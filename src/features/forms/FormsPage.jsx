import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui'

// ─── Data ──────────────────────────────────────────────────────────────────

const FORMS_DATA = [
  { id:1, name:'Contact vendeur',      type:'contact',      color:'#3B82F6', fields:['Nom','Email','Téléphone','Message'],                        submissions:48,  leads:12, conv:25, status:'actif',   created:'2026-04-15', lastSub:'2026-05-29' },
  { id:2, name:'Estimation gratuite',  type:'estimation',   color:'#10B981', fields:['Nom','Email','Téléphone','Adresse','Type de bien'],          submissions:127, leads:38, conv:30, status:'actif',   created:'2026-03-20', lastSub:'2026-05-30' },
  { id:3, name:'Demande de visite',    type:'visite',       color:'#8B5CF6', fields:['Nom','Email','Téléphone','Date souhaitée','Message'],        submissions:31,  leads:22, conv:71, status:'actif',   created:'2026-04-28', lastSub:'2026-05-28' },
  { id:4, name:'Investisseur qualifié',type:'investisseur', color:'#F59E0B', fields:['Nom','Email','Téléphone','Budget','Type d\'investissement'], submissions:19,  leads:9,  conv:47, status:'inactif', created:'2026-02-10', lastSub:'2026-05-10' },
  { id:5, name:'Newsletter',           type:'newsletter',   color:'#F97316', fields:['Nom','Email'],                                              submissions:284, leads:0,  conv:0,  status:'actif',   created:'2026-01-05', lastSub:'2026-05-30' },
]

const SUBMISSIONS_DATA = [
  { id:1,  formId:2, fn:'Sophie',  ln:'Martin',   ini:'SM', email:'sophie.m@email.com',     phone:'06 12 34 56 78', date:'2026-05-30', status:'nouveau',  message:'Je souhaite une estimation pour un T3 à Paris 11.' },
  { id:2,  formId:3, fn:'Thomas',  ln:'Dupont',   ini:'TD', email:'thomas.d@gmail.com',     phone:'06 23 45 67 89', date:'2026-05-30', status:'traité',   message:'Visite souhaitée le samedi 7 juin.' },
  { id:3,  formId:1, fn:'Amina',   ln:'Benali',   ini:'AB', email:'a.benali@hotmail.fr',    phone:'06 34 56 78 90', date:'2026-05-29', status:'nouveau',  message:'Bonjour, je suis intéressée par votre service.' },
  { id:4,  formId:2, fn:'Romain',  ln:'Lefèvre',  ini:'RL', email:'r.lefevre@pro.fr',       phone:'06 45 67 89 01', date:'2026-05-29', status:'lead CRM', message:'Maison 5 pièces à Bordeaux, estimation urgente.' },
  { id:5,  formId:5, fn:'Lucie',   ln:'Moreau',   ini:'LM', email:'lucie.moreau@gmail.com', phone:'',               date:'2026-05-28', status:'traité',   message:'' },
  { id:6,  formId:3, fn:'Hugo',    ln:'Bernard',  ini:'HB', email:'h.bernard@outlook.com',  phone:'06 67 89 01 23', date:'2026-05-28', status:'lead CRM', message:'Disponible en semaine pour la visite.' },
  { id:7,  formId:4, fn:'Clara',   ln:'Petit',    ini:'CP', email:'c.petit@email.fr',       phone:'06 78 90 12 34', date:'2026-05-27', status:'nouveau',  message:'Budget 600 k€, cherche SCPI ou immeuble de rapport.' },
  { id:8,  formId:2, fn:'Maxime',  ln:'Girard',   ini:'MG', email:'m.girard@gmail.com',     phone:'06 89 01 23 45', date:'2026-05-26', status:'traité',   message:'Appartement 4P Nice, vue mer.' },
  { id:9,  formId:1, fn:'Julie',   ln:'Blanc',    ini:'JB', email:'j.blanc@pro.fr',         phone:'06 90 12 34 56', date:'2026-05-25', status:'lead CRM', message:'Comment fonctionne votre réseau d\'agences ?' },
  { id:10, formId:5, fn:'Pierre',  ln:'Lambert',  ini:'PL', email:'p.lambert@email.com',    phone:'',               date:'2026-05-24', status:'traité',   message:'' },
  { id:11, formId:3, fn:'Marie',   ln:'Cohen',    ini:'MC', email:'m.cohen@gmail.com',      phone:'06 12 34 56 79', date:'2026-05-23', status:'lead CRM', message:'Visite pour un studio Lyon 3e.' },
  { id:12, formId:2, fn:'David',   ln:'Rousseau', ini:'DR', email:'d.rousseau@pro.fr',      phone:'06 23 45 67 90', date:'2026-05-22', status:'nouveau',  message:'Estimation villa Aix-en-Provence 200 m².' },
]

const ALL_FIELDS = ['Nom','Email','Téléphone','Adresse','Type de bien','Budget','Message','Date souhaitée',"Type d'investissement",'SIRET']

// ─── FormsPage ─────────────────────────────────────────────────────────────

export default function FormsPage() {
  const navigate = useNavigate()
  const [tab, setTab]             = useState('formulaires')
  const [dark, setDark]           = useState(false)
  const [search, setSearch]       = useState('')
  const [forms, setForms]         = useState(FORMS_DATA)
  const [selected, setSelected]   = useState(null)
  const [newOpen, setNewOpen]     = useState(false)
  const [newForm, setNewForm]     = useState({ name:'', type:'contact', fields:['Nom','Email'], color:'#3B82F6' })
  const [newErr, setNewErr]       = useState('')
  const [copied, setCopied]       = useState(null)

  const bg   = dark ? '#0f172a' : '#f8fafc'
  const card = dark ? '#1e293b' : '#ffffff'
  const bdr  = dark ? '#334155' : '#e2e8f0'
  const txt  = dark ? '#f1f5f9' : '#0f172a'
  const sub  = dark ? '#94a3b8' : '#64748b'

  const totalSubs  = forms.reduce((a, f) => a + f.submissions, 0)
  const totalLeads = forms.reduce((a, f) => a + f.leads, 0)
  const activeForms = forms.filter(f => f.status === 'actif').length
  const avgConv    = forms.filter(f => f.conv > 0).length
    ? Math.round(forms.filter(f => f.conv > 0).reduce((a, f) => a + f.conv, 0) / forms.filter(f => f.conv > 0).length)
    : 0

  const AVCOLS = { S:'#3B82F6',T:'#8B5CF6',A:'#F97316',R:'#10B981',L:'#F59E0B',H:'#06B6D4',C:'#EC4899',M:'#6366F1',J:'#84CC16',P:'#F43F5E',D:'#14B8A6' }
  const avColor = ini => AVCOLS[ini[0]] || '#94A3B8'

  const Av = ({ ini, sz = 36 }) => (
    <div className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 select-none"
      style={{ width:sz, height:sz, background:avColor(ini), fontSize:sz*0.35 }}>{ini}</div>
  )

  const STATUS_PILL = {
    'actif':    { bg:'#D1FAE5', text:'#065F46' },
    'inactif':  { bg:'#F1F5F9', text:'#475569' },
    'nouveau':  { bg:'#DBEAFE', text:'#1E40AF' },
    'traité':   { bg:'#D1FAE5', text:'#065F46' },
    'lead CRM': { bg:'#FEF3C7', text:'#92400E' },
  }
  const StatusPill = ({ st }) => (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background:STATUS_PILL[st]?.bg||'#f1f5f9', color:STATUS_PILL[st]?.text||'#475569' }}>{st}</span>
  )

  const TYPE_ICONS = {
    contact:      { icon: I.MessageSquare, label: 'Contact'     },
    estimation:   { icon: I.Home,          label: 'Estimation'  },
    visite:       { icon: I.Calendar,      label: 'Visite'      },
    investisseur: { icon: I.TrendingUp,    label: 'Investisseur'},
    newsletter:   { icon: I.Mail,          label: 'Newsletter'  },
  }

  const filteredForms = search
    ? forms.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : forms
  const filteredSubs = search
    ? SUBMISSIONS_DATA.filter(s => `${s.fn} ${s.ln} ${s.email}`.toLowerCase().includes(search.toLowerCase()))
    : SUBMISSIONS_DATA

  const toggleStatus = (id) => setForms(fs => fs.map(f => f.id === id ? { ...f, status: f.status === 'actif' ? 'inactif' : 'actif' } : f))

  const copyLink = (id) => {
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleCreate = () => {
    if (!newForm.name.trim()) { setNewErr('Le nom est obligatoire.'); return }
    if (newForm.fields.length === 0) { setNewErr('Choisissez au moins un champ.'); return }
    const f = {
      id: Date.now(),
      name: newForm.name.trim(),
      type: newForm.type,
      color: newForm.color,
      fields: newForm.fields,
      submissions: 0, leads: 0, conv: 0,
      status: 'actif',
      created: new Date().toISOString().slice(0, 10),
      lastSub: '—',
    }
    setForms(fs => [f, ...fs])
    setNewOpen(false)
    setNewForm({ name:'', type:'contact', fields:['Nom','Email'], color:'#3B82F6' })
    setNewErr('')
  }

  const SIDEBAR_NAV = [
    { Icon:I.Home,       label:"Vue d'ensemble",          id:'overview'   },
    { Icon:I.Search,     label:'Recherches sauvegardées',  id:'saved'      },
    { Icon:I.Bell,       label:'Notifications',            id:'notifs',    badge:4 },
    { Icon:I.Sparkles,   label:'Insights IA',              id:'insights'   },
    { Icon:I.CreditCard, label:'Abonnement',               id:'abonnement' },
    { Icon:I.Heart,      label:'Favoris',                  id:'favoris'    },
    { Icon:I.User,       label:'Mon profil',               id:'profil'     },
  ]

  const COLOR_OPTS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#F97316','#EF4444','#EC4899']

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
        <div className="px-4 pb-3 space-y-1">
          <button onClick={() => navigate('/crm')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all text-left">
            <I.Users size={16} /> CRM
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500">
            <I.FileText size={16} /> Formulaires
          </button>
        </div>
        <div className="mx-4 mb-5 p-4 rounded-2xl" style={{ background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.25)' }}>
          <div className="flex items-center gap-2 mb-1">
            <I.Zap size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white">Passer à Pro</span>
          </div>
          <p className="text-xs text-white/60 mb-3">Formulaires illimités + intégrations</p>
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
              <h1 className="text-2xl font-extrabold" style={{ color:txt }}>Formulaires</h1>
              <p className="text-sm mt-0.5" style={{ color:sub }}>{forms.length} formulaires · {totalSubs} soumissions · {totalLeads} leads générés</p>
            </div>
            <button onClick={() => setNewOpen(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all shadow-sm">
              <I.Plus size={15} /> Nouveau formulaire
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { Icon:I.FileText,   color:'#3B82F6', val:forms.length,  label:'Formulaires'       },
              { Icon:I.Users,      color:'#10B981', val:totalSubs,     label:'Soumissions'        },
              { Icon:I.TrendingUp, color:'#F59E0B', val:avgConv+'%',   label:'Conv. moyenne'      },
              { Icon:I.Sparkles,   color:'#8B5CF6', val:totalLeads,    label:'Leads générés'      },
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

          {/* Tabs */}
          <div className="flex items-center gap-0.5 p-1 rounded-2xl mb-6 w-fit" style={{ background:dark?'#1e293b':'#f1f5f9' }}>
            {[
              { id:'formulaires', label:'Formulaires', Icon:I.FileText },
              { id:'soumissions', label:'Soumissions',  Icon:I.Users },
              { id:'parametres',  label:'Paramètres',   Icon:I.Settings },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id?'bg-white shadow-sm':''}`}
                style={{ color:tab===id?txt:sub }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {/* FORMULAIRES TAB */}
          {tab === 'formulaires' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredForms.map(f => {
                const TIcon = TYPE_ICONS[f.type]?.icon || I.FileText
                return (
                  <motion.div key={f.id} layout className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{ background:card, border:`1px solid ${bdr}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:f.color+'22', color:f.color }}>
                        <TIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color:txt }}>{f.name}</div>
                        <div className="text-xs mt-0.5" style={{ color:sub }}>{TYPE_ICONS[f.type]?.label} · {f.fields.length} champs</div>
                      </div>
                      <StatusPill st={f.status} />
                    </div>

                    {/* Fields preview */}
                    <div className="flex flex-wrap gap-1">
                      {f.fields.slice(0, 4).map(field => (
                        <span key={field} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>{field}</span>
                      ))}
                      {f.fields.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>+{f.fields.length-4}</span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 pt-1" style={{ borderTop:`1px solid ${bdr}` }}>
                      {[
                        { val:f.submissions, label:'Soumis'  },
                        { val:f.leads,       label:'Leads'   },
                        { val:f.conv+'%',    label:'Conv.'   },
                      ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                          <div className="text-base font-extrabold" style={{ color:txt }}>{val}</div>
                          <div className="text-[10px]" style={{ color:sub }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => copyLink(f.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all"
                        style={{ background:dark?'#334155':'#f1f5f9', color:copied===f.id?'#10B981':sub }}>
                        {copied===f.id ? <><I.Check size={12}/> Copié</> : <><I.Link size={12}/> Copier lien</>}
                      </button>
                      <button
                        onClick={() => setSelected(f)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all"
                        style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>
                        <I.Edit size={12}/> Modifier
                      </button>
                      <button
                        onClick={() => toggleStatus(f.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                        style={{ background:dark?'#334155':'#f1f5f9', color:f.status==='actif'?'#10B981':'#EF4444' }}>
                        {f.status === 'actif'
                          ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
                          : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        }
                      </button>
                    </div>
                  </motion.div>
                )
              })}

              {/* Empty state */}
              {filteredForms.length === 0 && (
                <div className="col-span-3 text-center py-16">
                  <I.FileText size={40} style={{ color:sub, margin:'0 auto 12px' }} />
                  <p className="font-semibold" style={{ color:txt }}>Aucun formulaire trouvé</p>
                  <p className="text-sm mt-1" style={{ color:sub }}>Créez votre premier formulaire pour capturer des leads</p>
                </div>
              )}
            </div>
          )}

          {/* SOUMISSIONS TAB */}
          {tab === 'soumissions' && (
            <div>
              <div className="flex items-center gap-2.5 px-4 h-10 rounded-full border mb-5 max-w-xs"
                style={{ background:card, borderColor:bdr }}>
                <I.Search size={13} style={{ color:sub }} />
                <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Chercher une soumission..."
                  style={{ color:txt }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background:card, border:`1px solid ${bdr}` }}>
                <div className="grid px-5 py-3 border-b text-[10px] font-bold uppercase tracking-wider"
                  style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) minmax(0,2fr) 100px 40px', borderColor:bdr, color:sub }}>
                  <span>Contact</span><span>Formulaire</span><span>Message</span><span>Statut</span><span/>
                </div>
                {filteredSubs.map(s => {
                  const form = forms.find(f => f.id === s.formId)
                  return (
                    <div key={s.id}
                      className="grid px-5 py-3.5 border-b items-center transition-colors"
                      style={{ gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr) minmax(0,2fr) 100px 40px', borderColor:bdr }}
                      onMouseEnter={e => e.currentTarget.style.background = dark?'#263044':'#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Av ini={s.ini} sz={34} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color:txt }}>{s.fn} {s.ln}</div>
                          <div className="text-xs truncate" style={{ color:sub }}>{s.email}</div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        {form && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:form.color }}/>
                            <span className="text-sm truncate" style={{ color:txt }}>{form.name}</span>
                          </div>
                        )}
                        <div className="text-xs mt-0.5" style={{ color:sub }}>{s.date}</div>
                      </div>
                      <div className="text-xs truncate" style={{ color:sub }}>{s.message || '—'}</div>
                      <StatusPill st={s.status} />
                      <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
                        style={{ color:sub }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PARAMÈTRES TAB */}
          {tab === 'parametres' && (
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              {/* Notifications */}
              <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Notifications email</h3>
                <div className="space-y-3">
                  {[
                    ['Nouvelle soumission', true],
                    ['Lead ajouté au CRM',  true],
                    ['Rapport hebdomadaire', false],
                    ['Formulaire inactif',  false],
                  ].map(([label, defaultOn]) => {
                    const [on, setOn] = React.useState(defaultOn)
                    return (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color:txt }}>{label}</span>
                        <button onClick={() => setOn(v => !v)}
                          className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                          style={{ background: on ? '#F97316' : (dark ? '#334155' : '#e2e8f0') }}>
                          <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                            style={{ left: on ? '22px' : '2px' }}/>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Intégrations */}
              <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${bdr}` }}>
                <h3 className="text-sm font-bold mb-4" style={{ color:txt }}>Intégrations</h3>
                <div className="space-y-3">
                  {[
                    { label:'CRM PASMAL',   connected:true,  color:'#F97316' },
                    { label:'Mailchimp',    connected:false, color:'#FFE01B' },
                    { label:'HubSpot',      connected:false, color:'#FF7A59' },
                    { label:'Zapier',       connected:false, color:'#FF4F00' },
                  ].map(({ label, connected, color }) => (
                    <div key={label} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background:color }}>{label[0]}</div>
                        <span className="text-sm font-medium" style={{ color:txt }}>{label}</span>
                      </div>
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                        style={{ background:connected?'#D1FAE5':(dark?'#334155':'#f1f5f9'), color:connected?'#065F46':sub }}>
                        {connected ? '✓ Connecté' : 'Connecter'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domaine personnalisé */}
              <div className="rounded-2xl p-5 col-span-2" style={{ background:card, border:`1px solid ${bdr}` }}>
                <h3 className="text-sm font-bold mb-1" style={{ color:txt }}>Domaine personnalisé</h3>
                <p className="text-xs mb-4" style={{ color:sub }}>Partagez vos formulaires sous votre propre domaine</p>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-2xl border-2" style={{ background:dark?'#0f172a':bg, borderColor:bdr }}>
                    <span className="text-sm" style={{ color:sub }}>https://</span>
                    <input className="flex-1 text-sm bg-transparent outline-none" placeholder="forms.monagence.fr" style={{ color:txt }} />
                  </div>
                  <button className="px-5 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl transition-all">
                    Configurer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* New Form Modal */}
      <AnimatePresence>
        {newOpen && (
          <>
            <motion.div className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setNewOpen(false); setNewErr('') }} />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94, y:20 }}
                transition={{ type:'spring', damping:28, stiffness:320 }}
                className="pointer-events-auto w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden"
                style={{ background:card }}>
                <div className="flex items-center justify-between px-7 pt-6 pb-4" style={{ borderBottom:`1px solid ${bdr}` }}>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color:txt }}>Nouveau formulaire</h2>
                    <p className="text-xs mt-0.5" style={{ color:sub }}>Créez un formulaire pour capturer des leads</p>
                  </div>
                  <button onClick={() => { setNewOpen(false); setNewErr('') }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
                    style={{ color:sub }}>
                    <I.X size={16} />
                  </button>
                </div>

                <div className="px-7 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                  {/* Nom */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:sub }}>Nom du formulaire *</label>
                    <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name:e.target.value }))}
                      placeholder="Ex. Contact vendeur"
                      className="w-full h-11 px-4 rounded-2xl border-2 text-sm outline-none transition-all focus:border-orange-400"
                      style={{ background:dark?'#0f172a':bg, borderColor:bdr, color:txt }} />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(TYPE_ICONS).map(([key, { icon: TIcon, label }]) => (
                        <button key={key} type="button" onClick={() => setNewForm(f => ({ ...f, type:key }))}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-semibold transition-all"
                          style={{
                            background: newForm.type === key ? '#FFF7ED' : (dark ? '#0f172a' : bg),
                            borderColor: newForm.type === key ? '#F97316' : bdr,
                            color: newForm.type === key ? '#EA580C' : sub,
                          }}>
                          <TIcon size={16} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Couleur */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Couleur</label>
                    <div className="flex gap-2">
                      {COLOR_OPTS.map(c => (
                        <button key={c} type="button" onClick={() => setNewForm(f => ({ ...f, color:c }))}
                          className="w-7 h-7 rounded-full transition-all"
                          style={{ background:c, outline: newForm.color === c ? `3px solid ${c}` : 'none', outlineOffset:2, opacity: newForm.color === c ? 1 : 0.6 }}/>
                      ))}
                    </div>
                  </div>

                  {/* Champs */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Champs du formulaire *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_FIELDS.map(field => {
                        const active = newForm.fields.includes(field)
                        return (
                          <button key={field} type="button"
                            onClick={() => setNewForm(f => ({
                              ...f,
                              fields: active ? f.fields.filter(x => x !== field) : [...f.fields, field]
                            }))}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm text-left transition-all"
                            style={{
                              background: active ? '#FFF7ED' : (dark ? '#0f172a' : bg),
                              borderColor: active ? '#F97316' : bdr,
                              color: active ? '#EA580C' : sub,
                            }}>
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: active ? '#F97316' : 'transparent', border: active ? 'none' : `2px solid ${bdr}` }}>
                              {active && <I.Check size={10} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">{field}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {newErr && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl px-4 py-2.5">
                      <I.Alert size={14} className="shrink-0" /> {newErr}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 px-7 py-5" style={{ borderTop:`1px solid ${bdr}` }}>
                  <button onClick={() => { setNewOpen(false); setNewErr('') }}
                    className="flex-1 h-11 rounded-2xl border-2 text-sm font-semibold transition-all hover:border-slate-400"
                    style={{ borderColor:bdr, color:sub, background:'transparent' }}>
                    Annuler
                  </button>
                  <button onClick={handleCreate}
                    className="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                    <I.Plus size={15} /> Créer le formulaire
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Form Detail / Edit Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSelected(null)} />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity:0, scale:0.93, y:16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.93, y:16 }}
                transition={{ type:'spring', damping:26, stiffness:300 }}
                className="pointer-events-auto w-full max-w-md rounded-[28px] shadow-2xl"
                style={{ background:card }}>
                <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background:selected.color+'22', color:selected.color }}>
                    {React.createElement(TYPE_ICONS[selected.type]?.icon || I.FileText, { size:22 })}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold" style={{ color:txt }}>{selected.name}</h2>
                    <p className="text-sm" style={{ color:sub }}>{TYPE_ICONS[selected.type]?.label} · Créé le {selected.created}</p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background:dark?'#334155':'#f1f5f9', color:sub }}>
                    <I.X size={14}/>
                  </button>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                  {[
                    { val:selected.submissions, label:'Soumissions', color:'#3B82F6' },
                    { val:selected.leads,       label:'Leads',       color:'#10B981' },
                    { val:selected.conv+'%',    label:'Conversion',  color:'#F59E0B' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="text-center rounded-2xl p-3" style={{ background:dark?'#263044':'#f8fafc' }}>
                      <div className="text-xl font-extrabold" style={{ color }}>{val}</div>
                      <div className="text-[11px] mt-0.5" style={{ color:sub }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Champs */}
                <div className="px-6 pb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Champs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.fields.map(field => (
                      <span key={field} className="text-xs px-2.5 py-1 rounded-full" style={{ background:selected.color+'22', color:selected.color }}>{field}</span>
                    ))}
                  </div>
                </div>

                {/* Link */}
                <div className="px-6 pb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:sub }}>Lien de partage</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center px-3 h-9 rounded-xl text-xs truncate"
                      style={{ background:dark?'#0f172a':'#f1f5f9', color:sub }}>
                      https://pasmal.fr/f/{selected.id}
                    </div>
                    <button onClick={() => copyLink(selected.id)}
                      className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold transition-all"
                      style={{ background:copied===selected.id?'#D1FAE5':(dark?'#334155':'#f1f5f9'), color:copied===selected.id?'#065F46':sub }}>
                      {copied===selected.id ? <><I.Check size={12}/> Copié</> : <><I.Copy size={12}/> Copier</>}
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-2xl transition-all">
                    <I.Edit size={14}/> Modifier le formulaire
                  </button>
                  <button onClick={() => { toggleStatus(selected.id); setSelected(null) }}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border-2"
                    style={{ borderColor:bdr, color:txt }}>
                    {selected.status === 'actif' ? 'Désactiver' : 'Activer'}
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
