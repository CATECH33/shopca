import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Users:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Home:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  CreditCard:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Flag:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  XCircle:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Clock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ExternalLink: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  TrendUp:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
}

/* ── Status helpers ──────────────────────────────────────────────────────── */
const STATUS = {
  ok:      { label:'Opérationnel', color:'#10B981', bg:'#D1FAE5', icon:'Check'  },
  degraded:{ label:'Dégradé',      color:'#F59E0B', bg:'#FEF3C7', icon:'Alert'  },
  down:    { label:'Hors ligne',   color:'#EF4444', bg:'#FEE2E2', icon:'XCircle'},
  pending: { label:'Vérification…',color:'#94A3B8', bg:'#F1F5F9', icon:'Clock'  },
}

function latencyStatus(ms) {
  if (ms === null) return 'pending'
  if (ms < 0)     return 'down'
  if (ms < 400)   return 'ok'
  if (ms < 1200)  return 'degraded'
  return 'down'
}

const fmtMs = (ms) => ms == null ? '—' : ms < 0 ? 'Erreur' : `${ms} ms`

/* ── Measure latency ─────────────────────────────────────────────────────── */
async function measureSupabase() {
  try {
    const t0 = performance.now()
    const { error } = await supabase.from('profiles').select('id', { count:'exact', head:true })
    const ms = Math.round(performance.now() - t0)
    return error ? -1 : ms
  } catch { return -1 }
}

async function measureVercel() {
  try {
    const t0 = performance.now()
    await fetch(window.location.origin + '/', { method:'HEAD', cache:'no-store' })
    return Math.round(performance.now() - t0)
  } catch { return -1 }
}

async function measureExternal(url) {
  try {
    const t0 = performance.now()
    const r = await fetch(url, { mode:'no-cors', cache:'no-store' })
    return Math.round(performance.now() - t0)
  } catch { return -1 }
}

/* ── Latency bar ─────────────────────────────────────────────────────────── */
function LatencyBar({ ms, max = 1500 }) {
  const pct = ms == null || ms < 0 ? 0 : Math.min(100, (ms / max) * 100)
  const color = ms == null ? '#E2E8F0' : ms < 0 ? '#EF4444' : ms < 400 ? '#10B981' : ms < 1200 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ height:4, borderRadius:99, background:'#F1F5F9', overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width 0.6s ease' }} />
    </div>
  )
}

/* ── Service Card ─────────────────────────────────────────────────────────── */
function ServiceCard({ name, icon, ms, statusOverride, statusUrl, history }) {
  const st = statusOverride ?? latencyStatus(ms)
  const s  = STATUS[st]
  const IcStatus = Ic[s.icon]
  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
      {/* Colored top strip */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.color, borderRadius:'14px 14px 0 0' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>{icon}</span>
          <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>{name}</span>
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:s.bg, color:s.color, fontSize:11, fontWeight:700 }}>
          <IcStatus /> {s.label}
        </div>
      </div>

      <div style={{ fontSize:24, fontWeight:800, color: ms != null && ms >= 0 ? '#0F172A' : '#94A3B8' }}>
        {fmtMs(ms)}
      </div>
      <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>Temps de réponse</div>
      <LatencyBar ms={ms} />

      {/* Mini history sparkline */}
      {history && history.length > 1 && (
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:24, marginTop:10 }}>
          {history.slice(-12).map((v, i) => {
            const h = v < 0 ? 24 : Math.max(4, Math.min(24, (1 - v / 1500) * 24))
            const c = v < 0 ? '#EF4444' : v < 400 ? '#10B981' : v < 1200 ? '#F59E0B' : '#EF4444'
            return <div key={i} style={{ flex:1, height:h, borderRadius:2, background:c, opacity: 0.5 + (i / history.length) * 0.5 }} />
          })}
        </div>
      )}

      {statusUrl && (
        <a href={statusUrl} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:10, fontSize:11, color:'#94A3B8', textDecoration:'none' }}>
          <Ic.ExternalLink /> Page de statut
        </a>
      )}
    </div>
  )
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon, color }) {
  const Icon = Ic[icon]
  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
          <Icon />
        </div>
        <span style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:'#0F172A', lineHeight:1 }}>
        {value ?? <span style={{ fontSize:18, color:'#CBD5E1' }}>—</span>}
      </div>
      {sub && <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

/* ── Log row ──────────────────────────────────────────────────────────────── */
function LogRow({ level, message, time }) {
  const colors = { error:'#EF4444', warn:'#F59E0B', info:'#3B82F6', ok:'#10B981' }
  const c = colors[level] ?? '#94A3B8'
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'7px 0', borderBottom:'1px solid #F8FAFC' }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0, marginTop:5 }} />
      <div style={{ flex:1, fontSize:12, color:'#374151', lineHeight:1.4 }}>{message}</div>
      <div style={{ fontSize:11, color:'#CBD5E1', whiteSpace:'nowrap', flexShrink:0 }}>{time}</div>
    </div>
  )
}

/* ── Countdown ring ──────────────────────────────────────────────────────── */
function Countdown({ seconds, total }) {
  const pct = ((total - seconds) / total) * 100
  const r = 10, c = 2 * Math.PI * r
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <svg width="28" height="28" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="14" cy="14" r={r} fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
        <circle cx="14" cy="14" r={r} fill="none" stroke="#0EA5E9" strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize:11, color:'#94A3B8' }}>Actualisation dans {seconds}s</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const REFRESH_INTERVAL = 30
const SERVICES = [
  { id:'supabase', name:'Supabase',    icon:'🟢', statusUrl:'https://status.supabase.com',    measure: measureSupabase },
  { id:'vercel',   name:'Vercel',      icon:'▲',  statusUrl:'https://www.vercel-status.com',   measure: measureVercel   },
  { id:'stripe',   name:'Stripe',      icon:'💳', statusUrl:'https://status.stripe.com',       measure: () => measureExternal('https://stripe.com') },
  { id:'resend',   name:'Resend',      icon:'✉️',  statusUrl:'https://status.resend.com',       measure: () => measureExternal('https://resend.com') },
  { id:'gmaps',    name:'Google Maps', icon:'🗺️',  statusUrl:'https://status.cloud.google.com', measure: () => measureExternal('https://maps.googleapis.com') },
]

export default function MonitoringPage() {
  const [latencies,  setLatencies]  = useState({})    // { [id]: ms }
  const [history,    setHistory]    = useState({})    // { [id]: ms[] }
  const [stats,      setStats]      = useState(null)
  const [logs,       setLogs]       = useState([])
  const [checking,   setChecking]   = useState(false)
  const [lastCheck,  setLastCheck]  = useState(null)
  const [countdown,  setCountdown]  = useState(REFRESH_INTERVAL)
  const countRef                    = useRef(null)

  /* Build live log from check results */
  const addLog = useCallback((level, message) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    setLogs(p => [{ level, message, time }, ...p].slice(0, 40))
  }, [])

  const checkAll = useCallback(async () => {
    setChecking(true)

    /* Services */
    await Promise.all(SERVICES.map(async (svc) => {
      const ms = await svc.measure()
      setLatencies(p => ({ ...p, [svc.id]: ms }))
      setHistory(p => ({ ...p, [svc.id]: [...(p[svc.id] ?? []), ms].slice(-20) }))
      const st = latencyStatus(ms)
      if (st === 'down')     addLog('error', `${svc.name} : hors ligne ou inaccessible`)
      else if (st === 'degraded') addLog('warn', `${svc.name} : temps de réponse élevé (${ms} ms)`)
      else if (ms >= 0)      addLog('ok',    `${svc.name} : opérationnel (${ms} ms)`)
    }))

    /* Platform stats */
    try {
      const { data, error } = await supabase.rpc('get_manager_platform_stats')
      if (!error && data) {
        setStats(data)
        addLog('info', `Stats plateforme : ${data.users_total} utilisateurs · ${data.listings_active} annonces actives`)
        if (data.reports_pending > 0) addLog('warn', `${data.reports_pending} signalement${data.reports_pending > 1 ? 's' : ''} en attente de modération`)
      }
    } catch {}

    setLastCheck(new Date())
    setChecking(false)
    setCountdown(REFRESH_INTERVAL)
  }, [addLog])

  /* Initial check */
  useEffect(() => { checkAll() }, [])

  /* Countdown + auto-refresh */
  useEffect(() => {
    countRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { checkAll(); return REFRESH_INTERVAL }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [checkAll])

  const fmtLastCheck = () => lastCheck
    ? lastCheck.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    : '—'

  const overallStatus = (() => {
    const vals = Object.values(latencies)
    if (vals.length === 0) return 'pending'
    if (vals.some(v => v < 0)) return 'down'
    if (vals.some(v => v >= 1200)) return 'degraded'
    return 'ok'
  })()
  const ovs = STATUS[overallStatus]
  const IcOv = Ic[ovs.icon]

  return (
    <div style={{ padding:'32px 32px 80px', maxWidth:1200, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, flexWrap:'wrap' }}>
        <div style={{ width:38, height:38, borderRadius:12, background:'#E0F2FE', display:'flex', alignItems:'center', justifyContent:'center', color:'#0EA5E9' }}>
          <Ic.Activity />
        </div>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#0F172A' }}>Monitoring</h1>
          <p style={{ margin:0, fontSize:12, color:'#94A3B8' }}>État des services en temps réel</p>
        </div>

        {/* Global status pill */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:99, background:ovs.bg, color:ovs.color, fontSize:12, fontWeight:700 }}>
          <IcOv /> {ovs.label}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <Countdown seconds={countdown} total={REFRESH_INTERVAL} />
          <button onClick={checkAll} disabled={checking}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#0EA5E9', color:'#fff', border:'none', borderRadius:9, padding:'8px 14px', fontSize:12, fontWeight:700, cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.7 : 1 }}>
            <span style={{ display:'inline-flex', animation: checking ? 'spin 1s linear infinite' : 'none' }}><Ic.Refresh /></span>
            {checking ? 'Vérification…' : 'Actualiser'}
          </button>
        </div>

        {lastCheck && (
          <div style={{ width:'100%', fontSize:11, color:'#94A3B8' }}>
            Dernière vérification : {fmtLastCheck()}
          </div>
        )}
      </div>

      {/* Services grid */}
      <h2 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>Services</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14, marginBottom:32 }}>
        {SERVICES.map(svc => (
          <ServiceCard
            key={svc.id}
            name={svc.name}
            icon={svc.icon}
            ms={latencies[svc.id] ?? null}
            statusUrl={svc.statusUrl}
            history={history[svc.id]}
          />
        ))}
      </div>

      {/* Platform KPIs */}
      <h2 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>Plateforme</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12, marginBottom:32 }}>
        <KpiCard label="Utilisateurs"        value={stats?.users_total?.toLocaleString('fr-FR')}          sub={`+${stats?.new_users_7d ?? '—'} cette semaine`}     icon="Users"      color="#6366F1" />
        <KpiCard label="Actifs aujourd'hui"  value={stats?.users_active_today?.toLocaleString('fr-FR')}   sub={`${stats?.users_active_7d ?? '—'} cette semaine`}      icon="TrendUp"    color="#10B981" />
        <KpiCard label="Annonces actives"    value={stats?.listings_active?.toLocaleString('fr-FR')}      sub={`+${stats?.new_listings_7d ?? '—'} cette semaine`}    icon="Home"       color="#F59E0B" />
        <KpiCard label="Abonnements actifs"  value={stats?.subscriptions_active?.toLocaleString('fr-FR')} sub="Stripe"                                               icon="CreditCard" color="#0EA5E9" />
        <KpiCard label="Signalements"        value={stats?.reports_pending?.toLocaleString('fr-FR')}      sub="En attente de modération"                             icon="Flag"       color="#EF4444" />
        <KpiCard label="Jamais connectés"    value={stats?.never_logged?.toLocaleString('fr-FR')}         sub="Depuis l'inscription"                                 icon="Users"      color="#8B5CF6" />
      </div>

      {/* Response time summary table */}
      <h2 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>Latences</h2>
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', marginBottom:32 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {['Service', 'Statut', 'Latence', 'Tendance', 'Min (session)', 'Max (session)'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((svc, i) => {
              const ms  = latencies[svc.id] ?? null
              const st  = latencyStatus(ms)
              const s   = STATUS[st]
              const his = history[svc.id] ?? []
              const valid = his.filter(v => v >= 0)
              const minMs = valid.length ? Math.min(...valid) : null
              const maxMs = valid.length ? Math.max(...valid) : null
              const trend = his.length >= 3
                ? (his[his.length - 1] - his[his.length - 3]) > 100 ? '↑ En hausse' : '→ Stable'
                : '—'
              const IcS = Ic[s.icon]
              return (
                <tr key={svc.id} style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}>
                  <td style={{ padding:'11px 16px', fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                    <span>{svc.icon}</span> {svc.name}
                  </td>
                  <td style={{ padding:'11px 16px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:99, background:s.bg, color:s.color, fontSize:11, fontWeight:700 }}>
                      <IcS /> {s.label}
                    </span>
                  </td>
                  <td style={{ padding:'11px 16px', fontWeight:700, color: ms != null && ms >= 0 ? (ms < 400 ? '#10B981' : ms < 1200 ? '#F59E0B' : '#EF4444') : '#94A3B8' }}>
                    {fmtMs(ms)}
                  </td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:'#64748B' }}>{trend}</td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:'#64748B' }}>{minMs != null ? `${minMs} ms` : '—'}</td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:'#64748B' }}>{maxMs != null ? `${maxMs} ms` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Live logs */}
      <h2 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>Journal temps réel</h2>
      <div style={{ background:'#0F172A', borderRadius:12, padding:'16px 20px', minHeight:200, maxHeight:360, overflowY:'auto', fontFamily:'monospace' }}>
        {logs.length === 0 ? (
          <div style={{ color:'#475569', fontSize:13, textAlign:'center', paddingTop:60 }}>Aucun événement — vérification en cours…</div>
        ) : logs.map((l, i) => {
          const c = { error:'#F87171', warn:'#FBBF24', info:'#60A5FA', ok:'#34D399' }[l.level] ?? '#94A3B8'
          const prefix = { error:'[ERR]', warn:'[WARN]', info:'[INFO]', ok:'[OK]' }[l.level] ?? '[LOG]'
          return (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:6, fontSize:12, lineHeight:1.5 }}>
              <span style={{ color:'#475569', flexShrink:0 }}>{l.time}</span>
              <span style={{ color:c, fontWeight:700, flexShrink:0 }}>{prefix}</span>
              <span style={{ color:'#CBD5E1' }}>{l.message}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
