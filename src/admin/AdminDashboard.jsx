import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { I, Counter, Button, Avatar, Badge } from '../lib/ui.jsx'

/* ============================================================
   Super Admin — Dashboard Overview
   - Theme-agnostic (uses text-current / bg-current/* tricks)
   - Reuses AdminLayout (parent renders <AdminDashboard /> as child)
   - Mock data only, no API
   ============================================================ */

const u = (id, w = 240) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const KPIS = [
  { id: 'revenue',   icon: I.CreditCard,    label: 'Revenus totaux',       value: 142580, suffix: ' €', trend: +18, trendUnit: '%', color: 'orange',  hint: 'Encaissements 30 j' },
  { id: 'users',     icon: I.Users,         label: 'Utilisateurs actifs',  value: 8412,                 trend: +24, trendUnit: '%', color: 'indigo',  hint: 'Connectés cette semaine' },
  { id: 'listings',  icon: I.Building,      label: 'Annonces actives',     value: 1248,                 trend: +12, trendUnit: '%', color: 'emerald', hint: 'Live sur la marketplace' },
  { id: 'premium',   icon: I.Sparkles,      label: 'Abonnements premium',  value: 384,                  trend: +9,  trendUnit: '%', color: 'orange',  hint: 'Pack Visibilité + Premium' },
  { id: 'agencies',  icon: I.Briefcase,     label: 'Agences actives',      value: 142,                  trend: +3,  trendUnit: '%', color: 'navy',    hint: '14 en attente de validation' },
  { id: 'fraud',     icon: I.Shield,        label: 'Alertes fraude',       value: 7,                    trend: -2,  trendUnit: '',  color: 'rose',    hint: 'Cette semaine — bon trend',  alarm: true },
]

const ACTIVITY = [
  { id: 'a1', actor: 'SHOPCA Trust',  action: 'a bloqué l\'annonce',     target: 'PSM-2418 (Lille)',      icon: I.Shield,     tone: 'rose',     time: 'Il y a 3 min' },
  { id: 'a2', actor: 'Camille L.',     action: 'a contacté',              target: 'Studio Bastille',       icon: I.Mail,       tone: 'orange',   time: 'Il y a 8 min' },
  { id: 'a3', actor: 'BARNES Lyon',    action: 'a soumis son Kbis',       target: 'Dossier #PSM-AG-204',   icon: I.FileText,   tone: 'indigo',   time: 'Il y a 14 min' },
  { id: 'a4', actor: 'Stripe',         action: 'a encaissé',              target: 'Pack Visibilité — 9,90 €', icon: I.CreditCard, tone: 'emerald',  time: 'Il y a 22 min' },
  { id: 'a5', actor: 'Julien M.',      action: 'a publié',                target: 'T3 Lyon Foch (Premium)',icon: I.Plus,       tone: 'orange',   time: 'Il y a 41 min' },
  { id: 'a6', actor: 'SHOPCA IA',      action: 'a détecté un duplicate',  target: '94% avec PSM-2401',     icon: I.Sparkles,   tone: 'rose',     time: 'Il y a 1h' },
  { id: 'a7', actor: 'Sofia B.',       action: 'a activé Premium',        target: 'Villa Aix-en-Provence', icon: I.Star,       tone: 'orange',   time: 'Il y a 2h' },
  { id: 'a8', actor: 'Foncia Premium', action: 'a invité 3 agents',       target: 'Équipe Paris Centre',   icon: I.Users,      tone: 'indigo',   time: 'Hier' },
]

const LISTINGS = [
  { id: 'PSM-2419', title: 'Loft industriel Joliette',        city: 'Marseille',     price: 690000, status: 'live',  agency: 'Engel & Völkers',   img: u('photo-1493809842364-78817add7ffb') },
  { id: 'PSM-2418', title: 'Appartement haussmannien',        city: 'Paris 8ᵉ',    price: 1250000,status: 'pending',agency: 'BARNES',            img: u('photo-1600585154340-be6161a56a0c') },
  { id: 'PSM-2417', title: 'T2 Capitole',                     city: 'Toulouse',      price: 245000, status: 'live',  agency: 'Particulier',       img: u('photo-1554995207-c18c203602cb') },
  { id: 'PSM-2416', title: 'Villa avec piscine',              city: 'Aix-en-Provence',price: 1850000,status: 'live',  agency: 'BARNES Premium',    img: u('photo-1613490493576-7fde63acd811') },
  { id: 'PSM-2415', title: 'Coloc design 4 ch.',              city: 'Nantes',        price: 590,    status: 'live',  agency: 'Particulier',       img: u('photo-1522708323590-d24dbb6b0267') },
]

const PENDING = [
  { id: 'AG-204', name: 'BARNES Lyon',       type: 'Kbis + KYC',    days: 1, urgent: false },
  { id: 'AG-203', name: 'Sotheby\'s Bordeaux', type: 'Kbis',          days: 2, urgent: false },
  { id: 'AG-202', name: 'Foncia Antibes',    type: 'KYC dirigeant', days: 4, urgent: true },
  { id: 'AG-201', name: 'Century 21 Nice',   type: 'Kbis (expiré)', days: 6, urgent: true },
]

const PAYMENTS = [
  { id: 'tx_1A2', label: 'Pack Visibilité',     customer: 'Camille Lefèvre',   amount: 9.90,   time: 'Il y a 8 min',  status: 'paid' },
  { id: 'tx_2B7', label: 'Premium',             customer: 'Julien Moreau',     amount: 14.90,  time: 'Il y a 22 min', status: 'paid' },
  { id: 'tx_3C1', label: 'Remonter en tête',    customer: 'Sofia Benali',      amount: 4.90,   time: 'Il y a 1h',     status: 'paid' },
  { id: 'tx_4D9', label: 'Abonnement Pro',      customer: 'Foncia Premium',    amount: 129.00, time: 'Il y a 3h',     status: 'paid' },
  { id: 'tx_5E4', label: 'Abonnement Enterprise',customer: 'BARNES Premium',   amount: 399.00, time: 'Hier',          status: 'refunded' },
]

/* Theme-agnostic color helpers (works on white or navy backgrounds) */
const colorBubble = {
  orange:  'bg-orange-500/15 text-orange-500',
  indigo:  'bg-indigo-500/15 text-indigo-500',
  emerald: 'bg-emerald-500/15 text-emerald-500',
  rose:    'bg-rose-500/15 text-rose-500',
  navy:    'bg-current/10 text-current',
}

const RANGES = [['7d', '7j'], ['30d', '30j'], ['90d', '90j']]

export default function AdminDashboard() {
  const [range, setRange] = useState('30d')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Pilotage</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Vue d'ensemble plateforme</h1>
          <p className="opacity-60 mt-1 text-sm">Indicateurs clés temps réel — au {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-1 rounded-full border border-current/10 bg-current/[0.03]">
            {RANGES.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setRange(k)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition ${range === k ? 'bg-orange-500 text-white shadow-soft' : 'opacity-60 hover:opacity-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm"><I.Download size={14}/> Exporter</Button>
        </div>
      </div>

      {/* KPI grid */}
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
      >
        {KPIS.map((k) => <KpiCardAdmin key={k.id} k={k}/>)}
      </motion.div>

      {/* Activity (wide) + Pending verifications (sidebar) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel className="xl:col-span-2" title="Activité récente" subtitle="Tout ce qui se passe sur la plateforme" action="Tout voir">
          <ul className="divide-y divide-current/10">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.03 }}
                  className="flex items-center gap-3 py-3"
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorBubble[a.tone]}`}>
                    <Icon size={15}/>
                  </span>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-semibold">{a.actor}</span>
                    <span className="opacity-65"> {a.action} </span>
                    <span className="font-semibold">{a.target}</span>
                  </div>
                  <span className="text-[11px] opacity-50 shrink-0 hidden md:inline">{a.time}</span>
                </motion.li>
              )
            })}
          </ul>
        </Panel>

        <Panel title="Vérifications en attente" subtitle={`${PENDING.length} dossiers à examiner`} accent>
          <ul className="space-y-2.5">
            {PENDING.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
                className="rounded-2xl p-3 bg-current/[0.04] border border-current/10 flex items-center gap-3"
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.urgent ? colorBubble.rose : colorBubble.indigo}`}>
                  <I.FileText size={14}/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-[11px] opacity-60 truncate">{p.type} · {p.days}j en attente</div>
                </div>
                {p.urgent && (
                  <Badge tone="rose">Urgent</Badge>
                )}
                <button
                  className="shrink-0 w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                  title="Examiner"
                >
                  <I.ArrowRight size={14}/>
                </button>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Latest listings + Recent payments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel className="xl:col-span-2" title="Dernières annonces" subtitle="Catalogue mis à jour en continu" action="Voir le catalogue">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LISTINGS.slice(0, 5).map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.04 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-current/[0.04] border border-current/10 overflow-hidden hover:bg-current/[0.06] transition cursor-pointer"
              >
                <div className="relative aspect-[5/3] overflow-hidden">
                  <img src={l.img} alt={l.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"/>
                  <div className="absolute top-2 right-2">
                    {l.status === 'live' ? <Badge tone="emerald">Live</Badge> : <Badge tone="amber">En attente</Badge>}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-mono opacity-50 truncate">{l.id}</div>
                  <div className="text-sm font-semibold truncate">{l.title}</div>
                  <div className="text-[11px] opacity-60 truncate flex items-center gap-1"><I.MapPin size={10}/> {l.city}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] opacity-60 truncate">{l.agency}</span>
                    <span className="text-sm font-extrabold">{l.price.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Derniers paiements" subtitle="Flux Stripe Connect">
          <ul className="space-y-2.5">
            {PAYMENTS.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.04 }}
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-current/[0.04] transition"
              >
                <Avatar name={p.customer} size={32}/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.label}</div>
                  <div className="text-[11px] opacity-60 truncate">{p.customer} · {p.time}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-extrabold ${p.status === 'refunded' ? 'line-through opacity-50' : ''}`}>
                    {p.amount.toFixed(2).replace('.', ',')} €
                  </div>
                  {p.status === 'refunded'
                    ? <span className="text-[10px] font-semibold text-rose-500">Remboursé</span>
                    : <span className="text-[10px] font-semibold text-emerald-500">Encaissé</span>}
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-xs">
            <span className="opacity-60">Total 24h</span>
            <span className="font-extrabold">+ 4 870 €</span>
          </div>
        </Panel>
      </div>
    </motion.div>
  )
}

/* ============================================================
   KPI card (theme-agnostic)
   ============================================================ */
function KpiCardAdmin({ k }) {
  const positive = k.trend >= 0
  const Icon = k.icon
  const trendOk = k.alarm ? !positive : positive
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl p-4 lg:p-5 bg-current/[0.04] border border-current/10 hover:bg-current/[0.06] transition overflow-hidden"
    >
      {k.alarm && k.value > 0 && (
        <span className="absolute top-3 right-3 flex">
          <span className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 opacity-60 animate-ping"/>
          <span className="relative w-2 h-2 rounded-full bg-rose-500"/>
        </span>
      )}
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorBubble[k.color]}`}>
          <Icon size={16}/>
        </span>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 ${trendOk ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {positive ? <I.TrendingUp size={10}/> : <I.TrendingDown size={10}/>}
          {positive ? '+' : ''}{k.trend}{k.trendUnit}
        </div>
      </div>
      <div className="text-2xl lg:text-[26px] font-extrabold tracking-tight leading-none">
        <Counter to={k.value} suffix={k.suffix || ''}/>
      </div>
      <div className="text-[12px] opacity-60 mt-1.5">{k.label}</div>
      {k.hint && <div className="text-[10px] opacity-40 mt-1 truncate">{k.hint}</div>}
    </motion.div>
  )
}

/* ============================================================
   Panel — reusable section wrapper
   ============================================================ */
function Panel({ title, subtitle, action, accent = false, children, className = '' }) {
  return (
    <section className={`rounded-3xl border p-5 lg:p-6 ${accent ? 'border-orange-500/30 bg-orange-500/[0.04]' : 'border-current/10 bg-current/[0.03]'} ${className}`}>
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="font-bold text-base">{title}</div>
          {subtitle && <div className="text-[11px] opacity-60 mt-0.5">{subtitle}</div>}
        </div>
        {action && (
          <button className="text-[11px] font-semibold text-orange-500 hover:underline inline-flex items-center gap-0.5">
            {action} <I.ArrowRight size={11}/>
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
