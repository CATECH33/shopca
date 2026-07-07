import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ──────────────────────────────────────────────────────────────── */
const Ic = {
  Zap:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Plus:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Play:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  X:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  AlertTri: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  History:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
  List:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  ChevronD: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  RefreshCw:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Save:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
}

/* ── Config catalogues ───────────────────────────────────────────────────── */
const TRIGGERS = {
  new_user:              { label: 'Nouvel utilisateur',          color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  emoji: '👤' },
  subscription_expiring: { label: 'Abonnement bientôt expiré',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '⏰' },
  subscription_expired:  { label: 'Abonnement expiré',          color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '💳' },
  listing_published:     { label: 'Annonce publiée',            color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '🏠' },
  report_submitted:      { label: 'Signalement soumis',         color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🚩' },
  payment_failed:        { label: 'Paiement échoué',            color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '💸' },
  kyc_submitted:         { label: 'KYC soumis',                 color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', emoji: '🔍' },
  support_opened:        { label: 'Ticket support créé',        color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  emoji: '🎧' },
  account_inactive:      { label: 'Compte inactif',             color: '#64748B', bg: 'rgba(100,116,139,0.12)',emoji: '💤' },
  scheduled:             { label: 'Planifié (cron)',             color: '#FF6B00', bg: 'rgba(255,107,0,0.12)',  emoji: '📅' },
}

const ACTIONS = {
  send_email:        { label: 'Envoyer un email',          color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  emoji: '📧' },
  send_notification: { label: 'Push notification',         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '🔔' },
  alert_manager:     { label: 'Alerter le manager',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🚨' },
  create_ticket:     { label: 'Créer un ticket support',   color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  emoji: '🎫' },
  suspend_account:   { label: 'Suspendre le compte',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🔒' },
  send_sms:          { label: 'Envoyer un SMS',            color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '💬' },
}

const EMPTY_FORM = {
  id: null, name: '', description: '',
  trigger_type: 'new_user', trigger_config: {},
  action_type: 'send_email', action_config: {},
  is_active: true,
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h} h`
  return `Il y a ${Math.floor(h / 24)} j`
}

function Badge({ type, config, size = 'sm' }) {
  const c = config[type] || { label: type, color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', emoji: '•' }
  const pad = size === 'sm' ? '2px 8px' : '3px 10px'
  const fs  = size === 'sm' ? 11 : 12
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: pad, borderRadius: 99, fontSize: fs, fontWeight: 700,
      background: c.bg, color: c.color,
    }}>
      <span>{c.emoji}</span> {c.label}
    </span>
  )
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative', width: 40, height: 22, borderRadius: 11,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? '#FF6B00' : '#CBD5E1',
        transition: 'background .2s', flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || '#0F172A', lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>}
    </div>
  )
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: '#10B981', error: '#EF4444', info: '#6366F1' }
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
      background: '#0F172A', color: '#fff', borderRadius: 12,
      padding: '12px 18px', fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 340,
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      borderLeft: `4px solid ${colors[type] || colors.info}`,
    }}>
      <span style={{ color: colors[type] || colors.info, display: 'flex' }}>
        {type === 'success' ? <Ic.Check /> : <Ic.AlertTri />}
      </span>
      {msg}
    </div>
  )
}

/* ── Drawer éditeur ──────────────────────────────────────────────────────── */
function AutomationDrawer({ rule, onClose, onSave }) {
  const [form, setForm] = useState(rule || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setTC = (k, v) => setForm(f => ({ ...f, trigger_config: { ...f.trigger_config, [k]: v } }))
  const setAC = (k, v) => setForm(f => ({ ...f, action_config:  { ...f.action_config,  [k]: v } }))

  const handle = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const inp = { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0F172A', width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const sel = { ...inp, cursor: 'pointer', appearance: 'none' }
  const label = { fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(7,15,31,0.45)', zIndex: 390, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, zIndex: 400,
        background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
              {form.id ? 'Modifier l\'automatisation' : 'Nouvelle automatisation'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Déclencheur → Action</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', display: 'flex', color: '#64748B' }}><Ic.X /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nom */}
          <div>
            <label style={label}>Nom de l'automatisation *</label>
            <input style={inp} placeholder="Ex: Email de bienvenue" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label style={label}>Description</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 64 }} placeholder="Décrivez ce que fait cette règle…" value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Déclencheur */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>⚡ Déclencheur</div>
            <label style={label}>Événement</label>
            <div style={{ position: 'relative' }}>
              <select style={sel} value={form.trigger_type} onChange={e => set('trigger_type', e.target.value)}>
                {Object.entries(TRIGGERS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
            </div>
            {/* Options contextuelles déclencheur */}
            {form.trigger_type === 'subscription_expiring' && (
              <div style={{ marginTop: 12 }}>
                <label style={label}>Jours avant expiration</label>
                <input style={inp} type="number" min="1" max="30" value={form.trigger_config?.days_before ?? 7}
                  onChange={e => setTC('days_before', parseInt(e.target.value) || 7)} />
              </div>
            )}
            {form.trigger_type === 'account_inactive' && (
              <div style={{ marginTop: 12 }}>
                <label style={label}>Inactif depuis (jours)</label>
                <input style={inp} type="number" min="1" value={form.trigger_config?.days ?? 30}
                  onChange={e => setTC('days', parseInt(e.target.value) || 30)} />
              </div>
            )}
            {form.trigger_type === 'report_submitted' && (
              <div style={{ marginTop: 12 }}>
                <label style={label}>Type de signalement (optionnel)</label>
                <div style={{ position: 'relative' }}>
                  <select style={sel} value={form.trigger_config?.type || ''} onChange={e => setTC('type', e.target.value)}>
                    <option value="">Tous les signalements</option>
                    <option value="fraud">Fraude</option>
                    <option value="spam">Spam</option>
                    <option value="duplicate">Doublon</option>
                    <option value="inappropriate">Contenu inapproprié</option>
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
                </div>
              </div>
            )}
            {form.trigger_type === 'scheduled' && (
              <div style={{ marginTop: 12 }}>
                <label style={label}>Expression cron</label>
                <input style={inp} placeholder="0 8 * * *" value={form.trigger_config?.cron || ''}
                  onChange={e => setTC('cron', e.target.value)} />
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Ex : "0 8 * * *" = chaque jour à 8h</div>
              </div>
            )}
          </div>

          {/* Action */}
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>⚡ Action</div>
            <label style={label}>Type d'action</label>
            <div style={{ position: 'relative' }}>
              <select style={sel} value={form.action_type} onChange={e => set('action_type', e.target.value)}>
                {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
            </div>
            {/* Options contextuelles action */}
            {form.action_type === 'send_email' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={label}>Sujet de l'email</label>
                  <input style={inp} placeholder="Ex: Bienvenue sur SHOPCA !" value={form.action_config?.subject || ''}
                    onChange={e => setAC('subject', e.target.value)} />
                </div>
                <div>
                  <label style={label}>Template</label>
                  <div style={{ position: 'relative' }}>
                    <select style={sel} value={form.action_config?.template || 'welcome'} onChange={e => setAC('template', e.target.value)}>
                      <option value="welcome">welcome — Email de bienvenue</option>
                      <option value="expiry_reminder">expiry_reminder — Rappel expiration</option>
                      <option value="payment_failed">payment_failed — Paiement échoué</option>
                      <option value="reactivation">reactivation — Réactivation compte</option>
                      <option value="kyc_received">kyc_received — KYC reçu</option>
                      <option value="custom">custom — Personnalisé</option>
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
                  </div>
                </div>
              </div>
            )}
            {form.action_type === 'send_notification' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={label}>Titre</label>
                  <input style={inp} placeholder="Ex: Votre abonnement expire !" value={form.action_config?.title || ''}
                    onChange={e => setAC('title', e.target.value)} />
                </div>
                <div>
                  <label style={label}>Message</label>
                  <textarea style={{ ...inp, minHeight: 56, resize: 'vertical' }} placeholder="Ex: Renouvelez dès maintenant." value={form.action_config?.body || ''}
                    onChange={e => setAC('body', e.target.value)} />
                </div>
              </div>
            )}
            {form.action_type === 'alert_manager' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={label}>Canal d'alerte</label>
                  <div style={{ position: 'relative' }}>
                    <select style={sel} value={form.action_config?.channel || 'email'} onChange={e => setAC('channel', e.target.value)}>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="both">Email + SMS</option>
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
                  </div>
                </div>
                <div>
                  <label style={label}>Priorité</label>
                  <div style={{ position: 'relative' }}>
                    <select style={sel} value={form.action_config?.priority || 'normal'} onChange={e => setAC('priority', e.target.value)}>
                      <option value="low">Basse</option>
                      <option value="normal">Normale</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
                  </div>
                </div>
              </div>
            )}
            {form.action_type === 'create_ticket' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={label}>Titre du ticket</label>
                  <input style={inp} placeholder="Ex: KYC à valider" value={form.action_config?.title || ''}
                    onChange={e => setAC('title', e.target.value)} />
                </div>
                <div>
                  <label style={label}>Priorité</label>
                  <div style={{ position: 'relative' }}>
                    <select style={sel} value={form.action_config?.priority || 'medium'} onChange={e => setAC('priority', e.target.value)}>
                      <option value="low">Basse</option>
                      <option value="medium">Normale</option>
                      <option value="high">Haute</option>
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#94A3B8' }}><Ic.ChevronD /></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actif */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Activer la règle</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>La règle sera déclenchée dès activation</div>
            </div>
            <Toggle checked={form.is_active} onChange={v => set('is_active', v)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: '#fff' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
            Annuler
          </button>
          <button
            onClick={handle}
            disabled={saving || !form.name.trim()}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: form.name.trim() ? '#FF6B00' : '#CBD5E1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: form.name.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Ic.Save /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── AutomationRow ───────────────────────────────────────────────────────── */
function AutomationRow({ rule, onToggle, onEdit, onDelete, toggling }) {
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'box-shadow .15s',
      borderLeft: `4px solid ${rule.is_active ? '#FF6B00' : '#CBD5E1'}`,
    }}>
      {/* Toggle */}
      <Toggle checked={rule.is_active} onChange={v => onToggle(rule.id, v)} disabled={toggling === rule.id} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{rule.name}</span>
          {!rule.is_active && <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', borderRadius: 99 }}>INACTIF</span>}
        </div>
        {rule.description && <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>{rule.description}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Badge type={rule.trigger_type} config={TRIGGERS} />
          <span style={{ fontSize: 10, color: '#CBD5E1' }}>→</span>
          <Badge type={rule.action_type} config={ACTIONS} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 99 }}>
            {(rule.run_count || 0).toLocaleString('fr-FR')} exéc.
          </span>
          {(rule.error_count || 0) > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 99 }}>
              {rule.error_count} err.
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Ic.Clock /> {timeAgo(rule.last_run_at)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(rule)}
          style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '7px 9px', display: 'flex', color: '#64748B', transition: 'background .12s' }}
          title="Modifier"
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
        ><Ic.Edit /></button>
        {confirmDel ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => onDelete(rule.id)}
              style={{ background: '#EF4444', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '7px 9px', display: 'flex', color: '#fff', fontSize: 11, fontWeight: 700 }}>Oui</button>
            <button onClick={() => setConfirmDel(false)}
              style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '7px 9px', display: 'flex', color: '#64748B', fontSize: 11, fontWeight: 700 }}>Non</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)}
            style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '7px 9px', display: 'flex', color: '#EF4444', transition: 'background .12s' }}
            title="Supprimer"
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
          ><Ic.Trash /></button>
        )}
      </div>
    </div>
  )
}

/* ── RunRow ──────────────────────────────────────────────────────────────── */
function RunRow({ run }) {
  const STATUS = {
    success: { label: 'Succès',  color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    error:   { label: 'Erreur',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
    skipped: { label: 'Ignoré',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  }
  const s = STATUS[run.status] || STATUS.skipped
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {run.automation_name || '—'}
        </div>
        {run.error_message && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>{run.error_message}</div>}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{s.label}</span>
      {run.duration_ms != null && <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{run.duration_ms} ms</span>}
      <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}><Ic.Clock /> {timeAgo(run.created_at)}</span>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function AutomationsPage() {
  const [automations, setAutomations] = useState([])
  const [runs,        setRuns]        = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [runsLoading, setRunsLoading] = useState(false)
  const [activeTab,   setActiveTab]   = useState('rules')
  const [drawer,      setDrawer]      = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [toggling,    setToggling]    = useState(null)
  const [toast,       setToast]       = useState(null)

  const notify = (msg, type = 'success') => setToast({ msg, type })

  /* Fetch automations + stats */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: a }, { data: s }] = await Promise.all([
        supabase.rpc('get_manager_automations'),
        supabase.rpc('get_manager_automation_stats'),
      ])
      setAutomations(Array.isArray(a) ? a : [])
      setStats(s || {})
    } catch { setAutomations([]); setStats({}) }
    finally { setLoading(false) }
  }, [])

  /* Fetch runs */
  const fetchRuns = useCallback(async () => {
    setRunsLoading(true)
    try {
      const { data } = await supabase.rpc('get_manager_automation_runs', { p_limit: 60, p_offset: 0 })
      setRuns(Array.isArray(data) ? data : [])
    } catch { setRuns([]) }
    finally { setRunsLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (activeTab === 'history') fetchRuns() }, [activeTab, fetchRuns])

  /* Toggle */
  const handleToggle = async (id, active) => {
    setToggling(id)
    setAutomations(prev => prev.map(r => r.id === id ? { ...r, is_active: active } : r))
    try {
      await supabase.rpc('manager_toggle_automation', { p_id: id, p_active: active })
      notify(active ? 'Règle activée' : 'Règle désactivée')
    } catch {
      setAutomations(prev => prev.map(r => r.id === id ? { ...r, is_active: !active } : r))
      notify('Erreur lors du changement d\'état', 'error')
    }
    setToggling(null)
  }

  /* Save */
  const handleSave = async (form) => {
    try {
      const { error } = await supabase.rpc('manager_save_automation', { p_rule: form })
      if (error) throw error
      notify(form.id ? 'Règle mise à jour' : 'Règle créée')
      setDrawer(false)
      setEditing(null)
      fetchAll()
    } catch { notify('Erreur lors de l\'enregistrement', 'error') }
  }

  /* Delete */
  const handleDelete = async (id) => {
    try {
      await supabase.rpc('manager_delete_automation', { p_id: id })
      setAutomations(prev => prev.filter(r => r.id !== id))
      notify('Règle supprimée')
    } catch { notify('Erreur lors de la suppression', 'error') }
  }

  const openNew  = () => { setEditing(null); setDrawer(true) }
  const openEdit = (rule) => { setEditing(rule); setDrawer(true) }

  /* KPI values */
  const total   = stats?.total      ?? automations.length
  const active  = stats?.active     ?? automations.filter(a => a.is_active).length
  const runs24  = stats?.runs_24h   ?? '—'
  const errors24= stats?.errors_24h ?? '—'

  const TAB = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
    borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <Ic.Zap />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Automatisations</h1>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Déclencheurs d'événements et actions automatiques sur la plateforme.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchAll} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B' }}>
            <Ic.RefreshCw /> Actualiser
          </button>
          <button onClick={openNew} style={{ background: '#FF6B00', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff' }}>
            <Ic.Plus /> Nouvelle règle
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14 }}>
        <KpiCard label="Règles totales"   value={total}   sub="Créées sur la plateforme" />
        <KpiCard label="Actives"          value={active}  sub={`${total > 0 ? Math.round(active/total*100) : 0}% activées`} color="#10B981" />
        <KpiCard label="Exécutions 24h"   value={runs24}  sub="Depuis hier à cette heure" color="#6366F1" />
        <KpiCard label="Erreurs 24h"      value={errors24} sub="Règles en échec" color={errors24 > 0 ? '#EF4444' : '#64748B'} />
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <button onClick={() => setActiveTab('rules')} style={{ ...TAB, background: activeTab === 'rules' ? '#FFF7ED' : 'transparent', color: activeTab === 'rules' ? '#FF6B00' : '#64748B' }}>
            <Ic.List /> Règles {automations.length > 0 && <span style={{ fontSize: 10, background: activeTab === 'rules' ? '#FF6B00' : '#E2E8F0', color: activeTab === 'rules' ? '#fff' : '#64748B', borderRadius: 99, padding: '1px 6px', fontWeight: 800 }}>{automations.length}</span>}
          </button>
          <button onClick={() => setActiveTab('history')} style={{ ...TAB, background: activeTab === 'history' ? '#FFF7ED' : 'transparent', color: activeTab === 'history' ? '#FF6B00' : '#64748B' }}>
            <Ic.History /> Historique
          </button>
        </div>

        {/* Tab content */}
        <div style={{ padding: 20 }}>

          {/* ── Règles ── */}
          {activeTab === 'rules' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>Chargement…</div>
            ) : automations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Aucune automatisation</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>Créez votre première règle pour automatiser les actions répétitives.</div>
                <button onClick={openNew} style={{ background: '#FF6B00', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Ic.Plus /> Créer une règle
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Actives */}
                {automations.filter(a => a.is_active).length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      Actives ({automations.filter(a => a.is_active).length})
                    </div>
                    {automations.filter(a => a.is_active).map(rule => (
                      <AutomationRow key={rule.id} rule={rule} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} toggling={toggling} />
                    ))}
                  </>
                )}
                {/* Inactives */}
                {automations.filter(a => !a.is_active).length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                      Inactives ({automations.filter(a => !a.is_active).length})
                    </div>
                    {automations.filter(a => !a.is_active).map(rule => (
                      <AutomationRow key={rule.id} rule={rule} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} toggling={toggling} />
                    ))}
                  </>
                )}
              </div>
            )
          )}

          {/* ── Historique ── */}
          {activeTab === 'history' && (
            runsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>Chargement…</div>
            ) : runs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Aucune exécution enregistrée</div>
                <div style={{ fontSize: 12 }}>Les exécutions apparaîtront ici dès que des règles seront déclenchées.</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{runs.length} exécutions récentes</div>
                  <button onClick={fetchRuns} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ic.RefreshCw /> Actualiser
                  </button>
                </div>
                {/* Légende */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  {[['#10B981','Succès'],['#EF4444','Erreur'],['#F59E0B','Ignoré']].map(([c,l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} /> {l}
                    </div>
                  ))}
                </div>
                <div>
                  {runs.map(run => <RunRow key={run.id} run={run} />)}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Drawer éditeur */}
      {drawer && (
        <AutomationDrawer
          rule={editing}
          onClose={() => { setDrawer(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
