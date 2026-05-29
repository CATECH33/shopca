import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { I } from '../lib/ui.jsx'
import VerificationStatusCard from './VerificationStatusCard.jsx'
import AgencyTrustScore from './AgencyTrustScore.jsx'

/* ─── Mock data ────────────────────────────────────────────────── */

const AGENCY = {
  name: 'Foncia Premium Lyon',
  status: 'verified',
  plan: 'Pack Pro',
  since: 'Janvier 2026',
  initials: 'FP',
}

const KPI_DATA = [
  { label: 'Vues totales',     value: '4 812', change: +18, Icon: I.Eye,          color: '#3B82F6' },
  { label: 'Leads reçus',      value: '127',   change: +32, Icon: I.Users,         color: '#10B981' },
  { label: 'Annonces actives', value: '23',    change: -4,  Icon: I.Building,      color: '#F97316' },
  { label: 'Taux conversion',  value: '6,4 %', change: +5,  Icon: I.TrendingUp,    color: '#8B5CF6' },
]

// 12 weeks of views for mini chart
const CHART_DATA = [280, 310, 260, 420, 390, 470, 510, 488, 620, 590, 710, 740]

const LISTINGS = [
  { id: 1, title: 'T3 lumineux Lyon 6ᵉ',      location: 'Lyon · Acheter',    price: '485 000 €', views: 312, leads: 14, status: 'active',   badge: 'Exclusif' },
  { id: 2, title: 'Studio Confluence',         location: 'Lyon · Louer',      price: '850 €/mois',views: 187, leads: 8,  status: 'active',   badge: null       },
  { id: 3, title: 'Maison Croix-Rousse',       location: 'Lyon · Acheter',    price: '650 000 €', views: 98,  leads: 5,  status: 'active',   badge: 'Premium'  },
  { id: 4, title: 'Loft Design Part-Dieu',     location: 'Lyon · Louer',      price: '1 200 €/mois', views: 44, leads: 2, status: 'pending', badge: null       },
  { id: 5, title: 'T2 Villeurbanne',           location: 'Villeurbanne · Louer', price: '720 €/mois', views: 201, leads: 9, status: 'active', badge: null      },
  { id: 6, title: 'Villa Saint-Cyr',           location: 'Lyon · Acheter',    price: '1 100 000 €', views: 66, leads: 3, status: 'archived', badge: 'Prestige' },
]

const LEADS = [
  { id: 1, name: 'Marie Lefort',   property: 'T3 lumineux Lyon 6ᵉ',   date: '29 mai',    status: 'new',       phone: '+33 6 11 22 33 44', budget: '500 000 €' },
  { id: 2, name: 'Julien Arnaud',  property: 'Studio Confluence',      date: '28 mai',    status: 'active',    phone: '+33 6 55 44 33 22', budget: '900 €/mois' },
  { id: 3, name: 'Sophie Martin',  property: 'Maison Croix-Rousse',    date: '27 mai',    status: 'active',    phone: '+33 6 77 88 99 00', budget: '700 000 €' },
  { id: 4, name: 'Pierre Dubois',  property: 'T3 lumineux Lyon 6ᵉ',   date: '26 mai',    status: 'converted', phone: '+33 6 22 33 44 55', budget: '490 000 €' },
  { id: 5, name: 'Emma Rousseau',  property: 'Loft Design Part-Dieu',  date: '25 mai',    status: 'new',       phone: '+33 6 66 55 44 33', budget: '1 300 €/mois' },
  { id: 6, name: 'Lucas Bernard',  property: 'T2 Villeurbanne',        date: '24 mai',    status: 'active',    phone: '+33 6 99 88 77 66', budget: '750 €/mois' },
]

const TEAM = [
  { name: 'Claire Morin',    role: 'Directrice agence',   initials: 'CM', color: '#059669', online: true  },
  { name: 'Thomas Petit',    role: 'Négociateur senior',  initials: 'TP', color: '#3B82F6', online: true  },
  { name: 'Inès Karimov',    role: 'Assistante commerciale', initials: 'IK', color: '#8B5CF6', online: false },
  { name: 'Romain Lefebvre', role: 'Consultant location', initials: 'RL', color: '#F97316', online: true  },
]

const BILLING_PRO = [
  { date: '29 mai 2026',  desc: 'Pack Pro — mensuel',   amount: '49,90 €', status: 'Payé' },
  { date: '29 avr. 2026', desc: 'Pack Pro — mensuel',   amount: '49,90 €', status: 'Payé' },
  { date: '29 mars 2026', desc: 'Pack Pro — mensuel',   amount: '49,90 €', status: 'Payé' },
]

const CHECKLIST = [
  { label: 'Profil agence complété',       done: true  },
  { label: 'Logo et bannière ajoutés',     done: true  },
  { label: 'Vérification PASMAL obtenue',  done: true  },
  { label: 'Première annonce publiée',     done: true  },
  { label: 'Premier lead traité',          done: false },
  { label: 'Intégration CRM configurée',   done: false },
]

/* ─── Nav ─────────────────────────────────────────────────────── */

const NAV = [
  { id: 'overview',       label: 'Tableau de bord',  Icon: I.LayoutDashboard },
  { id: 'annonces',       label: 'Annonces',          Icon: I.Building        },
  { id: 'leads',          label: 'Leads',             Icon: I.Users           },
  { id: 'analytiques',    label: 'Analytiques',       Icon: I.BarChart        },
  { id: 'verification',   label: 'Vérification',      Icon: I.Shield          },
  { id: 'equipe',         label: 'Équipe',            Icon: I.Users           },
  { id: 'abonnement',     label: 'Abonnement',        Icon: I.CreditCard      },
  { id: 'parametres',     label: 'Paramètres',        Icon: I.Settings        },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

const statusConfig = {
  active:    { label: 'Active',     bg: '#ECFDF5', color: '#059669' },
  pending:   { label: 'En attente', bg: '#FFF7ED', color: '#F97316' },
  archived:  { label: 'Archivée',   bg: '#F1F5F9', color: '#64748B' },
}

const leadStatus = {
  new:       { label: 'Nouveau',   bg: '#EFF6FF', color: '#3B82F6' },
  active:    { label: 'En cours',  bg: '#FFF7ED', color: '#F97316' },
  converted: { label: 'Converti',  bg: '#ECFDF5', color: '#059669' },
}

/* ─── KPI card ────────────────────────────────────────────────── */

function KpiCard({ d, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 p-5"
      style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: d.color + '18', color: d.color }}>
          <d.Icon size={16} />
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${d.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
          {d.change >= 0 ? '+' : ''}{d.change}%
        </span>
      </div>
      <p className="text-[22px] font-extrabold text-navy-900 leading-none">{d.value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{d.label}</p>
    </motion.div>
  )
}

/* ─── Mini SVG bar chart ──────────────────────────────────────── */

function MiniBarChart({ data }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const max = Math.max(...data)
  const H = 72
  const W_BAR = 18
  const GAP = 6
  const totalW = data.length * (W_BAR + GAP) - GAP

  return (
    <div ref={ref}>
      <svg width={totalW} height={H} className="overflow-visible">
        {data.map((v, i) => {
          const h = inView ? Math.round((v / max) * H) : 0
          const x = i * (W_BAR + GAP)
          const recent = i >= data.length - 3
          return (
            <motion.rect key={i} x={x} y={H - h} width={W_BAR} height={h}
              rx={4} ry={4}
              style={{ fill: recent ? '#FB923C' : '#E2E8F0' }}
              initial={{ height: 0, y: H }} animate={inView ? { height: h, y: H - h } : {}}
              transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
            />
          )
        })}
      </svg>
    </div>
  )
}

/* ─── Section header ─────────────────────────────────────────── */

function SH({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[17px] font-extrabold text-navy-900">{title}</h2>
        {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─── Pages ─────────────────────────────────────────────────── */

function PageOverview({ onNavigate }) {
  const done = CHECKLIST.filter(c => c.done).length
  const pct = Math.round((done / CHECKLIST.length) * 100)

  return (
    <div>
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-br from-[#0B1F3A] to-[#1E3A5F] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.22), transparent 70%)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1">Agence</p>
          <h1 className="text-[20px] font-extrabold mb-0.5">{AGENCY.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1.5 text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
              <I.BadgeCheck size={11} /> Agence vérifiée
            </span>
            <span className="text-[11px] text-white/40">{AGENCY.plan} · depuis {AGENCY.since}</span>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_DATA.map((d, i) => <KpiCard key={d.label} d={d} delay={i * 0.07} />)}
      </div>

      {/* Chart + checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Views chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-bold text-navy-900">Vues des annonces</p>
              <p className="text-[11px] text-slate-400 mt-0.5">12 dernières semaines</p>
            </div>
            <button onClick={() => onNavigate('analytiques')} className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Détails <I.ArrowRight size={12} />
            </button>
          </div>
          <MiniBarChart data={CHART_DATA} />
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-orange-400" /><span className="text-[10px] text-slate-400">3 dernières sem.</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-slate-200" /><span className="text-[10px] text-slate-400">Période précédente</span></div>
          </div>
        </div>

        {/* Setup checklist */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[14px] font-bold text-navy-900">Guide de démarrage</p>
            <span className="text-[11px] font-bold text-orange-500">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 mb-4 overflow-hidden">
            <motion.div className="h-full rounded-full bg-orange-400"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
          </div>
          <ul className="space-y-2.5">
            {CHECKLIST.map((c, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${c.done ? 'bg-emerald-500' : 'border-2 border-slate-200'}`}>
                  {c.done && <I.Check size={10} className="text-white" />}
                </div>
                <p className={`text-[12px] font-medium ${c.done ? 'text-slate-400 line-through' : 'text-navy-900'}`}>{c.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent leads */}
      <SH title="Derniers leads" sub="5 leads les plus récents"
        action={
          <button onClick={() => onNavigate('leads')} className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
            Voir tout <I.ArrowRight size={13} />
          </button>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        {LEADS.slice(0, 5).map((l, i) => {
          const sc = leadStatus[l.status]
          return (
            <div key={l.id} className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/60 transition cursor-pointer`}>
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                {l.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-navy-900 truncate">{l.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{l.property}</p>
              </div>
              <span className="text-[10px] text-slate-300">{l.date}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 flex items-center justify-center transition">
                <I.Phone size={12} className="text-slate-400" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PageAnnonces() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? LISTINGS : LISTINGS.filter(l => l.status === filter)

  return (
    <div>
      <SH title="Mes annonces" sub={`${LISTINGS.length} annonces au total`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-[12px] font-semibold hover:bg-orange-600 transition">
            <I.Plus size={13} /> Nouvelle annonce
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {[
          { v: 'all',      l: `Toutes (${LISTINGS.length})` },
          { v: 'active',   l: `Actives (${LISTINGS.filter(x => x.status === 'active').length})` },
          { v: 'pending',  l: `En attente (${LISTINGS.filter(x => x.status === 'pending').length})` },
          { v: 'archived', l: `Archivées (${LISTINGS.filter(x => x.status === 'archived').length})` },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${filter === f.v ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        {filtered.map((l, i) => {
          const sc = statusConfig[l.status]
          return (
            <div key={l.id} className={`flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/60 transition`}>
              {/* Color dot */}
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sc.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-navy-900 truncate">{l.title}</p>
                  {l.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: l.badge === 'Prestige' ? '#0EA5E9' : l.badge === 'Exclusif' ? '#8B5CF6' : '#F97316' }}>
                      {l.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{l.location}</p>
              </div>
              <p className="text-[13px] font-bold text-navy-900 flex-shrink-0">{l.price}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
                <span className="flex items-center gap-1"><I.Eye size={12} />{l.views}</span>
                <span className="flex items-center gap-1"><I.Users size={12} />{l.leads}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 flex items-center justify-center transition">
                  <I.Edit size={12} className="text-slate-400" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 flex items-center justify-center transition">
                  <I.Trash size={12} className="text-slate-400" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PageLeads() {
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' ? LEADS : LEADS.filter(l => l.status === filterStatus)

  return (
    <div className="flex gap-5">
      {/* List */}
      <div className="flex-1 min-w-0">
        <SH title="Leads reçus" sub={`${LEADS.length} leads ce mois`} />

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { v: 'all',       l: 'Tous'       },
            { v: 'new',       l: 'Nouveaux'   },
            { v: 'active',    l: 'En cours'   },
            { v: 'converted', l: 'Convertis'  },
          ].map(f => (
            <button key={f.v} onClick={() => setFilterStatus(f.v)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition ${filterStatus === f.v ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {f.l}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          {filtered.map((l, i) => {
            const sc = leadStatus[l.status]
            const active = selected?.id === l.id
            return (
              <div key={l.id} onClick={() => setSelected(active ? null : l)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition ${i < filtered.length - 1 ? 'border-b border-slate-100' : ''} ${active ? 'bg-orange-50/60' : 'hover:bg-slate-50/60'}`}>
                <div className="w-9 h-9 rounded-xl bg-navy-900 text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {l.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-navy-900">{l.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{l.property}</p>
                </div>
                <span className="text-[11px] text-slate-300 flex-shrink-0">{l.date}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="w-64 flex-shrink-0 bg-white rounded-2xl border border-slate-100 p-5 h-fit sticky top-20"
            style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Détail lead</p>
              <button onClick={() => setSelected(null)}>
                <I.X size={13} className="text-slate-400" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white text-[15px] font-extrabold flex items-center justify-center mb-3">
              {selected.name.split(' ').map(w => w[0]).join('')}
            </div>
            <p className="text-[15px] font-extrabold text-navy-900">{selected.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{selected.property}</p>

            <div className="mt-4 space-y-2.5">
              {[
                { Icon: I.Phone,   label: 'Téléphone', value: selected.phone   },
                { Icon: I.Tag,     label: 'Budget',    value: selected.budget  },
                { Icon: I.Calendar,label: 'Date',      value: selected.date    },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <row.Icon size={12} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{row.label}</p>
                    <p className="text-[12px] font-semibold text-navy-900">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <button className="w-full h-9 rounded-xl bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                <I.Phone size={13} /> Appeler
              </button>
              <button className="w-full h-9 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <I.Send size={13} /> Envoyer un message
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

function PageAnalytiques() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const viewsData = [1200, 1450, 1380, 1900, 2100, 2400, 2250, 2800, 2950, 3200, 3600, 4812]
  const leadsData = [22, 28, 24, 35, 42, 55, 48, 62, 68, 82, 96, 127]
  const maxViews = Math.max(...viewsData)
  const H = 140

  return (
    <div ref={ref}>
      <SH title="Analytiques" sub="Performance de l'agence sur 12 mois" />

      {/* Views chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[14px] font-bold text-navy-900">Vues des annonces</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total 2026 · 12 mois glissants</p>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-extrabold text-navy-900">4 812</p>
            <p className="text-[11px] text-emerald-500 font-semibold">↑ +18% vs. période préc.</p>
          </div>
        </div>

        <svg width="100%" height={H + 28} viewBox={`0 0 ${months.length * 54} ${H + 28}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t} x1={0} y1={t * H} x2={months.length * 54} y2={t * H}
              stroke="#F1F5F9" strokeWidth={1} />
          ))}

          {/* Bars */}
          {viewsData.map((v, i) => {
            const h = inView ? Math.round((v / maxViews) * H) : 0
            const x = i * 54 + 10
            const recent = i === viewsData.length - 1
            return (
              <g key={i}>
                <motion.rect x={x} y={H - h} width={34} height={h} rx={5} ry={5}
                  style={{ fill: recent ? '#FB923C' : '#EFF6FF' }}
                  initial={{ height: 0, y: H }} animate={inView ? { height: h, y: H - h } : {}}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
                <text x={x + 17} y={H + 18} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="sans-serif">{months[i]}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Leads chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[14px] font-bold text-navy-900">Leads reçus</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Évolution mensuelle</p>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-extrabold text-navy-900">127</p>
            <p className="text-[11px] text-emerald-500 font-semibold">↑ +32% vs. mois préc.</p>
          </div>
        </div>

        <svg width="100%" height={H + 28} viewBox={`0 0 ${months.length * 54} ${H + 28}`} className="overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t} x1={0} y1={t * H} x2={months.length * 54} y2={t * H} stroke="#F1F5F9" strokeWidth={1} />
          ))}
          {leadsData.map((v, i) => {
            const maxL = Math.max(...leadsData)
            const h = inView ? Math.round((v / maxL) * H) : 0
            const x = i * 54 + 10
            return (
              <g key={i}>
                <motion.rect x={x} y={H - h} width={34} height={h} rx={5} ry={5}
                  style={{ fill: '#10B98133' }}
                  initial={{ height: 0, y: H }} animate={inView ? { height: h, y: H - h } : {}}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
                <motion.rect x={x} y={H - h} width={34} height={Math.min(h, 4)} rx={2} ry={2}
                  style={{ fill: '#10B981' }}
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.05 + 0.6 }}
                />
                <text x={x + 17} y={H + 18} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="sans-serif">{months[i]}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Top listings */}
      <SH title="Meilleures annonces" sub="Par nombre de vues" />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        {LISTINGS.filter(l => l.status === 'active').sort((a, b) => b.views - a.views).map((l, i) => (
          <div key={l.id} className={`flex items-center gap-4 px-5 py-4 ${i < 3 ? 'border-b border-slate-100' : ''}`}>
            <p className="text-[13px] font-extrabold text-slate-200 w-5 text-center">{i + 1}</p>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-navy-900 truncate">{l.title}</p>
              <p className="text-[11px] text-slate-400">{l.location}</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-slate-400">
              <span className="flex items-center gap-1.5"><I.Eye size={13} /> {l.views} vues</span>
              <span className="flex items-center gap-1.5"><I.Users size={13} /> {l.leads} leads</span>
            </div>
            {/* Mini bar */}
            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div className="h-full rounded-full bg-blue-400"
                initial={{ width: 0 }} animate={inView ? { width: `${(l.views / 312) * 100}%` } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageVerification() {
  return (
    <div>
      <SH title="Vérification PASMAL" sub="Statut de certification de votre agence" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <VerificationStatusCard
          status="verified"
          agencyName="Foncia Premium Lyon"
          submittedAt="2026-01-10"
          score={83}
          documents={[
            { id: 'kbis',        label: 'Extrait Kbis (< 3 mois)',    status: 'ok'      },
            { id: 'id',          label: "Pièce d'identité",           status: 'ok'      },
            { id: 'attestation', label: "Attestation d'assurance RC", status: 'ok'      },
            { id: 'mandat',      label: 'Mandat de gestion locative', status: 'ok'      },
          ]}
        />
        <AgencyTrustScore dark={false} />
      </div>
    </div>
  )
}

function PageEquipe() {
  return (
    <div>
      <SH title="Équipe" sub={`${TEAM.length} membres`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-[12px] font-semibold hover:bg-orange-600 transition">
            <I.Plus size={13} /> Inviter
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEAM.map(m => (
          <div key={m.name} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-xl text-white text-[14px] font-extrabold flex items-center justify-center"
                style={{ background: m.color }}>{m.initials}</div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${m.online ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-navy-900 truncate">{m.name}</p>
              <p className="text-[11px] text-slate-400">{m.role}</p>
              <p className="text-[10px] mt-0.5" style={{ color: m.online ? '#10B981' : '#94A3B8' }}>
                {m.online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 flex items-center justify-center transition">
                <I.Send size={12} className="text-slate-400" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition">
                <I.Settings size={12} className="text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageAbonnement() {
  return (
    <div>
      <SH title="Abonnement Pro" />

      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#1E3A5F] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.22), transparent 70%)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1">Forfait actif</p>
          <h3 className="text-[22px] font-extrabold mb-0.5">Pack Pro</h3>
          <p className="text-[28px] font-extrabold"><span className="text-orange-400">49,90 €</span><span className="text-[14px] text-white/60">/mois</span></p>
          <p className="text-[11px] text-white/40 mt-1">Renouvellement le 29 juin 2026</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Annonces illimitées', 'Leads prioritaires', 'Badge vérifié', 'Stats avancées', 'API CRM', 'Support dédié'].map(f => (
              <span key={f} className="flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
                <I.Check size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade to premium */}
      <div className="flex items-center gap-4 p-5 bg-orange-50 border border-orange-100 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <I.Zap size={18} className="text-orange-500" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-navy-900">Passez au Pack Premium Agence</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Accès multi-agences, tableau de bord équipe, CRM avancé et reporting mensuel.</p>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white text-[12px] font-bold rounded-xl hover:bg-orange-600 transition flex-shrink-0">
          Mettre à niveau
        </button>
      </div>

      <SH title="Historique de facturation" />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        {BILLING_PRO.map((b, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < BILLING_PRO.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <I.FileText size={13} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-navy-900">{b.desc}</p>
              <p className="text-[11px] text-slate-400">{b.date}</p>
            </div>
            <p className="text-[13px] font-bold text-navy-900">{b.amount}</p>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{b.status}</span>
            <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition">
              <I.Download size={12} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageParametres() {
  return (
    <div className="max-w-lg">
      <SH title="Paramètres de l'agence" />

      {/* Agency info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Informations agence</p>
        <div className="space-y-4">
          {[
            { label: 'Nom de l\'agence', value: 'Foncia Premium Lyon' },
            { label: 'SIRET',            value: '82 394 710 000 28'   },
            { label: 'Email de contact', value: 'contact@foncia-lyon.fr' },
            { label: 'Téléphone',        value: '+33 4 72 00 00 00'   },
            { label: 'Site web',         value: 'www.foncia-lyon.fr'  },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input type="text" defaultValue={f.value}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] text-navy-900 font-semibold focus:outline-none focus:border-orange-400 transition bg-white" />
            </div>
          ))}
        </div>
        <button className="mt-5 h-11 px-6 rounded-xl bg-navy-900 text-white text-[13px] font-bold hover:bg-navy-800 transition">
          Enregistrer les modifications
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Notifications</p>
        {[
          { label: 'Nouveaux leads par email',       on: true  },
          { label: 'Nouveaux leads par SMS',         on: false },
          { label: 'Rapport hebdomadaire',           on: true  },
          { label: 'Alertes de vues d\'annonces',   on: true  },
        ].map((n, i) => (
          <div key={i} className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
            <p className="text-[13px] font-medium text-navy-900">{n.label}</p>
            <button className={`w-10 h-5.5 rounded-full relative transition-colors ${n.on ? 'bg-orange-500' : 'bg-slate-200'}`}
              style={{ width: 40, height: 22 }}>
              <motion.div animate={{ x: n.on ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── ProfessionalDashboard ─────────────────────────────────────── */

export default function ProfessionalDashboard({ onExit }) {
  const [view, setView] = useState('overview')

  const pages = {
    overview:     <PageOverview onNavigate={setView} />,
    annonces:     <PageAnnonces />,
    leads:        <PageLeads />,
    analytiques:  <PageAnalytiques />,
    verification: <PageVerification />,
    equipe:       <PageEquipe />,
    abonnement:   <PageAbonnement />,
    parametres:   <PageParametres />,
  }

  const newLeads = LEADS.filter(l => l.status === 'new').length

  return (
    <div className="fixed inset-0 z-[120] bg-[#F8FAFC] flex overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-[#0B1F3A] h-full"
        style={{ boxShadow: '4px 0 24px rgba(11,31,58,0.18)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
              <I.Building size={15} className="text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-[14px]">PAS<span className="text-orange-400">MAL</span></span>
              <p className="text-[9px] text-white/40 uppercase tracking-widest leading-none mt-0.5">Pro</p>
            </div>
          </div>
          <button onClick={onExit} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
            <I.X size={13} className="text-white/70" />
          </button>
        </div>

        {/* Agency chip */}
        <div className="mx-4 mt-2 mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">FP</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">Foncia Premium</p>
              <div className="flex items-center gap-1 mt-0.5">
                <I.BadgeCheck size={9} className="text-emerald-400" />
                <p className="text-[9px] text-emerald-400">Vérifié</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const active = view === id
            return (
              <button key={id} onClick={() => setView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-semibold transition relative ${active ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white'}`}
                style={!active ? { ':hover': { background: 'rgba(255,255,255,0.08)' } } : {}}>
                {active && <motion.div layoutId="pro-nav-pill" className="absolute inset-0 rounded-xl bg-orange-500" style={{ zIndex: -1 }} />}
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {id === 'leads' && newLeads > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {newLeads}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 pt-2 border-t border-white/10 mt-2">
          <button onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 hover:text-white transition">
            <I.LogOut size={15} /> Retour à l'accueil
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-8 h-14 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-400">
            {NAV.find(n => n.id === view)?.label}
          </p>
          <div className="flex items-center gap-3">
            <button className="h-9 px-4 rounded-xl bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600 transition flex items-center gap-2">
              <I.Plus size={13} /> Nouvelle annonce
            </button>
            <button className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 transition">
              <I.Bell size={15} className="text-slate-500" />
              {newLeads > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#F8FAFC]" />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-600 text-[11px] font-extrabold flex items-center justify-center">FP</div>
          </div>
        </div>

        {/* Page */}
        <div className="px-6 md:px-8 py-7 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              {pages[view]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
