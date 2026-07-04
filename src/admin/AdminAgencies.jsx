import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Badge, Button, Avatar } from '../lib/ui.jsx'

const AGENCIES = [
  { id: 'a1', name: 'Agence Prestige Immobilier', city: 'Paris', email: 'agence@shopca.fr', siret: '12345678900012', plan: 'premium', status: 'approved', agents: 8, listings: 24, revenue: 7900, logo: 'PI', color: '#0B1F3A', created: '2026-04-06', approved: '2026-04-11' },
  { id: 'a2', name: 'Century21 Lyon Centre',       city: 'Lyon',     email: 'lyon@century21.fr',    siret: '98765432100021', plan: 'enterprise', status: 'approved', agents: 15, listings: 67, revenue: 19900, logo: 'C2', color: '#F59E0B', created: '2026-02-20', approved: '2026-02-25' },
  { id: 'a3', name: 'Nexity Bordeaux',             city: 'Bordeaux', email: 'bordeaux@nexity.fr',   siret: '45612378900033', plan: 'enterprise', status: 'approved', agents: 22, listings: 103, revenue: 19900, logo: 'NX', color: '#6366F1', created: '2026-01-21', approved: '2026-01-26' },
  { id: 'a4', name: 'ImmoSud Marseille',           city: 'Marseille', email: 'contact@immosud.fr',  siret: '78945612300044', plan: 'basic', status: 'pending',  agents: 3,  listings: 0, revenue: 0, logo: 'IS', color: '#EF4444', created: '2026-05-16', approved: null },
  { id: 'a5', name: 'AlpesImmo Grenoble',          city: 'Grenoble', email: 'contact@alpesimmo.fr', siret: '36925814700055', plan: 'basic', status: 'pending',  agents: 2,  listings: 0, revenue: 0, logo: 'AI', color: '#10B981', created: '2026-05-19', approved: null },
  { id: 'a6', name: 'Orpi Nantes',                 city: 'Nantes',   email: 'nantes@orpi.fr',       siret: '14725836900066', plan: 'premium', status: 'approved', agents: 10, listings: 41, revenue: 7900, logo: 'OR', color: '#8B5CF6', created: '2026-03-21', approved: '2026-03-26' },
]

const STATUS = {
  approved: { label: 'Approuvée',  tone: 'green',  icon: I.CheckCircle },
  pending:  { label: 'En attente', tone: 'amber',  icon: I.AlertCircle },
  rejected: { label: 'Refusée',    tone: 'red',    icon: I.XCircle },
  suspended:{ label: 'Suspendue',  tone: 'slate',  icon: I.Shield },
}
const PLAN = {
  basic:      { label: 'Basic',      cls: 'bg-slate-100 text-slate-600' },
  premium:    { label: 'Premium',    cls: 'bg-orange-50 text-orange-700' },
  enterprise: { label: 'Enterprise', cls: 'bg-indigo-50 text-indigo-700' },
}

export default function AdminAgencies() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(AGENCIES.map((a) => [a.id, a.status]))
  )

  const visible = filter === 'all' ? AGENCIES : AGENCIES.filter((a) => statuses[a.id] === filter)
  const pending = AGENCIES.filter((a) => statuses[a.id] === 'pending').length
  const selectedAgency = AGENCIES.find((a) => a.id === selected)

  const approve = (id) => setStatuses((s) => ({ ...s, [id]: 'approved' }))
  const reject  = (id) => setStatuses((s) => ({ ...s, [id]: 'rejected' }))

  return (
    <motion.div key="agencies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Gestion</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Agences</h1>
          <p className="opacity-60 mt-1 text-sm">Vérification KYC, dossiers, profils publics.</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-2xl text-sm font-semibold">
            <I.AlertCircle size={15} />
            {pending} dossier{pending > 1 ? 's' : ''} en attente
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total agences',    val: AGENCIES.length,                                            icon: I.Briefcase,   cls: 'text-indigo-600 bg-indigo-50' },
          { label: 'Approuvées',       val: AGENCIES.filter((a) => statuses[a.id]==='approved').length, icon: I.CheckCircle, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'En attente',       val: pending,                                                    icon: I.AlertCircle, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Revenue total',    val: AGENCIES.reduce((s,a)=>s+a.revenue,0).toLocaleString()+'€', icon: I.CreditCard,  cls: 'text-orange-600 bg-orange-50' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-current/10 bg-current/[0.02] p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={16} /></div>
            <div className="text-2xl font-extrabold tracking-tight">{val}</div>
            <div className="text-xs opacity-60 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-current/[0.05] w-fit">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}>
            {f === 'all' ? 'Toutes' : STATUS[f]?.label}
            {f === 'pending' && pending > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 min-w-0 rounded-2xl border border-current/10 overflow-hidden">
          <div className="divide-y divide-current/10">
            {visible.map((a) => {
              const st = statuses[a.id]
              const Cfg = STATUS[st] || STATUS.pending
              return (
                <motion.div key={a.id} layout
                  onClick={() => setSelected(selected === a.id ? null : a.id)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-current/[0.03] ${selected === a.id ? 'bg-orange-500/[0.05]' : ''}`}>
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0" style={{ backgroundColor: a.color }}>
                    {a.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{a.name}</div>
                    <div className="text-xs opacity-50">{a.city} · {a.agents} agents · {a.listings} annonces</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN[a.plan]?.cls}`}>{PLAN[a.plan]?.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Cfg.icon size={13} className={st === 'approved' ? 'text-emerald-500' : st === 'pending' ? 'text-amber-500' : 'text-rose-500'} />
                    <span className={`text-xs font-semibold ${st === 'approved' ? 'text-emerald-600' : st === 'pending' ? 'text-amber-600' : 'text-rose-600'}`}>{Cfg.label}</span>
                  </div>
                  {st === 'pending' && (
                    <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => approve(a.id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">Approuver</button>
                      <button onClick={() => reject(a.id)}  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors">Refuser</button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedAgency && (
            <motion.div initial={{ opacity: 0, x: 16, width: 0 }} animate={{ opacity: 1, x: 0, width: 288 }} exit={{ opacity: 0, x: 16, width: 0 }}
              transition={{ duration: 0.25 }} className="shrink-0 overflow-hidden">
              <div className="w-72 rounded-2xl border border-current/10 bg-current/[0.02] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold" style={{ backgroundColor: selectedAgency.color }}>
                    {selectedAgency.logo}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-snug">{selectedAgency.name}</div>
                    <div className="text-xs opacity-50">{selectedAgency.city}</div>
                  </div>
                </div>
                {[
                  { l: 'Email',    v: selectedAgency.email },
                  { l: 'SIRET',   v: selectedAgency.siret },
                  { l: 'Plan',    v: PLAN[selectedAgency.plan]?.label },
                  { l: 'Agents',  v: selectedAgency.agents },
                  { l: 'Annonces',v: selectedAgency.listings },
                  { l: 'Revenue', v: selectedAgency.revenue ? selectedAgency.revenue.toLocaleString()+'€/mois' : '—' },
                  { l: 'Créée le',v: selectedAgency.created },
                ].map(({ l, v }) => (
                  <div key={l} className="flex items-center justify-between text-sm border-b border-current/5 pb-2 last:border-0 last:pb-0">
                    <span className="opacity-50 text-xs font-semibold uppercase tracking-wide">{l}</span>
                    <span className="font-medium text-xs text-right max-w-[60%] truncate">{v}</span>
                  </div>
                ))}
                {statuses[selectedAgency.id] === 'pending' && (
                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={() => approve(selectedAgency.id)} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors">
                      ✓ Approuver le dossier
                    </button>
                    <button onClick={() => reject(selectedAgency.id)} className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors">
                      ✗ Refuser le dossier
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
