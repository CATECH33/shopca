import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo, Avatar } from '../lib/ui.jsx'

/* ============================================================
   Super Admin Layout — premium SaaS shell
   (Stripe + Linear + Airbnb Admin inspiration)
   - No router dep, no backend, no charts
   - Theme toggle (light/dark) — local state only
   - Collapsible sidebar with grouped navigation
   - Glassmorphism topbar (search, notifs, avatar, theme)
   ============================================================ */

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: I.LayoutDashboard, group: 'pilotage' },
  { id: 'users',     label: 'Utilisateurs', icon: I.Users,           group: 'gestion' },
  { id: 'listings',  label: 'Annonces',     icon: I.Building,        group: 'gestion', badge: 1 },
  { id: 'agencies',  label: 'Agences',      icon: I.Briefcase,       group: 'gestion', badge: 2 },
  { id: 'payments',  label: 'Paiements',    icon: I.CreditCard,      group: 'operations' },
  { id: 'crm',       label: 'CRM',          icon: I.MessageSquare,   group: 'operations' },
  { id: 'reports',   label: 'Rapports',     icon: I.BarChart,        group: 'operations' },
  { id: 'settings',  label: 'Paramètres',   icon: I.Settings,        group: 'systeme' },
]

const GROUPS = [
  { id: 'pilotage',   label: 'Pilotage' },
  { id: 'gestion',    label: 'Gestion' },
  { id: 'operations', label: 'Opérations' },
  { id: 'systeme',    label: 'Système' },
]

const NOTIFICATIONS = [
  { id: 'n1', icon: I.Shield, tone: 'rose',    title: 'Nouvelle alerte fraude',         text: 'Annonce PSM-2418 signalée — duplicate 76%.',                time: 'Il y a 3 min' },
  { id: 'n2', icon: I.Users,  tone: 'orange',  title: '2 nouvelles agences à valider',  text: 'BARNES Lyon et Sotheby\'s Bordeaux attendent un examen.',  time: 'Il y a 18 min' },
  { id: 'n3', icon: I.CreditCard, tone: 'emerald', title: 'Encaissement Stripe',         text: '+4 870 € (Pack Visibilité × 12).',                          time: 'Il y a 1h' },
  { id: 'n4', icon: I.BarChart, tone: 'indigo', title: 'Nouveau rapport hebdo',         text: 'Le rapport « Performance plateforme » est prêt.',           time: 'Hier' },
]

export default function AdminLayout({
  children,
  activeId: controlledId,
  onActiveChange,
  defaultActive = 'dashboard',
  defaultTheme = 'light',
  user = { name: 'Jean Kevin PEMOU', email: 'admin@shopca.fr', role: 'Super Admin' },
}) {
  /* Controlled or uncontrolled active item */
  const [internalActive, setInternalActive] = useState(defaultActive)
  const activeId = controlledId ?? internalActive
  const setActive = (id) => {
    setInternalActive(id)
    onActiveChange?.(id)
  }

  /* Theme — internal state, no global side-effects on the app */
  const [theme, setTheme] = useState(defaultTheme)
  const dark = theme === 'dark'

  /* Sidebar collapse (desktop) + drawer (mobile) */
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Notifications popover */
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  /* Cmd+K to focus search */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('admin-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Tokens — single source of truth for theme-driven colors */
  const t = dark
    ? {
        outer:    'bg-[#070F1F] text-white',
        sidebar:  'bg-navy-900 border-white/10',
        topbar:   'bg-navy-900/70 border-white/10',
        card:     'bg-navy-800/60 border-white/10',
        textPrim: 'text-white',
        textMut:  'text-white/55',
        hover:    'hover:bg-white/5',
        chip:     'bg-white/5 border-white/10',
        active:   'bg-white text-navy-900',
        kbd:      'bg-white/5 text-white/60 border-white/10',
        section:  'text-white/35',
      }
    : {
        outer:    'bg-slate-50 text-navy-900',
        sidebar:  'bg-white border-slate-100',
        topbar:   'bg-white/85 border-slate-100',
        card:     'bg-white border-slate-100 shadow-soft',
        textPrim: 'text-navy-900',
        textMut:  'text-slate-500',
        hover:    'hover:bg-slate-100',
        chip:     'bg-slate-50 border-slate-200',
        active:   'bg-navy-900 text-white',
        kbd:      'bg-white text-slate-400 border-slate-200',
        section:  'text-slate-400',
      }

  /* ---------- Sidebar inner content (shared desktop + mobile drawer) ---------- */
  const SidebarBody = ({ inDrawer = false }) => (
    <>
      {/* Workspace switcher */}
      <div className={`h-16 lg:h-20 flex items-center gap-2 border-b ${dark ? 'border-white/10' : 'border-slate-100'} ${collapsed && !inDrawer ? 'justify-center px-2' : 'px-5'}`}>
        {(!collapsed || inDrawer) ? (
          <button className={`flex-1 flex items-center gap-2 px-2.5 py-2 rounded-xl border ${t.chip} ${t.hover} transition-colors`}>
            <BrandLogo compact dark={dark}/>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-[10px] font-bold uppercase tracking-wider ${t.textMut}`}>Workspace</div>
              <div className={`text-sm font-semibold truncate ${t.textPrim}`}>SHOPCA · Production</div>
            </div>
            <I.ChevronDown size={14} className={t.textMut}/>
          </button>
        ) : (
          <BrandLogo compact dark={dark}/>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {GROUPS.map((g) => {
          const items = NAV_ITEMS.filter((n) => n.group === g.id)
          if (!items.length) return null
          return (
            <div key={g.id}>
              {(!collapsed || inDrawer) && (
                <div className={`px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] ${t.section}`}>
                  {g.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {items.map((it) => {
                  const Icon = it.icon
                  const active = activeId === it.id
                  return (
                    <li key={it.id}>
                      <button
                        onClick={() => { setActive(it.id); inDrawer && setMobileOpen(false) }}
                        title={collapsed && !inDrawer ? it.label : undefined}
                        className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                          active ? t.active : `${t.textPrim} ${t.hover}`
                        } ${collapsed && !inDrawer ? 'justify-center' : ''}`}
                      >
                        {active && (
                          <motion.span
                            layoutId="admin-active-pill"
                            className="absolute inset-0 rounded-xl shadow-soft -z-10"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative flex items-center gap-3 w-full">
                          <Icon size={18} className="shrink-0"/>
                          {(!collapsed || inDrawer) && <span className="flex-1 text-left">{it.label}</span>}
                          {(!collapsed || inDrawer) && it.badge && (
                            <span className={`text-[10px] font-bold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 ${active ? 'bg-orange-600 text-white' : 'bg-rose-500 text-white'}`}>
                              {it.badge}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Bottom: user + collapse */}
      <div className={`border-t ${dark ? 'border-white/10' : 'border-slate-100'} p-3 space-y-2`}>
        {!collapsed || inDrawer ? (
          <div className={`flex items-center gap-2.5 p-2 rounded-xl border ${t.chip}`}>
            <Avatar name={user.name} size={32}/>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${t.textPrim}`}>{user.name}</div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                <span className={t.textMut}>{user.role}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar name={user.name} size={32}/>
          </div>
        )}

        {!inDrawer && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex w-full items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold ${t.textMut} ${t.hover} transition-colors`}
          >
            {collapsed ? <I.ChevronRight size={12}/> : <><I.ChevronLeft size={12}/> Réduire</>}
          </button>
        )}
      </div>
    </>
  )

  /* ============================================================ */
  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${t.outer}`}>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={`hidden lg:flex shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r ${t.sidebar}`}
      >
        <SidebarBody/>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-navy-900/55 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className={`lg:hidden fixed inset-y-0 left-0 w-72 z-50 flex flex-col border-r ${t.sidebar}`}
            >
              <SidebarBody inDrawer/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Right column — padded by sidebar width on desktop */}
      <div className={`flex-1 min-w-0 transition-[padding-left] duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        {/* Topbar */}
        <header className={`sticky top-0 z-20 backdrop-blur-xl border-b h-16 px-3 lg:px-6 flex items-center gap-3 transition-colors ${t.topbar}`}>
          {/* Mobile burger */}
          <button
            className={`lg:hidden p-2 rounded-xl ${t.hover}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <I.Menu size={20}/>
          </button>

          {/* Breadcrumb / role chip */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full ${dark ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30' : 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'}`}>
              <I.Shield size={11}/> Super Admin
            </span>
            <span className={`text-xs ${t.textMut}`}>/</span>
            <span className={`text-sm font-semibold capitalize ${t.textPrim}`}>
              {NAV_ITEMS.find((n) => n.id === activeId)?.label}
            </span>
          </div>

          {/* Search */}
          <div className={`flex-1 max-w-md mx-auto flex items-center gap-2 px-3 h-10 rounded-xl border transition focus-within:ring-2 focus-within:ring-orange-500/30 ${t.chip}`}>
            <I.Search size={14} className={t.textMut}/>
            <input
              id="admin-search"
              placeholder="Rechercher utilisateur, annonce, transaction…"
              className={`flex-1 bg-transparent text-sm focus:outline-none ${t.textPrim} placeholder:${dark ? 'text-white/40' : 'text-slate-400'}`}
            />
            <kbd className={`hidden md:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border ${t.kbd}`}>⌘K</kbd>
          </div>

          {/* Theme toggle */}
          <div className={`hidden sm:flex items-center p-1 rounded-full border ${t.chip}`}>
            {[
              { id: 'light', icon: I.Sun ?? null, label: 'Clair' },
              { id: 'dark',  icon: I.Moon ?? null, label: 'Sombre' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`relative text-[11px] font-semibold px-3 py-1.5 rounded-full transition ${
                  theme === opt.id ? (dark ? 'bg-white text-navy-900' : 'bg-navy-900 text-white') : t.textMut
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifsOpen(!notifsOpen); setProfileOpen(false) }}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${t.hover}`}
              aria-label="Notifications"
            >
              <I.Bell size={18}/>
              <span className="absolute top-2 right-2 flex">
                <span className="absolute inset-0 rounded-full bg-orange-500 opacity-50 animate-ping w-2 h-2"/>
                <span className="relative w-2 h-2 rounded-full bg-orange-500 ring-2 ring-current"/>
              </span>
            </button>
            <AnimatePresence>
              {notifsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifsOpen(false)}/>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border overflow-hidden z-40 ${t.sidebar} shadow-cardHover`}
                  >
                    <div className={`px-4 py-3 flex items-center justify-between border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className={`text-sm font-bold ${t.textPrim}`}>Notifications</div>
                      <button className="text-[11px] text-orange-500 font-semibold hover:underline">Tout marquer lu</button>
                    </div>
                    <ul className={`max-h-80 overflow-y-auto divide-y ${dark ? 'divide-white/5' : 'divide-slate-100'}`}>
                      {NOTIFICATIONS.map((n) => {
                        const Icon = n.icon
                        const tones = {
                          rose:    'bg-rose-500/15 text-rose-500',
                          orange:  'bg-orange-500/15 text-orange-500',
                          emerald: 'bg-emerald-500/15 text-emerald-500',
                          indigo:  'bg-indigo-500/15 text-indigo-500',
                        }
                        return (
                          <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${t.hover} transition-colors cursor-pointer`}>
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tones[n.tone]}`}>
                              <Icon size={15}/>
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[13px] font-semibold ${t.textPrim}`}>{n.title}</div>
                              <div className={`text-[11px] mt-0.5 ${t.textMut} truncate`}>{n.text}</div>
                              <div className={`text-[10px] mt-1 ${t.textMut}`}>{n.time}</div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className={`px-4 py-2.5 text-center text-[11px] font-semibold text-orange-500 hover:underline cursor-pointer border-t ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                      Voir tout le journal
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifsOpen(false) }}
              className={`flex items-center gap-2 p-1 pr-2.5 rounded-full transition-colors ${t.hover}`}
            >
              <Avatar name={user.name} size={30}/>
              <span className={`hidden md:inline text-sm font-semibold ${t.textPrim}`}>{user.name.split(' ')[0]}</span>
              <I.ChevronDown size={14} className={t.textMut}/>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)}/>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border overflow-hidden z-40 ${t.sidebar} shadow-cardHover`}
                  >
                    <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className={`text-sm font-semibold ${t.textPrim} truncate`}>{user.name}</div>
                      <div className={`text-xs ${t.textMut} truncate`}>{user.email}</div>
                    </div>
                    {[
                      { icon: I.User,       label: 'Mon profil' },
                      { icon: I.Settings,   label: 'Préférences' },
                      { icon: I.Briefcase,  label: 'Changer de workspace' },
                    ].map((it) => {
                      const Icon = it.icon
                      return (
                        <button key={it.label} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm ${t.textPrim} ${t.hover}`}>
                          <Icon size={16} className={t.textMut}/> {it.label}
                        </button>
                      )
                    })}
                    <button className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 border-t ${dark ? 'border-white/10 hover:bg-rose-500/10' : 'border-slate-100 hover:bg-rose-50'}`}>
                      <I.LogOut size={16}/> Déconnexion
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main content */}
        <main>
          <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
