import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Send:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Save:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Plus:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  History:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.11"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  X:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Users:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Code:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  ChevronD: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronU: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  ChevronL: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Refresh:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Desktop:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Phone:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  Sun:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Activity: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const AUDIENCES = [
  { value: 'all',            label: 'Tous les utilisateurs', icon: '🌍', desc: 'Tous les comptes actifs avec email opt-in' },
  { value: 'particuliers',   label: 'Particuliers',          icon: '🏠', desc: 'Rôles: user, private_user' },
  { value: 'professionnels', label: 'Professionnels',        icon: '💼', desc: 'Rôles: pro_user, agency, agency_admin' },
  { value: 'premium',        label: 'Abonnés Premium',       icon: '⭐', desc: 'Utilisateurs avec premium_alerts activé' },
  { value: 'city',           label: 'Par ville',             icon: '🏙️', desc: 'Filtrer par ville des annonces' },
  { value: 'department',     label: 'Par département',       icon: '📍', desc: 'Ex: 75 (Paris), 69 (Rhône)' },
  { value: 'region',         label: 'Par région',            icon: '🗺️', desc: 'Ex: Île-de-France, Auvergne-Rhône-Alpes' },
]
const VARIABLES = [
  { tag: '{{prenom}}', label: 'Prénom',  example: 'Jean'                },
  { tag: '{{nom}}',    label: 'Nom',     example: 'Dupont'              },
  { tag: '{{email}}',  label: 'Email',   example: 'jean@exemple.fr'     },
  { tag: '{{ville}}',  label: 'Ville',   example: 'Lyon'                },
  { tag: '{{plan}}',   label: 'Plan',    example: 'Premium'             },
]
const STATUS_MAP = {
  draft:   { label: 'Brouillon', bg: '#F1F5F9', color: '#64748B' },
  sent:    { label: 'Envoyé',    bg: '#DCFCE7', color: '#16A34A' },
  sending: { label: 'Envoi…',    bg: '#DBEAFE', color: '#2563EB' },
  failed:  { label: 'Échoué',   bg: '#FEE2E2', color: '#DC2626' },
}
const TIMEZONES = ['Europe/Paris','Europe/London','Europe/Berlin','Europe/Madrid','America/New_York','America/Los_Angeles','Asia/Tokyo','UTC']

const BLOCK_TYPES = [
  { type: 'banner',    label: 'Bannière',  icon: '▬', color: '#FF6B00' },
  { type: 'title',     label: 'Titre',     icon: 'H1', color: '#6366F1' },
  { type: 'text',      label: 'Texte',     icon: '¶',  color: '#64748B' },
  { type: 'image',     label: 'Image',     icon: '🖼', color: '#0EA5E9' },
  { type: 'logo',      label: 'Logo',      icon: '◈',  color: '#8B5CF6' },
  { type: 'button',    label: 'Bouton',    icon: '▶',  color: '#FF6B00' },
  { type: 'divider',   label: 'Sépar.',    icon: '—',  color: '#94A3B8' },
  { type: 'columns',   label: 'Colonnes',  icon: '⊞',  color: '#10B981' },
  { type: 'social',    label: 'Réseaux',   icon: '@',  color: '#0EA5E9' },
  { type: 'signature', label: 'Signature', icon: '✍',  color: '#374151' },
  { type: 'footer',    label: 'Footer',    icon: '⊟',  color: '#94A3B8' },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (s) => {
  if (!s) return '—'
  const d = (Date.now() - new Date(s)) / 1000
  if (d < 3600)   return `il y a ${Math.floor(d / 60)} min`
  if (d < 86400)  return `il y a ${Math.floor(d / 3600)}h`
  if (d < 604800) return `il y a ${Math.floor(d / 86400)}j`
  return fmtDate(s)
}
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0
let _uid = 0
const newId = () => `b${Date.now()}${++_uid}`

/* ── Block logic ───────────────────────────────────────────────────────────── */
function defaultConfig(type) {
  const map = {
    banner:    { title: 'SHOPCA', subtitle: 'La plateforme immobilière de confiance', bg: '#FF6B00', textColor: '#ffffff', padding: '40px 24px' },
    title:     { text: 'Titre de votre email', level: 'h1', align: 'center', color: '#0F172A', fontSize: 28 },
    text:      { content: 'Bonjour {{prenom}},\n\nVotre message ici.', align: 'left', fontSize: 14, color: '#374151', padding: '0 24px 24px' },
    image:     { url: '', alt: '', width: '100%', align: 'center', borderRadius: 0, padding: '16px 24px' },
    logo:      { url: '', alt: 'SHOPCA', width: 120, align: 'center', padding: '20px 24px' },
    button:    { text: 'Voir les annonces', url: 'https://shopca.fr', bg: '#FF6B00', textColor: '#ffffff', align: 'center', borderRadius: 8, fontSize: 14 },
    divider:   { color: '#E2E8F0', margin: '8px 24px', thickness: 1 },
    columns:   { left: 'Texte de la colonne gauche.', right: 'Texte de la colonne droite.' },
    social:    { networks: ['facebook', 'twitter', 'linkedin'], align: 'center' },
    signature: { name: "L'équipe SHOPCA", role: 'Service client', email: 'contact@shopca.fr', phone: '' },
    footer:    { text: '© 2026 SHOPCA · Tous droits réservés', unsubUrl: 'https://shopca.fr/unsubscribe?email={{email}}', bg: '#F8FAFC', color: '#94A3B8' },
  }
  return { ...(map[type] || {}) }
}

function blockToHtml(block) {
  const c = block.config
  switch (block.type) {
    case 'banner':
      return `<div style="background:${c.bg};color:${c.textColor};padding:${c.padding};text-align:center"><h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em;font-family:-apple-system,sans-serif">${c.title}</h1>${c.subtitle ? `<p style="margin:10px 0 0;opacity:.85;font-size:14px">${c.subtitle}</p>` : ''}</div>`
    case 'title': {
      const sizes = { h1: 28, h2: 22, h3: 18 }
      const fs = c.fontSize || sizes[c.level] || 24
      return `<div style="padding:24px 24px 8px;text-align:${c.align}"><${c.level} style="margin:0;font-size:${fs}px;color:${c.color};font-weight:800;font-family:-apple-system,sans-serif">${c.text}</${c.level}></div>`
    }
    case 'text':
      return `<div style="padding:${c.padding};font-size:${c.fontSize}px;color:${c.color};line-height:1.7;text-align:${c.align};font-family:-apple-system,sans-serif">${c.content.split('\n').map(l => l.trim() ? `<p style="margin:0 0 12px">${l}</p>` : '<br>').join('')}</div>`
    case 'image':
      return c.url
        ? `<div style="text-align:${c.align};padding:${c.padding}"><img src="${c.url}" alt="${c.alt}" style="width:${c.width};border-radius:${c.borderRadius}px;max-width:100%;height:auto;${c.align === 'center' ? 'display:block;margin:0 auto' : ''}"></div>`
        : `<div style="background:#F1F5F9;padding:32px;text-align:center;color:#94A3B8;font-size:12px">📷 Image — définissez l'URL</div>`
    case 'logo':
      return `<div style="text-align:${c.align};padding:${c.padding}">${c.url ? `<img src="${c.url}" alt="${c.alt}" style="width:${c.width}px;height:auto;max-width:100%;${c.align === 'center' ? 'display:block;margin:0 auto' : ''}">` : `<div style="display:inline-block;background:#FF6B00;color:#fff;font-size:18px;font-weight:900;padding:8px 18px;border-radius:6px;font-family:sans-serif;letter-spacing:-0.02em">SHOPCA</div>`}</div>`
    case 'button':
      return `<div style="text-align:${c.align};padding:20px 24px"><a href="${c.url}" style="display:inline-block;background:${c.bg};color:${c.textColor}!important;text-decoration:none;padding:12px 28px;border-radius:${c.borderRadius}px;font-size:${c.fontSize}px;font-weight:700;font-family:-apple-system,sans-serif">${c.text}</a></div>`
    case 'divider':
      return `<div style="padding:${c.margin}"><hr style="border:none;border-top:${c.thickness}px solid ${c.color};margin:0"></div>`
    case 'columns':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 24px"><tr><td width="50%" style="padding-right:12px;vertical-align:top;font-size:14px;color:#374151;line-height:1.7;font-family:sans-serif">${c.left}</td><td width="50%" style="padding-left:12px;vertical-align:top;font-size:14px;color:#374151;line-height:1.7;font-family:sans-serif">${c.right}</td></tr></table>`
    case 'social': {
      const SM = { facebook:{l:'f',u:'https://facebook.com',bg:'#1877F2'}, twitter:{l:'X',u:'https://twitter.com',bg:'#000'}, linkedin:{l:'in',u:'https://linkedin.com',bg:'#0A66C2'}, instagram:{l:'📷',u:'https://instagram.com',bg:'#E4405F'}, youtube:{l:'▶',u:'https://youtube.com',bg:'#FF0000'} }
      const links = (c.networks||[]).map(n=>SM[n]?`<a href="${SM[n].u}" style="display:inline-block;margin:0 5px;background:${SM[n].bg};color:#fff;text-decoration:none;width:36px;height:36px;border-radius:50%;text-align:center;line-height:36px;font-size:14px;font-weight:700;font-family:sans-serif">${SM[n].l}</a>`:'').join('')
      return `<div style="text-align:${c.align||'center'};padding:20px 24px">${links}</div>`
    }
    case 'signature':
      return `<div style="padding:20px 24px;border-top:2px solid #FF6B00"><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0F172A;font-family:sans-serif">${c.name}</p>${c.role?`<p style="margin:0 0 2px;font-size:12px;color:#64748B;font-family:sans-serif">${c.role}</p>`:''}${c.email?`<p style="margin:0;font-size:12px;font-family:sans-serif"><a href="mailto:${c.email}" style="color:#FF6B00">${c.email}</a></p>`:''}${c.phone?`<p style="margin:2px 0 0;font-size:12px;color:#64748B;font-family:sans-serif">${c.phone}</p>`:''}</div>`
    case 'footer':
      return `<div style="background:${c.bg};padding:20px 24px;text-align:center;border-top:1px solid #E2E8F0"><p style="margin:0 0 6px;font-size:12px;color:${c.color};font-family:sans-serif">${c.text}</p><a href="${c.unsubUrl}" style="font-size:11px;color:${c.color};text-decoration:underline;font-family:sans-serif">Se désabonner</a></div>`
    default: return ''
  }
}
const blocksToHtml = (blocks) => blocks.map(blockToHtml).join('\n')

/* ── Preview HTML wrapper ──────────────────────────────────────────────────── */
function buildPreviewHtml(subject, body, preHeader = '', theme = 'light') {
  const pageBg = theme === 'dark' ? '#1E293B' : '#F4F4F5'
  const cardBg = theme === 'dark' ? '#0F172A' : '#FFFFFF'
  const txt    = theme === 'dark' ? '#E2E8F0' : '#0F172A'
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject||'Aperçu'}</title><style>body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:${pageBg};color:${txt}}.wrap{max-width:600px;margin:0 auto;background:${cardBg};border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12)}img{max-width:100%;height:auto}a{color:#FF6B00}p{margin:0 0 12px}</style></head><body>${preHeader?`<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preHeader}</div>`:''}<div class="wrap">${body}</div></body></html>`
}

/* ── Default blocks ────────────────────────────────────────────────────────── */
const DEFAULT_BLOCKS = [
  { id: newId(), type: 'banner',  config: defaultConfig('banner') },
  { id: newId(), type: 'text',    config: defaultConfig('text')   },
  { id: newId(), type: 'button',  config: defaultConfig('button') },
  { id: newId(), type: 'divider', config: defaultConfig('divider')},
  { id: newId(), type: 'footer',  config: defaultConfig('footer') },
]

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
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(3px)' }}>
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

/* ── Send Modal ─────────────────────────────────────────────────────────────── */
function SendModal({ campaign, recipientCount, onClose, onConfirm, loading }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📨</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Envoyer la campagne ?</h3>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: 600 }}>«{campaign.subject?.slice(0, 60)}»</div>
        </div>
        <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>Destinataires estimés</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>{recipientCount.toLocaleString('fr-FR')}</span>
        </div>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400E' }}>
          ⚠️ Cette action est <strong>irréversible</strong>. Les emails seront envoyés à tous les destinataires.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Annuler</button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: '#FF6B00', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? .7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ic.Send /> {loading ? 'Envoi…' : 'Confirmer l\'envoi'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Stats Panel ────────────────────────────────────────────────────────────── */
function StatsPanel({ campaign: c, onClose, onEdit }) {
  const openRate  = pct(c.open_count,  c.sent_count)
  const clickRate = pct(c.click_count, c.sent_count)
  const errorRate = pct(c.error_count, c.recipient_count)
  const aud = AUDIENCES.find(a => a.value === c.audience)
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 400, width: '100%', maxWidth: 500, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}><Ic.ChevronR /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><StatusBadge status={c.status} /><span style={{ fontSize: 11, color: '#94A3B8' }}>{aud?.icon} {aud?.label}</span></div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
        </div>
        {c.status === 'draft' && (
          <button onClick={() => onEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            <Ic.Edit /> Modifier
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Destinataires', val: c.recipient_count??0, color:'#6366F1', icon:'👥' },
            { label: 'Envoyés',       val: c.sent_count??0,      color:'#0EA5E9', icon:'📤' },
            { label: `Ouverts (${openRate}%)`,  val: c.open_count??0,  color:'#10B981', icon:'👁️' },
            { label: `Cliqués (${clickRate}%)`, val: c.click_count??0, color:'#F59E0B', icon:'🖱️' },
            { label: `Erreurs (${errorRate}%)`, val: c.error_count??0, color:'#EF4444', icon:'❌' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{val.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
          {c.status === 'sent' && c.sent_count > 0 && (
            <div style={{ gridColumn: '1/-1', background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
              {[['Taux d\'ouverture', openRate, '#10B981'], ['Taux de clic', clickRate, '#F59E0B']].map(([lbl, val, col]) => (
                <div key={lbl} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{lbl}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: col }}>{val}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: '#E2E8F0' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: col, width: `${val}%`, transition: 'width .6s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 }}>Détails</div>
        {[['Audience', `${aud?.icon} ${aud?.label}${c.audience_value ? ` — ${c.audience_value}` : ''}`], ['Créée le', fmtDate(c.created_at)], ['Envoyée le', c.sent_at ? fmtDate(c.sent_at) : '—'], ['Aperçu', c.preview_text || '—']].map(([lbl, val]) => (
          <div key={lbl} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
            <span style={{ fontSize: 12, color: '#64748B', minWidth: 110 }}>{lbl}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', flex: 1 }}>{val}</span>
          </div>
        ))}
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

/* ── Block Edit Form ────────────────────────────────────────────────────────── */
function BlockEditForm({ block, onChange }) {
  const c   = block.config
  const upd = (key, val) => onChange({ ...block, config: { ...c, [key]: val } })

  const inp  = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 12, color: '#0F172A', outline: 'none', boxSizing: 'border-box', background: '#fff' }
  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }

  /* helper functions — called as {lbl('…')} not as <Lbl> to avoid remounting */
  const lbl = (t) => <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, marginTop: 10 }}>{t}</div>
  const colorRow = (label, key) => (
    <div>
      {lbl(label)}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="color" value={c[key] || '#000000'} onChange={e => upd(key, e.target.value)} style={{ width: 28, height: 28, border: '1px solid #E2E8F0', borderRadius: 4, cursor: 'pointer', padding: 2, flexShrink: 0 }} />
        <input style={{ ...inp, flex: 1 }} value={c[key] || ''} onChange={e => upd(key, e.target.value)} />
      </div>
    </div>
  )
  const alignSel = (key = 'align') => (
    <div>
      {lbl('Alignement')}
      <select style={inp} value={c[key] || 'center'} onChange={e => upd(key, e.target.value)}>
        <option value="left">Gauche</option><option value="center">Centre</option><option value="right">Droite</option>
      </select>
    </div>
  )

  switch (block.type) {
    case 'banner': return (
      <div>
        {lbl('Titre')}<input style={inp} value={c.title} onChange={e => upd('title', e.target.value)} />
        {lbl('Sous-titre')}<input style={inp} value={c.subtitle} onChange={e => upd('subtitle', e.target.value)} />
        <div style={grid}>{colorRow('Fond', 'bg')}{colorRow('Texte', 'textColor')}</div>
        {lbl('Padding CSS')}<input style={inp} value={c.padding} onChange={e => upd('padding', e.target.value)} placeholder="40px 24px" />
      </div>
    )
    case 'title': return (
      <div>
        {lbl('Texte du titre')}<input style={inp} value={c.text} onChange={e => upd('text', e.target.value)} />
        <div style={grid}>
          <div>
            {lbl('Niveau')}
            <select style={inp} value={c.level} onChange={e => upd('level', e.target.value)}>
              <option value="h1">H1 — Grand</option><option value="h2">H2 — Moyen</option><option value="h3">H3 — Petit</option>
            </select>
          </div>
          <div>{lbl('Taille px')}<input type="number" style={inp} value={c.fontSize} min={12} max={60} onChange={e => upd('fontSize', +e.target.value)} /></div>
        </div>
        {alignSel()}
        {colorRow('Couleur', 'color')}
      </div>
    )
    case 'text': return (
      <div>
        {lbl('Contenu')}
        <textarea style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} value={c.content} onChange={e => upd('content', e.target.value)} />
        <div style={grid}>
          <div>{lbl('Taille px')}<input type="number" style={inp} value={c.fontSize} min={10} max={32} onChange={e => upd('fontSize', +e.target.value)} /></div>
          {alignSel()}
        </div>
        {colorRow('Couleur', 'color')}
        {lbl('Padding CSS')}<input style={inp} value={c.padding} onChange={e => upd('padding', e.target.value)} placeholder="0 24px 24px" />
      </div>
    )
    case 'image': return (
      <div>
        {lbl('URL de l\'image')}<input style={inp} value={c.url} onChange={e => upd('url', e.target.value)} placeholder="https://…" />
        {lbl('Texte alt')}<input style={inp} value={c.alt} onChange={e => upd('alt', e.target.value)} />
        <div style={grid}>
          <div>{lbl('Largeur')}<input style={inp} value={c.width} onChange={e => upd('width', e.target.value)} placeholder="100%" /></div>
          <div>{lbl('Arrondi px')}<input type="number" style={inp} value={c.borderRadius} min={0} max={50} onChange={e => upd('borderRadius', +e.target.value)} /></div>
        </div>
        {alignSel()}
      </div>
    )
    case 'logo': return (
      <div>
        {lbl('URL du logo')}<input style={inp} value={c.url} onChange={e => upd('url', e.target.value)} placeholder="Laisser vide → logo SHOPCA" />
        {lbl('Texte alt')}<input style={inp} value={c.alt} onChange={e => upd('alt', e.target.value)} />
        <div style={grid}>
          <div>{lbl('Largeur px')}<input type="number" style={inp} value={c.width} min={40} max={400} onChange={e => upd('width', +e.target.value)} /></div>
          {alignSel()}
        </div>
      </div>
    )
    case 'button': return (
      <div>
        {lbl('Texte du bouton')}<input style={inp} value={c.text} onChange={e => upd('text', e.target.value)} />
        {lbl('URL')}<input style={inp} value={c.url} onChange={e => upd('url', e.target.value)} placeholder="https://shopca.fr" />
        <div style={grid}>{colorRow('Fond', 'bg')}{colorRow('Texte', 'textColor')}</div>
        <div style={grid}>
          <div>{lbl('Arrondi px')}<input type="number" style={inp} value={c.borderRadius} min={0} max={40} onChange={e => upd('borderRadius', +e.target.value)} /></div>
          <div>{lbl('Taille px')}<input type="number" style={inp} value={c.fontSize} min={10} max={24} onChange={e => upd('fontSize', +e.target.value)} /></div>
        </div>
        {alignSel()}
      </div>
    )
    case 'divider': return (
      <div>
        <div style={grid}>
          <div>{lbl('Épaisseur px')}<input type="number" style={inp} value={c.thickness} min={1} max={10} onChange={e => upd('thickness', +e.target.value)} /></div>
          {colorRow('Couleur', 'color')}
        </div>
        {lbl('Marges CSS')}<input style={inp} value={c.margin} onChange={e => upd('margin', e.target.value)} placeholder="8px 24px" />
      </div>
    )
    case 'columns': return (
      <div>
        {lbl('Colonne gauche')}
        <textarea style={{ ...inp, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} value={c.left} onChange={e => upd('left', e.target.value)} />
        {lbl('Colonne droite')}
        <textarea style={{ ...inp, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} value={c.right} onChange={e => upd('right', e.target.value)} />
      </div>
    )
    case 'social': {
      const ALL = ['facebook','twitter','linkedin','instagram','youtube']
      return (
        <div>
          {lbl('Réseaux actifs')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {ALL.map(n => {
              const active = (c.networks||[]).includes(n)
              return (
                <button key={n} onClick={() => upd('networks', active ? (c.networks||[]).filter(x=>x!==n) : [...(c.networks||[]), n])}
                  style={{ padding: '4px 12px', borderRadius: 99, border: `1px solid ${active ? '#FF6B00' : '#E2E8F0'}`, background: active ? '#FFF7ED' : '#fff', color: active ? '#FF6B00' : '#64748B', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {n}
                </button>
              )
            })}
          </div>
          {alignSel()}
        </div>
      )
    }
    case 'signature': return (
      <div>
        {lbl('Nom')}<input style={inp} value={c.name} onChange={e => upd('name', e.target.value)} />
        {lbl('Rôle')}<input style={inp} value={c.role} onChange={e => upd('role', e.target.value)} />
        {lbl('Email')}<input style={inp} value={c.email} onChange={e => upd('email', e.target.value)} />
        {lbl('Téléphone')}<input style={inp} value={c.phone} onChange={e => upd('phone', e.target.value)} placeholder="Optionnel" />
      </div>
    )
    case 'footer': return (
      <div>
        {lbl('Texte')}<input style={inp} value={c.text} onChange={e => upd('text', e.target.value)} />
        {lbl('URL désinscription')}<input style={inp} value={c.unsubUrl} onChange={e => upd('unsubUrl', e.target.value)} />
        <div style={grid}>{colorRow('Fond', 'bg')}{colorRow('Texte', 'color')}</div>
      </div>
    )
    default: return <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>Aucune option disponible.</div>
  }
}

/* ── Block Card ─────────────────────────────────────────────────────────────── */
function BlockCard({ block, index, total, selected, onSelect, onUpdate, onDelete, onMove }) {
  const bt = BLOCK_TYPES.find(b => b.type === block.type) || { label: block.type, icon: '?', color: '#94A3B8' }
  const preview = { banner: block.config.title, title: block.config.text, text: block.config.content?.split('\n')[0], image: block.config.url||'Aucune URL', logo: block.config.url||'Logo SHOPCA', button: block.config.text, divider: '─────────', columns: '2 colonnes', social: (block.config.networks||[]).join(', ')||'aucun réseau', signature: block.config.name, footer: block.config.text }[block.type] || ''

  return (
    <div style={{ borderRadius: 10, border: `1.5px solid ${selected ? '#FF6B00' : '#E2E8F0'}`, background: selected ? '#FFF7ED' : '#FAFAFA', overflow: 'hidden', transition: 'border-color .15s' }}>
      <div onClick={() => onSelect(selected ? null : block.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ fontSize: selected ? 14 : 13, minWidth: 22, textAlign: 'center', fontWeight: 900, color: bt.color, flexShrink: 0 }}>{bt.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{bt.label}</div>
          <div style={{ fontSize: 10, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onMove(index, -1) }} disabled={index === 0}
            style={{ padding: 3, borderRadius: 5, border: '1px solid #E2E8F0', background: '#fff', color: index===0?'#CBD5E1':'#64748B', cursor: index===0?'default':'pointer', display:'flex', alignItems:'center' }}>
            <Ic.ChevronU />
          </button>
          <button onClick={e => { e.stopPropagation(); onMove(index, 1) }} disabled={index === total - 1}
            style={{ padding: 3, borderRadius: 5, border: '1px solid #E2E8F0', background: '#fff', color: index===total-1?'#CBD5E1':'#64748B', cursor: index===total-1?'default':'pointer', display:'flex', alignItems:'center' }}>
            <Ic.ChevronD />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(block.id) }}
            style={{ padding: 3, borderRadius: 5, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display:'flex', alignItems:'center' }}>
            <Ic.Trash />
          </button>
        </div>
      </div>
      {selected && (
        <div style={{ padding: '0 12px 14px', borderTop: '1px solid #FFE4C9' }}>
          <BlockEditForm block={block} onChange={onUpdate} />
        </div>
      )}
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function EmailsPage() {
  /* view */
  const [view,           setView]           = useState('composer')

  /* campaigns list */
  const [campaigns,      setCampaigns]      = useState([])
  const [stats,          setStats]          = useState(null)
  const [total,          setTotal]          = useState(0)
  const [loading,        setLoading]        = useState(false)
  const [page,           setPage]           = useState(1)

  /* modals */
  const [panelCampaign,  setPanelCampaign]  = useState(null)
  const [sendModal,      setSendModal]      = useState(false)
  const [toast,          setToast]          = useState(null)
  const [saving,         setSaving]         = useState(false)
  const [sending,        setSending]        = useState(false)

  /* campaign params */
  const [editId,         setEditId]         = useState(null)
  const [campaignName,   setCampaignName]   = useState('')
  const [subject,        setSubject]        = useState('')
  const [preHeader,      setPreHeader]      = useState('')
  const [senderName,     setSenderName]     = useState('SHOPCA')
  const [senderEmail,    setSenderEmail]    = useState('noreply@shopca.fr')
  const [replyTo,        setReplyTo]        = useState('')
  const [audience,       setAudience]       = useState('all')
  const [audienceValue,  setAudienceValue]  = useState('')
  const [sendDate,       setSendDate]       = useState('')
  const [sendTime,       setSendTime]       = useState('')
  const [timezone,       setTimezone]       = useState('Europe/Paris')
  const [recipientCount, setRecipientCount] = useState(0)

  /* builder */
  const [blocks,          setBlocks]         = useState(() => DEFAULT_BLOCKS.map(b => ({ ...b, id: newId() })))
  const [editorTab,       setEditorTab]      = useState('design')
  const [codeHtml,        setCodeHtml]       = useState('')
  const [selectedBlockId, setSelectedBlockId]= useState(null)

  /* preview */
  const [previewDevice,  setPreviewDevice]  = useState('desktop')
  const [previewTheme,   setPreviewTheme]   = useState('light')

  const showToast = (msg, type = 'success') => setToast({ msg, type })
  const PER_PAGE  = 20

  /* fetch */
  const fetchCampaigns = useCallback(async (p = 1) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_manager_campaigns', { p_limit: PER_PAGE, p_offset: (p-1)*PER_PAGE })
    if (!error && data) { setCampaigns(data.campaigns||[]); setTotal(data.total||0); setStats(data.stats) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampaigns(page) }, [page, fetchCampaigns])

  /* derived html */
  const getHtmlBody = () => editorTab === 'code' ? codeHtml : blocksToHtml(blocks)

  /* preview html — recomputes on any change */
  const previewHtml = useMemo(() => {
    const body = (editorTab === 'code' ? codeHtml : blocksToHtml(blocks))
      .replace(/\{\{prenom\}\}/g, 'Jean').replace(/\{\{nom\}\}/g, 'Dupont')
      .replace(/\{\{email\}\}/g, 'jean@exemple.fr').replace(/\{\{ville\}\}/g, 'Lyon').replace(/\{\{plan\}\}/g, 'Premium')
    return buildPreviewHtml(subject, body, preHeader, previewTheme)
  }, [blocks, editorTab, codeHtml, subject, preHeader, previewTheme])

  /* save */
  const saveDraft = async () => {
    if (!subject.trim()) { showToast("L'objet est obligatoire", 'error'); return }
    setSaving(true)
    const { data, error } = await supabase.rpc('manager_save_campaign', {
      p_campaign_id: editId, p_subject: subject, p_preview_text: preHeader,
      p_html_body: getHtmlBody(), p_audience: audience, p_audience_value: audienceValue||null, p_status: 'draft',
    })
    if (error) showToast(error.message||'Erreur', 'error')
    else { if (!editId) setEditId(data.id); setRecipientCount(data.recipient_count||0); showToast('Brouillon enregistré'); fetchCampaigns(page) }
    setSaving(false)
  }

  /* send */
  const sendCampaign = async () => {
    setSending(true)
    const { data, error } = await supabase.rpc('manager_save_campaign', {
      p_campaign_id: editId, p_subject: subject, p_preview_text: preHeader,
      p_html_body: getHtmlBody(), p_audience: audience, p_audience_value: audienceValue||null, p_status: 'sent',
    })
    setSendModal(false)
    if (error) showToast(error.message||'Erreur', 'error')
    else { showToast(`Envoyé à ${(data.recipient_count||0).toLocaleString('fr-FR')} destinataire(s)`); resetComposer(); setView('history'); fetchCampaigns(1) }
    setSending(false)
  }

  /* delete */
  const deleteCampaign = async (id) => {
    const { error } = await supabase.rpc('manager_delete_campaign', { p_campaign_id: id })
    if (error) showToast(error.message, 'error')
    else { showToast('Campagne supprimée'); setPanelCampaign(null); fetchCampaigns(page) }
  }

  /* reset */
  const resetComposer = () => {
    setEditId(null); setCampaignName(''); setSubject(''); setPreHeader(''); setSenderName('SHOPCA')
    setSenderEmail('noreply@shopca.fr'); setReplyTo(''); setAudience('all'); setAudienceValue('')
    setSendDate(''); setSendTime(''); setTimezone('Europe/Paris'); setRecipientCount(0)
    setBlocks(DEFAULT_BLOCKS.map(b => ({ ...b, id: newId() }))); setEditorTab('design')
    setCodeHtml(''); setSelectedBlockId(null)
  }

  const loadCampaignInEditor = (c) => {
    setEditId(c.id); setCampaignName(c.subject||''); setSubject(c.subject||''); setPreHeader(c.preview_text||'')
    setAudience(c.audience||'all'); setAudienceValue(c.audience_value||''); setRecipientCount(c.recipient_count||0)
    setCodeHtml(c.html_body||''); setEditorTab('code'); setSelectedBlockId(null)
    setPanelCampaign(null); setView('composer')
  }

  /* block actions */
  const addBlock = (type) => {
    const nb = { id: newId(), type, config: defaultConfig(type) }
    setBlocks(prev => [...prev, nb]); setSelectedBlockId(nb.id)
  }
  const updateBlock = (updated) => setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
  const deleteBlock = (id) => { setBlocks(prev => prev.filter(b => b.id !== id)); if (selectedBlockId === id) setSelectedBlockId(null) }
  const moveBlock = (idx, dir) => {
    setBlocks(prev => {
      const next = [...prev]; const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  /* tab switch */
  const switchEditorTab = (tab) => {
    if (tab === 'code' && editorTab === 'design') setCodeHtml(blocksToHtml(blocks))
    setEditorTab(tab)
  }

  const totalPages      = Math.ceil(total / PER_PAGE)
  const selectedAudience = AUDIENCES.find(a => a.value === audience)
  const needsValue       = ['city','department','region'].includes(audience)

  /* shared input style */
  const inp = { width: '100%', padding: '8px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, color: '#0F172A', outline: 'none', boxSizing: 'border-box', background: '#fff' }

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .em-tr:hover td { background:#F8FAFC!important; cursor:pointer; }
        .em-tr td { transition:background .1s; }
        .blk-add:hover { background:#FFF7ED!important; border-color:#FF6B00!important; color:#FF6B00!important; }
        .tab-active { background:#fff!important; color:#FF6B00!important; font-weight:700!important; box-shadow:0 1px 4px rgba(0,0,0,.08); }
        .var-chip:hover { background:#DBEAFE!important; color:#1D4ED8!important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>Emails</h1>
          <p style={{ fontSize:12, color:'#94A3B8', margin:'4px 0 0' }}>Centre de création de campagnes email</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {view !== 'composer' && (
            <button onClick={() => { resetComposer(); setView('composer') }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'none', background:'#FF6B00', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              <Ic.Plus /> Nouvelle campagne
            </button>
          )}
          <button onClick={() => fetchCampaigns(page)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:12, fontWeight:600, color:'#64748B', cursor:'pointer' }}>
            <Ic.Refresh />
          </button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10, marginBottom:16 }}>
          {[
            { label:'Campagnes',  val:stats.total_campaigns,                         color:'#6366F1', icon:'📧' },
            { label:'Envoyées',   val:stats.sent,                                    color:'#10B981', icon:'✅' },
            { label:'Brouillons', val:stats.drafts,                                  color:'#F59E0B', icon:'📝' },
            { label:'Emails',     val:(stats.total_sent||0).toLocaleString('fr-FR'), color:'#0EA5E9', icon:'📤' },
            { label:'Ouvertures', val:(stats.total_opens||0).toLocaleString('fr-FR'),color:'#10B981', icon:'👁️' },
            { label:'Clics',      val:(stats.total_clicks||0).toLocaleString('fr-FR'),color:'#F59E0B',icon:'🖱️' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'11px 14px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:14, marginBottom:3 }}>{icon}</div>
              <div style={{ fontSize:18, fontWeight:800, color, letterSpacing:'-0.02em' }}>{val}</div>
              <div style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── View tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'#F8FAFC', borderRadius:12, padding:4, width:'fit-content' }}>
        {[['composer', <Ic.Edit />, 'Composer'], ['history', <Ic.History />, 'Historique']].map(([key, icon, label]) => (
          <button key={key} onClick={() => setView(key)} className={view===key ? 'tab-active' : ''}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, border:'none', background:'transparent', color:'#64748B', fontSize:13, fontWeight:500, cursor:'pointer' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          COMPOSER — 3-column layout
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'composer' && (
        <div style={{ display:'grid', gridTemplateColumns:'280px minmax(0,1fr) 340px', gap:14, alignItems:'start' }}>

          {/* ── COLUMN 1 · Paramètres ─────────────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:'calc(100vh - 220px)', overflowY:'auto', paddingRight:2 }}>

            {/* Section campagne */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#FF6B00', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>Campagne</div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Nom de la campagne</label>
              <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ex: Newsletter Juillet 2026" style={{ ...inp, marginBottom:10 }} />
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Objet de l'email *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Votre objet ici…" style={{ ...inp, marginBottom:4, fontWeight:600, border:`1px solid ${!subject.trim() ? '#FCA5A5' : '#E2E8F0'}` }} />
              {!subject.trim() && <div style={{ fontSize:10, color:'#EF4444', marginBottom:8 }}>Champ obligatoire</div>}
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3, marginTop:10 }}>Pré-header</label>
              <input value={preHeader} onChange={e => setPreHeader(e.target.value)} placeholder="Texte visible dans la boîte mail…" style={{ ...inp, fontSize:12 }} />
              <div style={{ fontSize:10, color:'#94A3B8', marginTop:4 }}>Complète l'objet dans l'aperçu mobile</div>
            </div>

            {/* Section expéditeur */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#6366F1', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>Expéditeur</div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Nom d'affichage</label>
              <input value={senderName} onChange={e => setSenderName(e.target.value)} style={{ ...inp, marginBottom:10 }} />
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Email d'envoi</label>
              <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} style={{ ...inp, marginBottom:10 }} />
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Adresse de réponse</label>
              <input type="email" value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="Optionnel — ex: support@shopca.fr" style={{ ...inp }} />
            </div>

            {/* Section audience */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#10B981', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>Audience</div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Segment cible</label>
              <div style={{ position:'relative', marginBottom:4 }}>
                <select value={audience} onChange={e => { setAudience(e.target.value); setAudienceValue('') }}
                  style={{ ...inp, appearance:'none', cursor:'pointer', fontWeight:600, paddingRight:28 }}>
                  {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.icon} {a.label}</option>)}
                </select>
                <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94A3B8', display:'flex' }}><Ic.ChevronD /></span>
              </div>
              {selectedAudience && <div style={{ fontSize:11, color:'#94A3B8', marginBottom:8 }}>{selectedAudience.desc}</div>}
              {needsValue && (
                <input value={audienceValue} onChange={e => setAudienceValue(e.target.value)}
                  placeholder={audience==='city'?'ex: Lyon, Paris…':audience==='department'?'ex: 69, 75…':'ex: Île-de-France…'}
                  style={inp} />
              )}
              {recipientCount > 0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, padding:'8px 10px', background:'#F0FDF4', borderRadius:8, fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>Destinataires estimés</span>
                  <span style={{ fontWeight:800, color:'#10B981', fontSize:15 }}>{recipientCount.toLocaleString('fr-FR')}</span>
                </div>
              )}

              {/* Variables */}
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:10, fontWeight:800, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Variables personnalisation</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {VARIABLES.map(v => (
                    <span key={v.tag} className="var-chip" title={`Exemple: ${v.example}`}
                      style={{ padding:'3px 9px', borderRadius:99, border:'1px solid #BFDBFE', background:'#EFF6FF', color:'#3B82F6', fontSize:11, fontWeight:700, cursor:'default', fontFamily:'monospace' }}>
                      {v.tag}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize:10, color:'#94A3B8', marginTop:6 }}>Cliquez dans l'éditeur pour insérer.</div>
              </div>
            </div>

            {/* Section programmation */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#F59E0B', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>Programmation</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Date d'envoi</label>
                  <input type="date" value={sendDate} onChange={e => setSendDate(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Heure</label>
                  <input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)} style={inp} />
                </div>
              </div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:3 }}>Fuseau horaire</label>
              <div style={{ position:'relative' }}>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  style={{ ...inp, appearance:'none', cursor:'pointer', paddingRight:28, fontSize:11 }}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94A3B8', display:'flex' }}><Ic.ChevronD /></span>
              </div>
              {!sendDate && <div style={{ fontSize:10, color:'#94A3B8', marginTop:6 }}>Sans date → envoi immédiat</div>}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={saveDraft} disabled={saving || !subject.trim()}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:700, color:'#64748B', cursor:'pointer', opacity:(saving||!subject.trim())?.6:1 }}>
                <Ic.Save /> {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
              </button>
              <button
                onClick={() => { if (!subject.trim()) { showToast("L'objet est obligatoire", 'error'); return } saveDraft().then(() => setSendModal(true)) }}
                disabled={!subject.trim()}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, border:'none', background:'#FF6B00', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:!subject.trim()?.5:1 }}>
                <Ic.Send /> Envoyer la campagne
              </button>
              {editId && (
                <button onClick={resetComposer}
                  style={{ padding:'7px', borderRadius:10, border:'1px solid #FECACA', background:'#FEF2F2', fontSize:12, fontWeight:600, color:'#EF4444', cursor:'pointer' }}>
                  ✕ Nouvelle campagne vierge
                </button>
              )}
            </div>
          </div>

          {/* ── COLUMN 2 · Constructeur ───────────────────────────────────── */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)', display:'flex', flexDirection:'column', maxHeight:'calc(100vh - 220px)' }}>
            {/* Editor tabs */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid #F1F5F9', background:'#FAFAFA', flexShrink:0 }}>
              <div style={{ display:'flex', gap:3, background:'#F1F5F9', borderRadius:8, padding:3 }}>
                {[['design','🎨 Design'],['code','</> Code']].map(([k,l]) => (
                  <button key={k} onClick={() => switchEditorTab(k)}
                    style={{ padding:'5px 14px', borderRadius:6, border:'none', background:editorTab===k?'#fff':'transparent', color:editorTab===k?'#FF6B00':'#64748B', fontSize:12, fontWeight:editorTab===k?700:500, cursor:'pointer', transition:'all .15s' }}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11, color:'#94A3B8' }}>
                {editorTab === 'design' ? `${blocks.length} bloc${blocks.length>1?'s':''}` : `${codeHtml.length} car.`}
              </div>
            </div>

            {editorTab === 'design' ? (
              <>
                {/* Add block toolbar */}
                <div style={{ padding:'10px 12px', borderBottom:'1px solid #F1F5F9', flexShrink:0 }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Ajouter un bloc</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.type} onClick={() => addBlock(bt.type)} className="blk-add"
                        style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:8, border:'1px solid #E2E8F0', background:'#FAFAFA', cursor:'pointer', fontSize:11, fontWeight:600, color:'#374151', transition:'all .15s' }}>
                        <span style={{ color:bt.color, fontWeight:900 }}>{bt.icon}</span> {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Block list */}
                <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
                  {blocks.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 20px', color:'#94A3B8', fontSize:13 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                      <div>Cliquez sur un bloc ci-dessus pour commencer</div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {blocks.map((block, idx) => (
                        <BlockCard
                          key={block.id} block={block} index={idx} total={blocks.length}
                          selected={selectedBlockId === block.id}
                          onSelect={setSelectedBlockId} onUpdate={updateBlock}
                          onDelete={deleteBlock} onMove={moveBlock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Code tab */
              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'8px 14px', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9', flexShrink:0 }}>
                  <div style={{ fontSize:11, color:'#64748B', fontWeight:600 }}>HTML — éditez directement le code source</div>
                  <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>Repasser en Design écrasera les modifications manuelles</div>
                </div>
                <textarea value={codeHtml} onChange={e => setCodeHtml(e.target.value)} spellCheck={false}
                  style={{ flex:1, padding:16, border:'none', outline:'none', resize:'none', fontFamily:"'Monaco','Menlo','Consolas',monospace", fontSize:12, lineHeight:1.6, color:'#0F172A', background:'#fff', overflowY:'auto' }} />
              </div>
            )}
          </div>

          {/* ── COLUMN 3 · Prévisualisation ───────────────────────────────── */}
          <div style={{ position:'sticky', top:0, display:'flex', flexDirection:'column', gap:10 }}>
            {/* Controls */}
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'10px 12px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:800, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em' }}>Aperçu temps réel</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {/* Device toggle */}
                <div style={{ display:'flex', gap:3, background:'#F1F5F9', borderRadius:8, padding:3, flex:1 }}>
                  {[['desktop',<Ic.Desktop />,'Bureau'],['mobile',<Ic.Phone />,'Mobile']].map(([k,icon,l]) => (
                    <button key={k} onClick={() => setPreviewDevice(k)}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'5px 8px', borderRadius:6, border:'none', background:previewDevice===k?'#fff':'transparent', color:previewDevice===k?'#FF6B00':'#64748B', fontSize:11, fontWeight:previewDevice===k?700:500, cursor:'pointer' }}>
                      {icon} {l}
                    </button>
                  ))}
                </div>
                {/* Theme toggle */}
                <div style={{ display:'flex', gap:3, background:'#F1F5F9', borderRadius:8, padding:3 }}>
                  {[['light',<Ic.Sun />],['dark',<Ic.Moon />]].map(([k,icon]) => (
                    <button key={k} onClick={() => setPreviewTheme(k)}
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'5px 10px', borderRadius:6, border:'none', background:previewTheme===k?'#fff':'transparent', color:previewTheme===k?'#FF6B00':'#64748B', cursor:'pointer' }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inbox preview strip */}
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'10px 14px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Aperçu boîte mail</div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#FF6B00,#F59E0B)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:800, flexShrink:0 }}>S</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#0F172A' }}>{senderName || 'SHOPCA'}</span>
                    <span style={{ fontSize:10, color:'#94A3B8' }}>maintenant</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{subject || <span style={{ color:'#94A3B8', fontStyle:'italic' }}>Aucun objet</span>}</div>
                  <div style={{ fontSize:11, color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{preHeader || 'Aperçu du message…'}</div>
                </div>
              </div>
            </div>

            {/* Preview iframe */}
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
              <div style={{ background: previewTheme === 'dark' ? '#1E293B' : '#F4F4F5', padding: previewDevice === 'mobile' ? '12px' : '8px', display:'flex', justifyContent:'center' }}>
                <div style={{
                  width: previewDevice === 'mobile' ? 320 : '100%',
                  borderRadius: previewDevice === 'mobile' ? 16 : 8,
                  overflow: 'hidden',
                  boxShadow: previewDevice === 'mobile' ? '0 8px 24px rgba(0,0,0,.2), 0 0 0 3px #1E293B' : 'none',
                  border: previewDevice === 'mobile' ? '4px solid #374151' : 'none',
                }}>
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: previewDevice === 'mobile' ? 560 : 500, border: 'none', display: 'block' }}
                    title="email-preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HISTORY VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'history' && (
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Campagne','Audience','Statut','Dest.','Ouverts','Cliqués','Erreurs','Date',''].map((h,i) => (
                  <th key={i} style={{ padding:'9px 14px', textAlign:i===8?'right':'left', fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', background:'#FAFAFA', borderBottom:'1px solid #F1F5F9', whiteSpace:'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:9}).map((_,j) => <td key={j} style={{padding:'12px 14px'}}><Skel w={j===0?180:60} /></td>)}</tr>
                )) : campaigns.length === 0 ? (
                  <tr><td colSpan={9} style={{padding:'48px',textAlign:'center',color:'#94A3B8',fontSize:13}}>
                    Aucune campagne — <button onClick={() => setView('composer')} style={{color:'#FF6B00',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:13}}>créer la première</button>
                  </td></tr>
                ) : campaigns.map(c => {
                  const aud = AUDIENCES.find(a => a.value === c.audience)
                  return (
                    <tr key={c.id} className="em-tr" onClick={() => setPanelCampaign(c)}>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,verticalAlign:'middle'}}>
                        <div style={{fontWeight:700,maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</div>
                        {c.preview_text && <div style={{fontSize:11,color:'#94A3B8',marginTop:1}}>{c.preview_text.slice(0,60)}</div>}
                      </td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,color:'#64748B',whiteSpace:'nowrap'}}>{aud?.icon} {aud?.label}{c.audience_value?` · ${c.audience_value}`:''}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC'}}><StatusBadge status={c.status} /></td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,fontWeight:700}}>{c.recipient_count?.toLocaleString('fr-FR')??'—'}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,color:'#10B981',fontWeight:600}}>{c.open_count??0} <span style={{color:'#94A3B8',fontWeight:400}}>({pct(c.open_count,c.sent_count)}%)</span></td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,color:'#F59E0B',fontWeight:600}}>{c.click_count??0} <span style={{color:'#94A3B8',fontWeight:400}}>({pct(c.click_count,c.sent_count)}%)</span></td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:12,color:c.error_count>0?'#EF4444':'#94A3B8',fontWeight:600}}>{c.error_count??0}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',fontSize:11,color:'#94A3B8',whiteSpace:'nowrap'}}>{fmtTime(c.created_at)}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid #F8FAFC',textAlign:'right'}} onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                          {c.status==='draft' && <button onClick={() => loadCampaignInEditor(c)} style={{padding:'5px 8px',borderRadius:7,border:'1px solid #E2E8F0',background:'#fff',color:'#64748B',cursor:'pointer',display:'flex',alignItems:'center'}}><Ic.Edit /></button>}
                          <button onClick={() => deleteCampaign(c.id)} style={{padding:'5px 8px',borderRadius:7,border:'1px solid #FECACA',background:'#FEF2F2',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center'}}><Ic.Trash /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{padding:'14px 20px',borderTop:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,color:'#94A3B8'}}>Page {page}/{totalPages} — {total} campagnes</span>
              <div style={{display:'flex',gap:6}}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:8,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,fontWeight:600,color:page===1?'#CBD5E1':'#374151',cursor:page===1?'default':'pointer'}}>
                  <Ic.ChevronL /> Préc.
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:8,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,fontWeight:600,color:page===totalPages?'#CBD5E1':'#374151',cursor:page===totalPages?'default':'pointer'}}>
                  Suiv. <Ic.ChevronR />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats panel */}
      {panelCampaign && (
        <>
          <div onClick={() => setPanelCampaign(null)} style={{position:'fixed',inset:0,zIndex:300,background:'rgba(15,23,42,.2)'}} />
          <StatsPanel campaign={panelCampaign} onClose={() => setPanelCampaign(null)} onEdit={loadCampaignInEditor} />
        </>
      )}

      {sendModal && (
        <SendModal campaign={{subject,audience,audienceValue}} recipientCount={recipientCount}
          onClose={() => setSendModal(false)} onConfirm={sendCampaign} loading={sending} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
