import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Ic = {
  Bell:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Plus:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Send:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Trash:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  X:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Refresh:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Users:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Info:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Alert:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ChevronD:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Link:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const NOTIF_TYPES = [
  { value: 'info',    label: 'Information', bg: '#EFF6FF', color: '#3B82F6', icon: 'ℹ️' },
  { value: 'success', label: 'Succès',      bg: '#F0FDF4', color: '#16A34A', icon: '✅' },
  { value: 'warning', label: 'Attention',   bg: '#FFFBEB', color: '#D97706', icon: '⚠️' },
  { value: 'error',   label: 'Erreur',      bg: '#FEF2F2', color: '#DC2626', icon: '❌' },
]

const AUDIENCES = [
  { value: 'all',            label: 'Tous les utilisateurs', icon: '🌍', desc: 'Visibilité pour tous les comptes actifs' },
  { value: 'particuliers',   label: 'Particuliers',          icon: '🏠', desc: 'Rôles: user, private_user' },
  { value: 'professionnels', label: 'Professionnels',        icon: '💼', desc: 'Rôles: pro_user, agency, agency_admin, premium_seller' },
  { value: 'premium',        label: 'Abonnés Premium',       icon: '⭐', desc: 'Utilisateurs avec premium_alerts activé' },
]

const ROLE_TARGETS = [
  { value: 'user',           label: 'Utilisateurs (user)' },
  { value: 'private_user',   label: 'Utilisateurs privés' },
  { value: 'pro_user',       label: 'Professionnels' },
  { value: 'agency',         label: 'Agences' },
  { value: 'agency_admin',   label: 'Admins agence' },
  { value: 'premium_seller', label: 'Vendeurs premium' },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)       return 'À l\'instant'
  if (diff < 3600)     return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)    return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 86400*7)  return `il y a ${Math.floor(diff / 86400)}j`
  return fmtDate(s)
}
const typeInfo = (t) => NOTIF_TYPES.find(n => n.value === t) ?? NOTIF_TYPES[0]

/* ── Small components ──────────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const t = typeInfo(type)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: t.bg, color: t.color, whiteSpace: 'nowrap' }}>
      {t.icon} {t.label}
    </span>
  )
}
function AudienceBadge({ target, targetRole }) {
  if (target === 'broadcast') return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#EDE9FE', color: '#7C3AED', whiteSpace: 'nowrap' }}>🌍 Tous</span>
  if (target === 'role')      return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#DBEAFE', color: '#1D4ED8', whiteSpace: 'nowrap' }}>👥 {targetRole}</span>
  if (target === 'user_target') return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#F0FDF4', color: '#16A34A', whiteSpace: 'nowrap' }}>👤 Ciblé</span>
  return null
}
function Skel({ w = '100%', h = 13 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
}
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'error' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${type === 'error' ? '#FECACA' : '#BBF7D0'}`, color: type === 'error' ? '#991B1B' : '#166534', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'success' ? <Ic.Check /> : '⚠️'} {msg}
    </div>
  )
}

/* ── Notification preview card ──────────────────────────────────────────────── */
function NotifPreview({ title, message, type, link }) {
  const t = typeInfo(type)
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.color}30`, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{t.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{title || 'Titre de la notification'}</div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{message || 'Contenu de votre notification…'}</div>
        {link && (
          <div style={{ marginTop: 8, fontSize: 12, color: t.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Ic.Link /> {link}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>À l'instant · Non lue</div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [stats,         setStats]         = useState(null)
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [sending,       setSending]       = useState(false)
  const [page,          setPage]          = useState(1)
  const [toast,         setToast]         = useState(null)

  // Form state
  const [title,         setTitle]         = useState('')
  const [message,       setMessage]       = useState('')
  const [type,          setType]          = useState('info')
  const [audienceMode,  setAudienceMode]  = useState('all') // 'all'|'role'|'user'
  const [targetRole,    setTargetRole]    = useState('')
  const [targetUserId,  setTargetUserId]  = useState('')
  const [link,          setLink]          = useState('')

  const PER_PAGE = 20
  const showToast = (msg, t = 'success') => setToast({ msg, type: t })

  /* ── Fetch notifications ──────────────────────────────────────────────── */
  const fetchNotifs = useCallback(async (p = 1) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_manager_broadcast_notifications', {
      p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE
    })
    if (!error && data) {
      setNotifications(data.notifications || [])
      setTotal(data.total || 0)
      setStats(data.stats)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotifs(page) }, [page, fetchNotifs])

  /* ── Send notification ────────────────────────────────────────────────── */
  const sendNotification = async () => {
    if (!title.trim())   { showToast('Le titre est obligatoire', 'error'); return }
    if (!message.trim()) { showToast('Le message est obligatoire', 'error'); return }
    if (audienceMode === 'role'    && !targetRole.trim())   { showToast('Sélectionner un rôle', 'error'); return }
    if (audienceMode === 'user'    && !targetUserId.trim()) { showToast('Saisir un user ID', 'error'); return }

    setSending(true)
    const { data, error } = await supabase.rpc('manager_create_broadcast_notification', {
      p_title:          title,
      p_message:        message,
      p_type:           type,
      p_audience:       audienceMode,
      p_target_role:    audienceMode === 'role'   ? targetRole   : null,
      p_target_user_id: audienceMode === 'user'   ? targetUserId : null,
      p_link:           link.trim() || null,
    })

    if (error) {
      showToast(error.message || 'Erreur lors de l\'envoi', 'error')
    } else {
      const count = data?.recipient_count ?? 0
      showToast(`Notification envoyée à ${count.toLocaleString('fr-FR')} utilisateur(s)`)
      setTitle(''); setMessage(''); setType('info'); setAudienceMode('all')
      setTargetRole(''); setTargetUserId(''); setLink('')
      fetchNotifs(1)
    }
    setSending(false)
  }

  /* ── Delete notification ──────────────────────────────────────────────── */
  const deleteNotif = async (id) => {
    const { error } = await supabase.rpc('manager_delete_notification', { p_notification_id: id })
    if (error) showToast(error.message, 'error')
    else { showToast('Notification supprimée'); fetchNotifs(page) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const inp  = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }
  const selS = { ...inp, appearance: 'none', cursor: 'pointer' }

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .mgr-tr:hover td { background:#F8FAFC !important; }
        .mgr-tr td { transition:background .1s; }
        .type-card:hover { border-color: var(--tc)!important; box-shadow: 0 0 0 3px var(--tc)20; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Notifications</h1>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>Notifications internes — in-app pour vos utilisateurs</p>
        </div>
        <button onClick={() => fetchNotifs(page)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
          <Ic.Refresh />
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total envoyées',  val: stats.total     ?? 0, color: '#6366F1', icon: '📬' },
            { label: 'Diffusion (tous)',val: stats.broadcast ?? 0, color: '#7C3AED', icon: '🌍' },
            { label: 'Par rôle',        val: stats.role      ?? 0, color: '#3B82F6', icon: '👥' },
            { label: 'Ciblées',         val: stats.targeted  ?? 0, color: '#10B981', icon: '👤' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── LEFT: Create form ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic.Bell /> Nouvelle notification
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {NOTIF_TYPES.map(t => (
                  <button key={t.value} onClick={() => setType(t.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, border: `2px solid ${type === t.value ? t.color : '#E2E8F0'}`, background: type === t.value ? t.bg : '#fff', cursor: 'pointer', transition: 'all .15s' }}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: type === t.value ? t.color : '#64748B' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Titre *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la notification…"
                style={{ ...inp, fontWeight: 600 }} maxLength={80} />
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'right' }}>{title.length}/80</div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Message *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Contenu de votre notification in-app…"
                style={{ ...inp, resize: 'vertical', minHeight: 80 }} maxLength={500} />
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'right' }}>{message.length}/500</div>
            </div>

            {/* Link (optional) */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                Lien <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optionnel)</span>
              </label>
              <input value={link} onChange={e => setLink(e.target.value)} placeholder="/annonces ou https://…"
                style={{ ...inp, fontSize: 12 }} />
            </div>

            {/* Audience */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Audience</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { mode: 'all',  label: '🌍 Tous les utilisateurs',  desc: 'Notifie tous les comptes actifs' },
                  { mode: 'role', label: '👥 Par rôle',               desc: 'Cible un rôle spécifique' },
                  { mode: 'user', label: '👤 Utilisateur ciblé',      desc: 'Cible un seul utilisateur (par UUID)' },
                ].map(({ mode, label, desc }) => (
                  <label key={mode} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, border: `2px solid ${audienceMode === mode ? '#F97316' : '#E2E8F0'}`, cursor: 'pointer', background: audienceMode === mode ? '#FFF7ED' : '#fff', transition: 'all .15s' }}>
                    <input type="radio" name="audience" value={mode} checked={audienceMode === mode} onChange={() => setAudienceMode(mode)}
                      style={{ accentColor: '#F97316', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: audienceMode === mode ? '#EA580C' : '#374151' }}>{label}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {audienceMode === 'role' && (
                <div style={{ marginTop: 10, position: 'relative' }}>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ ...selS }}>
                    <option value="">— Sélectionner un rôle —</option>
                    {ROLE_TARGETS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8', display: 'flex' }}><Ic.ChevronD /></span>
                </div>
              )}

              {audienceMode === 'user' && (
                <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)}
                  placeholder="UUID de l'utilisateur (auth.users.id)"
                  style={{ ...inp, marginTop: 10, fontFamily: 'monospace', fontSize: 11 }} />
              )}
            </div>

            <button onClick={sendNotification} disabled={sending || !title.trim() || !message.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: (sending || !title.trim() || !message.trim()) ? .6 : 1, transition: 'opacity .15s' }}>
              <Ic.Send /> {sending ? 'Envoi en cours…' : 'Envoyer la notification'}
            </button>
          </div>

          {/* Preview */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Aperçu</div>
            <NotifPreview title={title} message={message} type={type} link={link} />
          </div>
        </div>

        {/* ── RIGHT: History ─────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Historique des envois</div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{total} notification{total !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <Skel w={60} h={18} />
                    <Skel w={80} h={18} />
                  </div>
                  <Skel w="80%" h={14} />
                  <div style={{ marginTop: 6 }}><Skel w="60%" h={12} /></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Aucune notification envoyée</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Créez votre première notification dans le formulaire.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => {
                const t = typeInfo(n.type)
                return (
                  <div key={n.id}
                    style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,.04)', position: 'relative' }}>
                    {/* Type dot */}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {t.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Badges row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <TypeBadge type={n.type} />
                        <AudienceBadge target={n.target} targetRole={n.target_role} />
                        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{fmtTime(n.created_at)}</span>
                      </div>

                      {/* Title + message */}
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{n.message}</div>

                      {/* Link */}
                      {n.link && (
                        <div style={{ marginTop: 6, fontSize: 11, color: '#6366F1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Ic.Link /> {n.link}
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button onClick={() => deleteNotif(n.id)}
                      style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Supprimer">
                      <Ic.Trash />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Page {page}/{totalPages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: page === 1 ? '#CBD5E1' : '#374151', cursor: page === 1 ? 'default' : 'pointer' }}>
                  <Ic.ChevronL /> Préc.
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return p <= totalPages ? (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${p === page ? '#F97316' : '#E2E8F0'}`, background: p === page ? '#F97316' : '#fff', fontSize: 12, fontWeight: 700, color: p === page ? '#fff' : '#374151', cursor: 'pointer' }}>
                      {p}
                    </button>
                  ) : null
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: page === totalPages ? '#CBD5E1' : '#374151', cursor: page === totalPages ? 'default' : 'pointer' }}>
                  Suiv. <Ic.ChevronR />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
