import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../../lib/ui.jsx'
import { useAuth } from '../../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../../lib/supabase.js'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Il y a ${hrs} h`
  return `Il y a ${Math.floor(hrs / 24)} j`
}

const TYPE_META = {
  info:    { label: 'Info',     cls: 'bg-sky-100 text-sky-700',     icon: 'bg-sky-500'     },
  success: { label: 'Succès',   cls: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-500' },
  warning: { label: 'Alerte',   cls: 'bg-amber-100 text-amber-700', icon: 'bg-amber-500'   },
  error:   { label: 'Erreur',   cls: 'bg-rose-100 text-rose-700',   icon: 'bg-rose-500'    },
}

export default function AdminNotifications({ dark }) {
  const { user } = useAuth()
  const [notifs,    setNotifs]    = useState([])
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [readIds,   setReadIds]   = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('shopca_read_notifs') ?? '[]')) }
    catch { return new Set() }
  })
  const [tab,        setTab]       = useState('platform')
  const [sendForm,   setSendForm]  = useState({ open: false, title: '', message: '', type: 'info' })
  const [sending,    setSending]   = useState(false)

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('shopca_read_notifs', JSON.stringify([...next]))
      return next
    })
  }

  const markAllRead = () => {
    const allIds = [...notifs.map(n => n.id), ...events.map(e => e.id)]
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds])
      localStorage.setItem('shopca_read_notifs', JSON.stringify([...next]))
      return next
    })
  }

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [notifRes, listingRes, msgRes, subRes] = await Promise.all([
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('listings').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('messages').select('id, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('id, plan, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      setNotifs(notifRes.data ?? [])

      const platformEvents = [
        ...(listingRes.data ?? []).map(l => ({
          id: 'ev-l-' + l.id, icon: I.Building,
          type: l.status === 'pending' ? 'warning' : 'info',
          title: l.status === 'pending' ? 'Annonce en attente de validation' : 'Nouvelle annonce publiée',
          message: l.title,
          created_at: l.created_at,
        })),
        ...(msgRes.data ?? []).map(m => ({
          id: 'ev-m-' + m.id, icon: I.Mail, type: 'info',
          title: 'Nouveau message de contact', message: 'Via une annonce de la plateforme',
          created_at: m.created_at,
        })),
        ...(subRes.data ?? []).map(s => ({
          id: 'ev-s-' + s.id, icon: I.CreditCard, type: 'success',
          title: 'Nouvel abonnement activé', message: `Plan ${s.plan ?? '?'}`,
          created_at: s.created_at,
        })),
      ]
        .filter(e => e.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 15)

      setEvents(platformEvents)
    } catch (err) {
      console.error('[admin-notifs]', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try {
      await supabase.from('notifications').delete().eq('id', id)
      setNotifs(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  const handleSend = async () => {
    if (!sendForm.title.trim()) return
    setSending(true)
    try {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: sendForm.title,
        message: sendForm.message,
        type: sendForm.type,
      }).select().single()
      if (!error && data) {
        setNotifs(prev => [data, ...prev])
        setSendForm({ open: false, title: '', message: '', type: 'info' })
      }
    } catch (err) {
      console.error('[admin-notifs] send', err)
    } finally {
      setSending(false)
    }
  }

  const currentItems = tab === 'platform' ? events : notifs
  const unread = currentItems.filter(n => !readIds.has(n.id)).length

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'
  const inp = dark
    ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-orange-400'
    : 'bg-white border-slate-200 text-navy-900 placeholder-slate-400 focus:border-orange-400'

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {['platform', 'system'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition ${
                tab === t ? 'bg-orange-500 text-white' : dark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'
              }`}>
              {t === 'platform' ? 'Événements plateforme' : 'Notifications système'}
              {t === tab && unread > 0 && (
                <span className="ml-1.5 text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full">{unread}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead}
            className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition ${dark ? 'border-white/20 text-white/60 hover:border-white/40' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            Tout marquer lu
          </button>
          {tab === 'system' && (
            <button onClick={() => setSendForm(f => ({ ...f, open: true }))}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
              <I.Send size={13} /> Envoyer une notification
            </button>
          )}
        </div>
      </div>

      {/* Send form */}
      <AnimatePresence>
        {sendForm.open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-5 shadow-sm space-y-4 ${bd}`}>
            <p className={`text-sm font-extrabold ${tx}`}>Nouvelle notification système</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${sx}`}>Titre</label>
                <input value={sendForm.title} onChange={e => setSendForm(f => ({ ...f, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition ${inp}`}
                  placeholder="Titre de la notification" />
              </div>
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${sx}`}>Type</label>
                <select value={sendForm.type} onChange={e => setSendForm(f => ({ ...f, type: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition ${inp}`}>
                  <option value="info">Info</option>
                  <option value="success">Succès</option>
                  <option value="warning">Alerte</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${sx}`}>Message</label>
              <textarea value={sendForm.message} onChange={e => setSendForm(f => ({ ...f, message: e.target.value }))}
                rows={2} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none transition ${inp}`}
                placeholder="Contenu de la notification…" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSendForm({ open: false, title: '', message: '', type: 'info' })}
                className="flex-1 h-10 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-300 transition">
                Annuler
              </button>
              <button onClick={handleSend} disabled={sending || !sendForm.title.trim()}
                className="flex-1 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50">
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${bd}`}>
        {loading ? (
          <div className="flex justify-center py-14">
            <I.Loader size={22} className={`animate-spin ${sx}`} />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-14 text-center">
            <I.Bell size={28} className={`mx-auto mb-3 ${sx}`} />
            <p className={`text-sm font-semibold ${tx}`}>Aucune notification</p>
          </div>
        ) : currentItems.map(n => {
          const isRead = readIds.has(n.id)
          const meta   = TYPE_META[n.type] ?? TYPE_META.info
          const Icon   = n.icon ?? I.Bell
          return (
            <div key={n.id}
              className={`flex items-start gap-4 px-5 py-4 border-b last:border-0 transition cursor-pointer ${
                isRead ? '' : dark ? 'bg-orange-500/5' : 'bg-orange-50/50'
              } ${dark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}
              onClick={() => markRead(n.id)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.icon}`}>
                <Icon size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${tx}`}>{n.title}</p>
                  {!isRead && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${meta.cls}`}>{meta.label}</span>
                </div>
                {n.message && <p className={`text-xs mt-0.5 ${sx}`}>{n.message}</p>}
                <p className={`text-[11px] mt-1 ${sx}`}>{timeAgo(n.created_at)}</p>
              </div>
              {tab === 'system' && (
                <button onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${dark ? 'hover:bg-rose-500/20 text-white/40' : 'hover:bg-rose-50 text-slate-400'}`}>
                  <I.Trash size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
