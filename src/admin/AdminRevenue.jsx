import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { I, Counter, Button, Avatar, Badge } from '../lib/ui.jsx'
import { PasmalCheckbox } from '../components/ui/PasmalCheckbox'

/* ============================================================
   Super Admin — Revenue Analytics (Stripe-style)
   - Standalone: <AdminRevenue /> can be dropped inside AdminLayout
   - Recharts + theme-agnostic palette
   - Mock data only
   ============================================================ */

/* 12 months of revenue split by stream */
const REVENUE_12M = [
  { month: 'Juin', subs: 18420, boost: 3210,  prev: 14210 },
  { month: 'Juil',  subs: 21540, boost: 3680,  prev: 16820 },
  { month: 'Août', subs: 22980, boost: 4120,  prev: 18420 },
  { month: 'Sept', subs: 24310, boost: 4580,  prev: 19920 },
  { month: 'Oct',  subs: 26120, boost: 5240,  prev: 21080 },
  { month: 'Nov',  subs: 27890, boost: 5680,  prev: 23210 },
  { month: 'Déc',  subs: 29840, boost: 6110,  prev: 24980 },
  { month: 'Janv', subs: 30420, boost: 5890,  prev: 25890 },
  { month: 'Fév',  subs: 32480, boost: 6420,  prev: 27420 },
  { month: 'Mars', subs: 34110, boost: 7180,  prev: 28810 },
  { month: 'Avr',  subs: 36420, boost: 7980,  prev: 30240 },
  { month: 'Mai',  subs: 38920, boost: 8410,  prev: 32480 },
]

const SUBS_GROWTH = [
  { m: 'Juin', new: 42, cancelled: 8,  net: 34 },
  { m: 'Juil', new: 58, cancelled: 11, net: 47 },
  { m: 'Août',new: 71, cancelled: 14, net: 57 },
  { m: 'Sept',new: 84, cancelled: 12, net: 72 },
  { m: 'Oct', new: 92, cancelled: 18, net: 74 },
  { m: 'Nov', new: 102,cancelled: 16, net: 86 },
  { m: 'Déc', new: 118,cancelled: 21, net: 97 },
  { m: 'Janv',new: 134,cancelled: 24, net: 110 },
  { m: 'Fév', new: 142,cancelled: 22, net: 120 },
  { m: 'Mars',new: 158,cancelled: 28, net: 130 },
  { m: 'Avr', new: 174,cancelled: 26, net: 148 },
  { m: 'Mai', new: 192,cancelled: 31, net: 161 },
]

const BOOSTS_12M = REVENUE_12M.map((r, i) => ({
  m: r.month,
  amount: r.boost,
  count: Math.round(r.boost / (4.9 + (i * 0.02))),
}))

const METHODS = [
  { method: 'Carte bancaire',    value: 78, color: '#FF6B00' },
  { method: 'SEPA Direct Debit', value: 14, color: '#0B1F3A' },
  { method: 'Apple Pay',         value: 6,  color: '#FB923C' },
  { method: 'Google Pay',        value: 2,  color: '#94A3B8' },
]

const RECENT_PAYMENTS = [
  { id: 'pi_1a2b3c4', customer: 'Camille Lefèvre',  email: 'camille@…', amount: 9.90,   method: 'CB',   status: 'succeeded',  time: 'Il y a 8 min' },
  { id: 'pi_4d5e6f7', customer: 'Foncia Premium',   email: 'billing@foncia.fr', amount: 129.00, method: 'SEPA', status: 'succeeded',  time: 'Il y a 22 min' },
  { id: 'pi_7g8h9i0', customer: 'Sofia Benali',     email: 'sofia@…',  amount: 14.90,  method: 'CB',   status: 'succeeded',  time: 'Il y a 1h' },
  { id: 'pi_2j3k4l5', customer: 'BARNES Premium',   email: 'billing@barnes.com', amount: 399.00, method: 'SEPA', status: 'refunded',   time: 'Il y a 3h' },
  { id: 'pi_8m9n0p1', customer: 'Julien Moreau',    email: 'julien@…', amount: 4.90,   method: 'AP',   status: 'succeeded',  time: 'Il y a 5h' },
  { id: 'pi_q2r3s4t', customer: 'Inès Martin',      email: 'ines@…',   amount: 49.00,  method: 'CB',   status: 'failed',     time: 'Hier' },
]

const RANGES = [['7d', '7j'], ['30d', '30j'], ['90d', '3M'], ['12m', '12M']]

const fmtEUR = (n) => n.toLocaleString('fr-FR') + ' €'
const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)} k` : n)

export default function AdminRevenue() {
  const [range, setRange] = useState('12m')
  const [compare, setCompare] = useState(true)

  const totals = useMemo(() => {
    const ca = REVENUE_12M.reduce((s, r) => s + r.subs + r.boost, 0)
    const prev = REVENUE_12M.reduce((s, r) => s + r.prev, 0)
    const subs = REVENUE_12M.reduce((s, r) => s + r.subs, 0)
    const boost = REVENUE_12M.reduce((s, r) => s + r.boost, 0)
    const mrr = REVENUE_12M[REVENUE_12M.length - 1].subs
    const arpu = ca / 8412 // total active users
    return { ca, prev, subs, boost, mrr, arpu, growth: Math.round(((ca - prev) / prev) * 100) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Revenu</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Revenue analytics</h1>
          <p className="opacity-60 mt-1 text-sm">Flux financiers en temps réel — abonnements, boosts, méthodes de paiement.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PasmalCheckbox
            checked={compare}
            onChange={setCompare}
            label="Comparer N-1"
            dark
            className="text-[11px] font-semibold opacity-70"
          />
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
          <Button variant="outline" size="sm"><I.Download size={14}/> Exporter CSV</Button>
        </div>
      </div>

      {/* KPI strip */}
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KpiTile icon={I.CreditCard}  label="Revenus totaux"        value={totals.ca}    suffix=" €" trend={totals.growth} sub="vs N-1" tone="orange"/>
        <KpiTile icon={I.TrendingUp}  label="MRR (M en cours)"      value={totals.mrr}   suffix=" €" trend={+24}            sub="abonnements actifs" tone="emerald"/>
        <KpiTile icon={I.Zap}         label="Revenus boost"         value={totals.boost} suffix=" €" trend={+18}            sub="à la carte" tone="indigo"/>
        <KpiTile icon={I.Users}       label="ARPU"                   value={totals.arpu}  suffix=" €" trend={+4}             sub="revenu / utilisateur" tone="navy" decimals={2}/>
      </motion.div>

      {/* Main revenue chart (stacked area) */}
      <Panel
        title="Évolution des revenus"
        subtitle="Abonnements + boost à la carte, comparé à l'année précédente"
        action="Voir le détail"
      >
        {/* Big totals line */}
        <div className="flex items-baseline gap-6 mb-4 flex-wrap">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              <Counter to={totals.ca} suffix=" €"/>
            </div>
            <div className="text-xs opacity-50 mt-0.5">Cumul {RANGES.find(r => r[0] === range)?.[1] || range}</div>
          </div>
          <Badge tone={totals.growth >= 0 ? 'emerald' : 'rose'}>
            {totals.growth >= 0 ? '+' : ''}{totals.growth}% YoY
          </Badge>
          <div className="flex items-center gap-4 text-xs opacity-65 ml-auto">
            <Legend2 color="#FF6B00" label={`Abonnements · ${fmtEUR(totals.subs)}`}/>
            <Legend2 color="#FB923C" label={`Boost · ${fmtEUR(totals.boost)}`}/>
            {compare && <Legend2 color="#CBD5E1" label={`N-1 · ${fmtEUR(totals.prev)}`}/>}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_12M} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.45}/>
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gBoost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB923C" stopOpacity={0.45}/>
                  <stop offset="100%" stopColor="#FB923C" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CBD5E1" stopOpacity={0.30}/>
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="currentColor" strokeOpacity={0.08} vertical={false}/>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }}/>
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`}/>
              <Tooltip content={<DarkTooltip unit="€" />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.15 }}/>
              {compare && <Area type="monotone" dataKey="prev" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="4 4" fill="url(#gPrev)"/>}
              <Area type="monotone" dataKey="subs"  stackId="1" stroke="#FF6B00" strokeWidth={2.5} fill="url(#gSubs)"/>
              <Area type="monotone" dataKey="boost" stackId="1" stroke="#FB923C" strokeWidth={2.5} fill="url(#gBoost)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Subscription growth + Listing boost revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Croissance des abonnements" subtitle="Nouveaux vs résiliations · Net mensuel">
          <div className="flex items-baseline gap-4 mb-3 flex-wrap">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">+{SUBS_GROWTH[SUBS_GROWTH.length - 1].net}</div>
              <div className="text-[11px] opacity-50">Net Mai · {SUBS_GROWTH.reduce((s, r) => s + r.net, 0)} sur 12 mois</div>
            </div>
            <div className="flex items-center gap-3 text-xs ml-auto opacity-65">
              <Legend2 color="#10B981" label="Nouveaux"/>
              <Legend2 color="#E11D48" label="Résiliés"/>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SUBS_GROWTH} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" strokeOpacity={0.08} vertical={false}/>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }}/>
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }}/>
                <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.15 }}/>
                <Line type="monotone" dataKey="new"       stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}/>
                <Line type="monotone" dataKey="cancelled" stroke="#E11D48" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#E11D48', stroke: '#fff', strokeWidth: 2 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenus boost d'annonces" subtitle="Achats unitaires « Remonter en tête » & boost Premium">
          <div className="flex items-baseline gap-4 mb-3 flex-wrap">
            <div>
              <div className="text-2xl font-extrabold tracking-tight"><Counter to={BOOSTS_12M[BOOSTS_12M.length - 1].amount} suffix=" €"/></div>
              <div className="text-[11px] opacity-50">Mai · {BOOSTS_12M[BOOSTS_12M.length - 1].count} boosts vendus</div>
            </div>
            <Badge tone="emerald" >+18 % MoM</Badge>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOSTS_12M} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00"/>
                    <stop offset="100%" stopColor="#FB923C"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" strokeOpacity={0.08} vertical={false}/>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }}/>
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fillOpacity: 0.5, fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`}/>
                <Tooltip content={<DarkTooltip unit="€" />} cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}/>
                <Bar dataKey="amount" fill="url(#gBar)" radius={[8, 8, 0, 0]} maxBarSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Payment overview: methods + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <Panel title="Répartition par méthode" subtitle="30 derniers jours">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={METHODS} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={64} stroke="currentColor" strokeOpacity={0.05} strokeWidth={2}>
                    {METHODS.map((m, i) => <Cell key={i} fill={m.color}/>)}
                  </Pie>
                  <Tooltip content={<DarkTooltip unit="%" />}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-xs">
              {METHODS.map((m) => (
                <li key={m.method} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }}/>
                    <span className="opacity-75 truncate">{m.method}</span>
                  </span>
                  <span className="font-bold shrink-0">{m.value}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-current/10 grid grid-cols-2 gap-3 text-xs">
            <Stat label="Taux de succès" value="98,4 %" tone="emerald"/>
            <Stat label="Échecs cette semaine" value="11" tone="rose"/>
            <Stat label="Remboursements" value="3"/>
            <Stat label="Chargebacks" value="0" tone="emerald"/>
          </div>
        </Panel>

        <Panel title="Transactions récentes" subtitle={`${RECENT_PAYMENTS.length} dernières opérations Stripe`} action="Voir toutes les transactions">
          {/* Mobile list */}
          <ul className="md:hidden divide-y divide-current/10">
            {RECENT_PAYMENTS.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center gap-3">
                <Avatar name={p.customer} size={32}/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.customer}</div>
                  <div className="text-[11px] opacity-50 truncate">{p.id} · {p.time}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-extrabold ${p.status === 'refunded' || p.status === 'failed' ? 'line-through opacity-50' : ''}`}>
                    {p.amount.toFixed(2).replace('.', ',')} €
                  </div>
                  <StatusBadge status={p.status}/>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <table className="hidden md:table w-full">
            <thead className="text-[10px] font-bold uppercase tracking-wider opacity-50">
              <tr>
                <th className="text-left py-2 pr-3">Client</th>
                <th className="text-left py-2 pr-3">Transaction</th>
                <th className="text-center py-2 px-2">Méthode</th>
                <th className="text-right py-2 pr-2">Montant</th>
                <th className="text-right py-2 pl-2">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {RECENT_PAYMENTS.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
                  className="hover:bg-current/[0.03] transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={p.customer} size={28}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{p.customer}</div>
                        <div className="text-[11px] opacity-50 truncate">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="text-[11px] font-mono opacity-60">{p.id}</div>
                    <div className="text-[10px] opacity-50">{p.time}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <MethodPill method={p.method}/>
                  </td>
                  <td className={`py-2.5 pr-2 text-right text-sm font-extrabold ${p.status !== 'succeeded' ? 'line-through opacity-50' : ''}`}>
                    {p.amount.toFixed(2).replace('.', ',')} €
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <StatusBadge status={p.status}/>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Local sub-components
   ============================================================ */
function KpiTile({ icon: Icon, label, value, suffix = '', trend, sub, tone = 'orange', decimals = 0 }) {
  const positive = trend >= 0
  const tones = {
    orange:  'bg-orange-500/15 text-orange-500',
    indigo:  'bg-indigo-500/15 text-indigo-500',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    navy:    'bg-current/10 text-current',
  }
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl p-4 lg:p-5 bg-current/[0.04] border border-current/10 hover:bg-current/[0.06] transition overflow-hidden"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={16}/>
        </span>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 ${positive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {positive ? <I.TrendingUp size={10}/> : <I.TrendingDown size={10}/>}
          {positive ? '+' : ''}{trend}%
        </div>
      </div>
      <div className="text-2xl lg:text-[26px] font-extrabold tracking-tight leading-none">
        <Counter to={value} suffix={suffix} decimals={decimals}/>
      </div>
      <div className="text-[12px] opacity-60 mt-1.5">{label}</div>
      {sub && <div className="text-[10px] opacity-40 mt-1 truncate">{sub}</div>}
    </motion.div>
  )
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-current/10 bg-current/[0.03] p-5 lg:p-6 ${className}`}>
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

function Legend2({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }}/>
      {label}
    </span>
  )
}

function DarkTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-white rounded-xl shadow-cardHover px-3 py-2 border border-white/10 text-xs">
      {label && <div className="text-[10px] uppercase tracking-wider text-white/55 mb-1">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 leading-tight">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }}/>
          <span className="capitalize text-white/70 mr-2">{p.dataKey}</span>
          <span className="font-bold ml-auto">{Number(p.value).toLocaleString('fr-FR')}{unit}</span>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value, tone }) {
  const tones = { emerald: 'text-emerald-500', rose: 'text-rose-500' }
  return (
    <div className="rounded-xl px-3 py-2.5 bg-current/[0.04] border border-current/10">
      <div className="text-[10px] opacity-50 uppercase tracking-wider">{label}</div>
      <div className={`font-extrabold mt-0.5 ${tones[tone] || ''}`}>{value}</div>
    </div>
  )
}

function MethodPill({ method }) {
  const meta = {
    CB:   { label: 'Carte',     color: 'bg-orange-500/15 text-orange-500' },
    SEPA: { label: 'SEPA',      color: 'bg-navy-900/15 text-current' },
    AP:   { label: 'Apple Pay', color: 'bg-current/10 text-current' },
    GP:   { label: 'Google Pay',color: 'bg-current/10 text-current' },
  }[method] || { label: method, color: 'bg-current/10 text-current' }
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    succeeded: { label: 'Réussi',     tone: 'bg-emerald-500/15 text-emerald-500' },
    refunded:  { label: 'Remboursé',  tone: 'bg-amber-500/15 text-amber-500' },
    failed:    { label: 'Échec',      tone: 'bg-rose-500/15 text-rose-500' },
  }[status] || { label: status, tone: 'bg-current/10 text-current' }
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${map.tone}`}>
      {map.label}
    </span>
  )
}
