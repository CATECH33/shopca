import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui'
import { PasmalSelect } from '../../components/ui/PasmalSelect'

// ─── Data ──────────────────────────────────────────────────────────────────

const CRM_LEADS_DATA = [
  { id:1,  fn:'Sophie',  ln:'Martin',   ini:'SM', email:'sophie.m@email.com',     phone:'06 12 34 56 78', src:'Leboncoin', prop:'Appt 3P Paris 11',  budget:450000,  score:87, status:'nouveau',     profile:'Acheteur sérieux', tags:['URGENT','FINANCEMENT OK'],  date:'2026-05-20', notes:'Cherche pour juillet, financement accordé.'    },
  { id:2,  fn:'Thomas',  ln:'Dupont',   ini:'TD', email:'thomas.d@gmail.com',     phone:'06 23 45 67 89', src:'SeLoger',   prop:'Villa 5P Lyon',      budget:780000,  score:72, status:'nouveau',     profile:'Investisseur',     tags:['INVESTISSEMENT'],           date:'2026-05-21', notes:'Investisseur Lyon, cherche rendement > 5 %.'   },
  { id:3,  fn:'Amina',   ln:'Benali',   ini:'AB', email:'a.benali@hotmail.fr',    phone:'06 34 56 78 90', src:'PAP',       prop:'Studio Paris 15',    budget:210000,  score:55, status:'contacte',    profile:'Faible intention', tags:['INCERTAIN'],                date:'2026-05-19', notes:'Indécise, compare plusieurs options.'           },
  { id:4,  fn:'Romain',  ln:'Lefèvre',  ini:'RL', email:'r.lefevre@pro.fr',       phone:'06 45 67 89 01', src:"Bien'ici",  prop:'Appt 4P Bordeaux',   budget:320000,  score:91, status:'contacte',    profile:'Acheteur sérieux', tags:['URGENT','CASH'],            date:'2026-05-22', notes:'Acheteur cash, décision très rapide.'           },
  { id:5,  fn:'Lucie',   ln:'Moreau',   ini:'LM', email:'lucie.moreau@gmail.com', phone:'06 56 78 90 12', src:'SeLoger',   prop:'Maison Nantes',       budget:550000,  score:80, status:'visite',      profile:'Acheteur sérieux', tags:['FAMILLE'],                  date:'2026-05-18', notes:'Famille avec 2 enfants, besoin jardin.'         },
  { id:6,  fn:'Hugo',    ln:'Bernard',  ini:'HB', email:'h.bernard@outlook.com',  phone:'06 67 89 01 23', src:'Leboncoin', prop:'Loft Paris 10',       budget:380000,  score:68, status:'visite',      profile:'Investisseur',     tags:['LOCATION'],                 date:'2026-05-17', notes:'Veut louer après achat, cherche rendement.'     },
  { id:7,  fn:'Clara',   ln:'Petit',    ini:'CP', email:'c.petit@email.fr',       phone:'06 78 90 12 34', src:'PAP',       prop:'Appt 2P Paris 9',    budget:290000,  score:63, status:'negociation', profile:'Acheteur sérieux', tags:['AGENCE','MANDAT'],          date:'2026-05-15', notes:'En cours de négociation, offre déposée.'        },
  { id:8,  fn:'Maxime',  ln:'Girard',   ini:'MG', email:'m.girard@gmail.com',     phone:'06 89 01 23 45', src:"Bien'ici",  prop:'Villa Cannes',        budget:1200000, score:76, status:'negociation', profile:'Acheteur sérieux', tags:['PREMIUM','CASH'],           date:'2026-05-14', notes:'Client premium, villa vue mer.'                 },
  { id:9,  fn:'Julie',   ln:'Blanc',    ini:'JB', email:'j.blanc@pro.fr',         phone:'06 90 12 34 56', src:'SeLoger',   prop:'T2 Marseille 8',      budget:220000,  score:45, status:'gagne',       profile:'Acheteur sérieux', tags:['LOCATION'],                 date:'2026-05-10', notes:'Vendu ! Signature chez notaire.'                },
  { id:10, fn:'Pierre',  ln:'Lambert',  ini:'PL', email:'p.lambert@email.com',    phone:'06 01 23 45 67', src:'PAP',       prop:'Maison Nice',         budget:650000,  score:33, status:'perdu',       profile:'Faible intention', tags:[],                           date:'2026-05-08', notes:'A choisi une autre agence.'                     },
  { id:11, fn:'Marie',   ln:'Cohen',    ini:'MC', email:'m.cohen@gmail.com',      phone:'06 12 34 56 79', src:"Bien'ici",  prop:'Studio Lyon 3',       budget:180000,  score:58, status:'gagne',       profile:'Acheteur sérieux', tags:['INVESTISSEMENT'],           date:'2026-05-05', notes:'Investisseur, LMNP Lyon.'                       },
  { id:12, fn:'David',   ln:'Rousseau', ini:'DR', email:'d.rousseau@pro.fr',      phone:'06 23 45 67 90', src:'SeLoger',   prop:'Appt 5P Bordeaux',    budget:490000,  score:42, status:'perdu',       profile:'Faible intention', tags:[],                           date:'2026-04-28', notes:'Budget trop serré après simulation.'            },
]

const CRM_PIPELINE = [
  { id:'nouveau',     label:'Nouveau lead',  color:'#94A3B8' },
  { id:'contacte',    label:'Contacté',      color:'#3B82F6' },
  { id:'visite',      label:'Visite prévue', color:'#8B5CF6' },
  { id:'negociation', label:'Négociation',   color:'#F59E0B' },
  { id:'gagne',       label:'Gagné',         color:'#10B981' },
]

const CRM_CONV_DATA = [
  { m:'Janv', leads:15, conv:5  },
  { m:'Févr', leads:18, conv:7  },
  { m:'Mars', leads:22, conv:9  },
  { m:'Avr',  leads:25, conv:11 },
  { m:'Mai',  leads:28, conv:13 },
]

const CRM_SOURCES = [
  { label:'SeLoger',  pct:32, color:'#3B82F6' },
  { label:'Leboncoin',pct:28, color:'#F97316' },
  { label:'PAP',      pct:18, color:'#8B5CF6' },
  { label:"Bien'ici", pct:14, color:'#10B981' },
  { label:'Autre',    pct:8,  color:'#94A3B8' },
]

const CRM_TEMPLATES = [
  { emoji:'👋', label:'Prise de contact',       delay:'Immédiat'        },
  { emoji:'🔔', label:'Relance J+3',            delay:'Après 3 jours'   },
  { emoji:'📅', label:'Confirmation de visite', delay:'Visite prévue'   },
  { emoji:'💬', label:'Suivi post-visite',      delay:'Après la visite' },
  { emoji:'🏡', label:'Offre personnalisée',    delay:'Négociation'     },
]

// ─── CRMPage ───────────────────────────────────────────────────────────────

export default function CRMPage() {
  const navigate = useNavigate()
  const [tab, setTab]               = useState('kanban')
  const [dark, setDark]             = useState(false)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [leads, setLeads]           = useState(CRM_LEADS_DATA)
  const [editNotes, setEditNotes]   = useState(false)
  const [notesVal, setNotesVal]     = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver]     = useState(null)
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [newForm, setNewForm] = useState({ nom:'', email:'', phone:'', src:'', prop:'', budget:'', profile:'', notes:'' })
  const [newFormErr, setNewFormErr] = useState('')

  const total    = leads.length
  const gagne    = leads.filter(l => l.status === 'gagne').length
  const conv     = Math.round((gagne / total) * 100)
  const negoc    = leads.filter(l => l.status === 'negociation').length
  const perdus   = leads.filter(l => l.status === 'perdu').length
  const scoreAvg = Math.round(leads.reduce((a, l) => a + l.score, 0) / total)

  const S = {
    nouveau:     { label:'Nouveau lead',  bg:'#1e293b' },
    contacte:    { label:'Contacté',      bg:'#2563EB' },
    visite:      { label:'Visite prévue', bg:'#7C3AED' },
    negociation: { label:'Négociation',   bg:'#D97706' },
    gagne:       { label:'Gagné',         bg:'#059669' },
    perdu:       { label:'Perdu',         bg:'#DC2626' },
  }
  const P = {
    'Acheteur sérieux': { bg:'#D1FAE5', text:'#065F46', emoji:'🎯' },
    'Investisseur':     { bg:'#DBEAFE', text:'#1E40AF', emoji:'📈' },
    'Faible intention': { bg:'#F1F5F9', text:'#475569', emoji:'👤' },
    'Agence':           { bg:'#FEF3C7', text:'#92400E', emoji:'🏢' },
  }

  const sColor    = s => s >= 80 ? '#10B981' : s >= 60 ? '#F97316' : '#EF4444'
  const fmtBudget = n => n >= 1000000 ? (n / 1000000).toFixed(1) + ' M€' : (n / 1000).toFixed(0) + ' 000 €'
  const AVCOLS    = { S:'#3B82F6',T:'#8B5CF6',A:'#F97316',R:'#10B981',L:'#F59E0B',H:'#06B6D4',C:'#EC4899',M:'#6366F1',J:'#84CC16',P:'#F43F5E',D:'#14B8A6' }
  const avColor   = ini => AVCOLS[ini[0]] || '#94A3B8'

  const bg   = dark ? '#0f172a' : '#f8fafc'
  const card = dark ? '#1e293b' : '#ffffff'
  const bdr  = dark ? '#334155' : '#e2e8f0'
  const txt  = dark ? '#f1f5f9' : '#0f172a'
  const sub  = dark ? '#94a3b8' : '#64748b'

  const Av = ({ ini, sz = 36 }) => (
    <div className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 select-none"
      style={{ width:sz, height:sz, background:avColor(ini), fontSize:sz*0.35 }}>{ini}</div>
  )
  const ScoreBadge = ({ s }) => (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg tabular-nums"
      style={{ background:sColor(s)+'22', color:sColor(s) }}>{s}</span>
  )
  const StatusPill = ({ st }) => (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap"
      style={{ background:S[st]?.bg || '#64748b' }}>{S[st]?.label || st}</span>
  )

  const filteredLeads = search
    ? leads.filter(l => `${l.fn} ${l.ln} ${l.prop} ${l.email}`.toLowerCase().includes(search.toLowerCase()))
    : leads

  const updateStatus = (id, status) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    setSelected(s => s ? { ...s, status } : s)
  }

  const handleNewLead = () => {
    if (!newForm.nom.trim() || !newForm.email.trim()) { setNewFormErr("Le nom et l'e-mail sont obligatoires."); return }
    const parts = newForm.nom.trim().split(' ')
    const fn = parts[0] || ''
    const ln = parts.slice(1).join(' ') || ''
    const ini = ((fn[0] || '') + (ln[0] || '')).toUpperCase() || fn[0]?.toUpperCase() || '?'
    const score = Math.floor(Math.random() * 25) + 65
    const today = new Date().toISOString().slice(0, 10)
    const lead = {
      id: Date.now(), fn, ln, ini,
      email: newForm.email.trim(), phone: newForm.phone.trim(),
      src: newForm.src || 'Autre', prop: newForm.prop.trim() || 'Non précisé',
      budget: parseInt(newForm.budget.replace(/\s/g, '')) || 0,
      score, status: 'nouveau',
      profile: newForm.profile || 'Faible intention',
      tags: [], date: today, notes: newForm.notes.trim(),
    }
    setLeads(ls => [lead, ...ls])
    setNewLeadOpen(false)
    setNewForm({ nom:'', email:'', phone:'', src:'', prop:'', budget:'', profile:'', notes:'' })
    setNewFormErr('')
  }

  // Donut chart
  const r = 42, circ = 2 * Math.PI * r
  let cum = 0
  const donutSegs = CRM_SOURCES.map(src => {
    const dash = src.pct / 100 * circ
    const off  = circ / 4 - cum
    cum += dash
    return { ...src, dash, off }
  })

  // Bar chart
  const maxL = Math.max(...CRM_CONV_DATA.map(d => d.leads))
  const BH = 100, BW = 28, BGAP = 20, GW = BW * 2 + 6
  const CW = CRM_CONV_DATA.length * (GW + BGAP)

  const SIDEBAR_NAV = [
    { Icon:I.Home,       label:"Vue d'ensemble",          id:'overview'   },
    { Icon:I.Search,     label:'Recherches sauvegardées',  id:'saved'      },
    { Icon:I.Bell,       label:'Notifications',            id:'notifs',    badge:4 },
    { Icon:I.Sparkles,   label:'Insights IA',              id:'insights'   },
    { Icon:I.CreditCard, label:'Abonnement',               id:'abonnement' },
    { Icon:I.Heart,      label:'Favoris',                  id:'favoris'    },
    { Icon:I.User,       label:'Mon profil',               id:'profil'     },
  ]

  return (
    <div className="fixed inset-0 z-0 flex" style={{ background:bg }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 overflow-y-auto" style={{ background:'#0D1B2E' }}>
        <div className="px-6 py-5 border-b border-white/10">
          <BrandLogo dark />
        </div>
        <nav className="flex-1 px-4 py-5 space-y-0.5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-3">Navigation</p>
          {SIDEBAR_NAV.map(n => (
            <button key={n.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all text-left">
              <n.Icon size={16} />
              <span className="flex-1 truncate">{n.label}</span>
              {n.badge && <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500">
            <I.Users size={16} /> CRM
          </button>
        </div>
        <div className="mx-4 mb-5 p-4 rounded-2xl" style={{ background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.25)' }}>
          <div className="flex items-center gap-2 mb-1">
            <I.Zap size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white">Passer à Pro</span>
          </div>
          <p className="text-xs text-white/60 mb-3">Alertes illimitées + IA avancée</p>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-all">
            Voir les offres →
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-8 py-3.5 flex-shrink-0" style={{ background:card, borderBottom:`1px solid ${bdr}` }}>
          <div className="flex items-center gap-2.5 flex-1 max-w-sm px-4 h-10 rounded-full border" style={{ background:bg, borderColor:bdr }}>
            <I.Search size={14} style={{ color:sub }} />
            <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Rechercher..."
              style={{ color:txt }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button onClick={() => setDark(v => !v)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all" style={{ color:sub }}>
              {dark
                ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center relative" style={{ color:sub }}>
              <I.Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background:'#0f172a' }}>ME</div>
              <span className="text-sm font-semibold" style={{ color:txt }}>Mon</span>
              <I.ChevronDown size={13} style={{ color:sub }} />
            </div>
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300">
              <I.ChevronLeft size={12} /> Accueil
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Title */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color:txt }}>CRM Immobilier</h1>
              <p className="text-sm mt-0.5" style={{ color:sub }}>{total} leads · {gagne} gagnés · Taux de conv. {conv}%</p>
            </div>
            <button onClick={() => setNewLeadOpen(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all shadow-sm">
              <I.Plus size={15} /> Nouveau lead
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { Icon:I.Users,       color:'#3B82F6', val:total,    label:'Total leads'    },
              { Icon:I.TrendingUp,  color:'#10B981', val:conv+'%', label:'Taux de conv.'  },
              { Icon:I.Tag,         color:'#F59E0B', val:negoc,    label:'En négociation' },
              { Icon:I.Alert,       color:'#EF4444', val:perdus,   label:'Perdus'         },
            ].map(({ Icon, color, val, label }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:color+'22', color }}>
                  <Icon size={18} />
                </div>
                <div className="text-3xl font-extrabold" style={{ color:txt }}>{val}</div>
                <div className="text-sm mt-0.5" style={{ color:sub }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0.5 p-1 rounded-2xl mb-6 w-fit" style={{ background:dark?'#1e293b':'#f1f5f9' }}>
            {[
              { id:'kanban',    label:'Kanban'    },
              { id:'leads',     label:'Leads'     },
              { id:'analytics', label:'Analytics' },
              { id:'automation',label:'Automation'},
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id?'bg-white shadow-sm':''}`}
                style={{ color:tab===id?txt:sub }}>
                {id==='kanban'    && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width="7" height="12" x="3" y="6" rx="1"/><rect width="7" height="9" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>}
                {id==='leads'     && <I.Users size={13} />}
                {id==='analytics' && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                {id==='automation'&& <I.Zap size={13} />}
                {label}
              </button>
            ))}
          </div>

          {/* KANBAN */}
          {tab === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {CRM_PIPELINE.map(col => {
                const colL = leads.filter(l => l.status === col.id)
                const isOver = dragOver === col.id
                return (
                  <div key={col.id} className="flex-shrink-0 w-72"
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOver !== col.id) setDragOver(col.id) }}
                    onDragLeave={e => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
                    onDrop={e => {
                      e.preventDefault()
                      const id = parseInt(e.dataTransfer.getData('leadId'))
                      if (id) updateStatus(id, col.id)
                      setDraggingId(null)
                      setDragOver(null)
                    }}>
                    <div className="flex items-center gap-2 mb-3 px-1 py-1.5 rounded-xl transition-colors"
                      style={{ background: isOver ? col.color + '18' : 'transparent' }}>
                      <div className="w-2.5 h-2.5 rounded-full transition-transform" style={{ background:col.color, transform: isOver ? 'scale(1.3)' : 'scale(1)' }} />
                      <span className="text-sm font-bold" style={{ color:txt }}>{col.label}</span>
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{colL.length}</span>
                    </div>
                    <div className="space-y-3 rounded-2xl transition-all"
                      style={{
                        minHeight: 80,
                        padding: isOver ? '8px' : '0',
                        background: isOver ? col.color + '0d' : 'transparent',
                        border: isOver ? `2px dashed ${col.color}66` : '2px solid transparent',
                      }}>
                      {colL.map(lead => (
                        <motion.div key={lead.id}
                          layout
                          layoutId={`lead-${lead.id}`}
                          transition={{ type:'spring', stiffness:400, damping:30 }}
                          draggable={true}
                          onDragStart={e => {
                            setDraggingId(lead.id)
                            e.dataTransfer.setData('leadId', String(lead.id))
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          onDragEnd={() => { setDraggingId(null); setDragOver(null) }}
                          onClick={() => { if (!draggingId) { setSelected(lead); setNotesVal(lead.notes); setEditNotes(false) } }}
                          className="rounded-2xl p-4 transition-opacity"
                          style={{
                            background:card,
                            border:`1px solid ${bdr}`,
                            boxShadow: draggingId === lead.id ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                            opacity: draggingId === lead.id ? 0.35 : 1,
                            cursor: draggingId ? 'grabbing' : 'grab',
                          }}>
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <Av ini={lead.ini} sz={32} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                              <div className="text-[11px] truncate" style={{ color:sub }}>{lead.prop}</div>
                            </div>
                            <ScoreBadge s={lead.score} />
                          </div>
                          <div className="text-sm font-extrabold text-orange-500 mb-2">{fmtBudget(lead.budget)}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background:P[lead.profile]?.bg, color:P[lead.profile]?.text }}>
                              {P[lead.profile]?.emoji} {lead.profile}
                            </span>
                            <span className="text-[10px] ml-auto" style={{ color:sub }}>{lead.date.slice(5)}</span>
                          </div>
                          {lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.map(t => (
                                <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                                  style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {colL.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed p-6 text-center transition-all"
                          style={{ borderColor: isOver ? col.color : bdr, background: isOver ? col.color + '0d' : 'transparent' }}>
                          <p className="text-xs font-medium" style={{ color: isOver ? col.color : sub }}>
                            {isOver ? 'Déposer ici' : 'Aucun lead'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* LEADS */}
          {tab === 'leads' && (
            <div>
              <div className="flex items-center gap-2.5 px-4 h-10 rounded-full border mb-5 max-w-xs"
                style={{ background:card, borderColor:bdr }}>
                <I.Search size={13} style={{ color:sub }} />
                <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Chercher un lead..."
                  style={{ color:txt }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background:card, border:`1px solid ${bdr}` }}>
                <div className="grid px-5 py-3 border-b text-[10px] font-bold uppercase tracking-wider"
                  style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) 80px 150px 40px', borderColor:bdr, color:sub }}>
                  <span>Lead</span><span>Bien / Budget</span><span>Score</span><span>Statut</span><span/>
                </div>
                {filteredLeads.map(lead => (
                  <div key={lead.id}
                    onClick={() => { setSelected(lead); setNotesVal(lead.notes); setEditNotes(false) }}
                    className="grid px-5 py-3.5 border-b items-center cursor-pointer transition-colors"
                    style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) 80px 150px 40px', borderColor:bdr }}
                    onMouseEnter={e => e.currentTarget.style.background = dark?'#263044':'#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Av ini={lead.ini} sz={36} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                        <div className="text-xs truncate" style={{ color:sub }}>{lead.email}</div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm truncate" style={{ color:txt }}>{lead.prop}</div>
                      <div className="text-xs font-bold text-orange-500">{fmtBudget(lead.budget)}</div>
                    </div>
                    <ScoreBadge s={lead.score} />
                    <StatusPill st={lead.status} />
                    <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
                      style={{ color:sub }} onClick={e => e.stopPropagation()}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { Icon:I.Users,      color:'#3B82F6', val:total,    label:'Total leads'    },
                  { Icon:I.TrendingUp, color:'#10B981', val:conv+'%', label:'Taux de conv.'  },
                  { Icon:I.Sparkles,   color:'#8B5CF6', val:scoreAvg, label:'Score IA moyen' },
                  { Icon:I.Alert,      color:'#EF4444', val:perdus,   label:'Perdus'         },
                ].map(({ Icon, color, val, label }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:color+'22', color }}>
                      <Icon size={18} />
                    </div>
                    <div className="text-3xl font-extrabold" style={{ color:txt }}>{val}</div>
                    <div className="text-sm mt-0.5" style={{ color:sub }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Entonnoir de conversion</h3>
                  <svg width="100%" viewBox={`0 0 ${CW + 50} ${BH + 30}`}>
                    {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                      const v = Math.round(frac * maxL)
                      const y = BH - frac * BH
                      return (
                        <g key={i}>
                          <line x1="35" y1={y} x2={CW + 35} y2={y} stroke={dark?'#334155':'#e2e8f0'} strokeWidth={0.8}/>
                          <text x="30" y={y + 3.5} fontSize={8} fill={sub} textAnchor="end">{v}</text>
                        </g>
                      )
                    })}
                    {CRM_CONV_DATA.map((d, i) => {
                      const gx = 35 + i * (GW + BGAP)
                      const h1 = (d.leads / maxL) * BH
                      const h2 = (d.conv  / maxL) * BH
                      return (
                        <g key={d.m}>
                          <rect x={gx}      y={BH-h1} width={BW} height={h1} rx={3} fill="#3B82F6" opacity={0.85}/>
                          <rect x={gx+BW+6} y={BH-h2} width={BW} height={h2} rx={3} fill="#8B5CF6" opacity={0.85}/>
                          <text x={gx+GW/2} y={BH+14} fontSize={9} fill={sub} textAnchor="middle">{d.m}</text>
                        </g>
                      )
                    })}
                  </svg>
                  <div className="flex items-center gap-4 mt-1">
                    {[{c:'#3B82F6',l:'Leads'},{c:'#8B5CF6',l:'Convertis'}].map(({ c, l }) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background:c }}/>
                        <span className="text-[11px]" style={{ color:sub }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Sources de leads</h3>
                  <div className="flex items-center gap-6">
                    <svg width={120} height={120} viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={r} fill="none" stroke={dark?'#334155':'#f1f5f9'} strokeWidth={18}/>
                      {donutSegs.map((seg, i) => (
                        <circle key={i} cx="60" cy="60" r={r} fill="none"
                          stroke={seg.color} strokeWidth={18}
                          strokeDasharray={`${seg.dash} ${circ}`}
                          strokeDashoffset={seg.off}
                          transform="rotate(-90, 60, 60)"/>
                      ))}
                      <text x="60" y="57" textAnchor="middle" fontSize={11} fontWeight="700" fill={txt}>{total}</text>
                      <text x="60" y="70" textAnchor="middle" fontSize={8} fill={sub}>leads</text>
                    </svg>
                    <div className="flex-1 space-y-2.5">
                      {CRM_SOURCES.map(s => (
                        <div key={s.label} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:s.color }}/>
                          <span className="text-xs flex-1" style={{ color:txt }}>{s.label}</span>
                          <span className="text-xs font-bold" style={{ color:sub }}>{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Taux de réponse par jour</h3>
                  <div className="flex items-end gap-2" style={{ height:56 }}>
                    {[72,88,65,91,78,84,70].map((v,i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-sm" style={{ height:`${Math.round(v*0.52)}px`, background:'#F97316', opacity:0.75 }}/>
                        <span className="text-[9px]" style={{ color:sub }}>{['L','M','M','J','V','S','D'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Meilleures villes</h3>
                  <div className="space-y-2.5">
                    {[['Paris',4,'#3B82F6'],['Lyon',3,'#8B5CF6'],['Bordeaux',2,'#F97316'],['Nantes',2,'#10B981'],['Cannes',1,'#F59E0B']].map(([city,n,color]) => (
                      <div key={city} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-20" style={{ color:txt }}>{city}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9' }}>
                          <div className="h-full rounded-full" style={{ width:`${(n/4)*100}%`, background:color }}/>
                        </div>
                        <span className="text-xs font-bold w-4 text-right" style={{ color:sub }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUTOMATION */}
          {tab === 'automation' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                <h3 className="text-sm font-bold mb-0.5" style={{ color:txt }}>Templates d'emails automatiques</h3>
                <p className="text-xs mb-4" style={{ color:sub }}>Séquences de suivi prédéfinies</p>
                <div className="space-y-2">
                  {CRM_TEMPLATES.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all hover:shadow-sm"
                      style={{ borderColor:bdr, background:dark?'#263044':'#f8fafc' }}>
                      <span className="text-lg">{t.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color:txt }}>{t.label}</div>
                        <div className="text-xs" style={{ color:sub }}>{t.delay}</div>
                      </div>
                      <I.ChevronDown size={14} style={{ color:sub }}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <h3 className="text-sm font-bold mb-0.5" style={{ color:txt }}>Relances prioritaires</h3>
                  <p className="text-xs mb-4" style={{ color:sub }}>Leads à recontacter en urgence</p>
                  <div className="space-y-2.5">
                    {leads.filter(l => ['negociation','visite','contacte'].includes(l.status))
                      .sort((a,b) => a.date.localeCompare(b.date))
                      .slice(0, 5)
                      .map(lead => {
                        const days = Math.ceil((new Date('2026-05-30') - new Date(lead.date)) / 86400000)
                        return (
                          <div key={lead.id} className="flex items-center gap-3 p-3 rounded-2xl"
                            style={{ background:days>6?'#FEF2F2':dark?'#263044':'#f8fafc', border:`1px solid ${days>6?'#FCA5A5':bdr}` }}>
                            <Av ini={lead.ini} sz={36}/>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate" style={{ color:txt }}>{lead.fn} {lead.ln}</div>
                              <div className="text-xs" style={{ color:days>6?'#EF4444':sub }}>Il y a {days} jour{days>1?'s':''}</div>
                            </div>
                            <StatusPill st={lead.status}/>
                            <button className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0">
                              <I.Mail size={13}/>
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <I.Sparkles size={14} style={{ color:'#8B5CF6' }}/>
                    <h3 className="text-sm font-bold" style={{ color:txt }}>Score IA — Légende</h3>
                  </div>
                  <div className="space-y-2">
                    {[['80–100','Acheteur sérieux, décision rapide','#10B981'],['60–79','Intérêt modéré, à relancer','#F97316'],['0–59','Faible intention, surveiller','#EF4444']].map(([range,label,color]) => (
                      <div key={range} className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap" style={{ background:color+'22', color }}>{range}</span>
                        <span className="text-xs" style={{ color:sub }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* New Lead Modal */}
      <AnimatePresence>
        {newLeadOpen && (
          <>
            <motion.div className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setNewLeadOpen(false); setNewFormErr('') }} />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94, y:20 }}
                transition={{ type:'spring', damping:28, stiffness:320 }}
                className="pointer-events-auto w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden"
                style={{ background:card }}>
                <div className="flex items-center justify-between px-7 pt-6 pb-4" style={{ borderBottom:`1px solid ${bdr}` }}>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color:txt }}>Nouveau lead</h2>
                    <p className="text-xs mt-0.5" style={{ color:sub }}>Ajoutez un lead à votre pipeline</p>
                  </div>
                  <button onClick={() => { setNewLeadOpen(false); setNewFormErr('') }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
                    style={{ color:sub }}>
                    <I.X size={16} />
                  </button>
                </div>
                <div className="px-7 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Nom complet *</label>
                      <input value={newForm.nom} onChange={e => setNewForm(f => ({ ...f, nom:e.target.value }))} placeholder="Jean Dupont"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>E-mail *</label>
                      <input value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email:e.target.value }))} placeholder="jean@exemple.fr" type="email"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Téléphone</label>
                      <input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone:e.target.value }))} placeholder="06 00 00 00 00" type="tel"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Source</label>
                      <PasmalSelect
                        value={newForm.src}
                        onChange={v => setNewForm(f => ({ ...f, src: v }))}
                        options={["SeLoger","Leboncoin","PAP","Bien'ici","Instagram","Recommandation","Autre"]}
                        placeholder="Choisir…"
                        size="sm"
                        dark={dark}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Bien recherché</label>
                      <input value={newForm.prop} onChange={e => setNewForm(f => ({ ...f, prop:e.target.value }))} placeholder="Appt 3P Paris 11"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Budget (€)</label>
                      <input value={newForm.budget} onChange={e => setNewForm(f => ({ ...f, budget:e.target.value }))} placeholder="420 000"
                        className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                        style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Profil IA</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(P).map(([key, val]) => (
                        <button key={key} type="button" onClick={() => setNewForm(f => ({ ...f, profile:key }))}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border-2 text-left transition-all text-sm font-semibold"
                          style={{
                            background: newForm.profile === key ? val.bg : dark ? '#0f172a' : bg,
                            borderColor: newForm.profile === key ? val.text + '80' : bdr,
                            color: newForm.profile === key ? val.text : sub,
                          }}>
                          <span>{val.emoji}</span> {key}
                          {newForm.profile === key && <I.Check size={13} className="ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Notes</label>
                    <textarea value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes:e.target.value }))}
                      placeholder="Contexte, motivation, urgence…" rows={3}
                      className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400 resize-none"
                      style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                  </div>
                  {newFormErr && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl px-4 py-2.5">
                      <I.Alert size={14} className="shrink-0" /> {newFormErr}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 px-7 py-5" style={{ borderTop:`1px solid ${bdr}` }}>
                  <button onClick={() => { setNewLeadOpen(false); setNewFormErr('') }}
                    className="flex-1 h-11 rounded-2xl border-2 text-sm font-semibold transition-all hover:border-slate-400"
                    style={{ borderColor:bdr, color:sub, background:'transparent' }}>
                    Annuler
                  </button>
                  <button onClick={handleNewLead}
                    className="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                    <I.Plus size={15} /> Créer le lead
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setSelected(null); setEditNotes(false) }}/>
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.93, y:16 }}
                animate={{ opacity:1, scale:1,    y:0  }}
                exit={{ opacity:0, scale:0.93, y:16 }}
                transition={{ type:'spring', damping:26, stiffness:300 }}
                className="rounded-[28px] shadow-2xl w-full max-w-md pointer-events-auto"
                style={{ background:card }}>
                <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                  <Av ini={selected.ini} sz={52}/>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold" style={{ color:txt }}>{selected.fn} {selected.ln}</h2>
                    <p className="text-sm" style={{ color:sub }}>{selected.prop}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ScoreBadge s={selected.score}/>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background:P[selected.profile]?.bg, color:P[selected.profile]?.text }}>
                        {P[selected.profile]?.emoji} {selected.profile}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setEditNotes(false) }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>
                    <I.X size={14}/>
                  </button>
                </div>
                <div className="px-6 pb-4 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 text-sm min-w-0" style={{ color:sub }}><I.Mail size={13} className="shrink-0" style={{ color:sub }}/><span className="truncate">{selected.email}</span></div>
                  <div className="flex items-center gap-2 text-sm" style={{ color:sub }}><I.Phone size={13} style={{ color:sub }}/>{selected.phone}</div>
                  <div className="flex items-center gap-2 text-sm" style={{ color:sub }}><I.MapPin size={13} style={{ color:sub }}/>{selected.src}</div>
                  <div className="text-sm font-bold text-orange-500">{fmtBudget(selected.budget)}</div>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Statut Pipeline</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(S).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(selected.id, key)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{ background:selected.status===key?val.bg:dark?'#334155':'#f1f5f9', color:selected.status===key?'white':sub }}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:sub }}>Notes</p>
                    <button onClick={() => setEditNotes(v => !v)} className="text-xs font-medium text-orange-500 hover:text-orange-600">
                      {editNotes ? 'Sauvegarder' : 'Modifier'}
                    </button>
                  </div>
                  {editNotes
                    ? <textarea rows={2} value={notesVal} onChange={e => setNotesVal(e.target.value)}
                        className="w-full text-sm rounded-xl px-3 py-2 resize-none outline-none border transition-colors focus:border-orange-400"
                        style={{ background:dark?'#0f172a':'#f8fafc', color:txt, borderColor:bdr }}/>
                    : <p className="text-sm" style={{ color:txt }}>{notesVal || selected.notes}</p>}
                </div>
                {selected.tags.length > 0 && (
                  <div className="px-6 pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(t => <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{t.toLowerCase()}</span>)}
                    </div>
                  </div>
                )}
                <div className="px-6 pb-6 pt-2 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-2xl transition-all">
                    <I.Mail size={14}/> Envoyer email
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border-2"
                    style={{ borderColor:bdr, color:txt }}>
                    <I.Eye size={13}/> Visite
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border-2"
                    style={{ borderColor:bdr, color:txt }}>
                    <I.Phone size={13}/> Appeler
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
