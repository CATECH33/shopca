import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useManagerAuth } from './ManagerAuthProvider.jsx'

/* ── Inline SVG Icons (pas d'import lucide-react) ─────────────── */
const Ic = {
  Dashboard:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Users:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Briefcase:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  Building:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  CreditCard:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Mail:          () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Bell:          () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Headphones:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Shield:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Settings:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  FileText:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  LogOut:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Eye:           () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Menu:          () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X:             () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

/* ── Navigation ──────────────────────────────────────────────── */
const GROUPS = [
  {
    label: 'Pilotage',
    items: [
      { path: 'dashboard',     label: 'Dashboard',      Icon: Ic.Dashboard },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { path: 'users',         label: 'Utilisateurs',   Icon: Ic.Users },
      { path: 'professionals', label: 'Agences',        Icon: Ic.Briefcase },
      { path: 'listings',      label: 'Annonces',       Icon: Ic.Building },
      { path: 'kyc',           label: 'KYC',            Icon: Ic.Shield },
    ],
  },
  {
    label: 'Opérations',
    items: [
      { path: 'payments',      label: 'Paiements',      Icon: Ic.CreditCard },
      { path: 'emails',        label: 'Emails',         Icon: Ic.Mail },
      { path: 'notifications', label: 'Notifications',  Icon: Ic.Bell },
      { path: 'crm',           label: 'CRM',            Icon: Ic.FileText },
      { path: 'support',       label: 'Support',        Icon: Ic.Headphones },
    ],
  },
  {
    label: 'Modération & IA',
    items: [
      { path: 'moderation',    label: 'Modération',     Icon: Ic.Shield },
      { path: 'analytics',     label: 'Analytics',      Icon: Ic.Dashboard },
      { path: 'ia',            label: 'IA Manager',     Icon: Ic.FileText },
      { path: 'automations',   label: 'Automatisations',Icon: Ic.Settings },
    ],
  },
  {
    label: 'Système',
    items: [
      { path: 'settings',      label: 'Paramètres',     Icon: Ic.Settings },
      { path: 'monitoring',    label: 'Monitoring',     Icon: Ic.Eye },
      { path: 'audit',         label: 'Audit',          Icon: Ic.FileText },
      { path: 'backups',       label: 'Sauvegardes',    Icon: Ic.FileText },
    ],
  },
]

/* ── Loading screen ─────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #070F1F 0%, #0A1628 100%)',
    }}>
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: 'spin 1s linear infinite' }}>
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </svg>
    </div>
  )
}

/* ── Layout principal ────────────────────────────────────────── */
export default function ManagerLayout() {
  const { isOwner, loading, signOut } = useManagerAuth()
  const [mobileOpen, setMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setMobile(false) }, [location.pathname])

  if (loading)   return <LoadingScreen />
  if (!isOwner)  return <Navigate to="/managerIT/login" replace />

  const currentPath = location.pathname.replace('/managerIT/', '').replace('/managerIT', '') || 'dashboard'
  const activeLabel = GROUPS.flatMap(g => g.items).find(i => i.path === currentPath)?.label ?? 'Back Office'

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em',
                      textTransform: 'uppercase', color: '#FF6B00', marginBottom: 2 }}>
          Back Office
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          SHOPCA <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: 14 }}>IT</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', scrollbarWidth: 'none' }}>
        {GROUPS.map(g => (
          <div key={g.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                          textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
                          padding: '0 8px', marginBottom: 4 }}>
              {g.label}
            </div>
            {g.items.map(({ path, label, Icon }) => {
              const active = currentPath === path
              return (
                <button
                  key={path}
                  onClick={() => navigate('/managerIT/' + path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 10px', borderRadius: 10,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    marginBottom: 2, transition: 'background .12s, color .12s',
                    background: active ? '#FF6B00' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 700 : 500, fontSize: 13,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ flexShrink: 0, display: 'flex' }}><Icon /></span>
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: 13, fontWeight: 500, transition: 'background .12s, color .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          <Ic.LogOut /> Déconnexion
        </button>
      </div>
    </div>
  )

  const SIDEBAR_W = 220

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F1F5F9' }}>

      {/* Sidebar desktop */}
      <aside
        className="manager-sidebar"
        style={{ width: SIDEBAR_W, flexShrink: 0, position: 'fixed', inset: '0 auto 0 0',
                 zIndex: 30, background: '#0A1628', overflowY: 'auto' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobile(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(7,15,31,0.65)', zIndex: 40,
                     backdropFilter: 'blur(2px)' }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
            zIndex: 50, background: '#0A1628', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12 }}>
              <button onClick={() => setMobile(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 4 }}>
                <Ic.X />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="manager-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20, height: 60,
          background: '#fff', borderBottom: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px',
        }}>
          <button
            onClick={() => setMobile(true)}
            className="manager-burger"
            style={{ background: 'none', border: 'none', cursor: 'pointer',
                     color: '#64748B', display: 'flex', padding: 4, borderRadius: 8 }}
          >
            <Ic.Menu />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99,
              background: '#FF6B00', color: '#fff',
            }}>
              IT Manager
            </span>
            <span style={{ color: '#CBD5E1', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{activeLabel}</span>
          </div>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: 12, color: '#94A3B8' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 28px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .manager-sidebar { display: flex !important; flex-direction: column !important; }
        .manager-main    { padding-left: ${SIDEBAR_W}px; }
        .manager-burger  { display: none !important; }
        @media (max-width: 1023px) {
          .manager-sidebar { display: none !important; }
          .manager-main    { padding-left: 0 !important; }
          .manager-burger  { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
