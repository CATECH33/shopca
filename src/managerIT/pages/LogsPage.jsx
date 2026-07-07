import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  X:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  FileText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Clock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  User:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Play:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Alert:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

/* ── Config ─────────────────────────────────────────────────────────────────── */
const PER_PAGE = 50

const LEVELS = [
  { id: null,    label: 'Tous',    color: '#64748B', bg: '#F1F5F9' },
  { id: 'error', label: 'Erreur',  color: '#EF4444', bg: '#FEE2E2' },
  { id: 'warn',  label: 'Avert.',  color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'info',  label: 'Info',    color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'debug', label: 'Debug',   color: '#94A3B8', bg: '#F1F5F9' },
]

const CATEGORIES = [
  { id: null,         label: 'Toutes',      color: '#64748B' },
  { id: 'user',       label: 'Utilisateurs', color: '#6366F1' },
  { id: 'payment',    label: 'Paiements',    color: '#10B981' },
  { id: 'moderation', label: 'Modération',   color: '#EF4444' },
  { id: 'system',     label: 'Système',      color: '#94A3B8' },
  { id: 'auth',       label: 'Auth',         color: '#F59E0B' },
  { id: 'admin',      label: 'Admin',        color: '#8B5CF6' },
  { id: 'api',        label: 'API',          color: '#0EA5E9' },
]

const LEVEL_CONFIG = {
  error: { color: '#EF4444', bg: '#FEF2F2', label: 'ERREUR',  prefix: '[ERR] ' },
  warn:  { color: '#F59E0B', bg: '#FFFBEB', label: 'AVERT.',  prefix: '[WARN]' },
  info:  { color: '#3B82F6', bg: '#EFF6FF', label: 'INFO',    prefix: '[INFO]' },
  debug: { color: '#94A3B8', bg: '#F8FAFC', label: 'DEBUG',   prefix: '[DBG] ' },
}

const CAT_COLORS = {
  user: '#6366F1', payment: '#10B981', moderation: '#EF4444',
  system: '#94A3B8', auth: '#F59E0B', admin: '#8B5CF6', api: '#0EA5E9',
}

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const fmtAgo = (s) => {
  if (!s) return '—'
  const d = (Date.now() - new Date(s)) / 1000
  if (d < 5)      return 'À l\'instant'
  if (d < 60)     return `${Math.floor(d)}s`
  if (d < 3600)   return `${Math.floor(d / 60)} min`
  if (d < 86400)  return `${Math.floor(d / 3600)}h`
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}
const fmtFull = (s) => s ? new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'
const actorName = (a) => {
  if (!a) return null
  if (a.first_name || a.last_name) return [a.first_name, a.last_name].filter(Boolean).join(' ')
  return a.email?.split('@')[0] ?? null
}

/* ── Export CSV ─────────────────────────────────────────────────────────────── */
function exportCSV(rows) {
  const cols = ['created_at', 'level', 'category', 'action', 'description', 'user_id', 'target_type', 'target_id']
  const header = cols.join(';')
  const lines = rows.map(r => cols.map(c => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`).join(';'))
  const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `logs_${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

/* ── Toast ───────────────────────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'error') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, add }
}
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#10B981', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 340 }}>{t.msg}</div>
      ))}
    </div>
  )
}

/* ── Overlay ────────────────────────────────────────────────────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 399 }} />
}

/* ── Pagination ────────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '14px 0' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page <= 1 ? 0.4 : 1 }}>
        <Ic.ChevronL />
      </button>
      <span style={{ fontSize: 13, color: '#64748B' }}>Page {page} / {totalPages} · {total.toLocaleString('fr-FR')} entrées</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page >= totalPages ? 0.4 : 1 }}>
        <Ic.ChevronR />
      </button>
    </div>
  )
}

/* ── Level badge ────────────────────────────────────────────────────────────── */
function LevelBadge({ level }) {
  const c = LEVEL_CONFIG[level] ?? { color: '#94A3B8', bg: '#F1F5F9', label: level }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: c.bg, color: c.color, fontFamily: 'monospace', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

/* ── Category badge ────────────────────────────────────────────────────────── */
function CatBadge({ category }) {
  const color = CAT_COLORS[category] ?? '#94A3B8'
  const labels = { user: 'Utilisateur', payment: 'Paiement', moderation: 'Modération', system: 'Système', auth: 'Auth', admin: 'Admin', api: 'API' }
  return (
    <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: color + '18', color, whiteSpace: 'nowrap' }}>
      {labels[category] ?? category}
    </span>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[60, 80, 100, 200, 120, 80].map((w, i) => (
        <td key={i} style={{ padding: '11px 14px' }}>
          <div style={{ height: 12, borderRadius: 6, background: '#E2E8F0', width: w }} />
        </td>
      ))}
    </tr>
  )
}

/* ── Detail Drawer ──────────────────────────────────────────────────────────── */
function DetailDrawer({ log, onClose }) {
  if (!log) return null
  const lc = LEVEL_CONFIG[log.level] ?? {}
  return (
    <>
      <Overlay onClose={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 440, maxWidth: '92vw', background: '#fff', zIndex: 400, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LevelBadge level={log.level} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Détail de l'entrée</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}><Ic.X /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Main info */}
          <div style={{ background: lc.bg ?? '#F8FAFC', borderRadius: 10, padding: '14px 16px', marginBottom: 20, borderLeft: `4px solid ${lc.color ?? '#94A3B8'}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{log.action}</div>
            {log.description && <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{log.description}</div>}
          </div>

          {/* Fields */}
          {[
            ['Horodatage',  fmtFull(log.created_at)],
            ['Niveau',      <LevelBadge level={log.level} />],
            ['Catégorie',   <CatBadge category={log.category} />],
            ['Action',      log.action],
            ['Acteur',      log.actor ? actorName(log.actor) || log.actor.email : '—'],
            ['Email acteur', log.actor?.email ?? '—'],
            ['Cible',       log.target_type ? `${log.target_type} · ${log.target_id?.slice(0, 8)}…` : '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 500, maxWidth: '55%', textAlign: 'right', wordBreak: 'break-word' }}>{val}</span>
            </div>
          ))}

          {/* Metadata JSON */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Métadonnées</div>
              <pre style={{ background: '#0F172A', color: '#34D399', borderRadius: 10, padding: '14px 16px', fontSize: 11, lineHeight: 1.7, overflow: 'auto', margin: 0, fontFamily: 'monospace' }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, bg, icon }) {
  const Icon = Ic[icon]
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        <Icon />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function LogsPage() {
  const [tab, setTab]             = useState('feed')   // 'feed' | 'system'
  const [rows, setRows]           = useState([])
  const [total, setTotal]         = useState(0)
  const [stats, setStats]         = useState(null)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchQ, setSearchQ]     = useState('')
  const [level, setLevel]         = useState(null)
  const [category, setCategory]   = useState(null)
  const [selected, setSelected]   = useState(null)
  const [liveMode, setLiveMode]   = useState(false)
  const debRef                    = useRef(null)
  const liveRef                   = useRef(null)
  const { toasts, add: toast }    = useToast()

  const load = useCallback(async (p = page, q = searchQ, lvl = level, cat = category, t = tab) => {
    setLoading(true)
    try {
      let data, error
      if (t === 'feed') {
        ;({ data, error } = await supabase.rpc('get_manager_activity_feed', {
          p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE,
          p_category: cat || null, p_search: q || null,
        }))
      } else {
        ;({ data, error } = await supabase.rpc('get_manager_logs', {
          p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE,
          p_level: lvl || null, p_category: cat || null, p_search: q || null,
        }))
      }
      if (error) throw error
      const arr = Array.isArray(data) ? data : []
      setRows(arr)
      setTotal(arr[0]?.total_count ?? arr.length)
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [page, searchQ, level, category, tab])

  const loadStats = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('get_manager_log_stats')
      if (data) setStats(data)
    } catch {}
  }, [])

  useEffect(() => { load(1, '', null, null, tab); setPage(1); setSearch(''); setSearchQ(''); setLevel(null); setCategory(null) }, [tab])
  useEffect(() => { loadStats() }, [])

  /* live refresh */
  useEffect(() => {
    clearInterval(liveRef.current)
    if (liveMode) liveRef.current = setInterval(() => { load(1, searchQ, level, category, tab); loadStats() }, 10000)
    return () => clearInterval(liveRef.current)
  }, [liveMode, searchQ, level, category, tab])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => { setSearchQ(v); setPage(1); load(1, v, level, category, tab) }, 300)
  }

  const applyLevel = (l) => { setLevel(l); setPage(1); load(1, searchQ, l, category, tab) }
  const applyCat   = (c) => { setCategory(c); setPage(1); load(1, searchQ, level, c, tab) }

  const handleExport = async () => {
    try {
      const { data } = tab === 'feed'
        ? await supabase.rpc('get_manager_activity_feed', { p_limit: 500, p_offset: 0, p_category: category || null, p_search: searchQ || null })
        : await supabase.rpc('get_manager_logs', { p_limit: 500, p_offset: 0, p_level: level || null, p_category: category || null, p_search: searchQ || null })
      exportCSV(Array.isArray(data) ? data : [])
    } catch (e) { toast(e.message) }
  }

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
          <Ic.FileText />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Logs système</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Journal d'événements — connexions, actions admin, paiements, modération</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Live toggle */}
          <button onClick={() => setLiveMode(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1px solid ${liveMode ? '#10B981' : '#E2E8F0'}`, background: liveMode ? '#D1FAE5' : '#fff', color: liveMode ? '#059669' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {liveMode ? <><Ic.Pause /> Live<span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981', marginLeft: 2, animation: 'pulse 1.5s ease infinite' }} /></> : <><Ic.Play /> Live</>}
          </button>
          {/* Refresh */}
          <button onClick={() => { load(page, searchQ, level, category, tab); loadStats() }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', animation: loading ? 'spin 1s linear infinite' : 'none' }}><Ic.Refresh /></span> Actualiser
          </button>
          {/* Export */}
          <button onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Ic.Download /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Événements aujourd'hui" value={stats?.total_today?.toLocaleString('fr-FR')} color="#3B82F6" bg="#DBEAFE" icon="Activity" />
        <StatCard label="Erreurs aujourd'hui"     value={stats?.errors_today?.toLocaleString('fr-FR')} color="#EF4444" bg="#FEE2E2" icon="Alert" />
        <StatCard label="Alertes aujourd'hui"     value={stats?.warns_today?.toLocaleString('fr-FR')}  color="#F59E0B" bg="#FEF3C7" icon="Alert" />
        <StatCard label="Total historique"        value={stats?.total_all?.toLocaleString('fr-FR')}    color="#8B5CF6" bg="#EDE9FE" icon="FileText" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #F1F5F9', marginBottom: 20 }}>
        {[
          { id: 'feed',   label: 'Journal d\'activité', icon: 'Activity' },
          { id: 'system', label: 'Logs système',         icon: 'FileText' },
        ].map(t => {
          const Icon = Ic[t.icon]
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: 'none', border: 'none', padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#0F172A' : '#64748B', borderBottom: active ? '2px solid #0F172A' : '2px solid transparent', marginBottom: -2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><Ic.Search /></span>
          <input value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0F172A' }} />
        </div>

        {/* Level filter (system tab only) */}
        {tab === 'system' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <button key={String(l.id)} onClick={() => applyLevel(l.id)}
                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${level === l.id ? l.color : '#E2E8F0'}`, background: level === l.id ? l.bg : '#fff', color: level === l.id ? l.color : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace' }}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={String(c.id)} onClick={() => applyCat(c.id)}
              style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${category === c.id ? c.color : '#E2E8F0'}`, background: category === c.id ? c.color + '18' : '#fff', color: category === c.id ? c.color : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {c.label}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>{total.toLocaleString('fr-FR')} entrée{total > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Horodatage', 'Niveau', 'Catégorie', 'Événement', 'Acteur', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : rows.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 13 }}>
                    {tab === 'system' ? 'Aucun log système — les événements apparaîtront ici dès la prochaine action.' : 'Aucun événement trouvé.'}
                  </td></tr>
                : rows.map((r, i) => {
                  const lc = LEVEL_CONFIG[r.level] ?? {}
                  const actor = actorName(r.actor)
                  return (
                    <tr key={r.id ?? i}
                      onClick={() => setSelected(r)}
                      style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: 12 }}>
                          <Ic.Clock />
                          <span title={fmtFull(r.created_at)}>{fmtAgo(r.created_at)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}><LevelBadge level={r.level} /></td>
                      <td style={{ padding: '11px 14px' }}><CatBadge category={r.category} /></td>
                      <td style={{ padding: '11px 14px', maxWidth: 340 }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description ?? r.action}</div>
                        {r.description && <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginTop: 2 }}>{r.action}</div>}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {actor
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}><Ic.User />{actor}</div>
                          : <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, color: '#CBD5E1' }}>›</span>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); load(p, searchQ, level, category, tab) }} />

      {selected && <DetailDrawer log={selected} onClose={() => setSelected(null)} />}
      <Toast toasts={toasts} />
    </div>
  )
}
