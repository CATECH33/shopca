import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Ic = {
  Search:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ChevronD:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Dots:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>,
  Eye:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  XCircle:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Star:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarFill:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trash:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Shield:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Home:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Map:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Activity:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  User:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Image:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Refresh:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Sort:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  ExternalLink: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  active:   { label: 'Active',     bg: '#DCFCE7', color: '#16A34A' },
  pending:  { label: 'En attente', bg: '#FEF3C7', color: '#D97706' },
  inactive: { label: 'Inactive',   bg: '#F1F5F9', color: '#64748B' },
}
const TRUST_MAP = {
  trusted:    { label: 'Fiable',      color: '#10B981', bg: '#D1FAE5' },
  suspicious: { label: 'Suspect',     color: '#F59E0B', bg: '#FEF3C7' },
  unverified: { label: 'Non vérifié', color: '#94A3B8', bg: '#F1F5F9' },
  fraudulent: { label: 'Fraude',      color: '#EF4444', bg: '#FEE2E2' },
}
const TRANSACTION_MAP = {
  vente:     { label: 'Vente',    color: '#6366F1', bg: '#EEF2FF' },
  location:  { label: 'Location', color: '#3B82F6', bg: '#DBEAFE' },
  colocation:{ label: 'Coloc',    color: '#8B5CF6', bg: '#EDE9FE' },
}
const PROPERTY_TYPES = ['appartement','maison','studio','loft','villa','terrain','garage','bureau','commerce']
const PER_PAGE = 25

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtPrice = (n, type) => {
  if (!n) return '—'
  const p = Number(n).toLocaleString('fr-FR')
  return type === 'location' ? `${p} €/mois` : `${p} €`
}
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtTime = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)      return 'À l\'instant'
  if (diff < 3600)    return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400)   return `il y a ${Math.floor(diff/3600)}h`
  if (diff < 86400*7) return `il y a ${Math.floor(diff/86400)}j`
  return fmtDate(s)
}
const displayOwner = (o) => {
  if (!o) return 'Inconnu'
  if (o.first_name || o.last_name) return [o.first_name, o.last_name].filter(Boolean).join(' ')
  if (o.full_name) return o.full_name
  return o.email?.split('@')[0] || '—'
}

/* ── Small Components ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#F1F5F9', color: '#64748B' }
  return <span style={{ display:'inline-flex', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>
}
function TransBadge({ type }) {
  const t = TRANSACTION_MAP[type] ?? { label: type, color: '#64748B', bg: '#F1F5F9' }
  return <span style={{ display:'inline-flex', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:t.bg, color:t.color, whiteSpace:'nowrap' }}>{t.label}</span>
}
function TrustBadge({ tier, score }) {
  const t = TRUST_MAP[tier] ?? TRUST_MAP.unverified
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <span style={{ display:'inline-flex', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:t.bg, color:t.color }}>{t.label}</span>
      {score != null && <span style={{ fontSize:10, color:'#94A3B8' }}>{score}</span>}
    </div>
  )
}
function Skel({ w='100%', h=13 }) {
  return <div style={{ width:w, height:h, borderRadius:6, background:'#F1F5F9', animation:'pulse 1.4s ease-in-out infinite' }} />
}
function Overlay({ children, onClose }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(3px)' }}>
      {children}
    </div>
  )
}
function SectionTitle({ children }) {
  return <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#94A3B8', marginTop:18, marginBottom:4 }}>{children}</div>
}
function StatBox({ label, val, color }) {
  return (
    <div style={{ background:'#F8FAFC', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
      <div style={{ fontSize:20, fontWeight:800, color: color || '#0F172A' }}>{val}</div>
      <div style={{ fontSize:10, color:'#94A3B8', fontWeight:600, marginTop:2 }}>{label}</div>
    </div>
  )
}
function ActionBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:`1px solid ${color}30`, background:`${color}10`, color, fontSize:12, fontWeight:600, cursor:'pointer' }}
      onMouseEnter={e=>e.currentTarget.style.background=`${color}20`}
      onMouseLeave={e=>e.currentTarget.style.background=`${color}10`}>
      {children}
    </button>
  )
}
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background: type==='error'?'#FEF2F2':'#F0FDF4', border:`1px solid ${type==='error'?'#FECACA':'#BBF7D0'}`, color: type==='error'?'#991B1B':'#166534', borderRadius:12, padding:'12px 18px', fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,.12)', display:'flex', alignItems:'center', gap:8 }}>
      {type==='success' ? <Ic.Check /> : '⚠️'} {msg}
    </div>
  )
}

/* ── Action Dropdown ────────────────────────────────────────────────────────── */
function ActionMenu({ listing, onView, onEdit, onApprove, onReject, onTogglePremium, onDelete, loading }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const item = (icon, label, onClick, danger, disabled) => (
    <button disabled={disabled||loading} onClick={() => { setOpen(false); onClick() }}
      style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', background:'none', border:'none', cursor:disabled?'default':'pointer', fontSize:12, fontWeight:500, color:danger?'#EF4444':'#374151', textAlign:'left', opacity:disabled?.4:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background='#F8FAFC' }}
      onMouseLeave={e=>e.currentTarget.style.background='none'}>
      <span style={{ color:danger?'#EF4444':'#94A3B8' }}>{icon}</span>{label}
    </button>
  )
  const sep = () => <div style={{ height:1, background:'#F1F5F9', margin:'4px 0' }} />
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', cursor:'pointer', color:'#64748B' }}
        onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
        onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
        <Ic.Dots />
      </button>
      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:200, background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', boxShadow:'0 8px 24px rgba(0,0,0,.10)', minWidth:210, overflow:'hidden', padding:'4px 0' }}>
          {item(<Ic.Eye />,      'Voir la fiche',       onView)}
          {item(<Ic.Edit />,     'Modifier',             onEdit)}
          {sep()}
          {listing.status === 'pending'  && item(<Ic.Check />,    'Approuver',         onApprove)}
          {listing.status !== 'inactive' && item(<Ic.XCircle />,  'Rejeter',           onReject,  true)}
          {listing.status === 'inactive' && item(<Ic.Check />,    'Réactiver',         onApprove)}
          {sep()}
          {!listing.is_premium && item(<Ic.StarFill />, 'Activer Premium',    () => onTogglePremium(true))}
          {listing.is_premium  && item(<Ic.Star />,     'Retirer Premium',    () => onTogglePremium(false))}
          {sep()}
          {item(<Ic.Trash />,    'Supprimer',            onDelete, true)}
        </div>
      )}
    </div>
  )
}

/* ── Edit Modal ─────────────────────────────────────────────────────────────── */
function EditModal({ listing, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    title:       listing.title       || '',
    description: listing.description || '',
    price:       listing.price       || '',
    status:      listing.status      || 'active',
    is_verified: listing.is_verified || false,
    is_premium:  listing.is_premium  || false,
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value }))
  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, color:'#0F172A', outline:'none', boxSizing:'border-box' }
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800 }}>Modifier l'annonce</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><Ic.X /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Titre</label>
            <input style={inp} value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Description</label>
            <textarea style={{ ...inp, resize:'vertical', minHeight:100 }} value={form.description} onChange={set('description')} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Prix (€)</label>
              <input style={inp} type="number" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Statut</label>
              <select style={{ ...inp, cursor:'pointer' }} value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="pending">En attente</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={form.is_verified} onChange={set('is_verified')} style={{ accentColor:'#10B981', width:16, height:16 }} />
              Vérifiée
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={form.is_premium} onChange={set('is_premium')} style={{ accentColor:'#F59E0B', width:16, height:16 }} />
              Premium
            </label>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={() => onSave(form)} disabled={loading}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#6366F1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:loading?.7:1 }}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Reject Modal ───────────────────────────────────────────────────────────── */
function RejectModal({ listing, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>❌</div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800 }}>Rejeter cette annonce ?</h3>
          <div style={{ fontSize:12, color:'#64748B', marginTop:6, fontWeight:600 }}>«{listing.title?.slice(0,50)}»</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Motif du rejet (obligatoire)</label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Contenu inapproprié, informations incorrectes…"
            style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, resize:'none', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#EF4444', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:(loading||!reason.trim())?.5:1 }}>
            {loading ? '…' : 'Rejeter'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Delete Modal ───────────────────────────────────────────────────────────── */
function DeleteModal({ listing, onClose, onConfirm, loading }) {
  const [ok, setOk] = useState(false)
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🗑️</div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#EF4444' }}>Supprimer cette annonce ?</h3>
          <div style={{ fontSize:12, color:'#64748B', marginTop:6 }}>Action <strong>irréversible</strong>.</div>
          <div style={{ fontSize:12, fontWeight:600, marginTop:8, background:'#F8FAFC', borderRadius:8, padding:'8px 12px', color:'#0F172A' }}>
            {listing.title?.slice(0,60)}
          </div>
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', marginBottom:16 }}>
          <input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)} style={{ accentColor:'#EF4444', width:16, height:16 }} />
          Je confirme la suppression définitive
        </label>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={onConfirm} disabled={!ok||loading}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#EF4444', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:(!ok||loading)?.4:1 }}>
            {loading ? '…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Detail Panel ───────────────────────────────────────────────────────────── */
function DetailPanel({ listing: l, onClose, onAction }) {
  const mainImg = (l.images || [])[0]
  const owner   = l.owner   || {}
  const row = (icon, label, val) => val ? (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
      <span style={{ color:'#94A3B8', flexShrink:0, marginTop:1 }}>{icon}</span>
      <span style={{ fontSize:12, color:'#64748B', minWidth:120 }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color:'#0F172A', flex:1 }}>{val}</span>
    </div>
  ) : null

  return (
    <div style={{ position:'fixed', top:0, right:0, bottom:0, zIndex:400, width:'100%', maxWidth:500, background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,.12)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B', display:'flex' }}><Ic.ChevronR /></button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:4 }}>
            <StatusBadge status={l.status} />
            <TransBadge  type={l.transaction_type} />
            {l.is_premium  && <span style={{ fontSize:10, fontWeight:700, background:'#FEF3C7', color:'#D97706', padding:'2px 8px', borderRadius:99 }}>⭐ Premium</span>}
            {l.is_verified && <span style={{ fontSize:10, fontWeight:700, background:'#DCFCE7', color:'#16A34A', padding:'2px 8px', borderRadius:99 }}>✅ Vérifié</span>}
          </div>
          <div style={{ fontSize:14, fontWeight:800, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.title}</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 24px' }}>
        {/* Photo */}
        {mainImg
          ? <div style={{ margin:'16px 0', borderRadius:12, overflow:'hidden', height:200 }}><img src={mainImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
          : <div style={{ margin:'16px 0', borderRadius:12, height:120, background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#CBD5E1' }}><Ic.Image /><span style={{ fontSize:13 }}>Aucune photo</span></div>
        }

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:4 }}>
          <StatBox label="Vues"     val={l.views_count    ?? 0} />
          <StatBox label="Contacts" val={l.contact_requests_count ?? l.contacts_count ?? 0} />
          <StatBox label="Photos"   val={l.photo_count    ?? (l.images?.length ?? 0)} />
          <StatBox label="Score"    val={l.trust_score ?? '—'} color={l.trust_score >= 80 ? '#10B981' : l.trust_score >= 50 ? '#F59E0B' : '#EF4444'} />
        </div>

        {/* Prix */}
        <div style={{ background:'#F0FDF4', borderRadius:12, padding:'14px 16px', margin:'12px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#64748B', fontWeight:600 }}>Prix</span>
          <span style={{ fontSize:22, fontWeight:900, color:'#0F172A', letterSpacing:'-0.02em' }}>{fmtPrice(l.price, l.transaction_type)}</span>
        </div>

        {/* Annonce */}
        <SectionTitle>Bien</SectionTitle>
        {row(<Ic.Map />,      'Ville / Quartier', [l.city, l.district].filter(Boolean).join(', '))}
        {row(<Ic.Home />,     'Type',             l.property_type)}
        {row(<Ic.Home />,     'Surface',          l.surface ? `${l.surface} m²` : null)}
        {row(<Ic.Home />,     'Pièces',           l.rooms ? `${l.rooms} pièces` : null)}
        {row(<Ic.Home />,     'Meublé',           l.furnished != null ? (l.furnished ? 'Oui' : 'Non') : null)}
        {row(<Ic.Home />,     'DPE',              l.dpe)}
        {(l.parking || l.elevator) && row(<Ic.Home />, 'Équipements', [l.parking && 'Parking', l.elevator && 'Ascenseur'].filter(Boolean).join(', '))}
        {row(<Ic.Activity />, 'Prix marché m²',   l.market_price_m2 ? `${l.market_price_m2} €/m²` : null)}

        {/* Source */}
        {l.source && <>
          <SectionTitle>Source</SectionTitle>
          {row(<Ic.ExternalLink />, 'Plateforme', l.source)}
          {l.source_url && (
            <div style={{ padding:'8px 0', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'#94A3B8' }}><Ic.ExternalLink /></span>
              <a href={l.source_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:12, color:'#6366F1', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:350 }}>
                {l.source_url}
              </a>
            </div>
          )}
        </>}

        {/* Propriétaire */}
        <SectionTitle>Propriétaire</SectionTitle>
        {row(<Ic.User />, 'Nom',   displayOwner(owner))}
        {row(<Ic.User />, 'Email', owner.email)}
        {row(<Ic.User />, 'Rôle',  owner.role)}

        {/* Modération */}
        <SectionTitle>Modération</SectionTitle>
        {row(<Ic.Activity />, 'Publiée le',     fmtDate(l.created_at))}
        {row(<Ic.Check />,    'Approuvée le',   l.approved_at ? fmtDate(l.approved_at) : null)}
        {row(<Ic.XCircle />,  'Rejetée le',     l.rejected_at ? fmtDate(l.rejected_at) : null)}
        <div style={{ padding:'8px 0', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#94A3B8' }}><Ic.Shield /></span>
          <span style={{ fontSize:12, color:'#64748B', minWidth:120 }}>Fiabilité</span>
          <TrustBadge tier={l.trust_tier} score={l.trust_score} />
        </div>
        {l.duplicate_score > 0 && row(<Ic.Activity />, 'Score doublon', `${l.duplicate_score}%`)}
        {l.rejection_reason && (
          <div style={{ background:'#FEF2F2', borderRadius:10, padding:'10px 12px', marginTop:8, fontSize:12, color:'#DC2626' }}>
            <strong>Motif rejet :</strong> {l.rejection_reason}
          </div>
        )}

        {/* Description */}
        {l.description && <>
          <SectionTitle>Description</SectionTitle>
          <div style={{ fontSize:12, color:'#475569', lineHeight:1.6, padding:'6px 0', whiteSpace:'pre-wrap' }}>{l.description}</div>
        </>}

        {/* Actions */}
        <SectionTitle>Actions rapides</SectionTitle>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, paddingTop:4 }}>
          <ActionBtn color="#6366F1" onClick={() => onAction('edit')}><Ic.Edit /> Modifier</ActionBtn>
          {l.status === 'pending'  && <ActionBtn color="#10B981" onClick={() => onAction('approve')}><Ic.Check /> Approuver</ActionBtn>}
          {l.status !== 'inactive' && <ActionBtn color="#EF4444"  onClick={() => onAction('reject')}><Ic.XCircle /> Rejeter</ActionBtn>}
          {l.status === 'inactive' && <ActionBtn color="#10B981"  onClick={() => onAction('approve')}><Ic.Check /> Réactiver</ActionBtn>}
          {!l.is_premium && <ActionBtn color="#F59E0B" onClick={() => onAction('premium_on')}><Ic.StarFill /> Premium</ActionBtn>}
          {l.is_premium  && <ActionBtn color="#64748B" onClick={() => onAction('premium_off')}><Ic.Star /> Retirer Premium</ActionBtn>}
          <ActionBtn color="#EF4444" onClick={() => onAction('delete')}><Ic.Trash /> Supprimer</ActionBtn>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function ListingsPage() {
  const [listings,      setListings]      = useState([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [filterTrans,   setFilterTrans]   = useState('')
  const [filterType,    setFilterType]    = useState('')
  const [filterPremium, setFilterPremium] = useState('')
  const [sortBy,        setSortBy]        = useState('created_at_desc')
  const [page,          setPage]          = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast,         setToast]         = useState(null)

  const [detailListing, setDetailListing] = useState(null)
  const [editModal,     setEditModal]     = useState(null)
  const [rejectModal,   setRejectModal]   = useState(null)
  const [deleteModal,   setDeleteModal]   = useState(null)

  const debRef = useRef()

  const fetchListings = useCallback(async (s, status, trans, type, premium, sort, p) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_manager_listings', {
      p_search:           s       || null,
      p_status:           status  || null,
      p_transaction_type: trans   || null,
      p_property_type:    type    || null,
      p_premium:          premium === 'true' ? true : premium === 'false' ? false : null,
      p_trust_tier:       null,
      p_sort:             sort,
      p_limit:            PER_PAGE,
      p_offset:           (p - 1) * PER_PAGE,
    })
    if (!error && data) { setListings(data.listings || []); setTotal(data.total || 0) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => {
      fetchListings(search, filterStatus, filterTrans, filterType, filterPremium, sortBy, page)
    }, 300)
  }, [search, filterStatus, filterTrans, filterType, filterPremium, sortBy, page, fetchListings])

  const refresh = () => fetchListings(search, filterStatus, filterTrans, filterType, filterPremium, sortBy, page)
  const showToast = (msg, type='success') => setToast({ msg, type })

  const doAction = async (fn) => {
    setActionLoading(true)
    try { await fn(); refresh() }
    catch(e) { showToast(e.message || 'Erreur', 'error') }
    setActionLoading(false)
  }

  const doApprove = (listing) => doAction(async () => {
    const { error } = await supabase.rpc('manager_update_listing', { p_listing_id: listing.id, p_status: 'active' })
    if (error) throw error
    showToast('Annonce approuvée')
    if (detailListing?.id === listing.id) setDetailListing(l => ({ ...l, status:'active' }))
  })

  const doReject = (listing, reason) => doAction(async () => {
    const { error } = await supabase.rpc('manager_update_listing', { p_listing_id: listing.id, p_status: 'inactive', p_rejection_reason: reason })
    if (error) throw error
    setRejectModal(null)
    showToast('Annonce rejetée', 'error')
    if (detailListing?.id === listing.id) setDetailListing(l => ({ ...l, status:'inactive', rejection_reason: reason }))
  })

  const doEdit = (form) => doAction(async () => {
    const { error } = await supabase.rpc('manager_update_listing', {
      p_listing_id:  editModal.id,
      p_title:       form.title       || null,
      p_description: form.description || null,
      p_price:       form.price ? parseInt(form.price) : null,
      p_status:      form.status,
      p_is_premium:  form.is_premium,
      p_is_verified: form.is_verified,
    })
    if (error) throw error
    setEditModal(null)
    showToast('Annonce mise à jour')
    if (detailListing?.id === editModal.id) setDetailListing(l => ({ ...l, ...form, price: parseInt(form.price) }))
  })

  const doTogglePremium = (listing, enable) => doAction(async () => {
    const { error } = await supabase.rpc('manager_toggle_premium', { p_listing_id: listing.id, p_enable: enable })
    if (error) throw error
    showToast(enable ? '⭐ Premium activé' : 'Premium retiré')
    if (detailListing?.id === listing.id) setDetailListing(l => ({ ...l, is_premium: enable }))
  })

  const doDelete = (listing) => doAction(async () => {
    const { error } = await supabase.rpc('manager_delete_listing', { p_listing_id: listing.id })
    if (error) throw error
    setDeleteModal(null)
    setDetailListing(null)
    showToast('Annonce supprimée')
  })

  const handleDetailAction = (action) => {
    const l = detailListing
    if (action === 'edit')        setEditModal(l)
    if (action === 'approve')     doApprove(l)
    if (action === 'reject')      setRejectModal(l)
    if (action === 'delete')      setDeleteModal(l)
    if (action === 'premium_on')  doTogglePremium(l, true)
    if (action === 'premium_off') doTogglePremium(l, false)
  }

  const pendingCount = listings.filter(l => l.status === 'pending').length
  const th = { padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', background:'#FAFAFA', borderBottom:'1px solid #F1F5F9', whiteSpace:'nowrap' }
  const td = { padding:'11px 14px', borderBottom:'1px solid #F8FAFC', fontSize:12, color:'#0F172A', verticalAlign:'middle' }
  const selStyle = { padding:'9px 32px 9px 12px', borderRadius:10, border:'1px solid #E2E8F0', fontSize:13, background:'#fff', cursor:'pointer', appearance:'none', outline:'none' }
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .mgr-tr:hover td { background:#F8FAFC !important; cursor:pointer; }
        .mgr-tr td { transition:background .1s; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>Annonces</h1>
          <p style={{ fontSize:12, color:'#94A3B8', margin:'4px 0 0' }}>
            {loading ? 'Chargement…' : `${total.toLocaleString('fr-FR')} annonce${total!==1?'s':''} au total`}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {!loading && pendingCount > 0 && filterStatus !== 'pending' && (
            <button onClick={() => { setFilterStatus('pending'); setPage(1) }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid #FDE68A', background:'#FFFBEB', fontSize:12, fontWeight:700, color:'#D97706', cursor:'pointer' }}>
              ⚠️ {pendingCount} en attente
            </button>
          )}
          <button onClick={refresh}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:12, fontWeight:600, color:'#64748B', cursor:'pointer' }}>
            <Ic.Refresh /> Actualiser
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 220px', minWidth:200 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Ic.Search /></span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Titre, ville, description…"
            style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:10, border:'1px solid #E2E8F0', fontSize:13, color:'#0F172A', outline:'none', boxSizing:'border-box' }} />
        </div>

        {[
          { val: filterStatus,  set: v=>{setFilterStatus(v);setPage(1)},  opts: [['','Tous statuts'],['active','Active'],['pending','En attente'],['inactive','Inactive']], w: 150 },
          { val: filterTrans,   set: v=>{setFilterTrans(v);setPage(1)},   opts: [['','Vente & Location'],['vente','Vente'],['location','Location'],['colocation','Colocation']], w: 150 },
          { val: filterType,    set: v=>{setFilterType(v);setPage(1)},    opts: [['','Tous types'],...PROPERTY_TYPES.map(t=>[t,t.charAt(0).toUpperCase()+t.slice(1)])], w: 150 },
          { val: filterPremium, set: v=>{setFilterPremium(v);setPage(1)}, opts: [['','Premium & Std.'],['true','Premium'],['false','Standard']], w: 140 },
          { val: sortBy,        set: v=>setSortBy(v),                     opts: [['created_at_desc','Plus récentes'],['created_at_asc','Plus anciennes'],['price_desc','Prix ↓'],['price_asc','Prix ↑'],['views_desc','Plus vues']], w: 160 },
        ].map(({ val, set, opts, w }, i) => (
          <div key={i} style={{ position:'relative' }}>
            <select style={{ ...selStyle, minWidth:w, color: (val && i < 4) ? '#6366F1' : '#64748B', fontWeight: (val && i < 4) ? 700 : 400 }}
              value={val} onChange={e=>set(e.target.value)}>
              {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94A3B8', display:'flex' }}><Ic.ChevronD /></span>
          </div>
        ))}

        {(search || filterStatus || filterTrans || filterType || filterPremium) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterTrans(''); setFilterType(''); setFilterPremium(''); setPage(1) }}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:10, border:'1px solid #FECACA', background:'#FEF2F2', fontSize:12, fontWeight:600, color:'#EF4444', cursor:'pointer' }}>
            <Ic.X /> Effacer
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Annonce</th>
                <th style={th}>Type</th>
                <th style={th}>Ville</th>
                <th style={th}>Prix</th>
                <th style={th}>Statut</th>
                <th style={th}>Fiabilité</th>
                <th style={th}>Vues</th>
                <th style={th}>Publiée</th>
                <th style={{ ...th, textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => (
                  <tr key={i}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:52, height:38, borderRadius:8, background:'#F1F5F9', animation:'pulse 1.4s ease-in-out infinite', flexShrink:0 }} />
                        <div><Skel w={160} h={12} /><div style={{ marginTop:5 }}><Skel w={90} h={10} /></div></div>
                      </div>
                    </td>
                    {[60,70,80,70,80,40,70,40].map((w,j) => <td key={j} style={{ padding:'12px 14px' }}><Skel w={w} /></td>)}
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#94A3B8', fontSize:13 }}>
                  {search||filterStatus||filterTrans||filterType ? 'Aucune annonce pour ces filtres' : 'Aucune annonce'}
                </td></tr>
              ) : listings.map(l => {
                const thumb = (l.images || [])[0]
                return (
                  <tr key={l.id} className="mgr-tr" onClick={() => setDetailListing(l)}>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:52, height:38, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {thumb
                            ? <img src={thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <span style={{ color:'#CBD5E1' }}><Ic.Image /></span>
                          }
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            {l.is_premium  && <span style={{ fontSize:9 }}>⭐</span>}
                            {l.is_verified && <span style={{ fontSize:9, color:'#10B981' }}>✅</span>}
                            <span style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180, display:'block' }}>{l.title||'(sans titre)'}</span>
                          </div>
                          <div style={{ fontSize:11, color:'#94A3B8', marginTop:1 }}>
                            {[l.property_type, l.surface?`${l.surface}m²`:null, l.rooms?`${l.rooms}p`:null].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={td}><TransBadge type={l.transaction_type} /></td>
                    <td style={{ ...td, color:'#64748B' }}>{l.city||'—'}</td>
                    <td style={{ ...td, fontWeight:700, whiteSpace:'nowrap' }}>{fmtPrice(l.price, l.transaction_type)}</td>
                    <td style={td}><StatusBadge status={l.status} /></td>
                    <td style={td}><TrustBadge tier={l.trust_tier} score={l.trust_score} /></td>
                    <td style={{ ...td, color:'#64748B' }}>{l.views_count ?? 0}</td>
                    <td style={{ ...td, color:'#64748B', whiteSpace:'nowrap' }}>{fmtTime(l.created_at)}</td>
                    <td style={{ ...td, textAlign:'right' }} onClick={e=>e.stopPropagation()}>
                      <ActionMenu listing={l} loading={actionLoading}
                        onView={() => setDetailListing(l)} onEdit={() => setEditModal(l)}
                        onApprove={() => doApprove(l)}     onReject={() => setRejectModal(l)}
                        onTogglePremium={enable => doTogglePremium(l, enable)}
                        onDelete={() => setDeleteModal(l)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:'#94A3B8' }}>Page {page}/{totalPages} — {total.toLocaleString('fr-FR')} annonces</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:'1px solid #E2E8F0', background:page===1?'#F8FAFC':'#fff', fontSize:12, fontWeight:600, color:page===1?'#CBD5E1':'#374151', cursor:page===1?'default':'pointer' }}>
                <Ic.ChevronL /> Préc.
              </button>
              {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                const p = Math.max(1,Math.min(page-2,totalPages-4))+i
                return p<=totalPages ? (
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ width:32, height:32, borderRadius:8, border:`1px solid ${p===page?'#6366F1':'#E2E8F0'}`, background:p===page?'#6366F1':'#fff', fontSize:12, fontWeight:700, color:p===page?'#fff':'#374151', cursor:'pointer' }}>
                    {p}
                  </button>
                ) : null
              })}
              <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:'1px solid #E2E8F0', background:page===totalPages?'#F8FAFC':'#fff', fontSize:12, fontWeight:600, color:page===totalPages?'#CBD5E1':'#374151', cursor:page===totalPages?'default':'pointer' }}>
                Suiv. <Ic.ChevronR />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detailListing && (
        <>
          <div onClick={() => setDetailListing(null)} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(15,23,42,.2)' }} />
          <DetailPanel listing={detailListing} onClose={() => setDetailListing(null)} onAction={handleDetailAction} />
        </>
      )}

      {editModal   && <EditModal   listing={editModal}   onClose={() => setEditModal(null)}   onSave={doEdit}                    loading={actionLoading} />}
      {rejectModal && <RejectModal listing={rejectModal} onClose={() => setRejectModal(null)} onConfirm={r => doReject(rejectModal, r)} loading={actionLoading} />}
      {deleteModal && <DeleteModal listing={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={() => doDelete(deleteModal)} loading={actionLoading} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
