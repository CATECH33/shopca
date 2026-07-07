import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Ic = {
  Search:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  XCircle:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Trash:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Shield:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  User:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Image:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Flag:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Copy:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  RefreshCw: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Eye:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Alert:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ChevronL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Ban:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Unlock:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Home:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const PER_PAGE = 20
const TABS = [
  { id: 'reports',   label: 'Signalements',     icon: 'Flag'  },
  { id: 'accounts',  label: 'Comptes signalés',  icon: 'User'  },
  { id: 'photos',    label: 'Photos interdites', icon: 'Image' },
  { id: 'spam',      label: 'Spam',              icon: 'Alert' },
  { id: 'dupes',     label: 'Doublons',          icon: 'Copy'  },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtD = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtAgo = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)      return 'À l\'instant'
  if (diff < 3600)    return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400)   return `il y a ${Math.floor(diff/3600)}h`
  if (diff < 86400*7) return `il y a ${Math.floor(diff/86400)}j`
  return fmtD(s)
}
const displayName = (u) => {
  if (!u) return 'Inconnu'
  if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ')
  if (u.full_name) return u.full_name
  return u.email?.split('@')[0] || '—'
}
const shortId = (id) => id ? id.slice(0,8) + '…' : '—'

/* ── Toast ─────────────────────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type==='error' ? '#EF4444' : t.type==='warning' ? '#F59E0B' : '#10B981',
          color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:600,
          boxShadow:'0 4px 20px rgba(0,0,0,0.25)', maxWidth:340, lineHeight:1.4,
          animation:'slideIn 0.2s ease'
        }}>{t.msg}</div>
      ))}
    </div>
  )
}
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type='success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, add }
}

/* ── Overlay ───────────────────────────────────────────────────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:399 }} />
}

/* ── Pagination ─────────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', padding:'16px 0' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ background:'none', border:'1px solid #E2E8F0', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B', opacity: page<=1 ? 0.4 : 1 }}>
        <Ic.ChevronL />
      </button>
      <span style={{ fontSize:13, color:'#64748B' }}>Page {page} / {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        style={{ background:'none', border:'1px solid #E2E8F0', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B', opacity: page>=totalPages ? 0.4 : 1 }}>
        <Ic.ChevronR />
      </button>
    </div>
  )
}

/* ── Status / Type Badges ──────────────────────────────────────────────────── */
function Badge({ label, bg, color }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:bg, color, whiteSpace:'nowrap', display:'inline-flex' }}>
      {label}
    </span>
  )
}
function ReportStatusBadge({ status }) {
  const map = {
    pending:  { label:'En attente', bg:'#FEF3C7', color:'#D97706' },
    resolved: { label:'Résolu',     bg:'#DCFCE7', color:'#16A34A' },
    rejected: { label:'Rejeté',     bg:'#F1F5F9', color:'#64748B' },
  }
  const s = map[status] ?? { label: status, bg:'#F1F5F9', color:'#64748B' }
  return <Badge {...s} />
}
function TrustBadge({ tier }) {
  const map = {
    trusted:    { label:'Fiable',      bg:'#D1FAE5', color:'#059669' },
    unverified: { label:'Non vérifié', bg:'#F1F5F9', color:'#64748B' },
    suspicious: { label:'Suspect',     bg:'#FEF3C7', color:'#D97706' },
    fraudulent: { label:'Fraude',      bg:'#FEE2E2', color:'#DC2626' },
  }
  const s = map[tier] ?? { label: tier ?? '—', bg:'#F1F5F9', color:'#64748B' }
  return <Badge {...s} />
}
function AccountStatusBadge({ status }) {
  const map = {
    active:    { label:'Actif',    bg:'#DCFCE7', color:'#16A34A' },
    suspended: { label:'Suspendu', bg:'#FEE2E2', color:'#DC2626' },
    banned:    { label:'Banni',    bg:'#1E293B', color:'#F8FAFC'  },
  }
  const s = map[status] ?? { label: status, bg:'#F1F5F9', color:'#64748B' }
  return <Badge {...s} />
}

/* ── Skeleton Row ──────────────────────────────────────────────────────────── */
function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding:'12px 16px' }}>
          <div style={{ height:14, borderRadius:6, background:'#E2E8F0', width: i===0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}

/* ── Action Button ─────────────────────────────────────────────────────────── */
function ActionBtn({ onClick, color, bg, border, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: bg ?? 'none', color: color ?? '#374151',
        border: `1px solid ${border ?? '#D1D5DB'}`,
        borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display:'inline-flex', alignItems:'center', gap:5, transition:'opacity 0.15s'
      }}>{children}</button>
  )
}

/* ── Confirm Modal ─────────────────────────────────────────────────────────── */
function ConfirmModal({ title, body, confirmLabel, confirmColor, onConfirm, onClose, withNote, loading }) {
  const [note, setNote] = useState('')
  return (
    <>
      <Overlay onClose={onClose} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        background:'#fff', borderRadius:16, padding:28, width:440, maxWidth:'90vw',
        zIndex:500, boxShadow:'0 20px 60px rgba(0,0,0,0.25)'
      }}>
        <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:700, color:'#0F172A' }}>{title}</h3>
        <p style={{ margin:'0 0 16px', fontSize:13, color:'#64748B', lineHeight:1.6 }}>{body}</p>
        {withNote && (
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Motif / notes (optionnel)"
            style={{ width:'100%', boxSizing:'border-box', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 12px', fontSize:13, resize:'vertical', minHeight:72, outline:'none', fontFamily:'inherit', color:'#0F172A', background:'#F8FAFC' }} />
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
          <ActionBtn onClick={onClose}>Annuler</ActionBtn>
          <ActionBtn
            onClick={() => onConfirm(note)}
            disabled={loading}
            bg={confirmColor ?? '#EF4444'} color="#fff" border={confirmColor ?? '#EF4444'}>
            {loading ? 'En cours…' : confirmLabel}
          </ActionBtn>
        </div>
      </div>
    </>
  )
}

/* ── Detail Drawer ─────────────────────────────────────────────────────────── */
function DetailDrawer({ item, type, onClose, onAction, actionLoading }) {
  if (!item) return null
  const isListing = type === 'listing'
  const isProfile = type === 'profile'
  const isReport  = type === 'report'

  return (
    <>
      <Overlay onClose={onClose} />
      <div style={{
        position:'fixed', top:0, right:0, height:'100vh', width:400, maxWidth:'92vw',
        background:'#fff', zIndex:400, boxShadow:'-8px 0 40px rgba(0,0,0,0.15)',
        display:'flex', flexDirection:'column', overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>
            {isListing ? 'Détail annonce' : isProfile ? 'Détail compte' : 'Détail signalement'}
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:4 }}>
            <Ic.X />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {isReport && (
            <InfoSection rows={[
              ['ID',          shortId(item.id)],
              ['Type',        item.reported_type === 'listing' ? 'Annonce' : 'Profil'],
              ['Motif',       item.reason ?? '—'],
              ['Statut',      <ReportStatusBadge status={item.status} />],
              ['Signalé le',  fmtAgo(item.created_at)],
              ['Par',         item.reporter ? displayName(item.reporter) : '—'],
              ['Notes résol.', item.notes ?? '—'],
            ]} />
          )}
          {isListing && (
            <InfoSection rows={[
              ['ID',          shortId(item.id)],
              ['Titre',       item.title ?? '—'],
              ['Propriétaire', item.owner ? displayName(item.owner) : '—'],
              ['Email',       item.owner?.email ?? '—'],
              ['Statut',      item.status ?? '—'],
              ['Trust tier',  <TrustBadge tier={item.trust_tier} />],
              ['Score doublon', item.duplicate_score != null ? `${item.duplicate_score}%` : '—'],
              ['Signalements', item.report_count ?? 0],
              ['Créée le',    fmtD(item.created_at)],
              ['Ville',       item.city ?? '—'],
              ['Prix',        item.price ? `${Number(item.price).toLocaleString('fr-FR')} €` : '—'],
            ]} />
          )}
          {isProfile && (
            <InfoSection rows={[
              ['ID',          shortId(item.id)],
              ['Nom',         displayName(item)],
              ['Email',       item.email ?? '—'],
              ['Rôle',        item.role ?? '—'],
              ['Statut',      <AccountStatusBadge status={item.account_status} />],
              ['Trust tier',  <TrustBadge tier={item.trust_tier} />],
              ['Signalements', item.report_count ?? 0],
              ['Inscrit le',  fmtD(item.created_at)],
            ]} />
          )}
        </div>

        {/* Actions */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid #F1F5F9', display:'flex', flexWrap:'wrap', gap:8, flexShrink:0 }}>
          {(isListing || isReport) && (
            <ActionBtn onClick={() => onAction('approve', item)} disabled={actionLoading}
              bg="#10B981" color="#fff" border="#10B981">
              <Ic.Check /> Approuver
            </ActionBtn>
          )}
          {(isListing || isReport) && (
            <ActionBtn onClick={() => onAction('reject', item)} disabled={actionLoading}
              bg="#F59E0B" color="#fff" border="#F59E0B">
              <Ic.XCircle /> Refuser
            </ActionBtn>
          )}
          {isListing && (
            <ActionBtn onClick={() => onAction('delete', item)} disabled={actionLoading}
              bg="#EF4444" color="#fff" border="#EF4444">
              <Ic.Trash /> Supprimer
            </ActionBtn>
          )}
          {isListing && (
            <ActionBtn onClick={() => onAction('suspend_owner', item)} disabled={actionLoading}
              bg="#1E293B" color="#fff" border="#1E293B">
              <Ic.Ban /> Suspendre compte
            </ActionBtn>
          )}
          {isProfile && item.account_status !== 'active' && (
            <ActionBtn onClick={() => onAction('reactivate', item)} disabled={actionLoading}
              bg="#10B981" color="#fff" border="#10B981">
              <Ic.Unlock /> Réactiver
            </ActionBtn>
          )}
          {isProfile && item.account_status === 'active' && (
            <ActionBtn onClick={() => onAction('suspend_owner', item)} disabled={actionLoading}
              bg="#EF4444" color="#fff" border="#EF4444">
              <Ic.Ban /> Suspendre
            </ActionBtn>
          )}
        </div>
      </div>
    </>
  )
}

function InfoSection({ rows }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {rows.map(([label, val], i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F1F5F9' }}>
          <span style={{ fontSize:12, color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
          <span style={{ fontSize:13, color:'#0F172A', fontWeight:500, maxWidth:'55%', textAlign:'right', wordBreak:'break-word' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   TAB 1 — Signalements (annonces signalées par les utilisateurs)
══════════════════════════════════════════════════════════════════════════════ */
function SignalementsTab({ toast }) {
  const [rows, setRows]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [status, setStatus]     = useState('pending')
  const [selected, setSelected] = useState(null)
  const [modal, setModal]       = useState(null) // { action, item }
  const [actLoading, setAct]    = useState(false)

  const load = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_manager_reports', {
        p_type: 'listing', p_status: status,
        p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE
      })
      if (error) throw error
      setRows(Array.isArray(data) ? data : [])
      setTotal(data?.[0]?.total_count ?? data?.length ?? 0)
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { load(1); setPage(1) }, [status])
  useEffect(() => { load(page) }, [page])

  const handleAction = (action, item) => {
    if (action === 'approve') setModal({ action: 'approve', item })
    else if (action === 'reject') setModal({ action: 'reject', item })
    else setModal({ action, item })
  }

  const confirmAction = async (note) => {
    if (!modal) return
    setAct(true)
    try {
      const { error } = await supabase.rpc('manager_resolve_report', {
        p_report_id: modal.item.id,
        p_action: modal.action,
        p_notes: note || null
      })
      if (error) throw error
      toast(modal.action === 'approve' ? 'Signalement approuvé' : 'Signalement refusé')
      setModal(null); setSelected(null); load(page)
    } catch (e) { toast(e.message, 'error') }
    finally { setAct(false) }
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['pending','resolved','rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            style={{ padding:'6px 16px', borderRadius:8, border:`1px solid ${status===s ? '#EF4444' : '#E2E8F0'}`,
              background: status===s ? '#EF4444' : '#fff', color: status===s ? '#fff' : '#64748B',
              fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {{ pending:'En attente', resolved:'Résolus', rejected:'Rejetés' }[s]}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:12, color:'#94A3B8', alignSelf:'center' }}>{total} signalement{total>1?'s':''}</span>
      </div>

      <TableShell cols={['Annonce signalée', 'Motif', 'Signalé par', 'Date', 'Statut', 'Actions']} loading={loading} empty={rows.length === 0}>
        {rows.map(r => (
          <tr key={r.id} style={{ borderBottom:'1px solid #F8FAFC', cursor:'pointer' }}
            onClick={() => setSelected(r)}>
            <td style={td}><span style={{ fontSize:11, color:'#94A3B8', fontFamily:'monospace' }}>{shortId(r.reported_id)}</span></td>
            <td style={td}><span style={{ fontSize:12 }}>{r.reason ?? '—'}</span></td>
            <td style={td}>{r.reporter ? <span style={{ fontSize:12 }}>{displayName(r.reporter)}</span> : <span style={{ fontSize:12, color:'#94A3B8' }}>Anonyme</span>}</td>
            <td style={td}><span style={{ fontSize:12, color:'#94A3B8' }}>{fmtAgo(r.created_at)}</span></td>
            <td style={td}><ReportStatusBadge status={r.status} /></td>
            <td style={td} onClick={e => e.stopPropagation()}>
              {r.status === 'pending' && (
                <div style={{ display:'flex', gap:6 }}>
                  <ActionBtn onClick={() => handleAction('approve', r)} bg="#10B981" color="#fff" border="#10B981"><Ic.Check /> OK</ActionBtn>
                  <ActionBtn onClick={() => handleAction('reject', r)} bg="#F59E0B" color="#fff" border="#F59E0B"><Ic.XCircle /> Refuser</ActionBtn>
                </div>
              )}
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); load(p) }} />

      {selected && (
        <DetailDrawer item={selected} type="report" onClose={() => setSelected(null)}
          onAction={handleAction} actionLoading={actLoading} />
      )}
      {modal && (
        <ConfirmModal
          title={modal.action === 'approve' ? 'Approuver ce signalement ?' : 'Refuser ce signalement ?'}
          body={modal.action === 'approve'
            ? 'Le signalement sera marqué résolu et l\'annonce sera maintenue.'
            : 'Le signalement sera rejeté et classé sans suite.'}
          confirmLabel={modal.action === 'approve' ? 'Approuver' : 'Refuser'}
          confirmColor={modal.action === 'approve' ? '#10B981' : '#F59E0B'}
          onConfirm={confirmAction} onClose={() => setModal(null)}
          withNote loading={actLoading} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   TAB 2 — Comptes signalés
══════════════════════════════════════════════════════════════════════════════ */
function ComptesTab({ toast }) {
  const [rows, setRows]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)
  const [modal, setModal]       = useState(null)
  const [actLoading, setAct]    = useState(false)

  const load = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_manager_reported_profiles', {
        p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE
      })
      if (error) throw error
      setRows(Array.isArray(data) ? data : [])
      setTotal(data?.[0]?.total_count ?? data?.length ?? 0)
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])
  useEffect(() => { load(page) }, [page])

  const handleAction = (action, item) => setModal({ action, item })

  const confirmAction = async (note) => {
    if (!modal) return
    setAct(true)
    try {
      if (modal.action === 'reactivate') {
        const { error } = await supabase.rpc('manager_reactivate_profile', { p_profile_id: modal.item.id })
        if (error) throw error
        toast('Compte réactivé')
      } else {
        const { error } = await supabase.rpc('manager_moderate_listing', {
          p_listing_id: modal.item.id, p_action: modal.action, p_notes: note || null
        })
        if (error) throw error
        toast('Action effectuée')
      }
      setModal(null); setSelected(null); load(page)
    } catch (e) { toast(e.message, 'error') }
    finally { setAct(false) }
  }

  return (
    <div>
      <div style={{ marginBottom:16, display:'flex', justifyContent:'flex-end' }}>
        <span style={{ fontSize:12, color:'#94A3B8' }}>{total} compte{total>1?'s':''}</span>
      </div>

      <TableShell cols={['Utilisateur', 'Email', 'Rôle', 'Statut', 'Trust', 'Signalements', 'Actions']} loading={loading} empty={rows.length === 0}>
        {rows.map(r => (
          <tr key={r.id} style={{ borderBottom:'1px solid #F8FAFC', cursor:'pointer' }} onClick={() => setSelected(r)}>
            <td style={td}><span style={{ fontSize:13, fontWeight:600 }}>{displayName(r)}</span></td>
            <td style={td}><span style={{ fontSize:12, color:'#64748B' }}>{r.email ?? '—'}</span></td>
            <td style={td}><span style={{ fontSize:12, color:'#64748B', textTransform:'capitalize' }}>{r.role ?? '—'}</span></td>
            <td style={td}><AccountStatusBadge status={r.account_status} /></td>
            <td style={td}><TrustBadge tier={r.trust_tier} /></td>
            <td style={td}><span style={{ fontSize:13, fontWeight:700, color:'#EF4444' }}>{r.report_count ?? 0}</span></td>
            <td style={td} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', gap:6 }}>
                {r.account_status !== 'active'
                  ? <ActionBtn onClick={() => handleAction('reactivate', r)} bg="#10B981" color="#fff" border="#10B981"><Ic.Unlock /> Réactiver</ActionBtn>
                  : <ActionBtn onClick={() => handleAction('suspend_owner', r)} bg="#EF4444" color="#fff" border="#EF4444"><Ic.Ban /> Suspendre</ActionBtn>
                }
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); load(p) }} />

      {selected && (
        <DetailDrawer item={selected} type="profile" onClose={() => setSelected(null)}
          onAction={handleAction} actionLoading={actLoading} />
      )}
      {modal && (
        <ConfirmModal
          title={modal.action === 'reactivate' ? 'Réactiver ce compte ?' : 'Suspendre ce compte ?'}
          body={modal.action === 'reactivate'
            ? `Le compte de ${displayName(modal.item)} sera réactivé immédiatement.`
            : `Le compte de ${displayName(modal.item)} sera suspendu. L'utilisateur ne pourra plus se connecter.`}
          confirmLabel={modal.action === 'reactivate' ? 'Réactiver' : 'Suspendre'}
          confirmColor={modal.action === 'reactivate' ? '#10B981' : '#EF4444'}
          onConfirm={confirmAction} onClose={() => setModal(null)}
          withNote loading={actLoading} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHARED — Flagged Listings Tab (Photos / Spam / Doublons)
══════════════════════════════════════════════════════════════════════════════ */
function FlaggedTab({ filter, toast }) {
  const [rows, setRows]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [searchQ, setSearchQ]   = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal]       = useState(null)
  const [actLoading, setAct]    = useState(false)
  const debRef                  = useRef(null)

  const load = useCallback(async (p = page, q = searchQ) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_manager_flagged_listings', {
        p_filter: filter, p_search: q || null,
        p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE
      })
      if (error) throw error
      setRows(Array.isArray(data) ? data : [])
      setTotal(data?.[0]?.total_count ?? data?.length ?? 0)
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [filter, page, searchQ])

  useEffect(() => { load(1, ''); setPage(1); setSearch(''); setSearchQ('') }, [filter])
  useEffect(() => { load(page, searchQ) }, [page])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => { setSearchQ(v); setPage(1); load(1, v) }, 300)
  }

  const handleAction = (action, item) => setModal({ action, item })

  const confirmAction = async (note) => {
    if (!modal) return
    setAct(true)
    try {
      const { error } = await supabase.rpc('manager_moderate_listing', {
        p_listing_id: modal.item.id,
        p_action: modal.action,
        p_notes: note || null
      })
      if (error) throw error
      const labels = { approve:'Annonce approuvée', reject:'Annonce refusée', delete:'Annonce supprimée', suspend_owner:'Compte suspendu' }
      toast(labels[modal.action] ?? 'Action effectuée')
      setModal(null); setSelected(null); load(page, searchQ)
    } catch (e) { toast(e.message, 'error') }
    finally { setAct(false) }
  }

  const colsMap = {
    photos:     ['Annonce', 'Propriétaire', 'Photos signalées', 'Créée le', 'Actions'],
    spam:       ['Annonce', 'Propriétaire', 'Trust tier', 'Signalements', 'Créée le', 'Actions'],
    duplicates: ['Annonce', 'Propriétaire', 'Score doublon', 'Signalements', 'Créée le', 'Actions'],
  }

  return (
    <div>
      {/* Search */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ position:'relative', flex:1, maxWidth:320 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }}><Ic.Search /></span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher une annonce…"
            style={{ width:'100%', boxSizing:'border-box', padding:'8px 12px 8px 32px', border:'1px solid #E2E8F0', borderRadius:9, fontSize:13, outline:'none', fontFamily:'inherit', color:'#0F172A' }} />
        </div>
        <span style={{ fontSize:12, color:'#94A3B8', marginLeft:'auto' }}>{total} annonce{total>1?'s':''}</span>
      </div>

      <TableShell cols={colsMap[filter] ?? []} loading={loading} empty={rows.length === 0}>
        {rows.map(r => (
          <tr key={r.id} style={{ borderBottom:'1px solid #F8FAFC', cursor:'pointer' }} onClick={() => setSelected(r)}>
            <td style={td}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0F172A', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title ?? '—'}</div>
                <div style={{ fontSize:11, color:'#94A3B8', fontFamily:'monospace' }}>{shortId(r.id)}</div>
              </div>
            </td>
            <td style={td}><span style={{ fontSize:12 }}>{r.owner ? displayName(r.owner) : '—'}</span></td>
            {filter === 'photos' && <td style={td}><span style={{ fontSize:13, fontWeight:700, color:'#EF4444' }}>{Array.isArray(r.photo_flags) ? r.photo_flags.length : 0}</span></td>}
            {filter === 'spam'   && <td style={td}><TrustBadge tier={r.trust_tier} /></td>}
            {filter === 'duplicates' && <td style={td}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:60, height:6, borderRadius:99, background:'#E2E8F0', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100, r.duplicate_score ?? 0)}%`, background: (r.duplicate_score ?? 0) > 75 ? '#EF4444' : '#F59E0B', borderRadius:99 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color: (r.duplicate_score ?? 0) > 75 ? '#EF4444' : '#D97706' }}>{r.duplicate_score ?? 0}%</span>
              </div>
            </td>}
            {filter !== 'photos' && <td style={td}><span style={{ fontSize:13, fontWeight:700, color:'#EF4444' }}>{r.report_count ?? 0}</span></td>}
            <td style={td}><span style={{ fontSize:12, color:'#94A3B8' }}>{fmtAgo(r.created_at)}</span></td>
            <td style={td} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', gap:6 }}>
                <ActionBtn onClick={() => handleAction('approve', r)} bg="#10B981" color="#fff" border="#10B981"><Ic.Check /></ActionBtn>
                <ActionBtn onClick={() => handleAction('reject', r)}  bg="#F59E0B" color="#fff" border="#F59E0B"><Ic.XCircle /></ActionBtn>
                <ActionBtn onClick={() => handleAction('delete', r)}  bg="#EF4444" color="#fff" border="#EF4444"><Ic.Trash /></ActionBtn>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); load(p, searchQ) }} />

      {selected && (
        <DetailDrawer item={selected} type="listing" onClose={() => setSelected(null)}
          onAction={handleAction} actionLoading={actLoading} />
      )}
      {modal && (
        <ConfirmModal
          title={{
            approve: 'Approuver cette annonce ?',
            reject:  'Refuser cette annonce ?',
            delete:  'Supprimer cette annonce ?',
            suspend_owner: 'Suspendre le propriétaire ?',
          }[modal.action]}
          body={{
            approve: 'L\'annonce sera marquée valide et retirée de la file de modération.',
            reject:  'L\'annonce sera masquée et le propriétaire notifié.',
            delete:  'L\'annonce sera définitivement supprimée. Action irréversible.',
            suspend_owner: `Le compte de ${modal.item.owner ? displayName(modal.item.owner) : 'ce propriétaire'} sera suspendu.`,
          }[modal.action]}
          confirmLabel={{ approve:'Approuver', reject:'Refuser', delete:'Supprimer', suspend_owner:'Suspendre' }[modal.action]}
          confirmColor={{ approve:'#10B981', reject:'#F59E0B', delete:'#EF4444', suspend_owner:'#1E293B' }[modal.action]}
          onConfirm={confirmAction} onClose={() => setModal(null)}
          withNote loading={actLoading} />
      )}
    </div>
  )
}

/* ── Table Shell ───────────────────────────────────────────────────────────── */
function TableShell({ cols, loading, empty, children }) {
  return (
    <div style={{ border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', background:'#fff' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#F8FAFC' }}>
            {cols.map(c => (
              <th key={c} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
            : empty
              ? <tr><td colSpan={cols.length} style={{ textAlign:'center', padding:'40px 16px', color:'#94A3B8', fontSize:13 }}>Aucun élément</td></tr>
              : children
          }
        </tbody>
      </table>
    </div>
  )
}

const td = { padding:'12px 16px', verticalAlign:'middle' }

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('reports')
  const { toasts, add: toast }    = useToast()

  return (
    <div style={{ padding:'32px 32px 80px', maxWidth:1200, margin:'0 auto' }}>
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', color:'#EF4444' }}>
            <Ic.Shield />
          </div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#0F172A' }}>Modération</h1>
        </div>
        <p style={{ margin:0, fontSize:13, color:'#64748B' }}>
          Signalements, fraudes détectées, doublons IA, annonces suspectes — validation ou suppression en 1 clic.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'2px solid #F1F5F9', marginBottom:24, overflowX:'auto' }}>
        {TABS.map(t => {
          const Icon = Ic[t.icon]
          const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background:'none', border:'none', padding:'10px 18px', cursor:'pointer',
                fontSize:13, fontWeight: active ? 700 : 500,
                color: active ? '#EF4444' : '#64748B',
                borderBottom: active ? '2px solid #EF4444' : '2px solid transparent',
                marginBottom:-2, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
                transition:'color 0.15s'
              }}>
              <Icon /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'reports'  && <SignalementsTab toast={toast} />}
      {activeTab === 'accounts' && <ComptesTab     toast={toast} />}
      {activeTab === 'photos'   && <FlaggedTab filter="photos"     toast={toast} />}
      {activeTab === 'spam'     && <FlaggedTab filter="spam"       toast={toast} />}
      {activeTab === 'dupes'    && <FlaggedTab filter="duplicates" toast={toast} />}

      <Toast toasts={toasts} />
    </div>
  )
}
