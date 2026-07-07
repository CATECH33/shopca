import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { BrandLogo, I, Avatar } from '../lib/ui.jsx'

const NAV = [
  { to: '/app', label: 'Overview', icon: I.LayoutDashboard, end: true },
  { to: '/app/listings', label: 'Annonces', icon: I.Building },
  { to: '/app/crm', label: 'CRM', icon: I.Users },
  { to: '/app/messages', label: 'Messagerie', icon: I.MessageSquare, badge: 3 },
  { to: '/app/analytics', label: 'Analytics', icon: I.BarChart },
  { to: '/app/billing', label: 'Abonnement', icon: I.CreditCard },
  { to: '/app/agency', label: 'Agence', icon: I.Briefcase },
  { to: '/app/settings', label: 'Paramètres', icon: I.Settings },
]


export default function DashboardLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe?.()
  }, [])

  const signOut = () => navigate('/auth/logout')

  // Demo: always allow access (no real auth gate in this prototype scope)
  const displayName = user?.user_metadata?.full_name || 'Jean Kevin PEMOU'
  const email = user?.email || 'jean@shopca.fr'

  const SidebarContent = () => (
    <>
      <Link to="/" className="px-6 h-20 flex items-center border-b border-slate-100">
        <BrandLogo />
      </Link>
      <div className="px-3 py-4 flex-1 overflow-y-auto no-scrollbar">
        <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Espace</div>
        <nav className="space-y-1">
          {NAV.map((it) => {
            const Icon = it.icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-navy-900 text-white shadow-soft' : 'text-navy-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{it.label}</span>
                {it.badge && (
                  <span className="bg-orange-600 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">{it.badge}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

      </div>

      <div className="px-3 pb-4">
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-600/30 blur-2xl" />
          <I.Sparkles size={16} className="text-orange-400 mb-2" />
          <div className="font-semibold text-sm">Pack Visibilité</div>
          <div className="text-xs text-white/70 mt-1 mb-3">4× plus de contacts qualifiés</div>
          <Link to="/app/billing" className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            Passer Pro <I.ArrowRight size={12}/>
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-100 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-navy-900/40 z-40" />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-64 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-slate-100 h-16 px-4 lg:px-8 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setMobileOpen(true)}>
            <I.Menu size={20}/>
          </button>

          <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-4 h-10 bg-slate-50 border border-slate-100 rounded-2xl focus-within:bg-white focus-within:border-slate-200 transition">
            <I.Search size={16} className="text-slate-400"/>
            <input placeholder="Rechercher annonces, leads, messages…" className="flex-1 bg-transparent text-sm text-navy-900 placeholder-slate-400 focus:outline-none"/>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘ K</kbd>
          </div>
          <div className="md:hidden flex-1" />

          <button className="relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
            <I.Bell size={18} className="text-navy-700"/>
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full ring-2 ring-white" />
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition">
              <Avatar name={displayName} size={32} />
              <span className="hidden md:inline text-sm font-semibold text-navy-900">{displayName.split(' ')[0]}</span>
              <I.ChevronDown size={14} className="text-slate-500" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-cardHover border border-slate-100 overflow-hidden z-40"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-semibold text-navy-900 truncate">{displayName}</div>
                      <div className="text-xs text-slate-500 truncate">{email}</div>
                    </div>
                    <NavLink to="/app/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
                      <I.User size={16} className="text-slate-500"/> Mon profil
                    </NavLink>
                    <NavLink to="/app/billing" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
                      <I.CreditCard size={16} className="text-slate-500"/> Abonnement
                    </NavLink>
                    <button onClick={signOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100">
                      <I.LogOut size={16}/> Déconnexion
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1500px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
