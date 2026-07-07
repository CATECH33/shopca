import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Send:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Spark:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>,
  User:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Trash:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Search:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Clock:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ChevR:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Info:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Check:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtD = (s) => s ? new Date(s).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtAgo = (s) => {
  if (!s) return '—'
  const d = Math.floor((Date.now() - new Date(s)) / 86400000)
  if (d === 0) return "aujourd'hui"
  if (d === 1) return 'hier'
  return `il y a ${d}j`
}
const name = (u) => {
  if (!u) return '—'
  if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ')
  return u.email?.split('@')[0] ?? '—'
}
const eur = (c) => c != null ? (c / 100).toLocaleString('fr-FR', { style:'currency', currency:'EUR' }) : '—'

/* ── Predefined questions / capabilities ────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'inactive',
    label: 'Comptes inactifs',
    question: 'Quels comptes sont inactifs depuis plus de 30 jours ?',
    color: '#F59E0B', bg: '#FEF3C7',
    keywords: ['inactif','inactive','inactifs','connecté','connectés','actif','actifs','dormant'],
    negative: ['jamais'],
    call: () => supabase.rpc('get_manager_inactive_accounts', { p_days: 30, p_limit: 20, p_offset: 0 }),
    summary: (data) => `J'ai trouvé **${data[0]?.total_count ?? data.length}** compte${(data[0]?.total_count ?? data.length) > 1 ? 's' : ''} inactifs depuis plus de 30 jours.`,
    cols: ['Utilisateur', 'Email', 'Rôle', 'Inactif depuis'],
    row: (r) => [name(r), r.email, r.role, `${r.days_inactive} jours`],
  },
  {
    id: 'expiring',
    label: 'Abonnements expirant',
    question: 'Quels abonnements expirent cette semaine ?',
    color: '#EF4444', bg: '#FEE2E2',
    keywords: ['expir','abonnement','semaine','renouvellement','fin','termine','bientôt'],
    negative: [],
    call: () => supabase.rpc('get_manager_expiring_subscriptions', { p_days: 7, p_limit: 20, p_offset: 0 }),
    summary: (data) => `**${data[0]?.total_count ?? data.length}** abonnement${(data[0]?.total_count ?? data.length) > 1 ? 's' : ''} expire${(data[0]?.total_count ?? data.length) > 1 ? 'nt' : ''} dans les 7 prochains jours.`,
    cols: ['Utilisateur', 'Plan', 'Expire le', 'Jours restants'],
    row: (r) => [name(r.user_info), r.plan, fmtD(r.end_date), `${r.days_remaining}j`],
  },
  {
    id: 'never',
    label: 'Jamais connectés',
    question: 'Quels utilisateurs ne se sont jamais connectés ?',
    color: '#6366F1', bg: '#EEF2FF',
    keywords: ['jamais','connecté','connectés','connecter','inscrit','inscrits'],
    negative: [],
    call: () => supabase.rpc('get_manager_never_logged_users', { p_limit: 20, p_offset: 0 }),
    summary: (data) => `**${data[0]?.total_count ?? data.length}** utilisateur${(data[0]?.total_count ?? data.length) > 1 ? 's' : ''} ne se sont jamais connectés après leur inscription.`,
    cols: ['Utilisateur', 'Email', 'Rôle', 'Inscrit depuis'],
    row: (r) => [name(r), r.email, r.role, `${r.days_since_signup}j`],
  },
  {
    id: 'top_listings',
    label: 'Annonces populaires',
    question: 'Quelles annonces ont le plus de vues ?',
    color: '#10B981', bg: '#D1FAE5',
    keywords: ['vue','vues','annonce','annonces','populaire','populaires','visitée','trafic'],
    negative: ['professionnel'],
    call: () => supabase.rpc('get_manager_top_listings', { p_limit: 20, p_offset: 0 }),
    summary: (data) => `Voici le top ${Math.min(data.length, 20)} des annonces parmi **${data[0]?.total_count ?? data.length}** annonces actives.`,
    cols: ['Titre', 'Ville', 'Propriétaire', 'Vues'],
    row: (r) => [r.title ?? '—', r.city ?? '—', name(r.owner), (r.view_count ?? 0).toLocaleString('fr-FR')],
  },
  {
    id: 'top_pros',
    label: 'Pros performants',
    question: 'Quels professionnels sont les plus performants ?',
    color: '#8B5CF6', bg: '#EDE9FE',
    keywords: ['professionnel','professionnels','pro','pros','performant','performants','meilleur','agence','agences'],
    negative: [],
    call: () => supabase.rpc('get_manager_top_professionals', { p_limit: 20, p_offset: 0 }),
    summary: (data) => `**${data[0]?.total_count ?? data.length}** professionnels actifs — classés par nombre de vues cumulées.`,
    cols: ['Professionnel', 'Email', 'Annonces actives', 'Vues totales'],
    row: (r) => [name(r), r.email, r.active_listings, (r.total_views ?? 0).toLocaleString('fr-FR')],
  },
]

/* ── Pattern matcher ─────────────────────────────────────────────────────── */
function matchQuestion(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  let best = null, bestScore = 0
  for (const q of QUESTIONS) {
    const neg = q.negative.some(k => lower.includes(k.normalize('NFD').replace(/[̀-ͯ]/g, '')))
    if (neg && q.id !== 'never') continue
    const score = q.keywords.reduce((acc, k) => {
      const kn = k.normalize('NFD').replace(/[̀-ͯ]/g, '')
      return acc + (lower.includes(kn) ? 1 : 0)
    }, 0)
    if (score > bestScore) { bestScore = score; best = q }
  }
  return bestScore > 0 ? best : null
}

/* ── Result Table ─────────────────────────────────────────────────────────── */
function ResultTable({ q, data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign:'center', padding:'20px 0', color:'#94A3B8', fontSize:13 }}>Aucun résultat trouvé.</div>
  }
  return (
    <div style={{ border:'1px solid #E2E8F0', borderRadius:10, overflow:'hidden', marginTop:12 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr style={{ background:'#F8FAFC' }}>
            {q.cols.map(c => (
              <th key={c} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#64748B', textTransform:'uppercase', fontSize:10, letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((r, i) => (
            <tr key={i} style={{ borderTop:'1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              {q.row(r).map((cell, j) => (
                <td key={j} style={{ padding:'9px 12px', color: j === 0 ? '#0F172A' : '#475569', fontWeight: j === 0 ? 600 : 400, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Typing dots ─────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, alignItems:'center', padding:'4px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:7, height:7, borderRadius:'50%', background:'#8B5CF6',
          animation:`dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  )
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display:'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap:10, alignItems:'flex-start', marginBottom:20 }}>
      {/* Avatar */}
      <div style={{
        width:34, height:34, borderRadius:'50%', flexShrink:0,
        background: isUser ? '#E2E8F0' : 'linear-gradient(135deg,#8B5CF6,#6366F1)',
        display:'flex', alignItems:'center', justifyContent:'center', color: isUser ? '#64748B' : '#fff'
      }}>
        {isUser ? <Ic.User /> : <Ic.Spark />}
      </div>

      {/* Content */}
      <div style={{ maxWidth:'82%', display:'flex', flexDirection:'column', gap:4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ fontSize:10, color:'#94A3B8', marginBottom:2 }}>
          {isUser ? 'Vous' : 'IA Manager'} · {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
        </div>
        <div style={{
          background: isUser ? '#F1F5F9' : '#F8F5FF',
          border: `1px solid ${isUser ? '#E2E8F0' : '#DDD6FE'}`,
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding:'12px 16px', fontSize:13, color:'#0F172A', lineHeight:1.6,
        }}>
          {msg.typing
            ? <TypingDots />
            : <span dangerouslySetInnerHTML={{ __html: (msg.content ?? '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          }
        </div>
        {msg.data && msg.q && !msg.typing && (
          <div style={{ width:'100%' }}>
            <ResultTable q={msg.q} data={msg.data} />
          </div>
        )}
        {msg.error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#DC2626' }}>
            {msg.error}
          </div>
        )}
        {msg.noMatch && (
          <div style={{ background:'#FEF9C3', border:'1px solid #FEF08A', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#713F12', lineHeight:1.6 }}>
            Je ne reconnais pas cette question. Essayez :<br />
            {QUESTIONS.map(q => <span key={q.id} style={{ display:'block', marginTop:4 }}>• {q.question}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Quick question chip ─────────────────────────────────────────────────── */
function QuickCard({ q, onClick }) {
  return (
    <button onClick={() => onClick(q)} style={{
      background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'14px 18px',
      cursor:'pointer', textAlign:'left', transition:'all 0.15s', width:'100%',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = q.bg }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background: q.color, flexShrink:0 }} />
        <span style={{ fontSize:11, fontWeight:700, color: q.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{q.label}</span>
      </div>
      <div style={{ fontSize:13, color:'#0F172A', fontWeight:500, lineHeight:1.4 }}>{q.question}</div>
      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:4, color:'#94A3B8', fontSize:11 }}>
        <Ic.ChevR /> Cliquez pour analyser
      </div>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function IAManagerPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)

  const pushMsg = (msg) => {
    setMessages(p => [...p, { ts: Date.now(), ...msg }])
    scrollBottom()
  }
  const replaceLastAssistant = (update) => {
    setMessages(p => {
      const copy = [...p]
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') { copy[i] = { ...copy[i], ...update }; break }
      }
      return copy
    })
    scrollBottom()
  }

  const ask = useCallback(async (text) => {
    if (!text.trim() || loading) return
    setLoading(true)
    setInput('')

    pushMsg({ role:'user', content: text })
    pushMsg({ role:'assistant', typing: true, content:'' })

    await new Promise(r => setTimeout(r, 700))

    const q = matchQuestion(text)

    if (!q) {
      replaceLastAssistant({ typing:false, content:'Je ne suis pas sûr de comprendre votre demande.', noMatch:true })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await q.call()
      if (error) throw error
      const arr = Array.isArray(data) ? data : []
      replaceLastAssistant({ typing:false, content: q.summary(arr), q, data: arr })
    } catch (e) {
      replaceLastAssistant({ typing:false, content:'Une erreur est survenue lors de la requête.', error: e.message })
    }
    setLoading(false)
  }, [loading])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input) } }

  const isEmpty = messages.length === 0

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 60px)', maxWidth:900, margin:'0 auto', padding:'0 24px' }}>
      <style>{`
        @keyframes dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
      `}</style>

      {/* Header */}
      <div style={{ padding:'28px 0 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#8B5CF6,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <Ic.Spark />
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#0F172A' }}>IA Manager</h1>
            <p style={{ margin:0, fontSize:12, color:'#94A3B8' }}>Posez vos questions en langage naturel</p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} title="Effacer la conversation"
              style={{ marginLeft:'auto', background:'none', border:'1px solid #E2E8F0', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#94A3B8', display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
              <Ic.Trash /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Messages / Empty state */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>
        {isEmpty ? (
          <div>
            <p style={{ fontSize:13, color:'#64748B', marginBottom:20 }}>
              Choisissez une question ou tapez la vôtre ci-dessous :
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
              {QUESTIONS.map(q => <QuickCard key={q.id} q={q} onClick={q => ask(q.question)} />)}
            </div>
            <div style={{ marginTop:32, background:'#F8FAFC', borderRadius:12, padding:'16px 20px', border:'1px solid #E2E8F0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, color:'#64748B', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <Ic.Info /> Exemples de questions
              </div>
              {[
                'Quels comptes sont inactifs depuis 30 jours ?',
                'Montre-moi les abonnements qui expirent cette semaine',
                'Quels utilisateurs ne se sont jamais connectés ?',
                'Quelles sont les annonces avec le plus de vues ?',
                'Classe les professionnels par performance',
              ].map((ex, i) => (
                <button key={i} onClick={() => ask(ex)} style={{
                  display:'block', width:'100%', textAlign:'left', background:'none', border:'none',
                  padding:'5px 0', fontSize:13, color:'#6366F1', cursor:'pointer', fontFamily:'inherit',
                }}>
                  → {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ paddingTop:8 }}>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {/* Quick chips after conversation */}
            {!loading && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {QUESTIONS.map(q => (
                  <button key={q.id} onClick={() => ask(q.question)}
                    style={{ background: q.bg, border:`1px solid ${q.color}30`, borderRadius:99, padding:'5px 14px', fontSize:12, fontWeight:600, color: q.color, cursor:'pointer' }}>
                    {q.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ flexShrink:0, paddingBottom:24, paddingTop:8 }}>
        <div style={{ display:'flex', gap:10, background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'10px 14px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', alignItems:'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Posez votre question…"
            rows={1}
            style={{ flex:1, border:'none', outline:'none', resize:'none', fontSize:14, fontFamily:'inherit', color:'#0F172A', background:'transparent', lineHeight:1.5, maxHeight:120, overflowY:'auto' }}
          />
          <button onClick={() => ask(input)} disabled={!input.trim() || loading}
            style={{
              width:36, height:36, borderRadius:10, border:'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              background: !input.trim() || loading ? '#E2E8F0' : 'linear-gradient(135deg,#8B5CF6,#6366F1)',
              color: !input.trim() || loading ? '#94A3B8' : '#fff',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s'
            }}>
            <Ic.Send />
          </button>
        </div>
        <div style={{ textAlign:'center', fontSize:11, color:'#CBD5E1', marginTop:8 }}>
          Entrée pour envoyer · Shift+Entrée pour saut de ligne
        </div>
      </div>
    </div>
  )
}
