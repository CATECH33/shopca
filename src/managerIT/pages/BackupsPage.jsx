import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  DB:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ExLink:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Archive:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  Clock:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  User:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Info:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

/* ── Tables exportables ─────────────────────────────────────────────────── */
const EXPORTABLE_TABLES = [
  { id: 'profiles',       label: 'Utilisateurs',   icon: '👤', color: '#6366F1', desc: 'Comptes, rôles, statuts' },
  { id: 'listings',       label: 'Annonces',        icon: '🏠', color: '#F59E0B', desc: 'Toutes les annonces' },
  { id: 'subscriptions',  label: 'Abonnements',     icon: '💳', color: '#10B981', desc: 'Plans et statuts Stripe' },
  { id: 'payments',       label: 'Paiements',       icon: '💰', color: '#0EA5E9', desc: 'Historique des transactions' },
  { id: 'reports',        label: 'Signalements',    icon: '🚩', color: '#EF4444', desc: 'Signalements utilisateurs' },
  { id: 'support_tickets',label: 'Tickets support', icon: '💬', color: '#8B5CF6', desc: 'Demandes et conversations' },
  { id: 'audit_trail',    label: 'Audit',           icon: '🔒', color: '#64748B', desc: 'Journal immuable des actions' },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const fmtAgo  = (s) => {
  if (!s) return '—'
  const d = (Date.now() - new Date(s)) / 1000
  if (d < 60)    return `${Math.floor(d)}s`
  if (d < 3600)  return `${Math.floor(d / 60)} min`
  if (d < 86400) return `${Math.floor(d / 3600)}h`
  return `${Math.floor(d / 86400)}j`
}
const fmtRows = (n) => n ? Number(n).toLocaleString('fr-FR') : '0'

/* ── CSV export ──────────────────────────────────────────────────────────── */
function toCSV(data) {
  if (!data || data.length === 0) return ''
  const keys = Object.keys(data[0])
  const header = keys.join(';')
  const rows = data.map(r => keys.map(k => {
    const v = r[k] == null ? '' : typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k])
    return `"${v.replace(/"/g, '""')}"`
  }).join(';'))
  return [header, ...rows].join('\n')
}
function downloadCSV(content, filename) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'error') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  return { toasts, add }
}
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#10B981', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360 }}>{t.msg}</div>
      ))}
    </div>
  )
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page <= 1 ? 0.4 : 1 }}><Ic.ChevronL /></button>
      <span style={{ fontSize: 12, color: '#64748B' }}>Page {page} / {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page >= pages ? 0.4 : 1 }}><Ic.ChevronR /></button>
    </div>
  )
}

/* ── Table export card ───────────────────────────────────────────────────── */
function TableCard({ tbl, rowCount, onExport, exporting }) {
  const busy = exporting === tbl.id
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: tbl.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {tbl.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{tbl.label}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{tbl.desc}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{fmtRows(rowCount)}</div>
        <div style={{ fontSize: 10, color: '#94A3B8' }}>lignes</div>
      </div>
      <button onClick={() => onExport(tbl.id)} disabled={busy}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: `1px solid ${busy ? '#E2E8F0' : tbl.color}`, background: busy ? '#F8FAFC' : tbl.color + '12', color: busy ? '#94A3B8' : tbl.color, fontSize: 12, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', animation: busy ? 'spin 1s linear infinite' : 'none' }}>
          {busy ? <Ic.Refresh /> : <Ic.Download />}
        </span>
        {busy ? 'Export…' : 'CSV'}
      </button>
    </div>
  )
}

/* ── History row ─────────────────────────────────────────────────────────── */
function HistoryRow({ rec, i }) {
  const typeMap = {
    manual:       { label: 'Manuel',    color: '#6366F1', bg: '#EEF2FF' },
    scheduled:    { label: 'Planifié',  color: '#0EA5E9', bg: '#E0F2FE' },
    supabase_auto:{ label: 'Supabase',  color: '#10B981', bg: '#D1FAE5' },
  }
  const statusMap = {
    completed: { label: 'Réussi',  color: '#10B981', bg: '#D1FAE5' },
    failed:    { label: 'Échoué',  color: '#EF4444', bg: '#FEE2E2' },
    running:   { label: 'En cours',color: '#F59E0B', bg: '#FEF3C7' },
    pending:   { label: 'Attente', color: '#94A3B8', bg: '#F1F5F9' },
  }
  const tc = typeMap[rec.type]   ?? { label: rec.type,   color: '#64748B', bg: '#F1F5F9' }
  const sc = statusMap[rec.status] ?? { label: rec.status, color: '#64748B', bg: '#F1F5F9' }

  return (
    <tr style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : 'none' }}>
      <td style={{ padding: '11px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{rec.label ?? 'Snapshot'}</div>
        {rec.creator && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Ic.User /> {rec.creator.email}</div>}
      </td>
      <td style={{ padding: '11px 14px' }}>
        <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: tc.bg, color: tc.color }}>{tc.label}</span>
      </td>
      <td style={{ padding: '11px 14px' }}>
        <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.color }}>{sc.label}</span>
      </td>
      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748B' }}>
        {Array.isArray(rec.tables_list) && rec.tables_list.length > 0
          ? rec.tables_list.join(', ')
          : '—'}
      </td>
      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748B' }}>
        {fmtRows(rec.row_count)} lignes
        {rec.size_label && <span style={{ color: '#94A3B8', marginLeft: 4 }}>· {rec.size_label}</span>}
      </td>
      <td style={{ padding: '11px 14px', fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Ic.Clock /> <span title={fmtDate(rec.created_at)}>{fmtAgo(rec.created_at)}</span>
      </td>
    </tr>
  )
}

/* ── Supabase auto backup info card ──────────────────────────────────────── */
function SupabaseCard() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 14, padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,0.1)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic.Shield />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Sauvegardes Supabase</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#10B981', color: '#fff' }}>ACTIF</span>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            Supabase effectue automatiquement des sauvegardes quotidiennes de votre base de données PostgreSQL. Les données sont conservées selon votre plan.
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              ['Fréquence',     'Quotidienne'],
              ['Rétention',     '7 jours (Free)'],
              ['Type',          'Full PostgreSQL dump'],
              ['Chiffrement',   'AES-256'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <a href="https://supabase.com/dashboard/project/vvjmcrcakmmjuhpbtzbu/database/backups/scheduled"
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
          <Ic.ExLink /> Gérer
        </a>
      </div>
    </div>
  )
}

/* ── Full snapshot (toutes tables) ──────────────────────────────────────── */
async function runFullSnapshot(stats, toast, logBackup) {
  const tables = EXPORTABLE_TABLES.map(t => t.id)
  toast('Snapshot complet en cours…', 'success')
  let totalRows = 0
  for (const tbl of tables) {
    try {
      const { data } = await supabase.rpc('manager_export_table', { p_table: tbl })
      const arr = Array.isArray(data) ? data : []
      if (arr.length > 0) {
        downloadCSV(toCSV(arr), `shopca_${tbl}_${Date.now()}.csv`)
        totalRows += arr.length
      }
    } catch {}
  }
  await logBackup('Snapshot complet', 'manual', tables, totalRows)
  toast(`Snapshot terminé — ${totalRows.toLocaleString('fr-FR')} lignes exportées`, 'success')
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const PER_PAGE = 20

export default function BackupsPage() {
  const [dbStats,    setDbStats]    = useState(null)
  const [records,    setRecords]    = useState([])
  const [recTotal,   setRecTotal]   = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(null)   // table id being exported
  const [snapLoading,setSnapLoading]= useState(false)
  const { toasts, add: toast }      = useToast()

  const loadAll = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const [statsRes, recsRes] = await Promise.all([
        supabase.rpc('get_manager_db_stats'),
        supabase.rpc('get_manager_backup_records', { p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE }),
      ])
      if (statsRes.data) setDbStats(statsRes.data)
      if (!recsRes.error) {
        const arr = Array.isArray(recsRes.data) ? recsRes.data : []
        setRecords(arr)
        setRecTotal(arr[0]?.total_count ?? arr.length)
      }
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { loadAll(1) }, [])

  /* Log backup to DB */
  const logBackup = useCallback(async (label, type, tables, rowCount) => {
    try {
      await supabase.rpc('manager_log_backup', {
        p_label: label, p_type: type,
        p_tables_list: tables,
        p_row_count: rowCount,
        p_size_label: `~${Math.round(rowCount * 0.5 / 1024)} Ko`,
      })
      await loadAll(1)
    } catch {}
  }, [loadAll])

  /* Export single table */
  const exportTable = useCallback(async (tableId) => {
    setExporting(tableId)
    try {
      const { data, error } = await supabase.rpc('manager_export_table', { p_table: tableId })
      if (error) throw error
      const arr = Array.isArray(data) ? data : []
      if (arr.length === 0) { toast('Aucune donnée à exporter pour cette table.', 'error'); return }
      const filename = `shopca_${tableId}_${new Date().toISOString().slice(0, 10)}.csv`
      downloadCSV(toCSV(arr), filename)
      const tbl = EXPORTABLE_TABLES.find(t => t.id === tableId)
      await logBackup(`Export ${tbl?.label ?? tableId}`, 'manual', [tableId], arr.length)
      toast(`${arr.length.toLocaleString('fr-FR')} lignes exportées`, 'success')
    } catch (e) { toast(e.message) }
    finally { setExporting(null) }
  }, [logBackup, toast])

  /* Full snapshot */
  const fullSnapshot = useCallback(async () => {
    setSnapLoading(true)
    await runFullSnapshot(dbStats, toast, logBackup)
    setSnapLoading(false)
  }, [dbStats, toast, logBackup])

  const lastBackup = records.find(r => r.status === 'completed')

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><Ic.DB /></div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Sauvegardes</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Gestion des exports et sauvegardes de la base de données</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => loadAll(page)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', animation: loading ? 'spin 1s linear infinite' : 'none' }}><Ic.Refresh /></span> Actualiser
          </button>
          <button onClick={fullSnapshot} disabled={snapLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: 'none', background: snapLoading ? '#E2E8F0' : '#10B981', color: snapLoading ? '#94A3B8' : '#fff', fontSize: 12, fontWeight: 700, cursor: snapLoading ? 'not-allowed' : 'pointer' }}>
            <span style={{ display: 'inline-flex', animation: snapLoading ? 'spin 1s linear infinite' : 'none' }}>
              {snapLoading ? <Ic.Refresh /> : <Ic.Archive />}
            </span>
            {snapLoading ? 'Export en cours…' : 'Snapshot complet'}
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total lignes DB',   value: dbStats ? Number(dbStats.total).toLocaleString('fr-FR') : '…', color: '#10B981' },
          { label: 'Dernier export',    value: lastBackup ? fmtAgo(lastBackup.created_at) : '—',              color: '#3B82F6' },
          { label: 'Exports total',     value: recTotal.toLocaleString('fr-FR'),                               color: '#8B5CF6' },
          { label: 'Tables exportables',value: EXPORTABLE_TABLES.length,                                       color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Supabase auto backup info */}
      <div style={{ marginBottom: 28 }}>
        <SupabaseCard />
      </div>

      {/* Tables export */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Export par table</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8' }}>
            <Ic.Info /> Téléchargement CSV immédiat + enregistrement dans l'historique
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
          {EXPORTABLE_TABLES.map(tbl => (
            <TableCard key={tbl.id} tbl={tbl}
              rowCount={dbStats?.[tbl.id]}
              onExport={exportTable}
              exporting={exporting} />
          ))}
        </div>
      </div>

      {/* Backup history */}
      <div>
        <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Historique des exports</h2>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Label', 'Type', 'Statut', 'Tables', 'Volume', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: '12px 14px' }}>
                    <div style={{ height: 14, background: '#E2E8F0', borderRadius: 6, width: '80%' }} />
                  </td></tr>
                ))
                : records.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 14px', color: '#94A3B8', fontSize: 13 }}>Aucun export enregistré</td></tr>
                  : records.map((r, i) => <HistoryRow key={r.id} rec={r} i={i} />)
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={recTotal} perPage={PER_PAGE} onChange={p => { setPage(p); loadAll(p) }} />
      </div>

      <Toast toasts={toasts} />
    </div>
  )
}
