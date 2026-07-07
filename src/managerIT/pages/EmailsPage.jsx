import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Ic = {
  Send:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Save:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Plus:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Eye:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  History:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.11"/></svg>,
  Edit:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  X:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Users:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Mail:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Image:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Code:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  ChevronD:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Activity:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  TrendUp:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Refresh:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Copy:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Map:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const AUDIENCES = [
  { value: 'all',            label: 'Tous les utilisateurs', icon: '🌍', desc: 'Tous les comptes actifs avec email opt-in' },
  { value: 'particuliers',   label: 'Particuliers',          icon: '🏠', desc: 'Rôles: user, private_user' },
  { value: 'professionnels', label: 'Professionnels',        icon: '💼', desc: 'Rôles: pro_user, agency, agency_admin, premium_seller' },
  { value: 'premium',        label: 'Abonnés Premium',       icon: '⭐', desc: 'Utilisateurs avec premium_alerts activé' },
  { value: 'city',           label: 'Par ville',             icon: '🏙️', desc: 'Filtrer par ville des annonces' },
  { value: 'department',     label: 'Par département',       icon: '📍', desc: 'Ex: 75 (Paris), 69 (Rhône)' },
  { value: 'region',         label: 'Par région',            icon: '🗺️', desc: 'Ex: Île-de-France, Auvergne-Rhône-Alpes' },
]
const VARIABLES = [
  { tag: '{{prenom}}',   label: 'Prénom',   example: 'Jean' },
  { tag: '{{nom}}',      label: 'Nom',      example: 'Dupont' },
  { tag: '{{email}}',    label: 'Email',    example: 'jean@exemple.fr' },
  { tag: '{{ville}}',    label: 'Ville',    example: 'Lyon' },
  { tag: '{{plan}}',     label: 'Plan',     example: 'Premium' },
]

const STATUS_MAP = {
  draft:   { label: 'Brouillon', bg: '#F1F5F9', color: '#64748B' },
  sent:    { label: 'Envoyé',    bg: '#DCFCE7', color: '#16A34A' },
  sending: { label: 'Envoi…',   bg: '#DBEAFE', color: '#2563EB' },
  failed:  { label: 'Échoué',   bg: '#FEE2E2', color: '#DC2626' },
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (s) => {
  if (!s) return '—'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 3600)    return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)   return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 86400*7) return `il y a ${Math.floor(diff / 86400)}j`
  return fmtDate(s)
}
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0

function insertAtCursor(ta, text) {
  const start = ta.selectionStart
  const end   = ta.selectionEnd
  const val   = ta.value
  return val.slice(0, start) + text + val.slice(end)
}

/* ── Small components ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#F1F5F9', color: '#64748B' }
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
}
function Skel({ w = '100%', h = 13 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
}
function Overlay({ children, onClose }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(3px)' }}>
      {children}
    </div>
  )
}
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'error' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${type === 'error' ? '#FECACA' : '#BBF7D0'}`, color: type === 'error' ? '#991B1B' : '#166534', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'success' ? <Ic.Check /> : '⚠️'} {msg}
    </div>
  )
}

/* ── Confirm Send Modal ─────────────────────────────────────────────────────── */
function SendModal({ campaign, recipientCount, onClose, onConfirm, loading }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📨</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Envoyer la campagne ?</h3>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: 600 }}>
            «{campaign.subject?.slice(0, 60)}»
          </div>
        </div>
        <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>Destinataires estimés</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>{recipientCount.toLocaleString('fr-FR')}</span>
        </div>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400E' }}>
          ⚠️ Cette action est <strong>irréversible</strong>. Les emails seront envoyés à tous les destinataires correspondant à l'audience sélectionnée.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Annuler</button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: '#0EA5E9', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? .7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ic.Send /> {loading ? 'Envoi en cours…' : 'Confirmer l\'envoi'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Campaign Stats Panel ───────────────────────────────────────────────────── */
function StatsPanel({ campaign: c, onClose, onEdit }) {
  const openRate  = pct(c.open_count,  c.sent_count)
  const clickRate = pct(c.click_count, c.sent_count)
  const errorRate = pct(c.error_count, c.recipient_count)

  const aud = AUDIENCES.find(a => a.value === c.audience)

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 400, width: '100%', maxWidth: 500, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}><Ic.ChevronR /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <StatusBadge status={c.status} />
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{aud?.icon} {aud?.label}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
        </div>
        {c.status === 'draft' && (
          <button onClick={() => onEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            <Ic.Edit /> Modifier
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Destinataires',     val: c.recipient_count ?? 0,  color: '#6366F1', icon: '👥' },
            { label: 'Envoyés',           val: c.sent_count     ?? 0,  color: '#0EA5E9', icon: '📤' },
            { label: `Ouverts (${openRate}%)`,  val: c.open_count  ?? 0,  color: '#10B981', icon: '👁️' },
            { label: `Cliqués (${clickRate}%)`, val: c.click_count ?? 0,  color: '#F59E0B', icon: '🖱️' },
            { label: `Erreurs (${errorRate}%)`, val: c.error_count ?? 0,  color: '#EF4444', icon: '❌' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{val.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
          {/* Open rate bar */}
          {c.status === 'sent' && c.sent_count > 0 && (
            <div style={{ gridColumn: '1/-1', background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Taux d'ouverture</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981' }}>{openRate}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#10B981', width: `${openRate}%`, transition: 'width .6s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Taux de clic</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B' }}>{clickRate}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden', marginTop: 4 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#F59E0B', width: `${clickRate}%`, transition: 'width .6s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 }}>Détails</div>
        {[
          ['Audience',    `${aud?.icon} ${aud?.label}${c.audience_value ? ` — ${c.audience_value}` : ''}`],
          ['Créée le',    fmtDate(c.created_at)],
          ['Envoyée le',  c.sent_at ? fmtDate(c.sent_at) : '—'],
          ['Aperçu',      c.preview_text || '—'],
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
            <span style={{ fontSize: 12, color: '#64748B', minWidth: 110 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', flex: 1 }}>{val}</span>
          </div>
        ))}

        {/* HTML preview */}
        {c.html_body && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', margin: '16px 0 8px' }}>Aperçu email</div>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', height: 300 }}>
              <iframe srcDoc={buildPreviewHtml(c.subject, c.html_body)} style={{ width: '100%', height: '100%', border: 'none' }} title="preview" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── HTML email wrapper ─────────────────────────────────────────────────────── */
function buildPreviewHtml(subject, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject || 'Aperçu email'}</title>
<style>body{margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;color:#0f172a}
.email-wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}
img{max-width:100%;height:auto} a{color:#0ea5e9}
.btn{display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px}
</style></head><body><div class="email-wrap">${body}</div></body></html>`
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function EmailsPage() {
  const [view,          setView]         = useState('editor') // 'editor' | 'preview' | 'history'
  const [campaigns,     setCampaigns]    = useState([])
  const [stats,         setStats]        = useState(null)
  const [total,         setTotal]        = useState(0)
  const [loading,       setLoading]      = useState(false)
  const [saving,        setSaving]       = useState(false)
  const [sending,       setSending]      = useState(false)
  const [toast,         setToast]        = useState(null)
  const [page,          setPage]         = useState(1)
  const [panelCampaign, setPanelCampaign]= useState(null)
  const [sendModal,     setSendModal]    = useState(false)

  // Editor state
  const [editId,        setEditId]       = useState(null)
  const [subject,       setSubject]      = useState('')
  const [previewText,   setPreviewText]  = useState('')
  const [audience,      setAudience]     = useState('all')
  const [audienceValue, setAudienceValue]= useState('')
  const [htmlBody,      setHtmlBody]     = useState(DEFAULT_HTML)
  const [recipientCount,setRecipientCount] = useState(0)

  const taRef = useRef()
  const PER_PAGE = 20

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  /* ── Fetch campaigns ──────────────────────────────────────────────────── */
  const fetchCampaigns = useCallback(async (p = 1) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_manager_campaigns', {
      p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE
    })
    if (!error && data) {
      setCampaigns(data.campaigns || [])
      setTotal(data.total || 0)
      setStats(data.stats)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampaigns(page) }, [page, fetchCampaigns])

  /* ── Compute recipient count on audience change ───────────────────────── */
  useEffect(() => {
    const aud = AUDIENCES.find(a => a.value === audience)
    if (!aud) return
    // Optimistic local estimate — real count comes from SQL on save
    setRecipientCount(0)
  }, [audience])

  /* ── Save draft ───────────────────────────────────────────────────────── */
  const saveDraft = async () => {
    if (!subject.trim()) { showToast('L\'objet est obligatoire', 'error'); return }
    setSaving(true)
    const { data, error } = await supabase.rpc('manager_save_campaign', {
      p_campaign_id:   editId,
      p_subject:       subject,
      p_preview_text:  previewText,
      p_html_body:     htmlBody,
      p_audience:      audience,
      p_audience_value: audienceValue || null,
      p_status:        'draft',
    })
    if (error) { showToast(error.message || 'Erreur', 'error') }
    else {
      if (!editId) setEditId(data.id)
      setRecipientCount(data.recipient_count || 0)
      showToast('Brouillon enregistré')
      fetchCampaigns(page)
    }
    setSaving(false)
  }

  /* ── Send campaign ────────────────────────────────────────────────────── */
  const sendCampaign = async () => {
    setSending(true)
    const { data, error } = await supabase.rpc('manager_save_campaign', {
      p_campaign_id:   editId,
      p_subject:       subject,
      p_preview_text:  previewText,
      p_html_body:     htmlBody,
      p_audience:      audience,
      p_audience_value: audienceValue || null,
      p_status:        'sent',
    })
    setSendModal(false)
    if (error) { showToast(error.message || 'Erreur', 'error') }
    else {
      showToast(`Campagne envoyée à ${(data.recipient_count || 0).toLocaleString('fr-FR')} destinataire(s)`)
      resetEditor()
      setView('history')
      fetchCampaigns(1)
    }
    setSending(false)
  }

  /* ── Delete campaign ──────────────────────────────────────────────────── */
  const deleteCampaign = async (id) => {
    const { error } = await supabase.rpc('manager_delete_campaign', { p_campaign_id: id })
    if (error) showToast(error.message, 'error')
    else { showToast('Campagne supprimée'); setPanelCampaign(null); fetchCampaigns(page) }
  }

  /* ── Editor helpers ───────────────────────────────────────────────────── */
  const resetEditor = () => {
    setEditId(null); setSubject(''); setPreviewText(''); setAudience('all')
    setAudienceValue(''); setHtmlBody(DEFAULT_HTML); setRecipientCount(0)
  }

  const loadCampaignInEditor = (c) => {
    setEditId(c.id); setSubject(c.subject || ''); setPreviewText(c.preview_text || '')
    setAudience(c.audience || 'all'); setAudienceValue(c.audience_value || '')
    setHtmlBody(c.html_body || DEFAULT_HTML); setRecipientCount(c.recipient_count || 0)
    setPanelCampaign(null); setView('editor')
  }

  const insertVariable = (tag) => {
    const ta = taRef.current
    if (!ta) { setHtmlBody(h => h + tag); return }
    setHtmlBody(insertAtCursor(ta, tag))
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.selectionStart + tag.length }, 0)
  }

  const insertSnippet = (type) => {
    const snippets = {
      image:  '\n<div style="text-align:center;padding:16px 0">\n  <img src="https://exemple.com/image.jpg" alt="" style="max-width:100%;border-radius:8px">\n</div>\n',
      button: '\n<div style="text-align:center;padding:20px 0">\n  <a href="https://shopca.fr" class="btn">Voir les annonces</a>\n</div>\n',
      divider:'\n<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">\n',
      header: '\n<div style="background:#0ea5e9;color:#fff;padding:32px 24px;text-align:center">\n  <h1 style="margin:0;font-size:24px">Titre de votre email</h1>\n  <p style="margin:8px 0 0;opacity:.85">Sous-titre ou accroche</p>\n</div>\n',
      footer: '\n<div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0">\n  <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 SHOPCA · <a href="https://shopca.fr/unsubscribe" style="color:#94a3b8">Se désabonner</a></p>\n</div>\n',
    }
    const ta = taRef.current
    if (!ta || !snippets[type]) return
    setHtmlBody(insertAtCursor(ta, snippets[type]))
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const selectedAudience = AUDIENCES.find(a => a.value === audience)
  const needsValue = ['city', 'department', 'region'].includes(audience)

  const inp  = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }
  const selS = { ...inp, appearance: 'none', cursor: 'pointer' }

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .mgr-tr:hover td { background:#F8FAFC !important; cursor:pointer; }
        .mgr-tr td { transition:background .1s; }
        .tab-btn { transition: all .15s; }
        .var-chip:hover { background:#DBEAFE!important; color:#1D4ED8!important; }
        .snip-btn:hover { background:#F1F5F9!important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Emails</h1>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>Centre de communication — campagnes marketing</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {view !== 'editor' && (
            <button onClick={() => { resetEditor(); setView('editor') }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#0EA5E9', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Ic.Plus /> Nouvelle campagne
            </button>
          )}
          <button onClick={() => fetchCampaigns(page)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            <Ic.Refresh />
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Campagnes',  val: stats.total_campaigns,  color: '#6366F1', icon: '📧' },
            { label: 'Envoyées',   val: stats.sent,             color: '#10B981', icon: '✅' },
            { label: 'Brouillons', val: stats.drafts,           color: '#F59E0B', icon: '📝' },
            { label: 'Emails envoyés', val: (stats.total_sent||0).toLocaleString('fr-FR'), color: '#0EA5E9', icon: '📤' },
            { label: 'Ouvertures', val: (stats.total_opens||0).toLocaleString('fr-FR'),  color: '#10B981', icon: '👁️' },
            { label: 'Clics',      val: (stats.total_clicks||0).toLocaleString('fr-FR'), color: '#F59E0B', icon: '🖱️' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F8FAFC', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          ['editor',  <Ic.Edit />,   'Éditeur'],
          ['preview', <Ic.Eye />,    'Prévisualisation'],
          ['history', <Ic.History />, 'Historique'],
        ].map(([key, icon, label]) => (
          <button key={key} onClick={() => setView(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', background: view === key ? '#fff' : 'transparent', color: view === key ? '#0EA5E9' : '#64748B', fontSize: 13, fontWeight: view === key ? 700 : 500, cursor: 'pointer', boxShadow: view === key ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── EDITOR VIEW ────────────────────────────────────────────────────────── */}
      {view === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left: settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Paramètres</div>

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Objet *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Votre objet d'email…"
                style={{ ...inp, marginBottom: 12, fontWeight: 600 }} />

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Aperçu (preheader)</label>
              <input value={previewText} onChange={e => setPreviewText(e.target.value)} placeholder="Texte affiché après l'objet dans la boîte mail…"
                style={{ ...inp, marginBottom: 12, fontSize: 12 }} />

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Audience</label>
              <div style={{ position: 'relative', marginBottom: needsValue ? 8 : 0 }}>
                <select value={audience} onChange={e => { setAudience(e.target.value); setAudienceValue('') }}
                  style={{ ...selS, fontWeight: 600 }}>
                  {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.icon} {a.label}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8', display: 'flex' }}><Ic.ChevronD /></span>
              </div>
              {selectedAudience && (
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, marginBottom: 8 }}>{selectedAudience.desc}</div>
              )}
              {needsValue && (
                <input value={audienceValue} onChange={e => setAudienceValue(e.target.value)}
                  placeholder={audience === 'city' ? 'ex: Lyon, Paris…' : audience === 'department' ? 'ex: 69, 75, 13…' : 'ex: Île-de-France…'}
                  style={{ ...inp }} />
              )}

              {recipientCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '8px 10px', background: '#F0FDF4', borderRadius: 8, fontSize: 12 }}>
                  <span style={{ color: '#64748B' }}>Destinataires estimés</span>
                  <span style={{ fontWeight: 800, color: '#10B981', fontSize: 15 }}>{recipientCount.toLocaleString('fr-FR')}</span>
                </div>
              )}
            </div>

            {/* Variables */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Variables</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {VARIABLES.map(v => (
                  <button key={v.tag} onClick={() => insertVariable(v.tag)} className="var-chip"
                    title={`Exemple: ${v.example}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#3B82F6', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                    {v.tag}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 8 }}>Cliquez pour insérer à la position du curseur dans l'éditeur.</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={saveDraft} disabled={saving || !subject.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#64748B', cursor: 'pointer', opacity: (saving || !subject.trim()) ? .6 : 1 }}>
                <Ic.Save /> {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
              </button>
              <button onClick={() => { if (!subject.trim() || !htmlBody.trim()) { showToast('Objet et contenu requis', 'error'); return } saveDraft().then(() => setSendModal(true)) }}
                disabled={!subject.trim() || !htmlBody.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: 'none', background: '#0EA5E9', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (!subject.trim() || !htmlBody.trim()) ? .5 : 1 }}>
                <Ic.Send /> Envoyer la campagne
              </button>
            </div>

            {editId && (
              <button onClick={() => { resetEditor() }}
                style={{ padding: '7px', borderRadius: 10, border: '1px solid #FECACA', background: '#FEF2F2', fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
                ✕ Nouvelle campagne vierge
              </button>
            )}
          </div>

          {/* Right: HTML editor */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            {/* Toolbar */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginRight: 6 }}>INSÉRER</span>
              {[
                ['header',  '🎨 En-tête'],
                ['image',   '🖼️ Image'],
                ['button',  '🔵 Bouton'],
                ['divider', '— Séparateur'],
                ['footer',  '📄 Pied de page'],
              ].map(([type, label]) => (
                <button key={type} onClick={() => insertSnippet(type)} className="snip-btn"
                  style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FAFAFA', fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>{htmlBody.length} car.</span>
                <button onClick={() => setHtmlBody(DEFAULT_HTML)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', fontSize: 11, color: '#EF4444', cursor: 'pointer' }}>
                  Reset
                </button>
              </div>
            </div>

            {/* Header bar */}
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAFA' }}>
              <Ic.Code />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>HTML</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>— Les variables s'insèrent dans le corps</span>
            </div>

            <textarea
              ref={taRef}
              value={htmlBody}
              onChange={e => setHtmlBody(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 500, padding: 16, border: 'none', outline: 'none', resize: 'vertical',
                fontFamily: "'Monaco','Menlo','Consolas',monospace", fontSize: 12, lineHeight: 1.6,
                color: '#0F172A', background: '#fff', boxSizing: 'border-box', display: 'block'
              }}
            />
          </div>
        </div>
      )}

      {/* ── PREVIEW VIEW ───────────────────────────────────────────────────────── */}
      {view === 'preview' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                {subject || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Aucun objet défini</span>}
              </div>
              {previewText && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{previewText}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, fontSize: 11, color: '#94A3B8' }}>
              <span>{selectedAudience?.icon} {selectedAudience?.label}</span>
              {audienceValue && <span>— {audienceValue}</span>}
            </div>
          </div>

          {/* Variable replacement preview */}
          {VARIABLES.some(v => htmlBody.includes(v.tag)) && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '8px 14px', marginBottom: 14, fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic.Users /> Les variables sont remplacées avec des exemples dans cet aperçu.
            </div>
          )}

          <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', background: '#f4f4f5', height: 600 }}>
            <iframe
              srcDoc={buildPreviewHtml(subject, htmlBody
                .replace(/\{\{prenom\}\}/g, 'Jean')
                .replace(/\{\{nom\}\}/g, 'Dupont')
                .replace(/\{\{email\}\}/g, 'jean.dupont@exemple.fr')
                .replace(/\{\{ville\}\}/g, 'Lyon')
                .replace(/\{\{plan\}\}/g, 'Premium')
              )}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Email preview"
            />
          </div>
        </div>
      )}

      {/* ── HISTORY VIEW ───────────────────────────────────────────────────────── */}
      {view === 'history' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Campagne','Audience','Statut','Dest.','Ouverts','Cliqués','Erreurs','Date',''].map((h, i) => (
                      <th key={i} style={{ padding: '9px 14px', textAlign: i === 8 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#FAFAFA', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j} style={{ padding: '12px 14px' }}><Skel w={j === 0 ? 180 : 60} /></td>)}</tr>
                    ))
                  ) : campaigns.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                      Aucune campagne — <button onClick={() => setView('editor')} style={{ color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>créer la première</button>
                    </td></tr>
                  ) : campaigns.map(c => {
                    const aud = AUDIENCES.find(a => a.value === c.audience)
                    return (
                      <tr key={c.id} className="mgr-tr" onClick={() => setPanelCampaign(c)}>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, color: '#0F172A', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
                          {c.preview_text && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{c.preview_text.slice(0, 60)}</div>}
                        </td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                          {aud?.icon} {aud?.label}{c.audience_value ? ` · ${c.audience_value}` : ''}
                        </td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', verticalAlign: 'middle' }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{c.recipient_count?.toLocaleString('fr-FR') ?? '—'}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                          {c.open_count ?? 0} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({pct(c.open_count, c.sent_count)}%)</span>
                        </td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                          {c.click_count ?? 0} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({pct(c.click_count, c.sent_count)}%)</span>
                        </td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 12, color: c.error_count > 0 ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                          {c.error_count ?? 0}
                        </td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmtTime(c.created_at)}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F8FAFC', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            {c.status === 'draft' && (
                              <button onClick={() => loadCampaignInEditor(c)}
                                style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Ic.Edit />
                              </button>
                            )}
                            <button onClick={() => deleteCampaign(c.id)}
                              style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Ic.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Page {page}/{totalPages} — {total} campagnes</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: page === 1 ? '#CBD5E1' : '#374151', cursor: page === 1 ? 'default' : 'pointer' }}>
                    <Ic.ChevronL /> Préc.
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: page === totalPages ? '#CBD5E1' : '#374151', cursor: page === totalPages ? 'default' : 'pointer' }}>
                    Suiv. <Ic.ChevronR />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats panel */}
      {panelCampaign && (
        <>
          <div onClick={() => setPanelCampaign(null)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,.2)' }} />
          <StatsPanel campaign={panelCampaign} onClose={() => setPanelCampaign(null)} onEdit={loadCampaignInEditor} />
        </>
      )}

      {/* Send confirm modal */}
      {sendModal && (
        <SendModal
          campaign={{ subject, audience, audienceValue }}
          recipientCount={recipientCount}
          onClose={() => setSendModal(false)}
          onConfirm={sendCampaign}
          loading={sending}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

/* ── Default HTML template ─────────────────────────────────────────────────── */
const DEFAULT_HTML = `<div style="background:#0ea5e9;color:#fff;padding:32px 24px;text-align:center">
  <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.02em">SHOPCA</h1>
  <p style="margin:8px 0 0;opacity:.85;font-size:14px">La plateforme immobilière de confiance</p>
</div>

<div style="padding:32px 24px">
  <p style="font-size:16px;margin:0 0 16px">Bonjour {{prenom}},</p>

  <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 20px">
    Votre message ici…
  </p>

  <div style="text-align:center;padding:20px 0">
    <a href="https://shopca.fr" class="btn">Voir les annonces</a>
  </div>
</div>

<div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:12px;color:#94a3b8">
    © 2026 SHOPCA · Vous recevez cet email car vous êtes inscrit sur shopca.fr<br>
    <a href="https://shopca.fr/unsubscribe?email={{email}}" style="color:#94a3b8">Se désabonner</a>
  </p>
</div>`
