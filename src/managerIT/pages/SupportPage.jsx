import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Send:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  User:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Clock:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Inbox:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Alert:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ChevronD: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Msg:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

/* ── Config ─────────────────────────────────────────────────────────────── */
const PER_PAGE = 30

const STATUS_CFG = {
  open:        { label: 'Ouvert',    color: '#3B82F6', bg: '#DBEAFE', dot: '#3B82F6' },
  in_progress: { label: 'En cours',  color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  resolved:    { label: 'Résolu',    color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  closed:      { label: 'Fermé',     color: '#94A3B8', bg: '#F1F5F9', dot: '#94A3B8' },
}
const PRIORITY_CFG = {
  urgent: { label: 'Urgent',  color: '#EF4444', bg: '#FEE2E2', border: '#EF4444' },
  high:   { label: 'Haute',   color: '#F97316', bg: '#FFF7ED', border: '#F97316' },
  medium: { label: 'Moyenne', color: '#F59E0B', bg: '#FEF3C7', border: '#F59E0B' },
  low:    { label: 'Faible',  color: '#94A3B8', bg: '#F1F5F9', border: '#E2E8F0' },
}
const CATEGORY_LABELS = {
  general: 'Général', billing: 'Facturation', technical: 'Technique',
  account: 'Compte', listing: 'Annonce', other: 'Autre',
}
const STATUS_TABS = [
  { id: null,         label: 'Tous'      },
  { id: 'open',       label: 'Ouverts'   },
  { id: 'in_progress',label: 'En cours'  },
  { id: 'resolved',   label: 'Résolus'   },
  { id: 'closed',     label: 'Fermés'    },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtAgo = (s) => {
  if (!s) return '—'
  const d = (Date.now() - new Date(s)) / 1000
  if (d < 60)    return `${Math.floor(d)}s`
  if (d < 3600)  return `${Math.floor(d / 60)} min`
  if (d < 86400) return `${Math.floor(d / 3600)}h`
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}j`
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}
const fmtFull = (s) => s ? new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const userName = (u) => {
  if (!u) return 'Utilisateur inconnu'
  if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ')
  return u.email?.split('@')[0] ?? '—'
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

/* ── KPI ─────────────────────────────────────────────────────────────────── */
function Kpi({ label, value, color, bg }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color ?? '#0F172A' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>{c.label}</span>
}

/* ── Priority badge ──────────────────────────────────────────────────────── */
function PriorityBadge({ priority }) {
  const c = PRIORITY_CFG[priority] ?? { label: priority, color: '#64748B', bg: '#F1F5F9' }
  return <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>{c.label}</span>
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 0', borderTop: '1px solid #F1F5F9' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page <= 1 ? 0.4 : 1 }}>
        <Ic.ChevronL />
      </button>
      <span style={{ fontSize: 12, color: '#64748B' }}>{page} / {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: page >= pages ? 0.4 : 1 }}>
        <Ic.ChevronR />
      </button>
    </div>
  )
}

/* ── Select dropdown ─────────────────────────────────────────────────────── */
function Sel({ value, onChange, options, style }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ appearance: 'none', padding: '6px 28px 6px 10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }}><Ic.ChevronD /></span>
    </div>
  )
}

/* ── Ticket row ──────────────────────────────────────────────────────────── */
function TicketRow({ ticket, active, onClick }) {
  const pc = PRIORITY_CFG[ticket.priority]
  const sc = STATUS_CFG[ticket.status]
  return (
    <div onClick={onClick} style={{
      padding: '12px 16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
      background: active ? '#F0F9FF' : '#fff',
      borderLeft: `3px solid ${active ? '#06B6D4' : pc?.border ?? '#E2E8F0'}`,
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            {ticket.priority === 'urgent' && (
              <span style={{ color: '#EF4444', flexShrink: 0 }}><Ic.Alert /></span>
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
            {ticket.last_message_preview ?? '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', borderRadius: 99 }}>
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{fmtAgo(ticket.updated_at)}</div>
          {ticket.message_count > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 4, fontSize: 11, color: '#64748B' }}>
              <Ic.Msg /> {ticket.message_count}
            </div>
          )}
        </div>
      </div>
      {ticket.user_info && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, color: '#94A3B8' }}>
          <Ic.User /> {userName(ticket.user_info)}
        </div>
      )}
    </div>
  )
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function MsgBubble({ msg }) {
  const isManager = msg.is_manager
  return (
    <div style={{ display: 'flex', flexDirection: isManager ? 'row-reverse' : 'row', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isManager ? '#06B6D4' : '#E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: isManager ? '#fff' : '#64748B',
      }}>
        <Ic.User />
      </div>
      <div style={{ maxWidth: '75%' }}>
        <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4, textAlign: isManager ? 'right' : 'left' }}>
          {isManager ? 'Support SHOPCA' : userName(msg.sender)} · {fmtFull(msg.created_at)}
        </div>
        <div style={{
          background: isManager ? '#06B6D4' : '#F1F5F9',
          color: isManager ? '#fff' : '#0F172A',
          borderRadius: isManager ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

/* ── Conversation panel ──────────────────────────────────────────────────── */
function ConversationPanel({ ticket, onUpdate, toast }) {
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [newStatus, setNewStatus] = useState(ticket.status)
  const bottomRef                 = useRef(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_ticket_messages', { p_ticket_id: ticket.id })
      if (error) throw error
      setMessages(Array.isArray(data) ? data : [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [ticket.id])

  useEffect(() => { setNewStatus(ticket.status); loadMessages() }, [ticket.id])

  const send = async () => {
    if (!reply.trim() || sending) return
    setSending(true)
    try {
      const { error } = await supabase.rpc('manager_reply_ticket', {
        p_ticket_id: ticket.id,
        p_content: reply.trim(),
        p_status: newStatus !== ticket.status ? newStatus : null,
      })
      if (error) throw error
      setReply('')
      await loadMessages()
      onUpdate()
      toast('Réponse envoyée', 'success')
    } catch (e) { toast(e.message) }
    finally { setSending(false) }
  }

  const updateStatus = async (s) => {
    try {
      await supabase.rpc('manager_update_ticket', { p_ticket_id: ticket.id, p_status: s })
      onUpdate()
      toast('Statut mis à jour', 'success')
    } catch (e) { toast(e.message) }
  }

  const updatePriority = async (p) => {
    try {
      await supabase.rpc('manager_update_ticket', { p_ticket_id: ticket.id, p_priority: p })
      onUpdate()
      toast('Priorité mise à jour', 'success')
    } catch (e) { toast(e.message) }
  }

  const pc = PRIORITY_CFG[ticket.priority] ?? {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Ticket header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', flexShrink: 0, background: '#FAFAFA' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 8, lineHeight: 1.3 }}>{ticket.subject}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Status */}
          <Sel value={ticket.status} onChange={updateStatus} options={[
            { value: 'open',        label: '🔵 Ouvert'    },
            { value: 'in_progress', label: '🟡 En cours'  },
            { value: 'resolved',    label: '🟢 Résolu'    },
            { value: 'closed',      label: '⚫ Fermé'     },
          ]} />
          {/* Priority */}
          <Sel value={ticket.priority} onChange={updatePriority} options={[
            { value: 'urgent', label: '🔴 Urgent'  },
            { value: 'high',   label: '🟠 Haute'   },
            { value: 'medium', label: '🟡 Moyenne' },
            { value: 'low',    label: '⚪ Faible'  },
          ]} />
          <span style={{ fontSize: 11, color: '#94A3B8', background: '#F1F5F9', padding: '4px 10px', borderRadius: 99 }}>
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
          {ticket.user_info && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B', marginLeft: 'auto' }}>
              <Ic.User /> {userName(ticket.user_info)} · {ticket.user_info.email}
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, display: 'flex', gap: 12 }}>
          <span><Ic.Clock style={{ display: 'inline' }} /> Ouvert {fmtAgo(ticket.created_at)}</span>
          {ticket.first_response_at && <span>1re réponse {fmtAgo(ticket.first_response_at)}</span>}
          <span>{ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading
          ? <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 13 }}>Chargement…</div>
          : messages.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 13 }}>Aucun message.</div>
            : messages.map(m => <MsgBubble key={m.id} msg={m} />)
        }
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {!['resolved', 'closed'].includes(ticket.status) && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 14px' }}>
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Répondre au ticket… (Entrée pour envoyer)"
              rows={2}
              style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 13, fontFamily: 'inherit', background: 'transparent', color: '#0F172A', lineHeight: 1.5 }} />
            <button onClick={send} disabled={!reply.trim() || sending}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: !reply.trim() || sending ? '#E2E8F0' : '#06B6D4', color: !reply.trim() || sending ? '#94A3B8' : '#fff', cursor: !reply.trim() || sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic.Send />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Fermer après réponse :</span>
            {['resolved', 'closed'].map(s => (
              <button key={s} onClick={() => { setNewStatus(s) }}
                style={{ padding: '3px 10px', borderRadius: 8, border: `1px solid ${newStatus === s ? '#06B6D4' : '#E2E8F0'}`, background: newStatus === s ? '#E0F2FE' : '#fff', color: newStatus === s ? '#0284C7' : '#64748B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {STATUS_CFG[s].label}
              </button>
            ))}
            {newStatus !== ticket.status && newStatus === ticket.status && (
              <button onClick={() => setNewStatus(ticket.status)} style={{ fontSize: 11, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
      {['resolved', 'closed'].includes(ticket.status) && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', flexShrink: 0, textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
          Ce ticket est {ticket.status === 'resolved' ? 'résolu' : 'fermé'}. Changez le statut pour répondre à nouveau.
        </div>
      )}
    </div>
  )
}

/* ── Empty right panel ───────────────────────────────────────────────────── */
function EmptyPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sélectionnez un ticket</div>
      <div style={{ fontSize: 13 }}>Cliquez sur un ticket pour voir la conversation</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function SupportPage() {
  const [tickets, setTickets]     = useState([])
  const [total, setTotal]         = useState(0)
  const [stats, setStats]         = useState(null)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchQ, setSearchQ]     = useState('')
  const [statusTab, setStatusTab] = useState(null)
  const [selected, setSelected]   = useState(null)
  const debRef                    = useRef(null)
  const { toasts, add: toast }    = useToast()

  const load = useCallback(async (p = page, q = searchQ, st = statusTab) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_manager_support_tickets', {
        p_status: st || null, p_search: q || null,
        p_limit: PER_PAGE, p_offset: (p - 1) * PER_PAGE,
      })
      if (error) throw error
      const arr = Array.isArray(data) ? data : []
      setTickets(arr)
      setTotal(arr[0]?.total_count ?? arr.length)
      // Refresh selected ticket data
      if (selected) {
        const fresh = arr.find(t => t.id === selected.id)
        if (fresh) setSelected(fresh)
      }
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [page, searchQ, statusTab, selected])

  const loadStats = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('get_manager_support_stats')
      if (data) setStats(data)
    } catch {}
  }, [])

  useEffect(() => { load(1); loadStats() }, [])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => { setSearchQ(v); setPage(1); load(1, v, statusTab) }, 300)
  }
  const applyTab = (st) => { setStatusTab(st); setPage(1); load(1, searchQ, st) }

  const urgentCount = stats?.urgent ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '0 0' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 28px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#CFFAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891B2' }}><Ic.Inbox /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Support</h1>
            <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Tickets entrants et conversations</p>
          </div>
          {urgentCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 700 }}>
              <Ic.Alert /> {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={() => { load(page, searchQ, statusTab); loadStats() }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', animation: loading ? 'spin 1s linear infinite' : 'none' }}><Ic.Refresh /></span> Actualiser
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Kpi label="Tickets ouverts"      value={stats?.open}           color="#3B82F6" />
          <Kpi label="En cours"             value={stats?.in_progress}    color="#F59E0B" />
          <Kpi label="Résolus aujourd'hui"  value={stats?.resolved_today} color="#10B981" />
          <Kpi label="Tps moyen réponse"    value={stats?.avg_response_h != null ? `${stats.avg_response_h}h` : '—'} color="#8B5CF6" />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><Ic.Search /></span>
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher…"
              style={{ padding: '6px 10px 6px 28px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#0F172A', width: 200 }} />
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {STATUS_TABS.map(t => (
              <button key={String(t.id)} onClick={() => applyTab(t.id)}
                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${statusTab === t.id ? '#06B6D4' : '#E2E8F0'}`, background: statusTab === t.id ? '#E0F2FE' : '#fff', color: statusTab === t.id ? '#0284C7' : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>{total} ticket{total > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Two-panel body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', margin: '12px 0 0' }}>
        {/* Left — ticket list */}
        <div style={{ width: 360, minWidth: 300, display: 'flex', flexDirection: 'column', borderRight: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && tickets.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ height: 13, width: '70%', background: '#E2E8F0', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 11, width: '90%', background: '#F1F5F9', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ height: 18, width: 60, background: '#F1F5F9', borderRadius: 99 }} />
                    <div style={{ height: 18, width: 50, background: '#F1F5F9', borderRadius: 99 }} />
                  </div>
                </div>
              ))
              : tickets.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 13 }}>Aucun ticket</div>
                : tickets.map(t => (
                  <TicketRow key={t.id} ticket={t} active={selected?.id === t.id}
                    onClick={() => setSelected(t)} />
                ))
            }
          </div>
          <Pagination page={page} total={total} perPage={PER_PAGE}
            onChange={p => { setPage(p); load(p, searchQ, statusTab) }} />
        </div>

        {/* Right — conversation */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
          {selected
            ? <ConversationPanel key={selected.id} ticket={selected} toast={toast}
                onUpdate={() => { load(page, searchQ, statusTab); loadStats() }} />
            : <EmptyPanel />
          }
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  )
}
