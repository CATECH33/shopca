import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { BrandLogo, I, Avatar } from '../lib/ui.jsx'

const Moon = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
const Sun  = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>

const NAV = [
  { to: '/dashboard',              label: 'Vue d\'ensemble',          icon: I.LayoutDashboard, end: true },
  { to: '/dashboard/searches',     label: 'Recherches sauvegardées',  icon: I.Search },
  { to: '/dashboard/notifications',label: 'Notifications',            icon: I.Bell,            badge: 4 },
  { to: '/dashboard/insights',     label: 'Insights IA',              icon: I.Sparkles },
  { to: '/dashboard/subscription', label: 'Abonnement',               icon: I.CreditCard },
  { to: '/dashboard/favorites',    label: 'Favoris',                  icon: I.Heart },
  { to: '/dashboard/profile',     label: 'Mon profil',               icon: I.User  },
  { to: '/dashboard/crm',        label: 'CRM',                      icon: I.Users },
]

export const ThemeContext = React.createContext({ dark: false })

export default function UserDashLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('ud-dark') === '1')
  const [unread] = useState(4)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription?.unsubscribe?.()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('ud-dark', dark ? '1' : '0')
  }, [dark])

  const signOut = async () => { await supabase.auth.signOut().catch(() => {}); navigate('/') }
  const displayName = user?.user_metadata?.full_name || 'Mon espace'
  const email = user?.email || ''

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#0B1F3A]">
      {/* Logo */}
      <Link to="/" className="px-6 h-16 flex items-center border-b border-white/10 shrink-0">
        <BrandLogo dark />
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Navigation</div>
        {NAV.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Upsell */}
      <div className="px-3 pb-4">
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-orange-600/30 blur-xl" />
          <I.Zap size={16} className="text-orange-400 mb-2" />
          <div className="text-white font-semibold text-sm">Passer à Pro</div>
          <div className="text-white/60 text-xs mt-0.5 mb-3">Alertes illimitées + IA avancée</div>
          <Link to="/dashboard/subscription"
            className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
            Voir les offres <I.ArrowRight size={11}/>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <ThemeContext.Provider value={{ dark }}>
      <div className={`min-h-screen flex ${dark ? 'dark bg-[#070D1A]' : 'bg-slate-50'}`}>
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 xl:w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-40" />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="lg:hidden fixed inset-y-0 left-0 w-72 z-50"
              >
                <Sidebar />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 lg:pl-60 xl:pl-64 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className={`sticky top-0 z-20 h-16 px-4 lg:px-8 flex items-center gap-3 border-b transition-colors ${
            dark ? 'bg-[#0B1120]/90 border-white/10 backdrop-blur-xl' : 'bg-white/90 border-slate-100 backdrop-blur-xl'
          }`}>
            <button className={`lg:hidden p-2 rounded-xl transition ${dark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-navy-900'}`}
              onClick={() => setMobileOpen(true)}>
              <I.Menu size={20}/>
            </button>

            {/* Search */}
            <div className={`flex-1 max-w-sm hidden md:flex items-center gap-2 px-4 h-10 rounded-2xl border transition ${
              dark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100'
            }`}>
              <I.Search size={15} className={dark ? 'text-white/40' : 'text-slate-400'}/>
              <input placeholder="Rechercher…" className={`flex-1 bg-transparent text-sm focus:outline-none ${
                dark ? 'text-white placeholder-white/40' : 'text-navy-900 placeholder-slate-400'
              }`}/>
            </div>
            <div className="flex-1 md:hidden"/>

            {/* Dark toggle */}
            <button onClick={() => setDark(d => !d)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}>
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>

            {/* Bell */}
            <Link to="/dashboard/notifications"
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition ${
                dark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-navy-700'
              }`}>
              <I.Bell size={18}/>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"/>
              )}
            </Link>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setProfileOpen(o => !o)}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition ${
                  dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                }`}>
                <Avatar name={displayName} size={30}/>
                <span className={`hidden md:inline text-sm font-semibold ${dark ? 'text-white' : 'text-navy-900'}`}>
                  {displayName.split(' ')[0]}
                </span>
                <I.ChevronDown size={13} className={dark ? 'text-white/50' : 'text-slate-500'}/>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)}/>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-cardHover border overflow-hidden z-40 ${
                        dark ? 'bg-[#0F1A2E] border-white/10' : 'bg-white border-slate-100'
                      }`}>
                      <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                        <div className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{displayName}</div>
                        <div className={`text-xs truncate ${dark ? 'text-white/50' : 'text-slate-500'}`}>{email}</div>
                      </div>
                      <Link to="/" onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${dark ? 'text-white/80 hover:bg-white/10' : 'text-navy-900 hover:bg-slate-50'}`}>
                        <I.Home size={15} className="text-slate-400"/> Retour au site
                      </Link>
                      <Link to="/dashboard/subscription" onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${dark ? 'text-white/80 hover:bg-white/10' : 'text-navy-900 hover:bg-slate-50'}`}>
                        <I.CreditCard size={15} className="text-slate-400"/> Abonnement
                      </Link>
                      <button onClick={signOut}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 transition border-t ${dark ? 'border-white/10 hover:bg-rose-500/10' : 'border-slate-100 hover:bg-rose-50'}`}>
                        <I.LogOut size={15}/> Déconnexion
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto w-full">
            <Outlet context={{ dark }}/>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
