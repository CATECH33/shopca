import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { I, KpiCard, Button, Avatar, Badge } from '../lib/ui.jsx'

const viewsData = [
  { day: 'Lun', views: 1240, leads: 14 },
  { day: 'Mar', views: 1380, leads: 18 },
  { day: 'Mer', views: 1190, leads: 11 },
  { day: 'Jeu', views: 1620, leads: 23 },
  { day: 'Ven', views: 1980, leads: 31 },
  { day: 'Sam', views: 2240, leads: 28 },
  { day: 'Dim', views: 1810, leads: 19 },
]

const sourceData = [
  { name: 'Recherche', value: 48 },
  { name: 'Direct', value: 22 },
  { name: 'Réseaux', value: 18 },
  { name: 'Partenaires', value: 12 },
]
const SOURCE_COLORS = ['#FF6B00', '#0B1F3A', '#FB923C', '#94A3B8']

const activity = [
  { who: 'Camille Lefèvre', what: 'a contacté l\'annonce', target: 'Studio Bastille', time: 'Il y a 4 min', icon: I.Mail, tone: 'orange' },
  { who: 'Julien Moreau', what: 'a planifié une visite', target: 'T3 Lyon Foch', time: 'Il y a 22 min', icon: I.Calendar, tone: 'indigo' },
  { who: 'SHOPCA Trust', what: 'a vérifié l\'annonce', target: 'Maison Bordeaux', time: 'Il y a 1h', icon: I.Shield, tone: 'emerald' },
  { who: 'Sofia Benali', what: 'a marqué en favori', target: 'Villa Nice', time: 'Il y a 3h', icon: I.Heart, tone: 'rose' },
  { who: 'Stripe', what: 'a encaissé', target: 'Pack Visibilité — 49 €', time: 'Hier', icon: I.CreditCard, tone: 'navy' },
]

const checklist = [
  { label: 'Vérifier mon e-mail', done: true },
  { label: 'Compléter mon profil', done: true },
  { label: 'Publier ma première annonce', done: true },
  { label: 'Activer la vérification téléphone', done: false },
  { label: 'Connecter Stripe pour encaisser', done: false },
]

export default function Overview() {
  const done = checklist.filter(c => c.done).length
  const pct = Math.round((done / checklist.length) * 100)

  return (
    <div className="space-y-6">
      {/* Greeting + quick actions */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Tableau de bord</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Bonjour Jean Kevin 👋</h1>
          <p className="text-slate-600 mt-1 text-sm">Voici ce qui s'est passé sur vos annonces cette semaine.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><I.Download size={14}/> Exporter</Button>
          <Button as={Link} to="/app/listings/new" size="sm"><I.Plus size={14}/> Nouvelle annonce</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={I.Eye} label="Vues totales (7j)" value={12480} trend="up" trendValue="+18%" />
        <KpiCard icon={I.Building} label="Annonces actives" value={14} trend="up" trendValue="+2" />
        <KpiCard icon={I.Users} label="Leads reçus" value={144} trend="up" trendValue="+24%" />
        <KpiCard icon={I.TrendingUp} label="Taux de conversion" value={3.8} suffix="%" trend="down" trendValue="-0.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft"
        >
          <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="font-bold text-navy-900">Vues & leads</div>
              <div className="text-xs text-slate-500">7 derniers jours</div>
            </div>
            <div className="flex items-center gap-1">
              {['7j','30j','90j'].map((p, i) => (
                <button key={p} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${i===0 ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B1F3A" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#0B1F3A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0B1F3A', color: '#fff', borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Area type="monotone" dataKey="views" stroke="#FF6B00" strokeWidth={2.5} fill="url(#gViews)" />
                <Area type="monotone" dataKey="leads" stroke="#0B1F3A" strokeWidth={2.5} fill="url(#gLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sources pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft"
        >
          <div className="font-bold text-navy-900">Sources de trafic</div>
          <div className="text-xs text-slate-500 mb-4">Répartition des visiteurs</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} stroke="#fff" strokeWidth={3}>
                  {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0B1F3A', color: '#fff', borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[i] }} />
                  <span className="text-slate-700">{s.name}</span>
                </div>
                <span className="font-bold text-navy-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft"
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="font-bold text-navy-900">Activité récente</div>
              <div className="text-xs text-slate-500">Tout ce qui se passe sur vos annonces</div>
            </div>
            <Link to="#" className="text-xs font-semibold text-orange-600 hover:underline">Tout voir</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {activity.map((a, i) => {
              const Icon = a.icon
              const toneClasses = {
                orange: 'bg-orange-50 text-orange-600',
                indigo: 'bg-indigo-50 text-indigo-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                rose: 'bg-rose-50 text-rose-600',
                navy: 'bg-navy-50 text-navy-900',
              }[a.tone]
              return (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className={`w-10 h-10 rounded-xl ${toneClasses} flex items-center justify-center shrink-0`}>
                    <Icon size={16}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-navy-900"><span className="font-semibold">{a.who}</span> {a.what} <span className="font-semibold">{a.target}</span></div>
                    <div className="text-xs text-slate-500">{a.time}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.div>

        {/* Onboarding checklist + trust score */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-navy-900">Onboarding</div>
              <Badge tone="orange">{done}/{checklist.length}</Badge>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4">
              <div className="bg-orange-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.label} className={`flex items-center gap-2.5 text-sm ${c.done ? 'text-slate-400 line-through' : 'text-navy-900'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                    {c.done && <I.Check size={11}/>}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-600/30 blur-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <I.Shield size={16} className="text-orange-400" />
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-300">Trust Score</div>
            </div>
            <div className="text-4xl font-extrabold">94<span className="text-xl text-white/60">/100</span></div>
            <div className="text-white/70 text-sm mt-1">Profil de confiance excellent</div>
            <div className="mt-4 space-y-1.5 text-xs text-white/80">
              <div className="flex items-center gap-2"><I.Check size={12} className="text-emerald-400"/> KYC validé</div>
              <div className="flex items-center gap-2"><I.Check size={12} className="text-emerald-400"/> Téléphone vérifié</div>
              <div className="flex items-center gap-2 opacity-50"><I.Check size={12}/> Stripe Connect (à activer)</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
