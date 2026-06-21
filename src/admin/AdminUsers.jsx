import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Counter, Button, Avatar, Badge } from '../lib/ui.jsx'
import { PasmalSelect } from '../components/ui/PasmalSelect'

/* ============================================================
   Super Admin — Users Management
   Enterprise SaaS table · responsive · slide-over detail
   ============================================================ */

const av = (id, w = 120) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const USERS = [
  { id: 'usr_001', name: 'Camille Lefèvre',  email: 'camille.lefevre@gmail.com', role: 'particulier', subscription: 'visibility', status: 'active',    trust_score: 92, listings: 3, created_at: '2025-09-12', last_active: 'il y a 4 min',  phone_verified: true,  kyc: true,  avatar: av('photo-1494790108377-be9c29b29330') },
  { id: 'usr_002', name: 'Julien Moreau',    email: 'julien.moreau@outlook.fr',  role: 'particulier', subscription: 'premium',    status: 'active',    trust_score: 88, listings: 5, created_at: '2025-08-04', last_active: 'il y a 22 min', phone_verified: true,  kyc: true,  avatar: av('photo-1500648767791-00dcc994a43e') },
  { id: 'usr_003', name: 'Sofia Benali',     email: 'sofia.benali@me.com',        role: 'particulier', subscription: 'premium',    status: 'active',    trust_score: 94, listings: 8, created_at: '2025-06-19', last_active: 'il y a 1h',     phone_verified: true,  kyc: true,  avatar: av('photo-1438761681033-6461ffad8d80') },
  { id: 'usr_004', name: 'Foncia Premium',   email: 'billing@foncia.fr',          role: 'agence',      subscription: 'pro',         status: 'active',    trust_score: 96, listings: 142,created_at: '2024-11-02', last_active: 'il y a 3h',     phone_verified: true,  kyc: true,  avatar: null },
  { id: 'usr_005', name: 'BARNES Premium',   email: 'paris@barnes.fr',            role: 'agence',      subscription: 'enterprise',  status: 'active',    trust_score: 98, listings: 268,created_at: '2024-08-22', last_active: 'aujourd\'hui',  phone_verified: true,  kyc: true,  avatar: null },
  { id: 'usr_006', name: 'Century 21 Nice',  email: 'nice@century21.fr',          role: 'agence',      subscription: 'pro',         status: 'pending',   trust_score: 72, listings: 0,  created_at: '2026-05-14', last_active: 'il y a 2j',     phone_verified: false, kyc: false, avatar: null },
  { id: 'usr_007', name: 'Sotheby\'s Bordeaux',email: 'bordeaux@sothebys.com',    role: 'agence',      subscription: 'enterprise',  status: 'pending',   trust_score: 78, listings: 0,  created_at: '2026-05-15', last_active: 'hier',          phone_verified: true,  kyc: false, avatar: null },
  { id: 'usr_008', name: 'Thomas Robert',    email: 'thomas.robert@hotmail.fr',   role: 'particulier', subscription: 'free',        status: 'active',    trust_score: 56, listings: 1,  created_at: '2026-04-28', last_active: 'il y a 4j',     phone_verified: false, kyc: false, avatar: null },
  { id: 'usr_009', name: 'Élodie Garnier',   email: 'elodie@protonmail.com',      role: 'particulier', subscription: 'visibility', status: 'active',    trust_score: 71, listings: 2,  created_at: '2026-03-11', last_active: 'il y a 1j',     phone_verified: true,  kyc: false, avatar: null },
  { id: 'usr_010', name: 'fast_seller_22',   email: 'cryptouser22@protonmail.com',role: 'particulier', subscription: 'free',        status: 'suspended', trust_score: 12, listings: 4,  created_at: '2026-05-08', last_active: 'il y a 6j',     phone_verified: false, kyc: false, avatar: null },
  { id: 'usr_011', name: 'inconnu_492',      email: 'inc492@yahoo.fr',            role: 'particulier', subscription: 'free',        status: 'suspended', trust_score: 18, listings: 2,  created_at: '2026-05-16', last_active: 'il y a 12h',    phone_verified: false, kyc: false, avatar: null },
  { id: 'usr_012', name: 'Jean Kevin PEMOU', email: 'admin@pasmal.fr',             role: 'admin',       subscription: 'enterprise',  status: 'active',    trust_score: 100,listings: 0,  created_at: '2024-01-15', last_active: 'maintenant',    phone_verified: true,  kyc: true,  avatar: null },
  { id: 'usr_013', name: 'Marc Dubois',      email: 'marc.dubois@gmail.com',       role: 'particulier', subscription: 'visibility', status: 'active',    trust_score: 82, listings: 4,  created_at: '2025-10-04', last_active: 'il y a 6h',     phone_verified: true,  kyc: true,  avatar: null },
  { id: 'usr_014', name: 'Léa Bernard',      email: 'lea.bernard@gmail.com',       role: 'particulier', subscription: 'premium',    status: 'active',    trust_score: 89, listings: 2,  created_at: '2025-12-20', last_active: 'il y a 30 min', phone_verified: true,  kyc: true,  avatar: null },
]

const ROLES = [
  { id: 'all',          label: 'Tous les rôles' },
  { id: 'particulier',  label: 'Particuliers' },
  { id: 'agence',       label: 'Agences' },
  { id: 'admin',        label: 'Admins' },
]

const STATUSES = [
  { id: 'all',       label: 'Tous statuts' },
  { id: 'active',    label: 'Actifs' },
  { id: 'pending',   label: 'En attente' },
  { id: 'suspended', label: 'Suspendus' },
]

const PLANS = [
  { id: 'all',         label: 'Tous plans' },
  { id: 'free',        label: 'Gratuit' },
  { id: 'visibility',  label: 'Pack Visibilité' },
  { id: 'premium',     label: 'Premium' },
  { id: 'pro',         label: 'Pro (B2B)' },
  { id: 'enterprise',  label: 'Enterprise' },
]

const PLAN_META = {
  free:        { label: 'Gratuit',         tone: 'bg-current/10 text-current',                short: 'Free' },
  visibility:  { label: 'Pack Visibilité', tone: 'bg-orange-500/15 text-orange-500',          short: 'Visibility' },
  premium:     { label: 'Premium',         tone: 'bg-orange-500/15 text-orange-500',          short: 'Premium' },
  pro:         { label: 'Pro',             tone: 'bg-indigo-500/15 text-indigo-500',          short: 'Pro' },
  enterprise:  { label: 'Enterprise',      tone: 'bg-emerald-500/15 text-emerald-500',        short: 'Enterprise' },
}

const STATUS_META = {
  active:    { label: 'Actif',     tone: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500' },
  pending:   { label: 'En attente', tone: 'bg-amber-500/15 text-amber-500',     dot: 'bg-amber-500' },
  suspended: { label: 'Suspendu',  tone: 'bg-rose-500/15 text-rose-500',        dot: 'bg-rose-500' },
}

const ROLE_META = {
  particulier: { label: 'Particulier' },
  agence:      { label: 'Agence' },
  admin:       { label: 'Admin' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState(USERS)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [plan, setPlan] = useState('all')
  const [selected, setSelected] = useState(new Set())
  const [selectedUserId, setSelectedUserId] = useState(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (role !== 'all' && u.role !== role) return false
      if (status !== 'all' && u.status !== status) return false
      if (plan !== 'all' && u.subscription !== plan) return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [users, role, status, plan, search])

  const stats = useMemo(() => ({
    total: users.length,
    verified: users.filter(u => u.kyc).length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    premium: users.filter(u => u.subscription !== 'free').length,
  }), [users])

  const allChecked = filtered.length > 0 && filtered.every((u) => selected.has(u.id))
  const someChecked = filtered.some((u) => selected.has(u.id))
  const toggleAll = () => {
    const next = new Set(selected)
    if (allChecked) filtered.forEach(u => next.delete(u.id))
    else filtered.forEach(u => next.add(u.id))
    setSelected(next)
  }
  const toggleOne = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  const updateStatus = (id, newStatus) => {
    setUsers((arr) => arr.map(u => u.id === id ? { ...u, status: newStatus } : u))
  }
  const verifyKyc = (id) => {
    setUsers((arr) => arr.map(u => u.id === id ? { ...u, kyc: true, phone_verified: true, status: 'active', trust_score: Math.max(u.trust_score, 85) } : u))
  }

  const bulkSuspend = () => {
    setUsers((arr) => arr.map(u => selected.has(u.id) ? { ...u, status: 'suspended' } : u))
    setSelected(new Set())
  }

  const resetFilters = () => { setSearch(''); setRole('all'); setStatus('all'); setPlan('all') }
  const hasFilters = search || role !== 'all' || status !== 'all' || plan !== 'all'

  const selectedUser = users.find(u => u.id === selectedUserId)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Gestion</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Utilisateurs</h1>
          <p className="opacity-60 mt-1 text-sm">{users.length} utilisateurs · {stats.verified} vérifiés · {stats.pending} en attente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><I.Download size={14}/> Exporter</Button>
          <Button size="sm"><I.Plus size={14}/> Inviter un utilisateur</Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={I.Users}       label="Total"           value={stats.total}      tone="navy"/>
        <StatTile icon={I.BadgeCheck}  label="KYC vérifié"      value={stats.verified}   tone="emerald"/>
        <StatTile icon={I.Sparkles}    label="Abonnements payants" value={stats.premium} tone="orange"/>
        <StatTile icon={I.Alert}       label="Suspendus"        value={stats.suspended}  tone="rose" pulse={stats.suspended > 0}/>
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-2 flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 h-10 bg-current/[0.04] border border-current/10 rounded-xl">
          <I.Search size={14} className="opacity-50"/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, e-mail, ID utilisateur…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <Select value={role}   onChange={setRole}   options={ROLES}/>
        <Select value={status} onChange={setStatus} options={STATUSES}/>
        <Select value={plan}   onChange={setPlan}   options={PLANS}/>

        {hasFilters && (
          <button onClick={resetFilters} className="text-xs opacity-60 hover:opacity-100 hover:text-orange-500 px-2 flex items-center gap-1">
            <I.X size={12}/> Effacer
          </button>
        )}
      </div>

      {/* Bulk actions toolbar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white shadow-card"
          >
            <I.Check size={14}/>
            <span className="text-sm font-semibold">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
            <div className="flex-1"/>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1"><I.Mail size={12}/> E-mail</button>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1"><I.Download size={12}/> Exporter</button>
            <button onClick={bulkSuspend} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1"><I.Lock size={12}/> Suspendre</button>
            <button onClick={() => setSelected(new Set())} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><I.X size={14}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users table */}
      <section className="rounded-3xl border border-current/10 bg-current/[0.03] overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-current/10">
          {filtered.length === 0 ? (
            <EmptyRow/>
          ) : filtered.map((u) => (
            <UserMobileCard key={u.id} u={u} onOpen={() => setSelectedUserId(u.id)} onVerify={() => verifyKyc(u.id)} onSuspend={() => updateStatus(u.id, 'suspended')} onActivate={() => updateStatus(u.id, 'active')}/>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-current/[0.04] text-[10px] font-bold uppercase tracking-wider opacity-60">
              <tr>
                <th className="w-10 pl-4 py-3">
                  <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked }} onChange={toggleAll} className="accent-orange-500"/>
                </th>
                <th className="text-left py-3 pr-3">Utilisateur</th>
                <th className="text-left py-3 pr-3">Rôle</th>
                <th className="text-left py-3 pr-3">Abonnement</th>
                <th className="text-left py-3 pr-3">Statut</th>
                <th className="text-center py-3 pr-3">Trust score</th>
                <th className="text-left py-3 pr-3">Créé le</th>
                <th className="text-right py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyRow/></td></tr>
              ) : filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                  className={`hover:bg-current/[0.04] transition-colors cursor-pointer ${selected.has(u.id) ? 'bg-orange-500/[0.06]' : ''}`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <td className="pl-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} className="accent-orange-500"/>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.name} src={u.avatar} size={36}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                          {u.name}
                          {u.kyc && <I.BadgeCheck size={12} className="text-emerald-500 shrink-0" title="KYC vérifié"/>}
                        </div>
                        <div className="text-[11px] opacity-50 truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs font-semibold capitalize opacity-80">{ROLE_META[u.role]?.label}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${PLAN_META[u.subscription].tone}`}>
                      {PLAN_META[u.subscription].short}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={u.status}/>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <ScoreBubble score={u.trust_score}/>
                  </td>
                  <td className="py-3 pr-3 text-xs opacity-65 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                    <RowActions user={u} onVerify={() => verifyKyc(u.id)} onSuspend={() => updateStatus(u.id, 'suspended')} onActivate={() => updateStatus(u.id, 'active')}/>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-current/10 text-xs">
          <span className="opacity-60">{filtered.length} sur {users.length} utilisateurs</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded-md hover:bg-current/[0.06] disabled:opacity-30" disabled><I.ChevronLeft size={14}/></button>
            <span className="opacity-65">Page 1 / 1</span>
            <button className="px-2 py-1 rounded-md hover:bg-current/[0.06] disabled:opacity-30" disabled><I.ChevronRight size={14}/></button>
          </div>
        </div>
      </section>

      {/* Slide-over detail */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            key={selectedUser.id}
            user={selectedUser}
            onClose={() => setSelectedUserId(null)}
            onVerify={() => verifyKyc(selectedUser.id)}
            onSuspend={() => { updateStatus(selectedUser.id, 'suspended'); setSelectedUserId(null) }}
            onActivate={() => { updateStatus(selectedUser.id, 'active'); setSelectedUserId(null) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */
function StatTile({ icon: Icon, label, value, tone, pulse }) {
  const tones = {
    navy:    'bg-current/10 text-current',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    orange:  'bg-orange-500/15 text-orange-500',
    rose:    'bg-rose-500/15 text-rose-500',
  }
  return (
    <div className="relative rounded-2xl p-4 lg:p-5 bg-current/[0.04] border border-current/10 overflow-hidden">
      {pulse && (
        <span className="absolute top-3 right-3 flex">
          <span className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 opacity-60 animate-ping"/>
          <span className="relative w-2 h-2 rounded-full bg-rose-500"/>
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl ${tones[tone]} flex items-center justify-center mb-3`}>
        <Icon size={16}/>
      </div>
      <div className="text-2xl lg:text-[26px] font-extrabold tracking-tight leading-none">
        <Counter to={value}/>
      </div>
      <div className="text-[12px] opacity-60 mt-1.5">{label}</div>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <PasmalSelect
      value={value}
      onChange={onChange}
      options={options.map(o => ({ value: o.id, label: o.label }))}
      size="sm"
      dark
    />
  )
}

function StatusBadge({ status }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${m.tone}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}/>
      {m.label}
    </span>
  )
}

function ScoreBubble({ score }) {
  const color = score >= 85 ? '#10B981' : score >= 65 ? '#F59E0B' : '#E11D48'
  const dash = (score / 100) * 87.96
  return (
    <div className="relative w-9 h-9 inline-block">
      <svg viewBox="0 0 32 32" className="w-9 h-9 -rotate-90">
        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3"/>
        <circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${dash} 87.96`}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold">{score}</div>
    </div>
  )
}

function RowActions({ user, onVerify, onSuspend, onActivate }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      {user.status === 'pending' && (
        <button onClick={onVerify} className="text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-full transition flex items-center gap-1">
          <I.Check size={12}/> Vérifier
        </button>
      )}
      {user.status === 'suspended' ? (
        <button onClick={onActivate} className="text-[11px] font-semibold bg-current/10 hover:bg-current/15 px-2.5 py-1.5 rounded-full transition flex items-center gap-1">
          <I.Check size={12}/> Réactiver
        </button>
      ) : user.role !== 'admin' && (
        <button onClick={onSuspend} className="text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-full transition flex items-center gap-1">
          <I.Lock size={12}/> Suspendre
        </button>
      )}
      <button className="w-7 h-7 rounded-md hover:bg-current/[0.08] flex items-center justify-center" title="Plus d'options">
        <I.MoreH size={14}/>
      </button>
    </div>
  )
}

function UserMobileCard({ u, onOpen, onVerify, onSuspend, onActivate }) {
  return (
    <div onClick={onOpen} className="p-4 flex items-center gap-3 hover:bg-current/[0.04] transition cursor-pointer">
      <Avatar name={u.name} src={u.avatar} size={40}/>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
          {u.name}
          {u.kyc && <I.BadgeCheck size={12} className="text-emerald-500"/>}
        </div>
        <div className="text-[11px] opacity-55 truncate">{u.email}</div>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={u.status}/>
          <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${PLAN_META[u.subscription].tone}`}>
            {PLAN_META[u.subscription].short}
          </span>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex flex-col items-end gap-1.5">
        <ScoreBubble score={u.trust_score}/>
        <RowActions user={u} onVerify={onVerify} onSuspend={onSuspend} onActivate={onActivate}/>
      </div>
    </div>
  )
}

function EmptyRow() {
  return (
    <div className="text-center py-14">
      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center mb-3">
        <I.Search size={20}/>
      </div>
      <div className="font-bold">Aucun utilisateur ne correspond</div>
      <div className="text-xs opacity-60 mt-1">Modifiez vos filtres ou effacez-les.</div>
    </div>
  )
}

/* ============================================================
   Slide-over detail
   ============================================================ */
function UserDrawer({ user, onClose, onVerify, onSuspend, onActivate }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-navy-900/55 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white text-navy-900 shadow-cardHover overflow-y-auto"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100">
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <I.X size={16}/>
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} size={52}/>
            <div className="min-w-0">
              <div className="text-lg font-extrabold truncate flex items-center gap-1.5">
                {user.name}
                {user.kyc && <I.BadgeCheck size={16} className="text-emerald-500"/>}
              </div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{user.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            <StatusBadge status={user.status}/>
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${PLAN_META[user.subscription].tone}`}>
              {PLAN_META[user.subscription].label}
            </span>
            <Badge tone="navy">{ROLE_META[user.role]?.label}</Badge>
          </div>
        </div>

        {/* Trust score block */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <BigGauge score={user.trust_score}/>
          <div>
            <div className="text-xs text-slate-500">Trust score plateforme</div>
            <div className="font-extrabold text-xl">{user.trust_score} <span className="text-sm text-slate-400 font-bold">/100</span></div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {user.trust_score >= 85 ? 'Excellent' : user.trust_score >= 65 ? 'Bon' : user.trust_score >= 40 ? 'Moyen' : 'Faible'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          <DrawerStat label="Annonces" value={user.listings} icon={I.Building}/>
          <DrawerStat label="Plan actuel" value={PLAN_META[user.subscription].label} icon={I.CreditCard}/>
          <DrawerStat label="Téléphone" value={user.phone_verified ? '✓ Vérifié' : '— Non vérifié'} tone={user.phone_verified ? 'emerald' : 'rose'} icon={I.Phone}/>
          <DrawerStat label="KYC" value={user.kyc ? '✓ Validé' : '— En attente'} tone={user.kyc ? 'emerald' : 'rose'} icon={I.Shield}/>
        </div>

        <div className="px-6 pb-5 space-y-1 text-sm">
          <Row k="Créé le" v={new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}/>
          <Row k="Dernière activité" v={user.last_active}/>
          <Row k="ID interne" v={<span className="font-mono text-xs">{user.id}</span>}/>
        </div>

        {/* Actions footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1"><I.Mail size={14}/> E-mail</Button>
            <Button variant="outline" className="flex-1"><I.MessageSquare size={14}/> Message</Button>
          </div>
          <div className="flex gap-2">
            {user.status === 'pending' && (
              <button onClick={onVerify} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition">
                <I.Check size={14}/> Vérifier le compte
              </button>
            )}
            {user.status === 'suspended' ? (
              <button onClick={onActivate} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-700 text-white font-semibold text-sm transition">
                <I.Check size={14}/> Réactiver
              </button>
            ) : user.role !== 'admin' && (
              <button onClick={onSuspend} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition">
                <I.Lock size={14}/> Suspendre le compte
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function BigGauge({ score }) {
  const color = score >= 85 ? '#10B981' : score >= 65 ? '#F59E0B' : '#E11D48'
  const dash = (score / 100) * 87.96
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 32 32" className="w-16 h-16 -rotate-90">
        <circle cx="16" cy="16" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3"/>
        <motion.circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          initial={{ strokeDasharray: '0 87.96' }} animate={{ strokeDasharray: `${dash} 87.96` }} transition={{ duration: 0.8 }}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">{score}</div>
    </div>
  )
}

function DrawerStat({ label, value, icon: Icon, tone }) {
  const tones = { emerald: 'text-emerald-600', rose: 'text-rose-600' }
  return (
    <div className="rounded-xl px-3.5 py-3 bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        <Icon size={12}/> {label}
      </div>
      <div className={`font-extrabold text-sm ${tones[tone] || 'text-navy-900'}`}>{value}</div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="text-xs text-slate-500">{k}</div>
      <div className="text-sm font-semibold text-navy-900 truncate">{v}</div>
    </div>
  )
}
