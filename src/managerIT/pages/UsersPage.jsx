import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Ic = {
  Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevronD: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Dots:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>,
  Eye:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Shield:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Lock:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Unlock:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Ban:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Key:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  Role:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Phone:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Globe:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Monitor:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Activity: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Home:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Card:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Mail:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Wifi:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  MapPin:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Msg:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const ROLES = [
  { value: 'user',          label: 'Particulier',    color: '#6366F1' },
  { value: 'private_user',  label: 'Particulier',    color: '#6366F1' },
  { value: 'pro_user',      label: 'Professionnel',  color: '#10B981' },
  { value: 'agency',        label: 'Agence',         color: '#3B82F6' },
  { value: 'agency_admin',  label: 'Admin Agence',   color: '#8B5CF6' },
  { value: 'super_admin',   label: 'Super Admin',    color: '#F59E0B' },
  { value: 'premium_seller',label: 'Premium',        color: '#FF6B00' },
  { value: 'platform_owner',label: 'Propriétaire',   color: '#EF4444' },
]

const ROLE_MAP = Object.fromEntries(ROLES.map(r => [r.value, r]))

const STATUS_MAP = {
  active:    { label: 'Actif',     bg: '#DCFCE7', color: '#16A34A' },
  suspended: { label: 'Suspendu',  bg: '#FEF3C7', color: '#D97706' },
  banned:    { label: 'Banni',     bg: '#FEE2E2', color: '#DC2626' },
}

const PER_PAGE = 25

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtTime = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)    return 'À l\'instant'
  if (diff < 3600)  return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)}h`
  if (diff < 86400*7) return `il y a ${Math.floor(diff/86400)}j`
  return fmtDate(s)
}
const fmtEur = (n) => {
  if (!n) return '0 €'
  const e = n / 100
  return e >= 1000 ? `${(e/1000).toFixed(1)}k €` : `${e.toLocaleString('fr-FR')} €`
}
const initials = (u) => {
  const n = (u.first_name || '') + ' ' + (u.last_name || '')
  const parts = n.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (u.email || '?').slice(0, 2).toUpperCase()
}
const displayName = (u) => {
  if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ')
  if (u.full_name) return u.full_name
  if (u.username) return u.username
  return u.email?.split('@')[0] || '—'
}

/* ── Sub-components ────────────────────────────────────────────────────────── */
function RoleBadge({ role, small }) {
  const r = ROLE_MAP[role] ?? { label: role, color: '#94A3B8' }
  return (
    <span style={{ display:'inline-flex', fontSize: small ? 10 : 11, fontWeight:700, padding: small ? '1px 6px' : '2px 8px', borderRadius:99, background: r.color + '18', color: r.color, whiteSpace:'nowrap' }}>
      {r.label}
    </span>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.active
  return (
    <span style={{ display:'inline-flex', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>
      {s.label}
    </span>
  )
}

function Avatar({ user, size = 32 }) {
  const colors = ['#6366F1','#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#FF6B00']
  const idx = (user.email || '').charCodeAt(0) % colors.length
  return (
    <div style={{ width:size, height:size, borderRadius:99, background:colors[idx], display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:800, color:'#fff', flexShrink:0, letterSpacing:'-0.02em' }}>
      {initials(user)}
    </div>
  )
}

function Skel({ w='100%', h=13 }) {
  return <div style={{ width:w, height:h, borderRadius:6, background:'#F1F5F9', animation:'pulse 1.4s ease-in-out infinite' }} />
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background: type==='error' ? '#FEF2F2' : '#F0FDF4', border:`1px solid ${type==='error' ? '#FECACA' : '#BBF7D0'}`, color: type==='error' ? '#991B1B' : '#166534', borderRadius:12, padding:'12px 18px', fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,.12)', display:'flex', alignItems:'center', gap:8, maxWidth:360 }}>
      {type === 'success' ? <Ic.Check /> : '⚠️'} {msg}
    </div>
  )
}

/* ── Action Dropdown ────────────────────────────────────────────────────────── */
function ActionMenu({ user, onView, onEdit, onSuspend, onReactivate, onBan, onDelete, onResetPwd, onChangeRole, loading }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const item = (icon, label, onClick, danger, disabled) => (
    <button disabled={disabled || loading}
      onClick={() => { setOpen(false); onClick() }}
      style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', background:'none', border:'none', cursor: disabled ? 'default' : 'pointer', fontSize:12, fontWeight:500, color: danger ? '#EF4444' : '#374151', textAlign:'left', opacity: disabled ? 0.4 : 1, transition:'background .1s' }}
      onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
      onMouseLeave={e => e.currentTarget.style.background='none'}>
      <span style={{ color: danger ? '#EF4444' : '#94A3B8' }}>{icon}</span>
      {label}
    </button>
  )

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', cursor:'pointer', color:'#64748B', transition:'background .1s' }}
        onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
        onMouseLeave={e => e.currentTarget.style.background='#fff'}>
        <Ic.Dots />
      </button>
      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:200, background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', boxShadow:'0 8px 24px rgba(0,0,0,.10)', minWidth:200, overflow:'hidden', padding:'4px 0' }}>
          {item(<Ic.Eye />,    'Voir la fiche',             onView)}
          {item(<Ic.Edit />,   'Modifier',                  onEdit)}
          {item(<Ic.Role />,   'Changer le rôle',           onChangeRole)}
          <div style={{ height:1, background:'#F1F5F9', margin:'4px 0' }} />
          {user.status !== 'suspended' && user.status !== 'banned' && item(<Ic.Lock />, 'Suspendre',   onSuspend, false)}
          {user.status !== 'active'  && item(<Ic.Unlock />, 'Réactiver',  onReactivate, false)}
          {user.status !== 'banned'  && item(<Ic.Ban />,    'Bannir',      onBan, true)}
          <div style={{ height:1, background:'#F1F5F9', margin:'4px 0' }} />
          {item(<Ic.Key />,   'Réinitialiser mot de passe', onResetPwd)}
          <div style={{ height:1, background:'#F1F5F9', margin:'4px 0' }} />
          {item(<Ic.Trash />, 'Supprimer',                  onDelete, true)}
        </div>
      )}
    </div>
  )
}

/* ── Edit Modal ─────────────────────────────────────────────────────────────── */
function EditModal({ user, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name:  user.last_name  || '',
    phone:      user.phone      || '',
  })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, color:'#0F172A', outline:'none', boxSizing:'border-box' }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#0F172A' }}>Modifier l'utilisateur</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><Ic.X /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Prénom</label>
              <input style={inp} value={form.first_name} onChange={set('first_name')} placeholder="Prénom" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Nom</label>
              <input style={inp} value={form.last_name} onChange={set('last_name')} placeholder="Nom" />
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>Téléphone</label>
            <input style={inp} value={form.phone} onChange={set('phone')} placeholder="+33 6 00 00 00 00" />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>
            Annuler
          </button>
          <button onClick={() => onSave(form)} disabled={loading}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#6366F1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Role Change Modal ─────────────────────────────────────────────────────── */
function RoleModal({ user, onClose, onSave, loading }) {
  const [role, setRole] = useState(user.role || 'user')
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#0F172A' }}>Changer le rôle</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><Ic.X /></button>
        </div>
        <div style={{ marginBottom:6, fontSize:12, color:'#64748B', fontWeight:600 }}>Utilisateur : <strong style={{ color:'#0F172A' }}>{displayName(user)}</strong></div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, margin:'14px 0' }}>
          {ROLES.filter((r,i,a) => a.findIndex(x=>x.value===r.value)===i).map(r => (
            <label key={r.value} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:`2px solid ${role===r.value ? r.color : '#E2E8F0'}`, cursor:'pointer', background: role===r.value ? r.color+'10' : '#fff', transition:'all .15s' }}>
              <input type="radio" name="role" value={r.value} checked={role===r.value} onChange={()=>setRole(r.value)} style={{ accentColor: r.color }} />
              <span style={{ fontSize:13, fontWeight:600, color: role===r.value ? r.color : '#374151' }}>{r.label}</span>
            </label>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={() => onSave(role)} disabled={loading}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#6366F1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:loading?.7:1 }}>
            {loading ? '…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Suspend / Ban Modal ───────────────────────────────────────────────────── */
function SuspendModal({ user, action, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')
  const isBan = action === 'ban'
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>{isBan ? '🚫' : '⏸️'}</div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#0F172A' }}>
            {isBan ? 'Bannir' : 'Suspendre'} cet utilisateur ?
          </h3>
          <div style={{ fontSize:13, color:'#64748B', marginTop:6 }}>{displayName(user)} · {user.email}</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:4 }}>
            Raison {isBan ? '(obligatoire)' : '(optionnel)'}
          </label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
            placeholder={isBan ? 'Motif du bannissement…' : 'Motif de la suspension…'}
            style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, resize:'none', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={() => onConfirm(reason)} disabled={loading || (isBan && !reason.trim())}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background: isBan ? '#EF4444' : '#F59E0B', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity: (loading || (isBan && !reason.trim())) ? .6 : 1 }}>
            {loading ? '…' : isBan ? 'Bannir définitivement' : 'Suspendre'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Delete Confirm Modal ─────────────────────────────────────────────────── */
function DeleteModal({ user, onClose, onConfirm, loading }) {
  const [typed, setTyped] = useState('')
  const email = user.email || ''
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🗑️</div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#EF4444' }}>Supprimer ce compte ?</h3>
          <div style={{ fontSize:13, color:'#64748B', marginTop:6 }}>Cette action est <strong>irréversible</strong>. Toutes les données seront perdues.</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:6 }}>
            Tapez <code style={{ background:'#FEF2F2', padding:'1px 5px', borderRadius:4, color:'#DC2626', fontSize:11 }}>{email}</code> pour confirmer
          </label>
          <input value={typed} onChange={e=>setTyped(e.target.value)} placeholder={email}
            style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`2px solid ${typed===email ? '#10B981' : '#E2E8F0'}`, fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Annuler</button>
          <button onClick={onConfirm} disabled={typed !== email || loading}
            style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#EF4444', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity: typed!==email||loading ? .4 : 1 }}>
            {loading ? '…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Overlay ────────────────────────────────────────────────────────────────── */
function Overlay({ children, onClose }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(3px)' }}>
      {children}
    </div>
  )
}

/* ── User Detail Panel ──────────────────────────────────────────────────────── */
function UserDetailPanel({ user, detail, loading, onClose, onAction }) {
  const p = detail?.profile || user
  const sessions = detail?.sessions || []

  const statItem = (icon, label, val) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 0', borderBottom:'1px solid #F8FAFC' }}>
      <span style={{ color:'#94A3B8', flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:12, color:'#64748B', minWidth:130 }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color:'#0F172A', flex:1 }}>{val || '—'}</span>
    </div>
  )

  const lastSess = p.last_session || sessions[0]

  return (
    <div style={{ position:'fixed', top:0, right:0, bottom:0, zIndex:400, width:'100%', maxWidth:480, background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,.12)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B', display:'flex' }}>
          <Ic.ChevronR />
        </button>
        <Avatar user={p} size={44} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName(p)}</div>
          <div style={{ fontSize:12, color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.email}</div>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px 24px' }}>
        {loading ? (
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}>
            {Array.from({length:8}).map((_,i) => <Skel key={i} h={14} w={`${70+Math.random()*30}%`} />)}
          </div>
        ) : <>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, padding:'20px 0 4px' }}>
            {[
              { label:'Annonces',  val: detail?.listings_count ?? '—' },
              { label:'Paiements', val: detail?.payments_count ?? '—' },
              { label:'Total payé',val: fmtEur(detail?.payments_total) },
            ].map(s => (
              <div key={s.label} style={{ background:'#F8FAFC', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:'#0F172A' }}>{s.val}</div>
                <div style={{ fontSize:10, color:'#94A3B8', fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section: Compte */}
          <SectionTitle>Compte</SectionTitle>
          {statItem(<Ic.Role />, 'Rôle', <RoleBadge role={p.role} small />)}
          {statItem(<Ic.Shield />, 'KYC', p.kyc_status === 'verified' ? '✅ Vérifié' : p.kyc_status === 'pending' ? '⏳ En attente' : '—')}
          {statItem(<Ic.Mail />, 'Email confirmé', p.email_confirmed_at ? `✅ ${fmtDate(p.email_confirmed_at)}` : '❌ Non confirmé')}
          {statItem(<Ic.Activity />, 'Inscrit le', fmtDate(p.registered_at))}
          {statItem(<Ic.Activity />, 'Dernière connexion', fmtTime(p.last_sign_in_at))}
          {p.stripe_customer_id && statItem(<Ic.Card />, 'Stripe ID', <code style={{ fontSize:10 }}>{p.stripe_customer_id}</code>)}

          {/* Section: Informations */}
          <SectionTitle>Informations personnelles</SectionTitle>
          {statItem(<Ic.Role />,  'Nom complet', [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name)}
          {statItem(<Ic.Phone />, 'Téléphone',   p.phone)}
          {statItem(<Ic.Role />,  'Type compte',  p.account_type)}

          {/* Section: Dernière session */}
          <SectionTitle>Dernière session</SectionTitle>
          {lastSess ? <>
            {statItem(<Ic.Wifi />,    'Adresse IP',  lastSess.ip_address)}
            {statItem(<Ic.Monitor />, 'Navigateur',  lastSess.browser)}
            {statItem(<Ic.Monitor />, 'OS',          lastSess.os)}
            {statItem(<Ic.Monitor />, 'Appareil',    lastSess.device)}
            {statItem(<Ic.MapPin />,  'Localisation', [lastSess.city, lastSess.country].filter(Boolean).join(', '))}
            {statItem(<Ic.Activity />, 'Date',        fmtTime(lastSess.created_at))}
          </> : (
            <div style={{ padding:'16px 0', fontSize:12, color:'#94A3B8' }}>Aucune session enregistrée</div>
          )}

          {/* Section: Historique sessions */}
          {sessions.length > 1 && <>
            <SectionTitle>Historique ({sessions.length} sessions)</SectionTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {sessions.map((s,i) => (
                <div key={i} style={{ background:'#F8FAFC', borderRadius:10, padding:'10px 12px', fontSize:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontWeight:700, color:'#0F172A' }}>{s.browser || 'Navigateur inconnu'}</span>
                    <span style={{ color:'#94A3B8', fontSize:11 }}>{fmtTime(s.created_at)}</span>
                  </div>
                  <div style={{ color:'#64748B', display:'flex', gap:10, flexWrap:'wrap' }}>
                    {s.ip_address && <span>🌐 {s.ip_address}</span>}
                    {s.city && <span>📍 {[s.city, s.country].filter(Boolean).join(', ')}</span>}
                    {s.device && <span>🖥 {s.device}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* Section: Suspension */}
          {p.status !== 'active' && (
            <div style={{ background: p.status==='banned' ? '#FEF2F2' : '#FFFBEB', border:`1px solid ${p.status==='banned' ? '#FECACA' : '#FDE68A'}`, borderRadius:12, padding:'14px 16px', marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color: p.status==='banned' ? '#DC2626' : '#D97706', marginBottom:4 }}>
                {p.status === 'banned' ? '🚫 Compte banni' : '⏸️ Compte suspendu'}
              </div>
              {p.suspension_reason && <div style={{ fontSize:12, color:'#64748B' }}>{p.suspension_reason}</div>}
              {(p.suspended_at || p.banned_at) && <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>Le {fmtDate(p.banned_at || p.suspended_at)}</div>}
            </div>
          )}

          {/* Actions rapides */}
          <SectionTitle>Actions rapides</SectionTitle>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            <ActionBtn color="#6366F1" onClick={() => onAction('edit')}>
              <Ic.Edit /> Modifier
            </ActionBtn>
            <ActionBtn color="#8B5CF6" onClick={() => onAction('role')}>
              <Ic.Role /> Rôle
            </ActionBtn>
            {p.status === 'active' && (
              <ActionBtn color="#F59E0B" onClick={() => onAction('suspend')}>
                <Ic.Lock /> Suspendre
              </ActionBtn>
            )}
            {p.status !== 'active' && (
              <ActionBtn color="#10B981" onClick={() => onAction('reactivate')}>
                <Ic.Unlock /> Réactiver
              </ActionBtn>
            )}
            {p.status !== 'banned' && (
              <ActionBtn color="#EF4444" onClick={() => onAction('ban')}>
                <Ic.Ban /> Bannir
              </ActionBtn>
            )}
            <ActionBtn color="#3B82F6" onClick={() => onAction('resetpwd')}>
              <Ic.Key /> Reset MDP
            </ActionBtn>
            <ActionBtn color="#EF4444" onClick={() => onAction('delete')}>
              <Ic.Trash /> Supprimer
            </ActionBtn>
          </div>
        </>}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#94A3B8', marginTop:20, marginBottom:2 }}>{children}</div>
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:`1px solid ${color}30`, background:`${color}10`, color, fontSize:12, fontWeight:600, cursor:'pointer', transition:'background .1s' }}
      onMouseEnter={e=>e.currentTarget.style.background=`${color}20`}
      onMouseLeave={e=>e.currentTarget.style.background=`${color}10`}>
      {children}
    </button>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function UsersPage() {
  const [users,         setUsers]         = useState([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterRole,    setFilterRole]    = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [page,          setPage]          = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast,         setToast]         = useState(null)

  // Panels / modals
  const [detailUser,   setDetailUser]   = useState(null)
  const [detailData,   setDetailData]   = useState(null)
  const [detailLoad,   setDetailLoad]   = useState(false)
  const [editModal,    setEditModal]    = useState(null)
  const [roleModal,    setRoleModal]    = useState(null)
  const [suspendModal, setSuspendModal] = useState(null)
  const [deleteModal,  setDeleteModal]  = useState(null)

  const searchRef = useRef()
  const debounceRef = useRef()

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async (s, role, status, p) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_manager_users', {
      p_search: s || null,
      p_role:   role || null,
      p_status: status || null,
      p_limit:  PER_PAGE,
      p_offset: (p - 1) * PER_PAGE,
    })
    if (!error && data) {
      setUsers(data.users || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchUsers(search, filterRole, filterStatus, page)
    }, 300)
  }, [search, filterRole, filterStatus, page, fetchUsers])

  /* ── Load detail ── */
  const loadDetail = useCallback(async (user) => {
    setDetailUser(user)
    setDetailData(null)
    setDetailLoad(true)
    const { data } = await supabase.rpc('get_user_detail', { p_user_id: user.id })
    setDetailData(data)
    setDetailLoad(false)
  }, [])

  /* ── Toast helper ── */
  const showToast = (msg, type = 'success') => setToast({ msg, type })

  /* ── Action handler ── */
  const handleDetailAction = (action) => {
    const u = detailData?.profile || detailUser
    if (action === 'edit')       setEditModal(u)
    if (action === 'role')       setRoleModal(u)
    if (action === 'suspend')    setSuspendModal({ user: u, action: 'suspend' })
    if (action === 'ban')        setSuspendModal({ user: u, action: 'ban' })
    if (action === 'delete')     setDeleteModal(u)
    if (action === 'reactivate') doReactivate(u)
    if (action === 'resetpwd')   doResetPassword(u)
  }

  const doAction = async (fn) => {
    setActionLoading(true)
    try {
      await fn()
      fetchUsers(search, filterRole, filterStatus, page)
      if (detailUser) loadDetail({ ...detailUser })
    } catch (e) {
      showToast(e.message || 'Erreur', 'error')
    }
    setActionLoading(false)
  }

  const doEdit = (form) => doAction(async () => {
    const { error } = await supabase.rpc('manager_update_user', {
      p_user_id:    editModal.id,
      p_first_name: form.first_name || null,
      p_last_name:  form.last_name  || null,
      p_phone:      form.phone      || null,
    })
    if (error) throw error
    setEditModal(null)
    showToast('Profil mis à jour')
  })

  const doChangeRole = (role) => doAction(async () => {
    const { error } = await supabase.rpc('manager_change_role', { p_user_id: roleModal.id, p_new_role: role })
    if (error) throw error
    setRoleModal(null)
    showToast('Rôle modifié')
  })

  const doSuspend = (reason) => doAction(async () => {
    const action = suspendModal.action
    const { error } = await supabase.rpc('manager_update_user', {
      p_user_id: suspendModal.user.id,
      p_status:  action === 'ban' ? 'banned' : 'suspended',
      p_suspension_reason: reason || null,
    })
    if (error) throw error
    setSuspendModal(null)
    showToast(action === 'ban' ? 'Utilisateur banni' : 'Utilisateur suspendu', action === 'ban' ? 'error' : 'success')
  })

  const doReactivate = (user) => doAction(async () => {
    const { error } = await supabase.rpc('manager_update_user', { p_user_id: user.id, p_status: 'active' })
    if (error) throw error
    showToast('Compte réactivé')
  })

  const doDelete = () => doAction(async () => {
    const { error } = await supabase.rpc('manager_delete_user', { p_user_id: deleteModal.id })
    if (error) throw error
    setDeleteModal(null)
    if (detailUser?.id === deleteModal.id) setDetailUser(null)
    showToast('Compte supprimé')
  })

  const doResetPassword = async (user) => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    showToast(error ? error.message : `Email de réinitialisation envoyé à ${user.email}`, error ? 'error' : 'success')
  }

  /* ── Table styles ── */
  const th = { padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', background:'#FAFAFA', borderBottom:'1px solid #F1F5F9', whiteSpace:'nowrap' }
  const td = { padding:'11px 14px', borderBottom:'1px solid #F8FAFC', fontSize:12, color:'#0F172A', verticalAlign:'middle' }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .mgr-tr:hover td { background:#F8FAFC !important; cursor:pointer; }
        .mgr-tr td { transition:background .1s; }
        .mgr-search:focus { border-color:#6366F1 !important; box-shadow:0 0 0 3px #6366F120; }
        .mgr-select:focus { border-color:#6366F1 !important; outline:none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>Utilisateurs</h1>
          <p style={{ fontSize:12, color:'#94A3B8', margin:'4px 0 0' }}>
            {loading ? 'Chargement…' : `${total.toLocaleString('fr-FR')} compte${total !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <button onClick={() => fetchUsers(search, filterRole, filterStatus, page)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:12, fontWeight:600, color:'#64748B', cursor:'pointer' }}>
          <Ic.Refresh /> Actualiser
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1 1 240px', minWidth:200 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}>
            <Ic.Search />
          </span>
          <input ref={searchRef} className="mgr-search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Rechercher par nom, email…"
            style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:10, border:'1px solid #E2E8F0', fontSize:13, color:'#0F172A', outline:'none', boxSizing:'border-box', transition:'border .15s,box-shadow .15s' }} />
        </div>

        {/* Role filter */}
        <div style={{ position:'relative' }}>
          <Ic.Filter />
          <select className="mgr-select" value={filterRole} onChange={e=>{setFilterRole(e.target.value);setPage(1)}}
            style={{ padding:'9px 32px 9px 12px', borderRadius:10, border:'1px solid #E2E8F0', fontSize:13, color: filterRole ? '#6366F1' : '#64748B', background:'#fff', cursor:'pointer', appearance:'none', minWidth:150, fontWeight: filterRole ? 700 : 400 }}>
            <option value="">Tous les rôles</option>
            <option value="user">Particulier</option>
            <option value="pro_user">Professionnel</option>
            <option value="agency">Agence</option>
            <option value="agency_admin">Admin Agence</option>
            <option value="super_admin">Super Admin</option>
            <option value="premium_seller">Premium</option>
            <option value="platform_owner">Propriétaire</option>
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94A3B8', display:'flex' }}><Ic.ChevronD /></span>
        </div>

        {/* Status filter */}
        <div style={{ position:'relative' }}>
          <select className="mgr-select" value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1)}}
            style={{ padding:'9px 32px 9px 12px', borderRadius:10, border:'1px solid #E2E8F0', fontSize:13, color: filterStatus ? '#6366F1' : '#64748B', background:'#fff', cursor:'pointer', appearance:'none', minWidth:140, fontWeight: filterStatus ? 700 : 400 }}>
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="banned">Banni</option>
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94A3B8', display:'flex' }}><Ic.ChevronD /></span>
        </div>

        {/* Active filters badge */}
        {(search || filterRole || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); setPage(1) }}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:10, border:'1px solid #FECACA', background:'#FEF2F2', fontSize:12, fontWeight:600, color:'#EF4444', cursor:'pointer' }}>
            <Ic.X /> Effacer filtres
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Utilisateur</th>
                <th style={th}>Rôle</th>
                <th style={th}>Statut</th>
                <th style={th}>Inscription</th>
                <th style={th}>Dernière connexion</th>
                <th style={th}>Session</th>
                <th style={th}>KYC</th>
                <th style={{ ...th, textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length: 8}).map((_, i) => (
                  <tr key={i}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:99, background:'#F1F5F9', animation:'pulse 1.4s ease-in-out infinite' }} />
                        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                          <Skel w={120} h={12} />
                          <Skel w={160} h={10} />
                        </div>
                      </div>
                    </td>
                    {[60, 60, 80, 100, 80, 40, 50].map((w, j) => (
                      <td key={j} style={{ padding:'12px 14px' }}><Skel w={w} /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding:'48px', textAlign:'center', color:'#94A3B8', fontSize:13 }}>
                    {search || filterRole || filterStatus ? 'Aucun résultat pour ces filtres' : 'Aucun utilisateur'}
                  </td>
                </tr>
              ) : users.map(u => {
                const lastSess = u.last_session
                return (
                  <tr key={u.id} className="mgr-tr" onClick={() => loadDetail(u)}>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar user={u} size={36} />
                        <div>
                          <div style={{ fontWeight:600, color:'#0F172A' }}>{displayName(u)}</div>
                          <div style={{ fontSize:11, color:'#94A3B8', marginTop:1 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}><RoleBadge role={u.role} /></td>
                    <td style={td}><StatusBadge status={u.status} /></td>
                    <td style={{ ...td, color:'#64748B', whiteSpace:'nowrap' }}>{fmtDate(u.registered_at)}</td>
                    <td style={{ ...td, color:'#64748B', whiteSpace:'nowrap' }}>{fmtTime(u.last_sign_in_at)}</td>
                    <td style={{ ...td, fontSize:11, color:'#64748B' }}>
                      {lastSess ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          <span>{lastSess.browser || '—'}</span>
                          {lastSess.city && <span style={{ color:'#94A3B8' }}>📍 {lastSess.city}</span>}
                        </div>
                      ) : <span style={{ color:'#CBD5E1' }}>—</span>}
                    </td>
                    <td style={td}>
                      {u.kyc_status === 'verified'
                        ? <span style={{ color:'#10B981', fontWeight:700, fontSize:11 }}>✅ Vérifié</span>
                        : u.kyc_status === 'pending'
                          ? <span style={{ color:'#F59E0B', fontSize:11 }}>⏳ En att.</span>
                          : <span style={{ color:'#CBD5E1', fontSize:11 }}>—</span>
                      }
                    </td>
                    <td style={{ ...td, textAlign:'right' }} onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        user={u}
                        loading={actionLoading}
                        onView={() => loadDetail(u)}
                        onEdit={() => setEditModal(u)}
                        onChangeRole={() => setRoleModal(u)}
                        onSuspend={() => setSuspendModal({ user: u, action: 'suspend' })}
                        onReactivate={() => doReactivate(u)}
                        onBan={() => setSuspendModal({ user: u, action: 'ban' })}
                        onDelete={() => setDeleteModal(u)}
                        onResetPwd={() => doResetPassword(u)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:'#94A3B8' }}>
              Page {page} / {totalPages} — {total.toLocaleString('fr-FR')} résultats
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:'1px solid #E2E8F0', background: page===1 ? '#F8FAFC' : '#fff', fontSize:12, fontWeight:600, color: page===1 ? '#CBD5E1' : '#374151', cursor: page===1 ? 'default' : 'pointer' }}>
                <Ic.ChevronL /> Préc.
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width:32, height:32, borderRadius:8, border:`1px solid ${p===page ? '#6366F1' : '#E2E8F0'}`, background: p===page ? '#6366F1' : '#fff', fontSize:12, fontWeight:700, color: p===page ? '#fff' : '#374151', cursor:'pointer' }}>
                    {p}
                  </button>
                ) : null
              })}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:'1px solid #E2E8F0', background: page===totalPages ? '#F8FAFC' : '#fff', fontSize:12, fontWeight:600, color: page===totalPages ? '#CBD5E1' : '#374151', cursor: page===totalPages ? 'default' : 'pointer' }}>
                Suiv. <Ic.ChevronR />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User Detail Panel ── */}
      {detailUser && (
        <>
          <div onClick={() => setDetailUser(null)}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(15,23,42,.2)' }} />
          <UserDetailPanel
            user={detailUser}
            detail={detailData}
            loading={detailLoad}
            onClose={() => setDetailUser(null)}
            onAction={handleDetailAction}
          />
        </>
      )}

      {/* ── Modals ── */}
      {editModal    && <EditModal    user={editModal}    onClose={() => setEditModal(null)}    onSave={doEdit}       loading={actionLoading} />}
      {roleModal    && <RoleModal    user={roleModal}    onClose={() => setRoleModal(null)}    onSave={doChangeRole} loading={actionLoading} />}
      {suspendModal && <SuspendModal user={suspendModal.user} action={suspendModal.action} onClose={() => setSuspendModal(null)} onConfirm={doSuspend} loading={actionLoading} />}
      {deleteModal  && <DeleteModal  user={deleteModal}  onClose={() => setDeleteModal(null)} onConfirm={doDelete} loading={actionLoading} />}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
