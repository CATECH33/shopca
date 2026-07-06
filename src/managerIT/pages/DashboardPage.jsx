import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ───────────────────────────────────────── */
const Ic = {
  Building:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  CheckCircle:() => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Star:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  MessageSq:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  TrendUp:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Refresh:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Eye:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Phone:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.89a16 16 0 0 0 6.08 6.08l.96-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16.92z"/></svg>,
  MapPin:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
}

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('fr-FR')
const fmtPrice = (n) => n == null ? '—' : Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const fmtDate = (s) => {
  if (!s) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(s))
}
const timeAgo = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)   return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return `Il y a ${Math.floor(diff / 86400)}j`
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KPICard({ title, value, sub, icon: Icon, color, loading, trend }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
      padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{title}</div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: color + '18', color,
        }}>
          <Icon />
        </div>
      </div>
      <div>
        {loading
          ? <div style={{ width: 80, height: 36, borderRadius: 8, background: '#F1F5F9', animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />
          : <div style={{ fontSize: 34, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>{fmt(value)}</div>
        }
        {sub && !loading && (
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{sub}</div>
        )}
      </div>
      {trend != null && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#10B981' }}>
          <Ic.TrendUp /> <span>+{fmt(trend)} cette semaine</span>
        </div>
      )}
    </div>
  )
}

/* ── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active:   { label: 'Active',    bg: '#DCFCE7', color: '#16A34A' },
    pending:  { label: 'En attente',bg: '#FEF3C7', color: '#D97706' },
    inactive: { label: 'Inactive',  bg: '#F1F5F9', color: '#64748B' },
    rejected: { label: 'Rejetée',   bg: '#FEE2E2', color: '#DC2626' },
  }
  const s = map[status] ?? { label: status, bg: '#F1F5F9', color: '#64748B' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  )
}

/* ── Section header ─────────────────────────────────────────── */
function Section({ title, count, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{title}</span>
        {count != null && (
          <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B',
                         padding: '2px 7px', borderRadius: 99 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── Skeleton row ───────────────────────────────────────────── */
function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{ height: 14, borderRadius: 6, background: '#F1F5F9',
                        width: i === 0 ? 180 : i === cols - 1 ? 60 : 80,
                        animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function DashboardPage() {
  const [loading,        setLoading]        = useState(true)
  const [stats,          setStats]          = useState(null)
  const [recentListings, setRecentListings] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [lastUpdated,    setLastUpdated]    = useState(null)
  const [refreshing,     setRefreshing]     = useState(false)

  const fetchAll = useCallback(async () => {
    setRefreshing(true)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoIso = weekAgo.toISOString()

    const [
      rTotal, rActive, rPremium, rVerified, rPending,
      rWeek, rTotalContacts, rWeekContacts,
      rListings, rContacts,
    ] = await Promise.allSettled([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoIso),
      supabase.from('contact_requests').select('*', { count: 'exact', head: true }),
      supabase.from('contact_requests').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoIso),
      supabase.from('listings')
        .select('id,title,city,price,property_type,transaction_type,status,is_premium,is_verified,created_at,views_count')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('contact_requests')
        .select('id,name,phone,message,created_at,listing_id')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    const val = (r) => r.status === 'fulfilled' ? r.value : {}

    setStats({
      total:         val(rTotal).count    ?? 0,
      active:        val(rActive).count   ?? 0,
      premium:       val(rPremium).count  ?? 0,
      verified:      val(rVerified).count ?? 0,
      pending:       val(rPending).count  ?? 0,
      newThisWeek:   val(rWeek).count     ?? 0,
      totalContacts: val(rTotalContacts).count ?? null,
      weekContacts:  val(rWeekContacts).count  ?? null,
    })
    setRecentListings(val(rListings).data ?? [])
    setRecentContacts(val(rContacts).data ?? [])
    setLastUpdated(new Date())
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const KPIS = [
    {
      title: 'Annonces actives',
      value: stats?.active,
      sub: `${fmt(stats?.total)} au total`,
      icon: Ic.Building,
      color: '#6366F1',
      trend: stats?.newThisWeek,
    },
    {
      title: 'Annonces vérifiées',
      value: stats?.verified,
      sub: stats?.total ? `${Math.round((stats.verified / stats.total) * 100)}% du catalogue` : null,
      icon: Ic.CheckCircle,
      color: '#10B981',
    },
    {
      title: 'Annonces premium',
      value: stats?.premium,
      sub: 'Avec boost de visibilité',
      icon: Ic.Star,
      color: '#F59E0B',
    },
    {
      title: 'Demandes de contact',
      value: stats?.totalContacts,
      sub: stats?.weekContacts != null ? `+${fmt(stats.weekContacts)} cette semaine` : 'Authentification requise',
      icon: Ic.MessageSq,
      color: '#FF6B00',
    },
  ]

  const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 700, color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '1px solid #F1F5F9', background: '#FAFAFA',
    whiteSpace: 'nowrap',
  }
  const tdStyle = {
    padding: '11px 16px', borderBottom: '1px solid #F8FAFC',
    fontSize: 13, color: '#0F172A', verticalAlign: 'middle',
  }

  return (
    <div>
      <style>{`
        @keyframes mgr-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .mgr-tr:hover td { background:#FAFCFF; }
        .mgr-refresh:hover { background:#F1F5F9 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
            Données en temps réel depuis Supabase
            {lastUpdated && ` · Actualisé à ${lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <button
          className="mgr-refresh"
          onClick={fetchAll}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff',
            fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer',
            transition: 'background .15s',
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <span style={{ display: 'flex', animation: refreshing ? 'mgr-pulse 1s linear infinite' : 'none' }}>
            <Ic.Refresh />
          </span>
          Actualiser
        </button>
      </div>

      {/* ── Alertes (en attente de modération) ── */}
      {!loading && stats?.pending > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 12, padding: '12px 16px', marginBottom: 24,
          fontSize: 13, color: '#92400E',
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span><strong>{stats.pending}</strong> annonce{stats.pending > 1 ? 's' : ''} en attente de validation.</span>
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {KPIS.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} loading={loading} />
        ))}
      </div>

      {/* ── Tables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
           className="mgr-grid-cols">
        <style>{`@media(max-width:900px){.mgr-grid-cols{grid-template-columns:1fr !important;}}`}</style>

        {/* Répartition rapide */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
                      padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Répartition des annonces</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 32, borderRadius: 8, background: '#F1F5F9', animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Actives',       value: stats?.active  ?? 0, color: '#10B981', total: stats?.total },
                { label: 'En attente',    value: stats?.pending ?? 0, color: '#F59E0B', total: stats?.total },
                { label: 'Non vérifiées', value: Math.max(0, (stats?.total ?? 0) - (stats?.verified ?? 0)), color: '#6366F1', total: stats?.total },
              ].map(({ label, value, color, total }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{fmt(value)} <span style={{ color: '#CBD5E1', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cette semaine */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
                      padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Cette semaine</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2].map(i => <div key={i} style={{ height: 48, borderRadius: 10, background: '#F1F5F9', animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Nouvelles annonces', value: stats?.newThisWeek, color: '#6366F1' },
                { label: 'Nouveaux contacts',  value: stats?.weekContacts, color: '#FF6B00', na: stats?.weekContacts == null },
              ].map(({ label, value, color, na }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}20`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{label}</span>
                  {na
                    ? <span style={{ fontSize: 12, color: '#CBD5E1' }}>auth requise</span>
                    : <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>+{fmt(value)}</span>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Annonces récentes ── */}
      <div style={{ marginBottom: 16 }}>
        <Section title="Annonces récentes" count={recentListings.length}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Titre', 'Ville', 'Type', 'Prix', 'Vues', 'Statut', 'Ajoutée'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  : recentListings.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                          Aucune annonce pour le moment
                        </td>
                      </tr>
                    )
                    : recentListings.map((l) => (
                      <tr key={l.id} className="mgr-tr">
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {l.is_premium && <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706', padding: '1px 5px', borderRadius: 4 }}>PRO</span>}
                            <span style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                              {l.title || '(sans titre)'}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Ic.MapPin />{l.city || '—'}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748B', whiteSpace: 'nowrap' }}>
                          {l.property_type ?? l.transaction_type ?? '—'}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {l.price ? fmtPrice(l.price) : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Ic.Eye />{fmt(l.views_count ?? 0)}
                          </div>
                        </td>
                        <td style={tdStyle}><StatusBadge status={l.status} /></td>
                        <td style={{ ...tdStyle, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {timeAgo(l.created_at)}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* ── Contacts récents ── */}
      <Section title="Contacts récents" count={recentContacts.length || undefined}>
        {recentContacts.length === 0 && !loading ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            {stats?.totalContacts === null
              ? 'Authentification Supabase requise pour lire les contacts.'
              : 'Aucun contact reçu pour le moment.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 99, background: '#F1F5F9', flexShrink: 0, animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 120, height: 13, borderRadius: 6, background: '#F1F5F9', animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />
                    <div style={{ width: '70%', height: 11, borderRadius: 6, background: '#F1F5F9', animation: 'mgr-pulse 1.4s ease-in-out infinite' }} />
                  </div>
                </div>
              ))
              : recentContacts.map((c) => (
                <div key={c.id} style={{ padding: '14px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Avatar initiale */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 99, background: '#FF6B00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{c.name || 'Anonyme'}</span>
                      {c.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748B' }}>
                          <Ic.Phone />{c.phone}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#CBD5E1', marginLeft: 'auto' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    {c.message && (
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                        {c.message}
                      </div>
                    )}
                    {c.listing_id && (
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>
                        Annonce #{c.listing_id.slice(0, 8)}…
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </Section>
    </div>
  )
}
