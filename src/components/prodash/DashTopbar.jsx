import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { signOut } from '../../features/auth/services/authService.js'
import { supabase } from '../../lib/supabase.js'

const PAGE_TITLES = {
  overview:     'Vue d\'ensemble',
  listings:     'Mes annonces',
  leads:        'Leads',
  analytics:    'Analytiques',
  billing:      'Facturation',
  verification: 'Vérification',
  profile:      'Profil agence',
  settings:     'Paramètres',
  security:     'Sécurité',
  'admin-overview':      'Vue d\'ensemble',
  'admin-searches':      'Recherches sauvegardées',
  'admin-notifications': 'Notifications',
  'admin-insights':      'Insights IA',
  'admin-subscriptions': 'Abonnements',
  'admin-favorites':     'Favoris',
  'admin-profile':       'Mon profil',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Il y a ${hrs} h`
  return `Il y a ${Math.floor(hrs / 24)} j`
}

export default function DashTopbar({ page, dark, setPage, onExit, isAdmin }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [events,      setEvents]      = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const bg   = dark ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200'
  const text = dark ? 'text-white'   : 'text-navy-900'
  const sub  = dark ? 'text-white/40' : 'text-slate-400'
  const hover = dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'

  const firstName  = profile?.first_name ?? user?.email?.split('@')[0] ?? 'User'
  const lastName   = profile?.last_name  ?? ''
  const fullName   = [firstName, lastName].filter(Boolean).join(' ')
  const initials   = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'U'
  const verified   = profile?.kyc_status === 'approved'
  const isAdminRole = profile?.role === 'super_admin'

  const loadEvents = useCallback(async () => {
    if (!user) return
    try {
      const [newListings, newSubs, newMsgs] = await Promise.all([
        supabase.from('listings').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('id, plan, created_at, user_id').order('created_at', { ascending: false }).limit(3),
        supabase.from('messages').select('id, created_at').order('created_at', { ascending: false }).limit(3),
      ])

      const items = [
        ...(newListings.data ?? []).map(l => ({
          id: 'l-' + l.id, icon: I.Building, tone: l.status === 'pending' ? 'amber' : 'orange',
          title: l.status === 'pending' ? 'Annonce en attente de validation' : 'Nouvelle annonce publiée',
          text: l.title, time: l.created_at,
        })),
        ...(newSubs.data ?? []).map(s => ({
          id: 's-' + s.id, icon: I.CreditCard, tone: 'emerald',
          title: 'Nouvel abonnement', text: `Plan ${s.plan ?? '—'}`, time: s.created_at,
        })),
        ...(newMsgs.data ?? []).map(m => ({
          id: 'm-' + m.id, icon: I.Mail, tone: 'sky',
          title: 'Nouveau message contact', text: 'Via une annonce', time: m.created_at,
        })),
      ]
        .filter(e => e.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6)

      setEvents(items)
      setUnreadCount(items.length)
    } catch {}
  }, [user])

  useEffect(() => { if (isAdminRole) loadEvents() }, [isAdminRole, loadEvents])

  const handleLogout = async () => {
    try { await signOut() } catch {}
    navigate('/auth/login')
  }

  const toneColor = {
    orange: 'bg-orange-500/15 text-orange-500',
    amber:  'bg-amber-500/15 text-amber-500',
    emerald:'bg-emerald-500/15 text-emerald-500',
    sky:    'bg-sky-500/15 text-sky-500',
    rose:   'bg-rose-500/15 text-rose-500',
  }

  return (
    <header className={`flex items-center justify-between px-6 h-14 border-b shrink-0 ${bg}`}>
      <div>
        <h1 className={`text-base font-extrabold leading-none ${text}`}>{PAGE_TITLES[page] ?? page}</h1>
        <p className={`text-[11px] mt-0.5 ${sub}`}>
          {isAdminRole ? 'PASMAL Super Admin' : (profile?.agencies?.name ?? firstName)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Badge vérifié (pro uniquement) */}
        {!isAdminRole && verified && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            <I.BadgeCheck size={13} /> Agence vérifiée
          </div>
        )}
        {/* Badge admin */}
        {isAdminRole && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
            <I.Shield size={13} /> Super Admin
          </div>
        )}

        {/* Cloche notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition ${dark ? `${hover} text-white/70` : `${hover} text-slate-500`}`}>
            <I.Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-11 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden ${dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Notifications</span>
                    {events.length > 0 && (
                      <button onClick={() => setUnreadCount(0)} className="text-[11px] text-orange-500 font-semibold">
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  {events.length === 0 ? (
                    <div className={`py-8 text-center text-xs ${sub}`}>Aucune notification</div>
                  ) : events.map(n => {
                    const Icon = n.icon
                    return (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition ${dark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}>
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${toneColor[n.tone] ?? toneColor.orange}`}>
                          <Icon size={14} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${text}`}>{n.title}</p>
                          <p className={`text-[11px] mt-0.5 ${sub} truncate`}>{n.text}</p>
                          <p className={`text-[10px] mt-0.5 ${sub}`}>{timeAgo(n.time)}</p>
                        </div>
                      </div>
                    )
                  })}
                  {isAdminRole && setPage && (
                    <button onClick={() => { setNotifOpen(false); setPage('admin-notifications') }}
                      className={`w-full py-2.5 text-center text-[11px] font-semibold text-orange-500 border-t ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                      Voir toutes les notifications
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + menu utilisateur */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            className={`flex items-center gap-2 px-1 py-1 rounded-full transition ${hover}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className={`hidden sm:inline text-sm font-semibold ${text}`}>{firstName}</span>
            <I.ChevronDown size={13} className={sub} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.14 }}
                  className={`absolute right-0 top-11 w-60 rounded-2xl shadow-xl border z-50 overflow-hidden ${dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                    <p className={`text-sm font-semibold ${text} truncate`}>{fullName}</p>
                    <p className={`text-xs ${sub} truncate`}>{user?.email}</p>
                  </div>
                  {[
                    { icon: I.User,       label: 'Mon profil',  page: isAdmin ? 'admin-profile' : 'profile'  },
                    { icon: I.Settings,   label: 'Paramètres',  page: isAdmin ? 'admin-profile' : 'settings' },
                    ...(!isAdmin ? [{ icon: I.CreditCard, label: 'Facturation', page: 'billing' }] : []),
                    { icon: I.Key,        label: 'Sécurité',    page: isAdmin ? 'admin-profile' : 'security' },
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <button key={item.label} onClick={() => { setProfileOpen(false); setPage?.(item.page) }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm ${text} transition ${hover}`}>
                        <Icon size={15} className={sub} /> {item.label}
                      </button>
                    )
                  })}
                  <button onClick={handleLogout}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 border-t transition ${dark ? 'border-white/10 hover:bg-rose-500/10' : 'border-slate-100 hover:bg-rose-50'}`}>
                    <I.LogOut size={15} /> Déconnexion
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
