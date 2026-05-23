import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Avatar, Badge } from '../lib/ui.jsx'
import {
  DndContext, closestCorners, DragOverlay,
  useSensor, useSensors, PointerSensor, useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

/* ── Data ─────────────────────────────────────────────── */

export const COLS = [
  { id: 'new',       label: 'Nouveau lead',  color: '#64748B' },
  { id: 'contacted', label: 'Contacté',       color: '#3B82F6' },
  { id: 'visit',     label: 'Visite prévue',  color: '#8B5CF6' },
  { id: 'nego',      label: 'Négociation',    color: '#F59E0B' },
  { id: 'won',       label: 'Gagné',          color: '#10B981' },
  { id: 'lost',      label: 'Perdu',          color: '#EF4444' },
]

export const PROFILES = {
  serious:  { label: 'Acheteur sérieux', tone: 'emerald', icon: '🎯' },
  investor: { label: 'Investisseur',     tone: 'indigo',  icon: '💼' },
  agency:   { label: 'Agence',           tone: 'amber',   icon: '🏢' },
  low:      { label: 'Faible intention', tone: 'slate',   icon: '👤' },
}

export const SEED_LEADS = [
  { id: 'l1',  name: 'Sophie Martin',   email: 'sophie.m@email.com',    phone: '06 12 34 56 78', property: 'Appt 3P Paris 11',  budget: '450 000 €', source: 'Leboncoin',      status: 'new',       score: 87, profile: 'serious',  tags: ['urgent', 'financement ok'], lastContact: '2026-05-20', notes: 'Cherche pour juillet, financement accordé.' },
  { id: 'l2',  name: 'Thomas Dupont',   email: 'thomas.d@gmail.com',    phone: '07 23 45 67 89', property: 'Villa 5P Lyon',      budget: '780 000 €', source: 'SeLoger',        status: 'new',       score: 72, profile: 'investor', tags: ['investissement'],           lastContact: '2026-05-21', notes: 'Cherche à placer 800k, flexible sur le type.' },
  { id: 'l3',  name: 'Amina Benali',    email: 'a.benali@hotmail.fr',   phone: '06 34 56 78 90', property: 'Studio Paris 15',    budget: '210 000 €', source: 'PAP',            status: 'contacted', score: 55, profile: 'low',      tags: ['incertain'],                lastContact: '2026-05-19', notes: 'Hésite entre achat et location.' },
  { id: 'l4',  name: 'Romain Lefèvre',  email: 'r.lefevre@pro.fr',      phone: '06 45 67 89 01', property: 'Appt 4P Bordeaux',  budget: '320 000 €', source: "Bien'ici",       status: 'contacted', score: 91, profile: 'serious',  tags: ['urgent', 'cash'],           lastContact: '2026-05-22', notes: "Achète cash, décision d'ici 2 semaines." },
  { id: 'l5',  name: 'Lucie Moreau',    email: 'lucie.moreau@gmail.com', phone: '07 56 78 90 12', property: 'Maison Nantes',     budget: '550 000 €', source: 'MeilleursAgents',status: 'visit',     score: 80, profile: 'serious',  tags: ['famille'],                  lastContact: '2026-05-18', notes: 'Famille de 4, cherche jardin.' },
  { id: 'l6',  name: 'Hugo Bernard',    email: 'h.bernard@outlook.com', phone: '06 67 89 01 23', property: 'Loft Paris 10',     budget: '380 000 €', source: 'Leboncoin',      status: 'visit',     score: 68, profile: 'investor', tags: ['location'],                 lastContact: '2026-05-17', notes: 'Cherche pour mise en location ensuite.' },
  { id: 'l7',  name: 'Clara Petit',     email: 'clara.p@agence.fr',     phone: '07 78 90 12 34', property: 'Appt 2P Paris 9',   budget: '290 000 €', source: 'Agence',         status: 'nego',      score: 45, profile: 'agency',   tags: ['mandat'],                   lastContact: '2026-05-16', notes: 'Agente immo, cherche un mandat co-exclusif.' },
  { id: 'l8',  name: 'Maxime Girard',   email: 'm.girard@email.com',    phone: '06 89 01 23 45', property: 'Villa Cannes',      budget: '1 200 000 €',source: 'SeLoger',        status: 'nego',      score: 94, profile: 'serious',  tags: ['premium', 'cash'],          lastContact: '2026-05-15', notes: 'Budget élevé, négociation en cours sur -3%.' },
  { id: 'l9',  name: 'Isabelle Durand', email: 'i.durand@yahoo.fr',     phone: '07 90 12 34 56', property: 'Appt 3P Marseille', budget: '240 000 €', source: 'PAP',            status: 'won',       score: 88, profile: 'serious',  tags: ['signé'],                    lastContact: '2026-05-14', notes: 'Compromis signé. Acte fin juin.' },
  { id: 'l10', name: 'Pierre Leclerc',  email: 'p.leclerc@gmail.com',   phone: '06 01 23 45 67', property: 'Maison Toulouse',   budget: '420 000 €', source: "Bien'ici",       status: 'won',       score: 76, profile: 'investor', tags: ['signé', 'location'],        lastContact: '2026-05-13', notes: 'Signé. Mise en location prévue en septembre.' },
  { id: 'l11', name: 'Nathalie Simon',  email: 'n.simon@hotmail.com',   phone: '07 12 34 56 78', property: 'Appt 2P Lyon',      budget: '185 000 €', source: 'MeilleursAgents',status: 'lost',      score: 32, profile: 'low',      tags: ['injoignable'],              lastContact: '2026-05-10', notes: 'Plus de réponse depuis 12 jours.' },
  { id: 'l12', name: 'Julien Rousseau', email: 'j.rousseau@email.fr',   phone: '06 23 45 67 89', property: 'Studio Paris 18',   budget: '195 000 €', source: 'Leboncoin',      status: 'lost',      score: 28, profile: 'low',      tags: ['budget trop bas'],          lastContact: '2026-05-09', notes: 'Budget incompatible avec le bien demandé.' },
]

/* ── Analytics static data ────────────────────────────── */

const FUNNEL_DATA = [
  { month: 'Janv', leads: 12, visites: 5,  gagnés: 2 },
  { month: 'Févr', leads: 18, visites: 7,  gagnés: 3 },
  { month: 'Mars', leads: 15, visites: 6,  gagnés: 4 },
  { month: 'Avr',  leads: 22, visites: 9,  gagnés: 5 },
  { month: 'Mai',  leads: 28, visites: 11, gagnés: 6 },
]

const SOURCE_DATA = [
  { name: 'SeLoger',   value: 32, color: '#3B82F6' },
  { name: 'Leboncoin', value: 28, color: '#F59E0B' },
  { name: 'PAP',       value: 18, color: '#8B5CF6' },
  { name: "Bien'ici",  value: 14, color: '#10B981' },
  { name: 'Autre',     value: 8,  color: '#64748B' },
]

const CITY_DATA = [
  { city: 'Paris',     leads: 42, value: '1.2M€' },
  { city: 'Lyon',      leads: 18, value: '380k€' },
  { city: 'Bordeaux',  leads: 14, value: '290k€' },
  { city: 'Marseille', leads: 11, value: '240k€' },
  { city: 'Nantes',    leads: 9,  value: '180k€' },
]

const RESPONSE_DATA = [
  { day: 'Lun', taux: 72 },
  { day: 'Mar', taux: 85 },
  { day: 'Mer', taux: 61 },
  { day: 'Jeu', taux: 90 },
  { day: 'Ven', taux: 78 },
  { day: 'Sam', taux: 45 },
  { day: 'Dim', taux: 30 },
]

const EMAIL_TEMPLATES = [
  { id: 't1', label: 'Prise de contact', delay: 'Immédiat', icon: '👋',
    subject: 'Votre recherche immobilière — PASMAL',
    body: 'Bonjour {prénom},\n\nNous avons bien reçu votre demande concernant {bien}. Je suis {agent}, votre conseiller PASMAL dédié.\n\nQuand seriez-vous disponible pour une visite ?\n\nCordialement,\n{agent}' },
  { id: 't2', label: 'Relance J+3', delay: 'Après 3 jours', icon: '🔔',
    subject: 'Toujours intéressé ? | PASMAL',
    body: 'Bonjour {prénom},\n\nJe me permets de revenir vers vous au sujet de {bien}. Le bien est toujours disponible et suscite beaucoup d\'intérêt.\n\nN\'hésitez pas à me contacter.\n\n{agent}' },
  { id: 't3', label: 'Confirmation de visite', delay: 'Visite prévue', icon: '📅',
    subject: 'Votre visite confirmée — {bien}',
    body: 'Bonjour {prénom},\n\nJe vous confirme notre rendez-vous le {date} à {heure} pour la visite de {bien}.\n\nAdresse : {adresse}\n\nÀ très bientôt,\n{agent}' },
  { id: 't4', label: 'Suivi post-visite', delay: 'Après la visite', icon: '💬',
    subject: 'Suite à votre visite | PASMAL',
    body: 'Bonjour {prénom},\n\nMerci d\'avoir visité {bien} avec nous. Qu\'avez-vous pensé du bien ? Avez-vous des questions ?\n\nJe reste disponible.\n\n{agent}' },
  { id: 't5', label: 'Offre personnalisée', delay: 'Négociation', icon: '🤝',
    subject: 'Une proposition pour vous | PASMAL',
    body: 'Bonjour {prénom},\n\nSuite à nos échanges, j\'ai le plaisir de vous transmettre une proposition personnalisée pour {bien}.\n\nJe reste disponible pour en discuter.\n\n{agent}' },
]

/* ── Helpers ──────────────────────────────────────────── */

export function scoreColor(score) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50'
  if (score >= 60) return 'text-amber-600 bg-amber-50'
  return 'text-rose-600 bg-rose-50'
}

export function ScoreBadge({ score }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${scoreColor(score)}`}>
      {score}
    </span>
  )
}

function ProfileChip({ profile: key, dark }) {
  const p = PROFILES[key]
  const cls =
    key === 'serious'  ? (dark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700') :
    key === 'investor' ? (dark ? 'bg-indigo-900/40 text-indigo-400'   : 'bg-indigo-50 text-indigo-700')   :
    key === 'agency'   ? (dark ? 'bg-amber-900/40 text-amber-400'     : 'bg-amber-50 text-amber-700')     :
                         (dark ? 'bg-white/10 text-white/50'           : 'bg-slate-100 text-slate-600')
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>
      {p.icon} {p.label}
    </span>
  )
}

/* ── Lead Card ────────────────────────────────────────── */

export function LeadCard({ lead, dark, onOpen }) {
  return (
    <div
      onClick={() => onOpen?.(lead)}
      className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
        dark
          ? 'bg-[#0F1A2E] border-white/10 hover:border-white/20'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-soft'
      }`}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <Avatar name={lead.name} size={32} />
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{lead.name}</div>
          <div className={`text-xs truncate ${dark ? 'text-white/50' : 'text-slate-500'}`}>{lead.property}</div>
        </div>
        <ScoreBadge score={lead.score} />
      </div>
      <div className={`text-xs mb-2.5 font-semibold ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{lead.budget}</div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <ProfileChip profile={lead.profile} dark={dark} />
        <span className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>{lead.lastContact}</span>
      </div>
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.map(t => (
            <span key={t} className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
              dark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500'
            }`}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sortable Card (wrapper DnD) ─────────────────────── */

function SortableLeadCard({ lead, dark, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      {...attributes}
      {...listeners}
    >
      <LeadCard lead={lead} dark={dark} onOpen={onOpen} />
    </div>
  )
}

/* ── Kanban Column (droppable) ────────────────────────── */

function KanbanColumn({ col, leads, dark, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div className="flex flex-col shrink-0 w-[250px]">
      <div className="flex items-center gap-2 px-1 mb-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
        <span className={`text-sm font-bold flex-1 ${dark ? 'text-white' : 'text-navy-900'}`}>{col.label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500'}`}>
          {leads.length}
        </span>
      </div>
      <div ref={setNodeRef} className={`flex-1 rounded-2xl p-2 space-y-2 min-h-[100px] border-2 border-dashed transition-colors ${
        isOver
          ? dark ? 'border-orange-500/60 bg-orange-900/10' : 'border-orange-300 bg-orange-50/50'
          : dark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} dark={dark} onOpen={onOpen} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className={`py-6 text-center text-xs ${dark ? 'text-white/20' : 'text-slate-300'}`}>
            Déposer ici
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Kanban View ──────────────────────────────────────── */

function KanbanView({ leads, setLeads, dark, onOpen }) {
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const activeLead = leads.find(l => l.id === activeId)

  function handleDragEnd({ active, over }) {
    if (!over) { setActiveId(null); return }
    const aId = active.id
    const oId = over.id
    const isColDrop = COLS.some(c => c.id === oId)
    const srcLead = leads.find(l => l.id === aId)
    const targetColId = isColDrop ? oId : leads.find(l => l.id === oId)?.status
    if (!targetColId || !srcLead) { setActiveId(null); return }
    setLeads(prev => {
      const updated = [...prev]
      const srcIdx = updated.findIndex(l => l.id === aId)
      if (srcLead.status !== targetColId) {
        updated[srcIdx] = { ...updated[srcIdx], status: targetColId }
      } else if (!isColDrop) {
        const overIdx = updated.findIndex(l => l.id === oId)
        return arrayMove(updated, srcIdx, overIdx)
      }
      return updated
    })
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
        {COLS.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            leads={leads.filter(l => l.status === col.id)}
            dark={dark}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} dark={dark} onOpen={() => {}} />}
      </DragOverlay>
    </DndContext>
  )
}

/* ── Leads List View (placeholder) ───────────────────── */

function LeadsView({ leads, dark, onOpen }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() =>
    leads.filter(l =>
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    ), [leads, search])

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 px-4 h-10 rounded-2xl border w-full max-w-sm ${
        dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <I.Search size={15} className={dark ? 'text-white/40' : 'text-slate-400'} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un lead…"
          className={`flex-1 bg-transparent text-sm focus:outline-none ${dark ? 'text-white placeholder-white/30' : 'text-navy-900'}`}
        />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/10' : 'border-slate-100'}`}>
        <div className={`hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider border-b ${
          dark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-400'
        }`}>
          <span>Lead</span><span>Bien / Budget</span><span>Score</span><span>Statut</span><span></span>
        </div>
        {filtered.map((lead, i) => {
          const col = COLS.find(c => c.id === lead.status)
          return (
            <motion.div key={lead.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onOpen(lead)}
              className={`grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center cursor-pointer border-b last:border-0 transition ${
                dark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={lead.name} size={32} />
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{lead.name}</div>
                  <div className={`text-xs truncate ${dark ? 'text-white/40' : 'text-slate-400'}`}>{lead.email}</div>
                </div>
              </div>
              <div className="min-w-0">
                <div className={`text-sm truncate ${dark ? 'text-white/70' : 'text-slate-600'}`}>{lead.property}</div>
                <div className={`text-xs font-semibold ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{lead.budget}</div>
              </div>
              <ScoreBadge score={lead.score} />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap"
                style={{ backgroundColor: col?.color }}>
                {col?.label}
              </span>
              <button className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-400'}`}>
                <I.MoreH size={15} />
              </button>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className={`py-12 text-center text-sm ${dark ? 'text-white/30' : 'text-slate-400'}`}>
            Aucun lead trouvé.
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Lead Detail Modal ────────────────────────────────── */

function LeadModal({ lead, dark, onClose, onStatusChange }) {
  const [note, setNote] = useState(lead.notes)
  const [editNote, setEditNote] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className={`relative z-10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl ${dark ? 'bg-[#0B1120]' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <div className="flex items-start gap-4">
            <Avatar name={lead.name} size={48} />
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>{lead.name}</h3>
              <div className={`text-sm ${dark ? 'text-white/60' : 'text-slate-500'}`}>{lead.property}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <ScoreBadge score={lead.score} />
                <ProfileChip profile={lead.profile} dark={dark} />
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition ${dark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-400'}`}>
              <I.X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
          {/* Infos contact */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: I.Mail,  val: lead.email  },
              { icon: I.Phone, val: lead.phone  },
              { icon: I.Tag,   val: lead.budget },
              { icon: I.Globe, val: lead.source },
            ].map(({ icon: Icon, val }) => (
              <div key={val} className={`flex items-center gap-2 text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>
                <Icon size={14} className={dark ? 'text-white/30' : 'text-slate-400'} />
                <span className="truncate">{val}</span>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div>
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-white/40' : 'text-slate-400'}`}>Statut pipeline</div>
            <div className="flex flex-wrap gap-2">
              {COLS.map(col => (
                <button key={col.id}
                  onClick={() => onStatusChange(lead.id, col.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                    lead.status === col.id
                      ? 'text-white border-transparent'
                      : dark ? 'border-white/20 text-white/60 hover:border-white/40' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  style={lead.status === col.id ? { backgroundColor: col.color, borderColor: col.color } : {}}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-white/40' : 'text-slate-400'}`}>Notes</div>
              <button onClick={() => setEditNote(e => !e)} className={`text-xs flex items-center gap-1 ${dark ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-600'}`}>
                <I.Edit size={12} /> {editNote ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            {editNote
              ? <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  className={`w-full text-sm rounded-xl p-3 border resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                    dark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-slate-50 border-slate-200 text-navy-900'
                  }`}
                />
              : <p className={`text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>{note || '—'}</p>
            }
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-white/40' : 'text-slate-400'}`}>Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map(t => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dark ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-600'}`}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`p-4 border-t flex gap-2 flex-wrap ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white transition min-w-[120px]">
            <I.Mail size={15} /> Envoyer email
          </button>
          <button className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${dark ? 'border-white/10 text-white/70 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <I.Calendar size={15} /> Visite
          </button>
          <button className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${dark ? 'border-white/10 text-white/70 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <I.Phone size={15} /> Appeler
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Analytics View ───────────────────────────────────── */

function AnalyticsView({ leads, dark }) {
  const txt  = dark ? '#94A3B8' : '#64748B'
  const grid = dark ? '#1E293B' : '#F1F5F9'
  const total = leads.length
  const won   = leads.filter(l => l.status === 'won').length
  const lost  = leads.filter(l => l.status === 'lost').length
  const nego  = leads.filter(l => l.status === 'nego').length
  const conv  = total ? Math.round((won / total) * 100) : 0
  const avgScore = total ? Math.round(leads.reduce((a, l) => a + l.score, 0) / total) : 0

  const kpis = [
    { label: 'Total leads',    value: total,    icon: I.Users,       color: 'text-blue-600 bg-blue-50'       },
    { label: 'Taux de conv.',  value: `${conv}%`,icon: I.TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Score IA moyen', value: avgScore, icon: I.Sparkles,    color: 'text-violet-600 bg-violet-50'   },
    { label: 'Perdus',         value: lost,     icon: I.TrendingDown,color: 'text-rose-600 bg-rose-50'       },
  ]

  const card = `rounded-2xl p-5 border ${dark ? 'bg-[#0F1A2E] border-white/10' : 'bg-white border-slate-100 shadow-soft'}`

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={card}>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={16} />
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>{value}</div>
            <div className={`text-xs mt-1 ${dark ? 'text-white/40' : 'text-slate-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className={card}>
          <div className={`text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-navy-900'}`}>Entonnoir de conversion</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={FUNNEL_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="month" tick={{ fill: txt, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: txt, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: dark ? '#0F1A2E' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="leads"   name="Leads"   fill="#3B82F6" radius={[4,4,0,0]} />
              <Bar dataKey="visites" name="Visites" fill="#8B5CF6" radius={[4,4,0,0]} />
              <Bar dataKey="gagnés"  name="Gagnés"  fill="#10B981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sources */}
        <div className={card}>
          <div className={`text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-navy-900'}`}>Sources de leads</div>
          <div className="flex items-center gap-6">
            <PieChart width={140} height={140}>
              <Pie data={SOURCE_DATA} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {SOURCE_DATA.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-2.5">
              {SOURCE_DATA.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className={`text-xs flex-1 ${dark ? 'text-white/60' : 'text-slate-600'}`}>{s.name}</span>
                  <span className={`text-xs font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taux de réponse */}
        <div className={card}>
          <div className={`text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-navy-900'}`}>Taux de réponse par jour</div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={RESPONSE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="day" tick={{ fill: txt, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: txt, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: dark ? '#0F1A2E' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} formatter={v => [`${v}%`, 'Taux']} />
              <Area type="monotone" dataKey="taux" stroke="#F97316" strokeWidth={2} fill="url(#respGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Meilleures villes */}
        <div className={card}>
          <div className={`text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-navy-900'}`}>Meilleures villes</div>
          <div className="space-y-3">
            {CITY_DATA.map((c, i) => (
              <div key={c.city} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                  i === 0 ? 'bg-orange-600 text-white' : dark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-600'
                }`}>{i + 1}</span>
                <span className={`text-sm font-semibold w-20 ${dark ? 'text-white' : 'text-navy-900'}`}>{c.city}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(c.leads / CITY_DATA[0].leads) * 100}%` }} />
                </div>
                <span className={`text-xs font-bold w-8 text-right ${dark ? 'text-white/60' : 'text-slate-500'}`}>{c.leads}</span>
                <span className={`text-xs w-14 text-right font-semibold ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Automation View ──────────────────────────────────── */

function AutomationView({ leads, dark }) {
  const [openTpl, setOpenTpl] = useState(null)

  const NOW = new Date('2026-05-23')
  const reminders = leads
    .filter(l => ['contacted', 'visit', 'nego'].includes(l.status))
    .map(l => ({ ...l, daysSince: Math.floor((NOW - new Date(l.lastContact)) / 86400000) }))
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 5)

  const card = `rounded-2xl border ${dark ? 'bg-[#0F1A2E] border-white/10' : 'bg-white border-slate-100 shadow-soft'}`
  const hd   = `px-5 py-4 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Templates */}
      <div className={card}>
        <div className={hd}>
          <div className={`text-sm font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>Templates d'emails automatiques</div>
          <div className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-slate-400'}`}>Séquences de suivi prédéfinies</div>
        </div>
        <div className="p-3 space-y-2">
          {EMAIL_TEMPLATES.map(t => (
            <div key={t.id}
              onClick={() => setOpenTpl(openTpl === t.id ? null : t.id)}
              className={`rounded-xl p-3.5 cursor-pointer border transition-all ${
                openTpl === t.id
                  ? dark ? 'border-orange-500/40 bg-orange-900/20' : 'border-orange-200 bg-orange-50'
                  : dark ? 'border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/5' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${dark ? 'text-white' : 'text-navy-900'}`}>{t.label}</div>
                  <div className={`text-xs ${dark ? 'text-white/40' : 'text-slate-400'}`}>{t.delay}</div>
                </div>
                <I.ChevronDown size={14} className={`transition-transform shrink-0 ${openTpl === t.id ? 'rotate-180' : ''} ${dark ? 'text-white/30' : 'text-slate-400'}`} />
              </div>

              <AnimatePresence>
                {openTpl === t.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-3 pt-3 border-t ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-slate-400'}`}>Objet</div>
                      <div className={`text-xs mb-3 ${dark ? 'text-white/60' : 'text-slate-600'}`}>{t.subject}</div>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-slate-400'}`}>Corps</div>
                      <pre className={`text-xs whitespace-pre-wrap font-sans leading-relaxed ${dark ? 'text-white/60' : 'text-slate-600'}`}>{t.body}</pre>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition flex items-center justify-center gap-1.5">
                          <I.Send size={12}/> Envoyer maintenant
                        </button>
                        <button className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${dark ? 'border-white/15 text-white/60 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          <I.Edit size={12}/>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Colonne droite */}
      <div className="space-y-5">

        {/* Relances prioritaires */}
        <div className={card}>
          <div className={hd}>
            <div className={`text-sm font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>Relances prioritaires</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-slate-400'}`}>Leads à recontacter en urgence</div>
          </div>
          <div className="p-3 space-y-2">
            {reminders.map(lead => {
              const col = COLS.find(c => c.id === lead.status)
              const urgent = lead.daysSince > 5
              return (
                <div key={lead.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  urgent
                    ? dark ? 'border-rose-500/30 bg-rose-900/10' : 'border-rose-100 bg-rose-50'
                    : dark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100'
                }`}>
                  <Avatar name={lead.name} size={34} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{lead.name}</div>
                    <div className={`text-xs font-medium ${urgent ? 'text-rose-500' : dark ? 'text-white/40' : 'text-slate-400'}`}>
                      Il y a {lead.daysSince} jour{lead.daysSince > 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: col?.color }}>
                    {col?.label}
                  </span>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white transition shrink-0">
                    <I.Mail size={13}/>
                  </button>
                </div>
              )
            })}
            {reminders.length === 0 && (
              <div className={`py-6 text-center text-sm ${dark ? 'text-white/30' : 'text-slate-400'}`}>Aucune relance en attente.</div>
            )}
          </div>
        </div>

        {/* Légende score IA */}
        <div className={card}>
          <div className={hd}>
            <div className={`flex items-center gap-2 text-sm font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>
              <I.Sparkles size={15} className="text-violet-500"/> Score IA — Légende
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { range: '80–100', label: 'Acheteur très motivé', color: 'bg-emerald-500', w: 100 },
              { range: '60–79',  label: 'Intérêt confirmé',     color: 'bg-amber-500',  w: 72  },
              { range: '40–59',  label: 'En exploration',       color: 'bg-orange-500', w: 50  },
              { range: '0–39',   label: 'Faible intention',     color: 'bg-rose-500',   w: 28  },
            ].map(row => (
              <div key={row.range} className="flex items-center gap-3">
                <span className={`text-[11px] font-bold w-14 shrink-0 ${dark ? 'text-white/50' : 'text-slate-500'}`}>{row.range}</span>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.w}%` }} />
                </div>
                <span className={`text-xs w-36 ${dark ? 'text-white/50' : 'text-slate-500'}`}>{row.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Placeholders pour Analytics & Automation ─────────── */

function PlaceholderTab({ label, icon: Icon, dark }) {
  return (
    <div className={`rounded-3xl p-12 text-center border ${dark ? 'bg-[#0F1A2E] border-white/10' : 'bg-white border-slate-100'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-white/10 text-white/50' : 'bg-orange-50 text-orange-500'}`}>
        <Icon size={24} />
      </div>
      <div className={`text-lg font-bold mb-1 ${dark ? 'text-white' : 'text-navy-900'}`}>{label}</div>
      <div className={`text-sm ${dark ? 'text-white/40' : 'text-slate-400'}`}>En cours de construction…</div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────── */

const TABS = [
  { id: 'kanban',     label: 'Kanban',     icon: I.LayoutDashboard },
  { id: 'leads',      label: 'Leads',      icon: I.Users },
  { id: 'analytics',  label: 'Analytics',  icon: I.BarChart },
  { id: 'automation', label: 'Automation', icon: I.Zap },
]

export default function UDCRM() {
  const { dark } = useOutletContext()
  const [leads, setLeads] = useState(SEED_LEADS)
  const [tab, setTab] = useState('kanban')
  const [selected, setSelected] = useState(null)

  const won   = leads.filter(l => l.status === 'won').length
  const total = leads.length
  const rate  = total ? Math.round((won / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>
            CRM Immobilier
          </h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-white/50' : 'text-slate-500'}`}>
            {total} leads · {won} gagnés · Taux de conv. {rate}%
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition">
          <I.Plus size={16} /> Nouveau lead
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total leads',    value: total,             color: 'text-blue-600 bg-blue-50',    icon: I.Users },
          { label: 'Taux de conv.',  value: `${rate}%`,        color: 'text-emerald-600 bg-emerald-50', icon: I.TrendingUp },
          { label: 'En négociation', value: leads.filter(l => l.status === 'nego').length, color: 'text-amber-600 bg-amber-50', icon: I.Flag },
          { label: 'Perdus',         value: leads.filter(l => l.status === 'lost').length, color: 'text-rose-600 bg-rose-50',   icon: I.TrendingDown },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl p-4 border ${dark ? 'bg-[#0F1A2E] border-white/10' : 'bg-white border-slate-100 shadow-soft'}`}>
            <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mb-2`}>
              <Icon size={15} />
            </div>
            <div className={`text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>{value}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-slate-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-2xl w-fit ${dark ? 'bg-white/5' : 'bg-slate-100'}`}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === id
                ? dark ? 'bg-[#0F1A2E] text-white shadow-lg' : 'bg-white text-navy-900 shadow-soft'
                : dark ? 'text-white/50 hover:text-white/70' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Modal lead */}
      <AnimatePresence>
        {selected && (
          <LeadModal
            lead={selected}
            dark={dark}
            onClose={() => setSelected(null)}
            onStatusChange={(id, status) => {
              setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
              setSelected(prev => ({ ...prev, status }))
            }}
          />
        )}
      </AnimatePresence>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'kanban'     && <KanbanView leads={leads} setLeads={setLeads} dark={dark} onOpen={setSelected} />}
          {tab === 'leads'      && <LeadsView      leads={leads} dark={dark} onOpen={setSelected} />}
          {tab === 'analytics'  && <AnalyticsView leads={leads} dark={dark} />}
          {tab === 'automation' && <AutomationView leads={leads} dark={dark} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
