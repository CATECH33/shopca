import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

/* ── Inline SVG Icons ───────────────────────────────────────── */
const Ic = {
  Users:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Briefcase:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  User:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Activity:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Home:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Clock:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Star:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  CreditCard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  TrendUp:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Alert:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Mail:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Shield:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Building2:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h4"/><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  XCircle:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Refresh:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Radio:      () => <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/></svg>,
}

/* ── Helpers ────────────────────────────────────────────────── */
const fmt    = (n) => n == null ? '—' : Number(n).toLocaleString('fr-FR')
const fmtEur = (n) => {
  if (n == null) return '—'
  const euros = n / 100
  if (euros >= 1000) return `${(euros / 1000).toFixed(1)}k €`
  return `${euros.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
}
const timeAgo = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)    return 'À l\'instant'
  if (diff < 3600)  return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}

function fillDays(data = [], days = 30) {
  const map = Object.fromEntries((data).map(d => [d.day, d.count]))
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    out.push({ label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), count: map[key] ?? 0 })
  }
  return out
}

function fillMonths(data = [], months = 6) {
  const map = Object.fromEntries((data).map(d => [d.month, d.total]))
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({ label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), total: Math.round((map[key] ?? 0) / 100) })
  }
  return out
}

const ROLE_LABELS = {
  user: 'Particulier', private_user: 'Particulier', personal: 'Particulier',
  pro_user: 'Professionnel', agency: 'Agence', agency_admin: 'Admin Agence',
  platform_owner: 'Propriétaire', premium_seller: 'Premium',
}
const PIE_COLORS = ['#6366F1','#10B981','#F59E0B','#FF6B00','#3B82F6','#EF4444','#8B5CF6','#64748B']

/* ── KPI Card ───────────────────────────────────────────────── */
function KPICard({ title, value, sub, icon: Icon, color, loading, trend, small }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
      padding: small ? '16px 20px' : '22px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '0.02em' }}>{title}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: color + '18', color, flexShrink: 0,
        }}>
          <Icon />
        </div>
      </div>
      {loading
        ? <div style={{ width: 80, height: 32, borderRadius: 8, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
        : <div style={{ fontSize: small ? 28 : 34, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </div>
      }
      {sub && !loading && <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>}
      {trend != null && !loading && (
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color:'#10B981' }}>
          <Ic.TrendUp /> +{fmt(trend)} cette semaine
        </div>
      )}
    </div>
  )
}

/* ── Section wrapper ────────────────────────────────────────── */
function Card({ title, action, children, style: s }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)', ...s }}>
      {title && (
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Skeleton ───────────────────────────────────────────────── */
const Skel = ({ w='100%', h=14 }) => (
  <div style={{ width:w, height:h, borderRadius:6, background:'#F1F5F9', animation:'pulse 1.4s ease-in-out infinite' }} />
)

/* ── Status badge ───────────────────────────────────────────── */
function Badge({ status }) {
  const map = {
    active:    { l:'Active',      bg:'#DCFCE7', c:'#16A34A' },
    pending:   { l:'En attente',  bg:'#FEF3C7', c:'#D97706' },
    inactive:  { l:'Inactive',    bg:'#F1F5F9', c:'#64748B' },
    succeeded: { l:'Succès',      bg:'#DCFCE7', c:'#16A34A' },
    failed:    { l:'Échoué',      bg:'#FEE2E2', c:'#DC2626' },
    canceled:  { l:'Annulé',      bg:'#F1F5F9', c:'#64748B' },
    disputed:  { l:'Litige',      bg:'#FEE2E2', c:'#DC2626' },
  }
  const s = map[status] ?? { l: status, bg:'#F1F5F9', c:'#64748B' }
  return (
    <span style={{ display:'inline-flex', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:s.bg, color:s.c, whiteSpace:'nowrap' }}>
      {s.l}
    </span>
  )
}

/* ── Activity item ──────────────────────────────────────────── */
const ACT_STYLES = {
  listing: { color:'#6366F1', bg:'#EEF2FF', label:'Annonce' },
  user:    { color:'#10B981', bg:'#D1FAE5', label:'Utilisateur' },
  payment: { color:'#FF6B00', bg:'#FFF0E6', label:'Paiement' },
  contact: { color:'#3B82F6', bg:'#DBEAFE', label:'Contact' },
  kyc:     { color:'#F59E0B', bg:'#FEF3C7', label:'KYC' },
}

function ActivityItem({ type, msg, time, live }) {
  const s = ACT_STYLES[type] ?? ACT_STYLES.contact
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px',
      borderBottom:'1px solid #F8FAFC', animation: live ? 'slide-in .3s ease' : 'none',
    }}>
      <div style={{ width:8, height:8, borderRadius:99, background:s.color, flexShrink:0, marginTop:4 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:10, fontWeight:700, background:s.bg, color:s.color, padding:'1px 6px', borderRadius:99 }}>
            {s.label}
          </span>
          <span style={{ fontSize:10, color:'#CBD5E1' }}>{timeAgo(time)}</span>
        </div>
        <div style={{ fontSize:12, color:'#475569', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {msg}
        </div>
      </div>
    </div>
  )
}

/* ── Custom Tooltip ─────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, euro }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#0F172A', color:'#fff', borderRadius:8, padding:'8px 12px', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,.2)' }}>
      <div style={{ color:'#94A3B8', marginBottom:3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontWeight:700 }}>
          {euro ? `${(p.value).toLocaleString('fr-FR')} €` : fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function DashboardPage() {
  const [stats,      setStats]      = useState(null)
  const [listings,   setListings]   = useState([])
  const [payments,   setPayments]   = useState([])
  const [contacts,   setContacts]   = useState([])
  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUp,     setLastUp]     = useState(null)
  const actRef = useRef([])

  const addActivity = useCallback((item) => {
    actRef.current = [{ ...item, live: true }, ...actRef.current].slice(0, 40)
    setActivities([...actRef.current])
  }, [])

  const fetchAll = useCallback(async () => {
    setRefreshing(true)
    const [rStats, rListings, rPayments, rContacts] = await Promise.allSettled([
      supabase.rpc('get_manager_dashboard_stats'),
      supabase.from('listings')
        .select('id,title,city,price,status,is_premium,property_type,created_at')
        .order('created_at', { ascending: false }).limit(8),
      supabase.from('payments')
        .select('id,amount,status,created_at,user_id')
        .order('created_at', { ascending: false }).limit(8),
      supabase.from('contact_requests')
        .select('id,name,phone,message,created_at')
        .order('created_at', { ascending: false }).limit(6),
    ])

    if (rStats.status === 'fulfilled' && !rStats.value.error) setStats(rStats.value.data)
    if (rListings.status === 'fulfilled') setListings(rListings.value.data ?? [])
    if (rPayments.status === 'fulfilled') setPayments(rPayments.value.data ?? [])
    if (rContacts.status === 'fulfilled') setContacts(rContacts.value.data ?? [])
    setLastUp(new Date()); setLoading(false); setRefreshing(false)
  }, [])

  /* Réactualisation auto 5 min */
  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [fetchAll])

  /* Realtime */
  useEffect(() => {
    const ch = supabase.channel('mgr-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, p =>
        addActivity({ type: 'listing', msg: `Annonce: ${p.new.title || 'Sans titre'} — ${p.new.city || ''}`, time: new Date() }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () =>
        addActivity({ type: 'user', msg: 'Nouvel utilisateur inscrit', time: new Date() }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_requests' }, p =>
        addActivity({ type: 'contact', msg: `Contact de ${p.new.name || 'Anonyme'}`, time: new Date() }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, p =>
        addActivity({ type: 'payment', msg: `Paiement ${fmtEur(p.new.amount)} — ${p.new.status}`, time: new Date() }))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [addActivity])

  /* Chart data */
  const listingsChart = fillDays(stats?.listings_30d, 30)
  const revenueChart  = fillMonths(stats?.revenue_6m, 6)
  const rolesChart    = (stats?.roles_dist ?? []).map((r, i) => ({
    name: ROLE_LABELS[r.role] ?? r.role, value: r.count, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const th = { padding:'9px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #F1F5F9', background:'#FAFAFA', whiteSpace:'nowrap' }
  const td = { padding:'10px 16px', borderBottom:'1px solid #F8FAFC', fontSize:12, color:'#0F172A', verticalAlign:'middle' }

  return (
    <div>
      <style>{`
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .mgr-tr:hover td { background:#F8FAFC !important; }
        .mgr-refresh:hover { background:#F1F5F9 !important; }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize:12, color:'#94A3B8', margin:'4px 0 0', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'#10B981', fontWeight:600 }}>
              <Ic.Radio /> Live
            </span>
            {lastUp && `· Actualisé à ${lastUp.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}`}
          </p>
        </div>
        <button className="mgr-refresh" onClick={fetchAll} disabled={refreshing}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:12, fontWeight:600, color:'#64748B', cursor:'pointer', transition:'background .15s', opacity: refreshing ? .6 : 1 }}>
          <span style={{ animation: refreshing ? 'pulse 1s linear infinite' : 'none', display:'flex' }}><Ic.Refresh /></span>
          Actualiser
        </button>
      </div>

      {/* ── Alertes urgentes ── */}
      {!loading && ((stats?.listings_pending ?? 0) > 0 || (stats?.kyc_pending ?? 0) > 0 || (stats?.payments_failed ?? 0) > 0) && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
          {(stats?.listings_pending ?? 0) > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#92400E' }}>
              ⚠️ <strong>{stats.listings_pending}</strong> annonce{stats.listings_pending>1?'s':''} en attente de validation
            </div>
          )}
          {(stats?.kyc_pending ?? 0) > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#92400E' }}>
              🪪 <strong>{stats.kyc_pending}</strong> KYC en attente de vérification
            </div>
          )}
          {(stats?.payments_failed ?? 0) > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#991B1B' }}>
              ❌ <strong>{stats.payments_failed}</strong> paiement{stats.payments_failed>1?'s':''} échoué{stats.payments_failed>1?'s':''}
            </div>
          )}
        </div>
      )}

      {/* ── KPI Rangée 1 : Utilisateurs ── */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#94A3B8', marginBottom:10 }}>
        UTILISATEURS
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
        <KPICard title="Inscrits au total"  value={fmt(stats?.users_total)}     sub="Tous comptes confondus"    icon={Ic.Users}     color="#6366F1" loading={loading} />
        <KPICard title="Professionnels"     value={fmt(stats?.users_pro)}       sub="Agences & pros"            icon={Ic.Briefcase} color="#10B981" loading={loading} />
        <KPICard title="Particuliers"       value={fmt(stats?.users_particular)} sub="Comptes personnels"       icon={Ic.User}      color="#3B82F6" loading={loading} />
        <KPICard title="Actifs (7 derniers jours)" value={fmt(stats?.users_active_7d)} sub="Connexion ou mise à jour" icon={Ic.Activity} color="#F59E0B" loading={loading} />
      </div>

      {/* ── KPI Rangée 2 : Plateforme ── */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#94A3B8', marginBottom:10 }}>
        PLATEFORME
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
        <KPICard title="Annonces actives"  value={fmt(stats?.listings_active)}   sub={`${fmt(stats?.listings_total)} au total`} icon={Ic.Home}       color="#6366F1" loading={loading} trend={stats?.listings_new_7d} />
        <KPICard title="En attente"        value={fmt(stats?.listings_pending)}  sub="À valider"                                icon={Ic.Clock}      color="#F59E0B" loading={loading} />
        <KPICard title="Annonces premium"  value={fmt(stats?.listings_premium)}  sub="Avec boost visibilité"                    icon={Ic.Star}       color="#FF6B00" loading={loading} />
        <KPICard title="Agences"           value={fmt(stats?.agencies_total)}    sub="Agences partenaires"                      icon={Ic.Building2}  color="#8B5CF6" loading={loading} />
      </div>

      {/* ── KPI Rangée 3 : Finance & Ops ── */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#94A3B8', marginBottom:10 }}>
        FINANCE & OPÉRATIONS
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:28 }}>
        <KPICard title="Revenus du mois"         value={fmtEur(stats?.revenue_month)}        sub={`${fmt(stats?.payments_month)} paiement${(stats?.payments_month??0)>1?'s':''}`} icon={Ic.TrendUp}    color="#10B981" loading={loading} />
        <KPICard title="Revenus totaux"           value={fmtEur(stats?.revenue_total)}        sub="Depuis le lancement"                          icon={Ic.CreditCard} color="#6366F1" loading={loading} />
        <KPICard title="Abonnements actifs"       value={fmt(stats?.subscriptions_active)}    sub="Plans en cours"                               icon={Ic.Star}       color="#F59E0B" loading={loading} />
        <KPICard title="Paiements échoués/litiges" value={fmt(stats?.payments_failed)}        sub="À surveiller"                                 icon={Ic.XCircle}    color="#EF4444" loading={loading} />
      </div>

      {/* ── KPI Rangée 4 : Alertes & Support ── */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#94A3B8', marginBottom:10 }}>
        ALERTES & SUPPORT
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:28 }}>
        <KPICard title="Alertes actives"    value={fmt(stats?.alerts_active)}   sub="Alertes de recherche"      icon={Ic.Alert}  color="#F59E0B" loading={loading} />
        <KPICard title="Contacts reçus"     value={fmt(stats?.contacts_total)}  sub={`+${fmt(stats?.contacts_7d)} cette semaine`} icon={Ic.Mail} color="#3B82F6" loading={loading} />
        <KPICard title="KYC en attente"     value={fmt(stats?.kyc_pending)}     sub="Documents à vérifier"      icon={Ic.Shield} color="#EF4444" loading={loading} />
        <KPICard title="Abonnements Stripe" value={fmt(stats?.subscriptions_active)} sub="Plans payants actifs" icon={Ic.CreditCard} color="#10B981" loading={loading} />
      </div>

      {/* ── Graphiques ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }} className="mgr-charts">
        <style>{`@media(max-width:900px){.mgr-charts{grid-template-columns:1fr !important;}}`}</style>

        {/* Annonces 30j */}
        <Card title="Nouvelles annonces — 30 derniers jours">
          <div style={{ padding:'20px 16px 16px' }}>
            {loading
              ? <div style={{ height:200, background:'#F8FAFC', borderRadius:10, animation:'pulse 1.4s ease-in-out infinite' }} />
              : <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={listingsChart} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="lgListings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" tick={{ fontSize:9, fill:'#94A3B8' }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fontSize:9, fill:'#94A3B8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#lgListings)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </div>
        </Card>

        {/* Revenus 6 mois */}
        <Card title="Revenus — 6 derniers mois (€)">
          <div style={{ padding:'20px 16px 16px' }}>
            {loading
              ? <div style={{ height:200, background:'#F8FAFC', borderRadius:10, animation:'pulse 1.4s ease-in-out infinite' }} />
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueChart} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:'#94A3B8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize:9, fill:'#94A3B8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip euro />} />
                    <Bar dataKey="total" fill="#10B981" radius={[6,6,0,0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </Card>
      </div>

      {/* ── Répartition + Activité temps réel ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16, marginBottom:16 }} className="mgr-charts">

        {/* Pie chart rôles */}
        <Card title="Répartition utilisateurs">
          <div style={{ padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            {loading
              ? <div style={{ width:160, height:160, borderRadius:99, background:'#F8FAFC', animation:'pulse 1.4s ease-in-out infinite' }} />
              : rolesChart.length === 0
                ? <div style={{ padding:32, color:'#94A3B8', fontSize:13 }}>Aucune donnée</div>
                : <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={rolesChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          dataKey="value" paddingAngle={3}>
                          {rolesChart.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ borderRadius:8, fontSize:12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }}>
                      {rolesChart.map((r) => (
                        <div key={r.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:8, height:8, borderRadius:99, background:r.color }} />
                            <span style={{ color:'#64748B' }}>{r.name}</span>
                          </div>
                          <span style={{ fontWeight:700, color:'#0F172A' }}>{fmt(r.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
            }
          </div>
        </Card>

        {/* Activité temps réel */}
        <Card title="Activité en temps réel" action={
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color:'#10B981' }}>
            <Ic.Radio /> Live
          </span>
        }>
          <div style={{ maxHeight:340, overflowY:'auto', scrollbarWidth:'none' }}>
            {activities.length === 0 ? (
              <div style={{ padding:'32px 20px', textAlign:'center', color:'#94A3B8', fontSize:13 }}>
                En attente d'activité…
                <div style={{ fontSize:11, marginTop:6, color:'#CBD5E1' }}>Les nouvelles actions apparaîtront ici en temps réel</div>
              </div>
            ) : activities.map((a, i) => (
              <ActivityItem key={i} {...a} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Annonces récentes ── */}
      <Card title="Dernières annonces" style={{ marginBottom:16 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Titre','Ville','Type','Prix','Statut','Ajoutée'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({length:4}).map((_,i) => (
                  <tr key={i}>
                    {[200,80,80,80,60,60].map((w,j) => (
                      <td key={j} style={{padding:'12px 16px'}}><Skel w={w} /></td>
                    ))}
                  </tr>
                ))
                : listings.length === 0
                  ? <tr><td colSpan={6} style={{padding:'28px',textAlign:'center',color:'#94A3B8',fontSize:13}}>Aucune annonce</td></tr>
                  : listings.map(l => (
                    <tr key={l.id} className="mgr-tr">
                      <td style={td}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          {l.is_premium && <span style={{ fontSize:9, fontWeight:700, background:'#FEF3C7', color:'#D97706', padding:'1px 4px', borderRadius:4 }}>PRO</span>}
                          <span style={{ fontWeight:500, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{l.title || '(sans titre)'}</span>
                        </div>
                      </td>
                      <td style={{ ...td, color:'#64748B' }}>{l.city || '—'}</td>
                      <td style={{ ...td, color:'#64748B' }}>{l.property_type || '—'}</td>
                      <td style={{ ...td, fontWeight:600, whiteSpace:'nowrap' }}>
                        {l.price ? `${Number(l.price).toLocaleString('fr-FR')} €` : '—'}
                      </td>
                      <td style={td}><Badge status={l.status} /></td>
                      <td style={{ ...td, color:'#94A3B8', whiteSpace:'nowrap' }}>{timeAgo(l.created_at)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Paiements récents + Contacts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="mgr-charts">

        <Card title="Derniers paiements">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Montant','Statut','Date'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length:4}).map((_,i) => (
                    <tr key={i}>{[80,60,80].map((w,j) => <td key={j} style={{padding:'10px 16px'}}><Skel w={w} /></td>)}</tr>
                  ))
                  : payments.length === 0
                    ? <tr><td colSpan={3} style={{padding:'24px',textAlign:'center',color:'#94A3B8',fontSize:12}}>Aucun paiement</td></tr>
                    : payments.map(p => (
                      <tr key={p.id} className="mgr-tr">
                        <td style={{ ...td, fontWeight:700, color: p.status==='succeeded' ? '#10B981' : '#EF4444' }}>
                          {fmtEur(p.amount)}
                        </td>
                        <td style={td}><Badge status={p.status} /></td>
                        <td style={{ ...td, color:'#94A3B8', fontSize:11 }}>{timeAgo(p.created_at)}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Derniers contacts">
          <div>
            {loading
              ? Array.from({length:4}).map((_,i) => (
                <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid #F8FAFC', display:'flex', gap:10 }}>
                  <Skel w={32} h={32} />
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                    <Skel w={100} h={12} /><Skel w="70%" h={10} />
                  </div>
                </div>
              ))
              : contacts.length === 0
                ? <div style={{ padding:'24px', textAlign:'center', color:'#94A3B8', fontSize:12 }}>Aucun contact</div>
                : contacts.map(c => (
                  <div key={c.id} style={{ padding:'12px 16px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:99, background:'#FF6B00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                      {(c.name||'?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{c.name||'Anonyme'}</span>
                        <span style={{ fontSize:10, color:'#CBD5E1', flexShrink:0 }}>{timeAgo(c.created_at)}</span>
                      </div>
                      {c.message && (
                        <div style={{ fontSize:11, color:'#64748B', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {c.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            }
          </div>
        </Card>
      </div>
    </div>
  )
}
