import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'
import { supabase } from '../lib/supabase.js'

/* ============================================================
   SHOPCA — Notification Center
   - Realtime via Supabase channel (postgres_changes)
   - Bell badge with unread count
   - Dropdown panel: history, mark read, grouped by date
   - Toast for new incoming notifications
   ============================================================ */

const TYPE_META = {
  listing_match: { label: 'Nouvelle annonce', color: 'bg-orange-500', Icon: I.Home },
  system:        { label: 'Système',           color: 'bg-indigo-500', Icon: I.Shield },
  promo:         { label: 'Offre',             color: 'bg-emerald-500', Icon: I.Sparkles },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `Il y a ${d}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function groupByDate(notifications) {
  const today    = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const groups = { "Aujourd'hui": [], 'Hier': [], 'Plus ancien': [] }
  notifications.forEach(n => {
    const d = new Date(n.created_at); d.setHours(0,0,0,0)
    if (d >= today)     groups["Aujourd'hui"].push(n)
    else if (d >= yesterday) groups['Hier'].push(n)
    else                groups['Plus ancien'].push(n)
  })
  return groups
}

/* ── Toast ───────────────────────────────────────────────── */
function NotifToast({ notif, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t) }, [onDismiss])
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed top-24 right-4 z-[100] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
          <I.Bell size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-[#0F172A] leading-snug">Nouvelle annonce correspondante</div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{notif.listing_title}</div>
          {notif.listing_price && (
            <div className="text-sm font-extrabold text-orange-600 mt-1">
              {notif.listing_price.toLocaleString()}€
            </div>
          )}
        </div>
        <button onClick={onDismiss} className="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <I.X size={14} className="text-slate-400" />
        </button>
      </div>
      <div className="h-0.5 bg-slate-100 mx-4">
        <motion.div className="h-full bg-orange-500 rounded-full" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 5, ease: 'linear' }} />
      </div>
    </motion.div>
  )
}

/* ── Notification card ───────────────────────────────────── */
function NotifCard({ notif, onRead }) {
  const meta = TYPE_META[notif.notification_type] || TYPE_META.listing_match
  const Icon = meta.Icon

  return (
    <motion.div
      layout
      onClick={() => !notif.is_read && onRead(notif.id)}
      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${notif.is_read ? '' : 'bg-orange-500/[0.04]'}`}
    >
      <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={15} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${notif.is_read ? 'text-slate-600' : 'font-semibold text-[#0F172A]'}`}>
            {notif.listing_title || 'Nouvelle annonce correspondante'}
          </p>
          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {notif.listing_city && <span className="text-[11px] text-slate-500">{notif.listing_city}</span>}
          {notif.listing_price && (
            <span className="text-[11px] font-bold text-orange-600">{notif.listing_price.toLocaleString()}€</span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto">{timeAgo(notif.created_at)}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Dropdown panel ──────────────────────────────────────── */
function NotifDropdown({ notifications, onRead, onReadAll, onClose }) {
  const groups = groupByDate(notifications)
  const hasAny = notifications.length > 0
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-[#0F172A]">Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {notifications.filter(n => !n.is_read).length} non lue{notifications.filter(n => !n.is_read).length > 1 ? 's' : ''}
            </p>
          </div>
          {hasUnread && (
            <button onClick={onReadAll}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50">
              Tout marquer lu
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[420px] overflow-y-auto">
          {!hasAny ? (
            <div className="flex flex-col items-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <I.Bell size={20} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">Aucune notification</p>
              <p className="text-slate-500 text-xs mt-1">Vos alertes vous notifieront ici.</p>
            </div>
          ) : (
            Object.entries(groups).map(([label, items]) =>
              items.length === 0 ? null : (
                <div key={label}>
                  <div className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50/80 border-b border-slate-100">
                    {label}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {items.map(n => <NotifCard key={n.id} notif={n} onRead={onRead} />)}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Footer */}
        {hasAny && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Voir tout l'historique →
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}

/* ============================================================
   Main export — drop anywhere in the header
   ============================================================ */
export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([])
  const [open,          setOpen]          = useState(false)
  const [toast,         setToast]         = useState(null)
  const channelRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('alert_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(40)
    setNotifications(data || [])
  }, [user])

  /* Realtime subscription */
  useEffect(() => {
    if (!user) return
    loadNotifications()

    // Guard against React StrictMode double-fire:
    // remove any stale channel with the same name before subscribing
    const channelName = `notif-center-${user.id}`
    const stale = supabase.getChannels?.()?.find(c => c.topic === `realtime:${channelName}`)
    if (stale) supabase.removeChannel(stale)

    let channel = null
    try {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event:  'INSERT',
          schema: 'public',
          table:  'alert_notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          const n = payload.new
          setNotifications(prev => [n, ...prev])
          setToast(n)
        })
        .subscribe((status, err) => {
          if (err) console.warn('[NotifCenter] Realtime error:', err.message)
        })

      channelRef.current = channel
    } catch (err) {
      console.warn('[NotifCenter] Could not subscribe:', err.message)
    }

    return () => {
      if (channel) supabase.removeChannel(channel).catch?.(() => {})
    }
  }, [user?.id, loadNotifications])

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('alert_notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    if (user) {
      await supabase.from('alert_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }

  if (!user) return null

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && <NotifToast key={toast.id} notif={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Bell button */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
        >
          <I.Bell size={18} />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-extrabold leading-none"
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {open && (
            <NotifDropdown
              notifications={notifications}
              onRead={markRead}
              onReadAll={markAllRead}
              onClose={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
