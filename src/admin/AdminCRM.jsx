import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Badge, Avatar } from '../lib/ui.jsx'
import { ShopCATextarea } from '../components/ui/ShopCATextarea'

const LEADS = [
  { id: 'l1', name: 'Sophie Mercier',   email: 'sophie.mercier@gmail.com',  phone: '+33 6 12 34 56 78', source: 'Site web',    status: 'hot',   plan: 'Business',    created: '2026-05-18', agency: 'Agence Prestige', value: 79,  notes: 'Intéressée par le pack Business annuel. Rappel vendredi.', avatar: 'SM', color: '#F59E0B' },
  { id: 'l2', name: 'Marc Delacroix',   email: 'marc.d@orpi-paris.fr',      phone: '+33 6 98 76 54 32', source: 'Partenaire',  status: 'warm',  plan: 'Enterprise',  created: '2026-05-16', agency: 'Orpi Paris',      value: 199, notes: 'Réseau de 3 agences. Veut une démo Enterprise.', avatar: 'MD', color: '#6366F1' },
  { id: 'l3', name: 'Julie Fontaine',   email: 'julie@immonantes.fr',        phone: '+33 6 55 44 33 22', source: 'LinkedIn',    status: 'cold',  plan: 'Starter',     created: '2026-05-14', agency: null,              value: 29,  notes: 'Indépendante, budget limité.', avatar: 'JF', color: '#10B981' },
  { id: 'l4', name: 'Antoine Bernard',  email: 'a.bernard@nexity.com',       phone: '+33 6 22 11 99 88', source: 'Salon Immo',  status: 'won',   plan: 'Enterprise',  created: '2026-05-10', agency: 'Nexity Lyon',     value: 199, notes: 'Signé 12 mois. Onboarding prévu le 25/05.', avatar: 'AB', color: '#0B1F3A' },
  { id: 'l5', name: 'Camille Roux',     email: 'camille.roux@era.fr',        phone: '+33 6 77 66 55 44', source: 'Site web',    status: 'warm',  plan: 'Business',    created: '2026-05-09', agency: 'ERA Bordeaux',    value: 79,  notes: 'Devis envoyé. En attente retour.', avatar: 'CR', color: '#EF4444' },
  { id: 'l6', name: 'Thomas Leroy',     email: 't.leroy@century21.fr',       phone: '+33 6 33 22 11 00', source: 'Partenaire',  status: 'lost',  plan: 'Premium',     created: '2026-05-05', agency: 'Century21 Nice',  value: 79,  notes: 'Préfère la concurrence — prix.', avatar: 'TL', color: '#8B5CF6' },
]

const MESSAGES = [
  { id: 'm1', from: 'Sophie Mercier',  avatar: 'SM', color: '#F59E0B', text: 'Bonjour, est-ce que je peux avoir plus d\'infos sur le plan Business annuel ?', time: 'Il y a 2 h',   unread: true  },
  { id: 'm2', from: 'Marc Delacroix',  avatar: 'MD', color: '#6366F1', text: 'J\'ai 3 agences, avez-vous un tarif groupe pour Enterprise ?',                  time: 'Il y a 4 h',   unread: true  },
  { id: 'm3', from: 'Camille Roux',    avatar: 'CR', color: '#EF4444', text: 'Démo reçue, merci ! Je reviens vers vous en fin de semaine.',                  time: 'Hier, 14:32',  unread: false },
  { id: 'm4', from: 'Antoine Bernard', avatar: 'AB', color: '#0B1F3A', text: 'Contrat signé ! Quels sont les prochains étapes pour l\'onboarding ?',          time: 'Hier, 09:15',  unread: false },
  { id: 'm5', from: 'Julie Fontaine',  avatar: 'JF', color: '#10B981', text: 'Est-ce qu\'il y a une version d\'essai gratuite disponible ?',                  time: 'Lun, 11:04',   unread: false },
]

const PIPELINE = [
  { id: 'stage1', label: 'Prospects',   color: '#94A3B8', leads: ['l3', 'l6'] },
  { id: 'stage2', label: 'Qualifiés',   color: '#F59E0B', leads: ['l2', 'l5'] },
  { id: 'stage3', label: 'Proposition', color: '#6366F1', leads: ['l1'] },
  { id: 'stage4', label: 'Gagnés',      color: '#10B981', leads: ['l4'] },
]

const STATUS_STYLE = {
  hot:  { label: 'Chaud',   cls: 'bg-red-50 text-red-600 ring-red-200' },
  warm: { label: 'Tiède',   cls: 'bg-amber-50 text-amber-600 ring-amber-200' },
  cold: { label: 'Froid',   cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
  won:  { label: 'Gagné',   cls: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  lost: { label: 'Perdu',   cls: 'bg-rose-50 text-rose-500 ring-rose-200' },
}

export default function AdminCRM() {
  const [tab, setTab]       = useState('leads')
  const [selected, setSelected] = useState(null)
  const [reply, setReply]   = useState('')

  const selectedLead = LEADS.find((l) => l.id === selected)
  const totalValue   = LEADS.filter((l) => l.status === 'won').reduce((s, l) => s + l.value, 0)
  const unread       = MESSAGES.filter((m) => m.unread).length

  return (
    <motion.div key="crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Opérations</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">CRM</h1>
          <p className="opacity-60 mt-1 text-sm">Leads, messages et pipeline de conversion.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm">
          <I.Plus size={14} />
          Nouveau lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Leads actifs',  val: LEADS.filter((l) => !['won','lost'].includes(l.status)).length, icon: I.Users,       cls: 'text-indigo-600 bg-indigo-50' },
          { label: 'Leads chauds', val: LEADS.filter((l) => l.status === 'hot').length,                  icon: I.Zap,         cls: 'text-red-600 bg-red-50' },
          { label: 'Taux conversion',val: Math.round((LEADS.filter((l) => l.status==='won').length / LEADS.length) * 100)+'%', icon: I.TrendingUp, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'MRR pipeline', val: totalValue+'€/mois',                                             icon: I.CreditCard,  cls: 'text-orange-600 bg-orange-50' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-current/10 bg-current/[0.02] p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={16} /></div>
            <div className="text-2xl font-extrabold tracking-tight">{val}</div>
            <div className="text-xs opacity-60 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-current/[0.05] w-fit">
        {[
          { id: 'leads',    label: 'Leads' },
          { id: 'messages', label: 'Messages', badge: unread },
          { id: 'pipeline', label: 'Pipeline' },
        ].map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}>
            {label}
            {badge > 0 && <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Leads tab ─────────────────────────────────── */}
      {tab === 'leads' && (
        <div className="flex gap-5">
          <div className="flex-1 min-w-0 rounded-2xl border border-current/10 overflow-hidden">
            <div className="divide-y divide-current/10">
              {LEADS.map((lead) => {
                const st = STATUS_STYLE[lead.status]
                return (
                  <motion.div key={lead.id} layout
                    onClick={() => setSelected(selected === lead.id ? null : lead.id)}
                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-current/[0.03] transition-colors ${selected === lead.id ? 'bg-orange-500/[0.04]' : ''}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0" style={{ backgroundColor: lead.color }}>{lead.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{lead.name}</div>
                      <div className="text-xs opacity-50 truncate">{lead.email}</div>
                    </div>
                    <div className="hidden sm:block text-xs opacity-50 shrink-0">{lead.source}</div>
                    <div className="hidden md:block text-xs font-bold text-orange-600 shrink-0">{lead.value}€/mois</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 shrink-0 ${st.cls}`}>{st.label}</span>
                    <I.ChevronRight size={14} className={`opacity-30 shrink-0 transition-transform ${selected === lead.id ? 'rotate-90' : ''}`} />
                  </motion.div>
                )
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedLead && (
              <motion.div initial={{ opacity: 0, x: 16, width: 0 }} animate={{ opacity: 1, x: 0, width: 288 }} exit={{ opacity: 0, x: 16, width: 0 }} transition={{ duration: 0.25 }} className="shrink-0 overflow-hidden">
                <div className="w-72 rounded-2xl border border-current/10 bg-current/[0.02] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold" style={{ backgroundColor: selectedLead.color }}>{selectedLead.avatar}</div>
                    <div>
                      <div className="font-bold text-sm">{selectedLead.name}</div>
                      <div className="text-xs opacity-50">{selectedLead.agency || 'Indépendant'}</div>
                    </div>
                  </div>
                  {[
                    { l: 'Email',  v: selectedLead.email },
                    { l: 'Tél',    v: selectedLead.phone },
                    { l: 'Source', v: selectedLead.source },
                    { l: 'Plan',   v: selectedLead.plan },
                    { l: 'Valeur', v: selectedLead.value+'€/mois' },
                    { l: 'Créé',   v: selectedLead.created },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex items-center justify-between text-sm border-b border-current/5 pb-2 last:border-0">
                      <span className="opacity-50 text-xs font-semibold uppercase tracking-wide">{l}</span>
                      <span className="font-medium text-xs text-right max-w-[60%] truncate">{v}</span>
                    </div>
                  ))}
                  <div className="pt-1">
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-1.5">Notes</div>
                    <p className="text-xs leading-relaxed opacity-70">{selectedLead.notes}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors">
                      <I.Mail size={12} className="inline mr-1" />Contacter
                    </button>
                    <button className="flex-1 py-2 border border-current/15 hover:bg-current/5 text-xs font-bold rounded-xl transition-colors">
                      <I.Phone size={12} className="inline mr-1" />Appeler
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Messages tab ─────────────────────────────── */}
      {tab === 'messages' && (
        <div className="flex gap-5">
          <div className="flex-1 min-w-0 rounded-2xl border border-current/10 overflow-hidden">
            <div className="divide-y divide-current/10">
              {MESSAGES.map((msg) => (
                <motion.div key={msg.id} layout
                  onClick={() => setSelected(selected === msg.id ? null : msg.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-current/[0.03] transition-colors ${selected === msg.id ? 'bg-orange-500/[0.04]' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 mt-0.5" style={{ backgroundColor: msg.color }}>{msg.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{msg.from}</span>
                      {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                    </div>
                    <p className="text-xs opacity-60 truncate">{msg.text}</p>
                  </div>
                  <span className="text-[10px] opacity-40 shrink-0 mt-0.5 whitespace-nowrap">{msg.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, x: 16, width: 0 }} animate={{ opacity: 1, x: 0, width: 320 }} exit={{ opacity: 0, x: 16, width: 0 }} transition={{ duration: 0.25 }} className="shrink-0 overflow-hidden">
                {(() => {
                  const msg = MESSAGES.find((m) => m.id === selected)
                  if (!msg) return null
                  return (
                    <div className="w-80 rounded-2xl border border-current/10 bg-current/[0.02] p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold" style={{ backgroundColor: msg.color }}>{msg.avatar}</div>
                        <div>
                          <div className="font-bold text-sm">{msg.from}</div>
                          <div className="text-xs opacity-50">{msg.time}</div>
                        </div>
                      </div>
                      <div className="bg-current/[0.04] rounded-xl p-3 text-sm leading-relaxed">{msg.text}</div>
                      <div>
                        <ShopCATextarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Votre réponse…"
                          rows={3}
                          dark
                        />
                        <button onClick={() => setReply('')} className="mt-2 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors">
                          <I.Send size={12} className="inline mr-1" />Envoyer la réponse
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pipeline tab ─────────────────────────────── */}
      {tab === 'pipeline' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE.map((stage) => {
            const stageLeads = stage.leads.map((id) => LEADS.find((l) => l.id === id)).filter(Boolean)
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0)
            return (
              <div key={stage.id} className="rounded-2xl border border-current/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-current/10" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">{stage.label}</span>
                    <span className="text-xs font-bold opacity-50">{stageLeads.length}</span>
                  </div>
                  <div className="text-xs opacity-40 mt-0.5">{stageValue}€/mois</div>
                </div>
                <div className="p-3 space-y-2 min-h-32">
                  {stageLeads.map((lead) => (
                    <motion.div key={lead.id} layout className="rounded-xl border border-current/10 bg-white p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-extrabold shrink-0" style={{ backgroundColor: lead.color }}>{lead.avatar}</div>
                        <span className="text-xs font-semibold truncate">{lead.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] opacity-50">{lead.plan}</span>
                        <span className="text-[10px] font-bold text-orange-600">{lead.value}€</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
