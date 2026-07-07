import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Shield:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  ChevronL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Lock:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Clock:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Tag:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Users:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}

/* ── Action config ────────────────────────────────────────────────────────── */
const ACTION_CONFIG = {
  listing_approve:            { label: 'Annonce approuvée',       color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  listing_reject:             { label: 'Annonce refusée',         color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  listing_delete:             { label: 'Annonce supprimée',       color: '#EF4444', bg: '#FEE2E2', dot: '#EF4444' },
  listing_suspend_owner:      { label: 'Compte suspendu',         color: '#EF4444', bg: '#FEE2E2', dot: '#EF4444' },
  report_approve:             { label: 'Signalement résolu',      color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  report_reject:              { label: 'Signalement rejeté',      color: '#94A3B8', bg: '#F1F5F9', dot: '#94A3B8' },
  subscription_suspended:     { label: 'Abonnement suspendu',     color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  subscription_reactivated:   { label: 'Abonnement réactivé',     color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  subscription_cancelled:     { label: 'Abonnement annulé',       color: '#EF4444', bg: '#FEE2E2', dot: '#EF4444' },
  account_reactivated:        { label: 'Compte réactivé',         color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  payment_refunded:           { label: 'Paiement remboursé',      color: '#8B5CF6', bg: '#EDE9FE', dot: '#8B5CF6' },
}

const ENTITY_LABELS = {
  listing: 'Annonce', profile: 'Compte', subscription: 'Abonnement',
  report: 'Signalement', payment: 'Paiement',
}

const ENTITY_TYPES = [
  { id: null,           label: 'Toutes entités' },
  { id: 'listing',      label: 'Annonces'       },
  { id: 'profile',      label: 'Comptes'        },
  { id: 'subscription', label: 'Abonnements'    },
  { id: 'report',       label: 'Signalements'   },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtAgo = (s) => {
  if (!s) return '—'
  const d = (Date.now() - new Date(s)) / 1000
  if (d < 60)    return `${Math.floor(d)}s`
  if (d < 3600)  return `${Math.floor(d / 60)} min`
  if (d < 86400) return `${Math.floor(d / 3600)}h`
  return `${Math.floor(d / 86400)}j`
}
const fmtFull = (s) => s
  ? new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  : '—'
const managerName = (m) => {
  if (!m) return 'Système'
  if (m.first_name || m.last_name) return [m.first_name, m.last_name].filter(Boolean).join(' ')
  return m.email?.split('@')[0] ?? 'Inconnu'
}

/* ── Export CSV ──────────────────────────────────────────────────────────── */
function exportCSV(rows) {
  const cols = ['created_at', 'action_type', 'entity_type', 'entity_id', 'description', 'notes', 'manager_id']
  const blob = new Blob(
    [cols.join(';') + '\n' + rows.map(r => cols.map(c => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`).join(';')).join('\n')],
    { type: 'text/csv;charset=utf-8;' }
  )
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), { href: url, download: `audit_${Date.now()}.csv` }).click()
  URL.revokeObjectURL(url)
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
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
        <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#10B981', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>{t.msg}</div>
      ))}
    </div>
  )
}

/* ── Overlay ─────────────────────────────────────────────────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 399 }} />
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '14px 0' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page <= 1 ? 0.4 : 1 }}>
        <Ic.ChevronL />
      </button>
      <span style={{ fontSize: 13, color: '#64748B' }}>Page {page} / {pages} · {total.toLocaleString('fr-FR')} entrées</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page >= pages ? 0.4 : 1 }}>
        <Ic.ChevronR />
      </button>
    </div>
  )
}

/* ── KPI Card ────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, bg, icon }) {
  const Icon = Ic[icon]
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', flex: 1, minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          <Icon />
        </div>
        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value ?? <span style={{ fontSize: 18, color: '#CBD5E1' }}>—</span>}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

/* ── Action badge ────────────────────────────────────────────────────────── */
function ActionBadge({ actionType }) {
  const c = ACTION_CONFIG[actionType] ?? { label: actionType, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: c.bg, color: c.color, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
      {c.label}
    </span>
  )
}

/* ── Detail Drawer ───────────────────────────────────────────────────────── */
function DetailDrawer({ entry, onClose }) {
  if (!entry) return null
  const ac = ACTION_CONFIG[entry.action_type] ?? { color: '#64748B', bg: '#F1F5F9', label: entry.action_type }

  const DiffBlock = ({ label, data }) => {
    if (!data) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
        <pre style={{ background: '#0F172A', color: '#34D399', borderRadius: 8, padding: '12px 14px', fontSize: 11, lineHeight: 1.6, overflow: 'auto', margin: 0, fontFamily: 'monospace', maxHeight: 200 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <>
      <Overlay onClose={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 460, maxWidth: '92vw', background: '#fff', zIndex: 400, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ActionBadge actionType={entry.action_type} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', flex: 1 }}>Détail de l'action</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10B981', background: '#D1FAE5', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
            <Ic.Lock /> IMMUABLE
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}><Ic.X /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Summary card */}
          <div style={{ background: ac.bg, borderLeft: `4px solid ${ac.color}`, borderRadius: '0 10px 10px 0', padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{entry.description}</div>
            {entry.notes && <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>Note : {entry.notes}</div>}
          </div>

          {/* Metadata fields */}
          {[
            ['Horodatage',  fmtFull(entry.created_at)],
            ['Action',      entry.action_type],
            ['Entité',      `${ENTITY_LABELS[entry.entity_type] ?? entry.entity_type} · ${entry.entity_id?.slice(0, 8) ?? '—'}…`],
            ['Manager',     managerName(entry.manager)],
            ['Email',       entry.manager?.email ?? '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 500, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' }}>{val}</span>
            </div>
          ))}

          {/* Before / After */}
          <div style={{ marginTop: 20 }}>
            <DiffBlock label="État avant" data={entry.before_snapshot} />
            <DiffBlock label="État après" data={entry.after_snapshot} />
            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <DiffBlock label="Métadonnées" data={entry.metadata} />
            )}
          </div>

          {/* Immutability notice */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 12, color: '#166534', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Ic.Lock />
            <div>Cette entrée est <strong>immuable</strong>. Elle ne peut pas être modifiée ni supprimée, conformément aux exigences de traçabilité.</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Timeline entry ──────────────────────────────────────────────────────── */
function TimelineEntry({ entry, onClick, isLast }) {
  const ac = ACTION_CONFIG[entry.action_type] ?? { dot: '#94A3B8', color: '#64748B', bg: '#F1F5F9', label: entry.action_type }
  const manager = managerName(entry.manager)

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Left timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16, flexShrink: 0 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: ac.dot, border: '2px solid #fff', boxShadow: `0 0 0 2px ${ac.dot}40`, zIndex: 1, marginTop: 14, flexShrink: 0 }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }} />}
      </div>

      {/* Card */}
      <div onClick={onClick}
        style={{ flex: 1, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s', borderLeft: `3px solid ${ac.dot}` }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateX(2px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <ActionBadge actionType={entry.action_type} />
              <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#F1F5F9', color: '#64748B' }}>
                {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>{entry.description}</div>
            {entry.notes && (
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' }}>"{entry.notes}"</div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94A3B8', justifyContent: 'flex-end' }}>
              <Ic.Clock /> <span title={fmtFull(entry.created_at)}>{fmtAgo(entry.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px solid #F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B' }}>
            <Ic.User /> {manager}
          </div>
          {entry.manager?.email && (
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{entry.manager.email}</div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#10B981', fontWeight: 700 }}>
            <Ic.Lock /> Certifié
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function SkeletonEntry() {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E2E8F0', marginTop: 14 }} />
      </div>
      <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '16px 18px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ height: 20, width: 120, borderRadius: 6, background: '#E2E8F0' }} />
          <div style={{ height: 20, width: 70, borderRadius: 6, background: '#E2E8F0' }} />
        </div>
        <div style={{ height: 14, width: '70%', borderRadius: 6, background: '#E2E8F0', marginBottom: 8 }} />
        <div style={{ height: 12, width: '40%', borderRadius: 6, background: '#E2E8F0' }} />
      </div>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94A3B8' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Aucune action enregistrée</div>
      <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
        Le journal d'audit se remplira automatiquement dès la première action de modération, paiement ou gestion de compte effectuée par un manager.
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const PER_PAGE = 30

export default function AuditPage() {
  const [entries, setEntries]     = useState([])
  const [total, setTotal]         = useState(0)
  const [stats, setStats]         = useState(null)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchQ, setSearchQ]     = useState('')
  const [entityType, setEntityType] = useState(null)
  const [selected, setSelected]   = useState(null)
  const debRef                    = useRef(null)
  const { toasts, add: toast }    = useToast()

  const load = useCallback(async (p = page, q = searchQ, et = entityType) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_manager_audit_trail', {
        p_entity_type: et || null,
        p_search:      q  || null,
        p_limit:  PER_PAGE,
        p_offset: (p - 1) * PER_PAGE,
      })
      if (error) throw error
      const arr = Array.isArray(data) ? data : []
      setEntries(arr)
      setTotal(arr[0]?.total_count ?? arr.length)
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [page, searchQ, entityType])

  const loadStats = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('get_manager_audit_stats')
      if (data) setStats(data)
    } catch {}
  }, [])

  useEffect(() => { load(1); loadStats() }, [])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => { setSearchQ(v); setPage(1); load(1, v, entityType) }, 300)
  }
  const applyEntity = (et) => { setEntityType(et); setPage(1); load(1, searchQ, et) }

  const handleExport = async () => {
    try {
      const { data } = await supabase.rpc('get_manager_audit_trail', {
        p_entity_type: entityType || null, p_search: searchQ || null, p_limit: 1000, p_offset: 0,
      })
      exportCSV(Array.isArray(data) ? data : [])
    } catch (e) { toast(e.message) }
  }

  /* Build by_action breakdown for stats bar */
  const topActions = stats?.by_action
    ? Object.entries(stats.by_action).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : []

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0 }}>
          <Ic.Shield />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Audit</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10B981', background: '#D1FAE5', padding: '3px 12px', borderRadius: 99, fontWeight: 700, border: '1px solid #A7F3D0' }}>
              <Ic.Lock /> Journal immuable
            </div>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>
            Traçabilité complète — toutes les actions admin sont enregistrées et ne peuvent pas être supprimées.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => { load(page, searchQ, entityType); loadStats() }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', animation: loading ? 'spin 1s linear infinite' : 'none' }}><Ic.Refresh /></span> Actualiser
          </button>
          <button onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Ic.Download /> Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <KpiCard label="Aujourd'hui"      value={stats?.total_today?.toLocaleString('fr-FR')}     color="#3B82F6" bg="#DBEAFE" icon="Shield" sub="actions enregistrées" />
        <KpiCard label="Cette semaine"    value={stats?.total_week?.toLocaleString('fr-FR')}      color="#8B5CF6" bg="#EDE9FE" icon="Tag"   sub="actions enregistrées" />
        <KpiCard label="Total historique" value={stats?.total_all?.toLocaleString('fr-FR')}       color="#10B981" bg="#D1FAE5" icon="Lock"  sub="entrées immuables" />
        <KpiCard label="Managers actifs"  value={stats?.unique_managers?.toLocaleString('fr-FR')} color="#F59E0B" bg="#FEF3C7" icon="Users" sub="ayant effectué des actions" />
      </div>

      {/* Action breakdown */}
      {topActions.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Répartition par action</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topActions.map(([action, count]) => {
              const ac = ACTION_CONFIG[action] ?? { label: action, color: '#64748B', bg: '#F1F5F9' }
              return (
                <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 6, background: ac.bg, borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ac.color }}>{ac.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: ac.color }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><Ic.Search /></span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher une action…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0F172A' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ENTITY_TYPES.map(et => (
            <button key={String(et.id)} onClick={() => applyEntity(et.id)}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${entityType === et.id ? '#0F172A' : '#E2E8F0'}`, background: entityType === et.id ? '#0F172A' : '#fff', color: entityType === et.id ? '#fff' : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {et.label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>{total.toLocaleString('fr-FR')} entrée{total > 1 ? 's' : ''}</span>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonEntry key={i} />)
          : entries.length === 0
            ? <EmptyState />
            : entries.map((e, i) => (
              <TimelineEntry key={e.id} entry={e} isLast={i === entries.length - 1}
                onClick={() => setSelected(e)} />
            ))
        }
      </div>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); load(p, searchQ, entityType) }} />

      {selected && <DetailDrawer entry={selected} onClose={() => setSelected(null)} />}
      <Toast toasts={toasts} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
