import React, { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCorners, useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy,
  sortableKeyboardCoordinates, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { I, Button, Avatar } from '../lib/ui.jsx'

/* ============================================================
   CRM Leads — Kanban premium (HubSpot-style)
   Étape 3 : modal détail lead (slide-in panel)
   ============================================================ */

const COLUMNS = [
  { id: 'new',         label: 'Nouveau lead', accent: '#FF6B00', bg: 'from-orange-50 to-orange-50/0' },
  { id: 'contacted',   label: 'Contacté',     accent: '#6366F1', bg: 'from-indigo-50 to-indigo-50/0' },
  { id: 'visit',       label: 'Visite',       accent: '#F59E0B', bg: 'from-amber-50 to-amber-50/0'  },
  { id: 'negotiation', label: 'Négociation',  accent: '#0B1F3A', bg: 'from-slate-100 to-slate-50/0' },
  { id: 'won',         label: 'Gagné',        accent: '#10B981', bg: 'from-emerald-50 to-emerald-50/0' },
]

const SOURCES = ['SeLoger', 'Site PASMAL', 'Recommandation', 'Instagram', 'Salon']

const INITIAL_LEADS = [
  { id: 'l1',  status: 'new',         first: 'Camille',   last: 'Lefèvre',  city: 'Paris 11ᵉ',   type: 'T3',         budget: 480000,  score: 92, source: 'SeLoger',        lastSeen: 'Il y a 12 min', tags: ['Hot']   },
  { id: 'l2',  status: 'new',         first: 'Julien',    last: 'Moreau',   city: 'Lyon 6ᵉ',     type: 'Studio',     budget: 240000,  score: 78, source: 'Site PASMAL',    lastSeen: 'Il y a 1h'      },
  { id: 'l3',  status: 'new',         first: 'Sofia',     last: 'Benali',   city: 'Marseille',   type: 'T2',         budget: 195000,  score: 65, source: 'Instagram',      lastSeen: 'Il y a 3h'      },
  { id: 'l4',  status: 'contacted',   first: 'Marc',      last: 'Dubois',   city: 'Bordeaux',    type: 'Maison',     budget: 720000,  score: 88, source: 'Recommandation', lastSeen: 'Hier'            },
  { id: 'l5',  status: 'contacted',   first: 'Élodie',    last: 'Garnier',  city: 'Nantes',      type: 'T3',         budget: 365000,  score: 71, source: 'SeLoger',        lastSeen: 'Hier'            },
  { id: 'l6',  status: 'contacted',   first: 'Thomas',    last: 'Robert',   city: 'Toulouse',    type: 'Colocation', budget: 850,     score: 54, source: 'Salon',          lastSeen: 'Il y a 2j'      },
  { id: 'l7',  status: 'visit',       first: 'Inès',      last: 'Martin',   city: 'Paris 8ᵉ',    type: 'Villa',      budget: 1850000, score: 94, source: 'Recommandation', lastSeen: "Aujourd'hui",    tags: ['VIP']  },
  { id: 'l8',  status: 'visit',       first: 'Antoine',   last: 'Petit',    city: 'Nice',        type: 'T2',         budget: 320000,  score: 82, source: 'SeLoger',        lastSeen: 'Il y a 3j'      },
  { id: 'l9',  status: 'negotiation', first: 'Léa',       last: 'Bernard',  city: 'Lille',       type: 'T3',         budget: 295000,  score: 86, source: 'Site PASMAL',    lastSeen: 'Il y a 4j',     tags: ['Offre']},
  { id: 'l10', status: 'negotiation', first: 'Karim',     last: 'Hamidi',   city: 'Strasbourg',  type: 'Maison',     budget: 540000,  score: 79, source: 'SeLoger',        lastSeen: 'Il y a 5j'      },
  { id: 'l11', status: 'won',         first: 'Charlotte', last: 'Lemoine',  city: 'Rennes',      type: 'T2',         budget: 248000,  score: 100, source: 'Recommandation', lastSeen: 'La semaine dernière', tags: ['Signé'] },
  { id: 'l12', status: 'won',         first: 'Hugo',      last: 'Vincent',  city: 'Montpellier', type: 'Studio',     budget: 178000,  score: 100, source: 'Site PASMAL',   lastSeen: 'La semaine dernière' },
]

const AVATARS = {
  l1:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  l4:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  l7:  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  l11: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
}

/* Extra data shown only in the panel */
const LEAD_EXTRAS = {
  l1:  { phone: '+33 6 12 34 56 78', email: 'camille.lefevre@email.fr',  notes: 'Préfère les appels le matin. Intéressée par le quartier République.' },
  l2:  { phone: '+33 6 23 45 67 89', email: 'j.moreau@gmail.com',         notes: 'Budget serré. Cherche studio meublé, disponible dès juillet.' },
  l3:  { phone: '+33 7 34 56 78 90', email: 'sofia.benali@outlook.com',   notes: '' },
  l4:  { phone: '+33 6 45 67 89 01', email: 'marc.dubois@entreprise.fr',  notes: 'Investisseur. Souhaite une visite samedi matin.' },
  l5:  { phone: '+33 6 56 78 90 12', email: 'elodie.garnier@free.fr',     notes: '' },
  l6:  { phone: '+33 7 67 89 01 23', email: 'thomas.robert@hotmail.fr',   notes: 'Cherche pour la rentrée de septembre.' },
  l7:  { phone: '+33 6 78 90 12 34', email: 'ines.martin@luxe.com',       notes: 'Cliente VIP référencée par Me Leblanc (notaire). Confidentiel.' },
  l8:  { phone: '+33 6 89 01 23 45', email: 'a.petit@yahoo.fr',           notes: '' },
  l9:  { phone: '+33 6 90 12 34 56', email: 'lea.bernard@gmail.com',      notes: 'Offre soumise le 18/05 à 289 000 €. En attente de réponse vendeur.' },
  l10: { phone: '+33 7 01 23 45 67', email: 'k.hamidi@pro.fr',            notes: '' },
  l11: { phone: '+33 6 12 34 56 79', email: 'c.lemoine@notaire.fr',       notes: 'Acte signé. Remise des clés prévue le 15/06. Envoyer le questionnaire satisfaction.' },
  l12: { phone: '+33 6 23 45 67 90', email: 'hugo.vincent@gmail.com',     notes: 'Très satisfait. Demande de recommandation envoyée par email.' },
}

/* Timeline mock — progressive selon le statut du lead */
function getTimeline(lead) {
  const steps = [
    { statuses: ['new','contacted','visit','negotiation','won'], icon: I.Star,       text: 'Lead créé dans le pipeline',           color: '#FF6B00' },
    { statuses: ['contacted','visit','negotiation','won'],       icon: I.Phone,      text: 'Premier contact établi',               color: '#6366F1' },
    { statuses: ['visit','negotiation','won'],                   icon: I.Calendar,   text: 'Visite planifiée et confirmée',         color: '#F59E0B' },
    { statuses: ['negotiation','won'],                           icon: I.FileText,   text: 'Offre envoyée au vendeur',             color: '#64748B' },
    { statuses: ['won'],                                         icon: I.CheckCircle,text: 'Vente conclue — félicitations ! 🎉',   color: '#10B981' },
  ]
  const ages = ['Il y a 8j', 'Il y a 5j', 'Il y a 3j', 'Hier', "Aujourd'hui"]
  return steps
    .filter(s => s.statuses.includes(lead.status))
    .map((s, i) => ({ ...s, date: ages[i] }))
    .reverse()
}

const fmtBudget = (n) => n.toLocaleString('fr-FR') + ' €'

/* ============================================================
   Root CRM component
   ============================================================ */
export default function CRM() {
  const [leads, setLeads] = useState(INITIAL_LEADS)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const isColumnId = (id) => COLUMNS.some((c) => c.id === id)
  const findLead   = (id) => leads.find((l) => l.id === id)

  const onDragStart  = (e) => setActiveId(e.active.id)
  const onDragCancel = () => setActiveId(null)

  const onDragOver = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const activeLead = findLead(active.id); if (!activeLead) return
    if (isColumnId(over.id)) {
      if (activeLead.status !== over.id)
        setLeads(prev => prev.map(l => l.id === active.id ? { ...l, status: over.id } : l))
      return
    }
    const overLead = findLead(over.id); if (!overLead) return
    if (activeLead.status !== overLead.status) {
      setLeads(prev => {
        const next = prev.map(l => l.id === active.id ? { ...l, status: overLead.status } : l)
        const oi = next.findIndex(l => l.id === active.id)
        const ni = next.findIndex(l => l.id === over.id)
        return oi === -1 || ni === -1 ? next : arrayMove(next, oi, ni)
      })
    }
  }

  const onDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id || isColumnId(over.id)) return
    const oi = leads.findIndex(l => l.id === active.id)
    const ni = leads.findIndex(l => l.id === over.id)
    if (oi !== -1 && ni !== -1 && oi !== ni) setLeads(arrayMove(leads, oi, ni))
  }

  const changeStatus = (leadId, newStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    setSelectedLead(prev => prev?.id === leadId ? { ...prev, status: newStatus } : prev)
  }

  const activeLead = activeId ? findLead(activeId) : null

  const filtered = useMemo(() => leads.filter(l => {
    if (search) {
      const q = search.toLowerCase()
      if (!`${l.first} ${l.last} ${l.city} ${l.type}`.toLowerCase().includes(q)) return false
    }
    if (sourceFilter && l.source !== sourceFilter) return false
    if (minBudget && l.budget < Number(minBudget)) return false
    return true
  }), [leads, search, sourceFilter, minBudget])

  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLUMNS.map(c => [c.id, []]))
    filtered.forEach(l => { if (g[l.status]) g[l.status].push(l) })
    return g
  }, [filtered])

  const totalPipeline = leads.filter(l => l.status !== 'won').reduce((s, l) => s + l.budget, 0)
  const wonValue      = leads.filter(l => l.status === 'won').reduce((s, l) => s + l.budget, 0)
  const winRate       = leads.length ? Math.round(leads.filter(l => l.status === 'won').length / leads.length * 100) : 0
  const resetFilters  = () => { setSearch(''); setSourceFilter(''); setMinBudget('') }

  return (
    <div className="space-y-6 relative">
      {/* Gradient blobs */}
      <div className="absolute -top-10 left-1/4 w-[420px] h-[420px] rounded-full bg-orange-200 blur-3xl opacity-25 pointer-events-none -z-0" />
      <div className="absolute top-40 -right-20 w-[460px] h-[460px] rounded-full bg-indigo-200 blur-3xl opacity-25 pointer-events-none -z-0" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Pipeline commercial</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">CRM Leads</h1>
            <p className="text-slate-600 mt-1 text-sm">{leads.length} leads · {COLUMNS.length} étapes · {winRate}% de taux de gain</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><I.Download size={14}/> Exporter</Button>
            <Button size="sm"><I.Plus size={14}/> Nouveau lead</Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard icon={I.TrendingUp}  label="Valeur pipeline" value={fmtBudget(totalPipeline)} tone="orange" />
          <StatCard icon={I.CheckCircle} label="Valeur gagnée"   value={fmtBudget(wonValue)}      tone="emerald" />
          <StatCard icon={I.Users}       label="Leads actifs"    value={leads.filter(l => l.status !== 'won').length} tone="indigo" />
          <StatCard icon={I.BadgeCheck}  label="Taux de gain"    value={`${winRate}%`}             tone="navy" />
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-soft rounded-2xl p-2 mb-5 flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 h-10 bg-white/70 border border-slate-100 rounded-xl">
            <I.Search size={14} className="text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un lead, une ville, un type…"
              className="flex-1 bg-transparent text-sm text-navy-900 placeholder-slate-400 focus:outline-none" />
          </div>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            className="h-10 px-3 bg-white/70 border border-slate-100 rounded-xl text-sm text-navy-900 focus:outline-none">
            <option value="">Toutes les sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2 px-3 h-10 bg-white/70 border border-slate-100 rounded-xl">
            <I.Tag size={14} className="text-slate-400"/>
            <input type="number" value={minBudget} onChange={e => setMinBudget(e.target.value)}
              placeholder="Budget min." className="w-28 bg-transparent text-sm text-navy-900 placeholder-slate-400 focus:outline-none" />
          </div>
          {(search || sourceFilter || minBudget) && (
            <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-orange-600 px-2 flex items-center gap-1">
              <I.X size={12}/> Effacer
            </button>
          )}
        </div>

        {/* Kanban */}
        <DndContext sensors={sensors} collisionDetection={closestCorners}
          onDragStart={onDragStart} onDragOver={onDragOver}
          onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 lg:-mx-8 px-4 lg:px-8 snap-x snap-mandatory lg:snap-none">
            {COLUMNS.map(col => (
              <KanbanColumn key={col.id} col={col}
                cards={grouped[col.id] || []}
                activeId={activeId}
                onOpen={setSelectedLead} />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Slide-in detail panel */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={changeStatus}
      />
    </div>
  )
}

/* ============================================================
   Kanban column
   ============================================================ */
function KanbanColumn({ col, cards, activeId, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const value = cards.reduce((s, l) => s + l.budget, 0)

  return (
    <div ref={setNodeRef}
      className={`flex-shrink-0 w-[88vw] sm:w-[340px] snap-center rounded-3xl border transition-all ${
        isOver && activeId ? 'border-orange-300 bg-orange-50/60 shadow-card' : 'border-white/40 bg-white/55 backdrop-blur-xl'
      }`}>
      <div className={`relative rounded-t-3xl px-4 py-3.5 bg-gradient-to-b ${col.bg}`}>
        <span className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full" style={{ background: col.accent }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
            <h3 className="font-bold text-navy-900 text-sm">{col.label}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-100 rounded-full px-2 py-0.5">{cards.length}</span>
          </div>
          <button className="w-7 h-7 rounded-lg hover:bg-white/80 text-slate-500 hover:text-navy-900 flex items-center justify-center transition">
            <I.Plus size={14}/>
          </button>
        </div>
        {value > 0 && (
          <div className="text-[11px] text-slate-500 mt-1">
            Valeur : <span className="font-semibold text-navy-900">{fmtBudget(value)}</span>
          </div>
        )}
      </div>
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="p-3 space-y-2.5 min-h-[120px] max-h-[calc(100vh-360px)] overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {cards.map(lead => (
              <SortableLeadCard key={lead.id} lead={lead} onOpen={onOpen} />
            ))}
          </AnimatePresence>
          {cards.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">Glissez un lead ici</div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

/* ============================================================
   Sortable wrapper — drag handle separated from click area
   ============================================================ */
function SortableLeadCard({ lead, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LeadCard lead={lead} dragging={isDragging} dragListeners={listeners} onOpen={() => onOpen(lead)} />
    </div>
  )
}

/* ============================================================
   Lead card
   ============================================================ */
function LeadCard({ lead, dragging = false, overlay = false, dragListeners, onOpen }) {
  const score       = lead.score
  const scoreColor  = score >= 85 ? '#10B981' : score >= 65 ? '#F59E0B' : '#94A3B8'
  const avatarSrc   = AVATARS[lead.id]

  return (
    <motion.article
      initial={overlay ? false : { opacity: 0, y: 8 }}
      animate={overlay ? { scale: 1.03 } : { opacity: dragging ? 0.35 : 1, y: 0, scale: 1 }}
      exit={overlay ? undefined : { opacity: 0, y: -8 }}
      whileHover={overlay ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      onClick={!overlay && !dragging ? onOpen : undefined}
      className={`group relative bg-white/85 backdrop-blur-md border rounded-2xl p-3.5 select-none ${
        overlay
          ? 'border-orange-200 shadow-cardHover rotate-1 cursor-grabbing'
          : 'border-white/60 shadow-soft hover:shadow-card cursor-pointer'
      }`}
    >
      {/* Drag handle — top-right corner, only visible on hover */}
      {!overlay && dragListeners && (
        <div
          {...dragListeners}
          onClick={e => e.stopPropagation()}
          title="Glisser"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-100 z-10"
        >
          <DragDots />
        </div>
      )}

      {/* Header: avatar + name + score */}
      <div className="flex items-start gap-3">
        <Avatar name={`${lead.first} ${lead.last}`} src={avatarSrc} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 pr-6">
            <div className="font-semibold text-navy-900 text-[13px] truncate">{lead.first} {lead.last}</div>
            {lead.tags?.includes('VIP') && <Tag label="VIP" color="amber" />}
            {lead.tags?.includes('Hot') && <Tag label="Hot" color="rose" />}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
            <I.MapPin size={10}/> {lead.city}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <ScoreRing score={score} color={scoreColor} size={36} />
        </div>
      </div>

      {/* Type + budget */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="inline-flex items-center gap-1 bg-slate-100 text-navy-900 text-[11px] font-semibold px-2 py-1 rounded-md">
          <I.Building size={11} className="text-orange-600"/> {lead.type}
        </div>
        <div className="text-[13px] font-extrabold text-navy-900 tracking-tight">{fmtBudget(lead.budget)}</div>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
        <span className="truncate">{lead.source} · {lead.lastSeen}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <QuickBtn icon={I.Phone}        title="Appeler"  hoverColor="hover:bg-emerald-50 hover:text-emerald-600" />
          <QuickBtn icon={I.Mail}         title="E-mail"   hoverColor="hover:bg-orange-50 hover:text-orange-600" />
          <QuickBtn icon={I.MessageSquare}title="Message"  hoverColor="hover:bg-indigo-50 hover:text-indigo-600" />
        </div>
      </div>
    </motion.article>
  )
}

/* ============================================================
   Lead detail panel (slide-in)
   ============================================================ */
function LeadDetailPanel({ lead, onClose, onStatusChange }) {
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const extras   = lead ? (LEAD_EXTRAS[lead.id] || {}) : {}
  const timeline = lead ? getTimeline(lead) : []
  const colInfo  = lead ? COLUMNS.find(c => c.id === lead.status) : null

  /* pre-fill note from extras when lead changes */
  useEffect(() => {
    if (lead) {
      setSavedNote(extras.notes || '')
      setNote(extras.notes || '')
    }
  }, [lead?.id])

  /* Escape closes */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-900/40 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: colInfo?.accent }} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{colInfo?.label}</span>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-navy-900 flex items-center justify-center transition">
                <I.X size={16}/>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* Hero */}
              <div className="px-5 pt-6 pb-4 flex items-start gap-4">
                <div className="relative shrink-0">
                  <Avatar name={`${lead.first} ${lead.last}`} src={AVATARS[lead.id]} size={72} />
                  {lead.score >= 85 && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <I.Check size={10} className="text-white"/>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold text-navy-900 tracking-tight leading-tight">
                    {lead.first} {lead.last}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                    <I.MapPin size={12}/> {lead.city}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {lead.tags?.includes('VIP')   && <Tag label="VIP"   color="amber" />}
                    {lead.tags?.includes('Hot')   && <Tag label="Hot"   color="rose"  />}
                    {lead.tags?.includes('Offre') && <Tag label="Offre" color="indigo"/>}
                    {lead.tags?.includes('Signé') && <Tag label="Signé" color="emerald"/>}
                  </div>
                </div>
                <div className="shrink-0">
                  <ScoreRing score={lead.score} color={lead.score >= 85 ? '#10B981' : lead.score >= 65 ? '#F59E0B' : '#94A3B8'} size={52} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-5 grid grid-cols-3 gap-2">
                <ActionBtn icon={I.Phone}         label="Appeler"  color="emerald" href={`tel:${extras.phone}`} />
                <ActionBtn icon={I.Mail}          label="E-mail"   color="orange"  href={`mailto:${extras.email}`} />
                <ActionBtn icon={I.MessageSquare} label="Message"  color="indigo" />
              </div>

              <Divider />

              {/* Info grid */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                <InfoCell icon={I.Tag}       label="Budget"      value={fmtBudget(lead.budget)} />
                <InfoCell icon={I.Building}  label="Type"        value={lead.type} />
                <InfoCell icon={I.Globe}     label="Source"      value={lead.source} />
                <InfoCell icon={I.Clock}     label="Dernière activité" value={lead.lastSeen} />
                {extras.phone && <InfoCell icon={I.Phone} label="Téléphone" value={extras.phone} />}
                {extras.email && <InfoCell icon={I.Mail}  label="Email"     value={extras.email} mono />}
              </div>

              <Divider />

              {/* Stage changer */}
              <div className="px-5 py-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Changer d'étape</div>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => onStatusChange(lead.id, col.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        lead.status === col.id
                          ? 'border-transparent text-white shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                      style={lead.status === col.id ? { background: col.accent } : {}}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: lead.status === col.id ? 'rgba(255,255,255,0.7)' : col.accent }} />
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Timeline */}
              <div className="px-5 py-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Historique</div>
                <div className="space-y-0">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {/* Line */}
                      {i < timeline.length - 1 && (
                        <div className="absolute left-[15px] top-7 bottom-0 w-px bg-slate-100" />
                      )}
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-white z-10"
                        style={{ color: event.color }}>
                        <event.icon size={14}/>
                      </div>
                      <div className="flex-1 pb-4 min-w-0">
                        <div className="text-sm font-medium text-navy-900 leading-snug">{event.text}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{event.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Notes */}
              <div className="px-5 py-4 pb-8">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ajouter une note sur ce lead…"
                  rows={3}
                  className="w-full text-sm text-navy-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                />
                {note !== savedNote && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button onClick={() => setNote(savedNote)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                      Annuler
                    </button>
                    <button
                      onClick={() => setSavedNote(note)}
                      className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                      <I.Check size={12}/> Enregistrer
                    </button>
                  </div>
                )}
              </div>

            </div>{/* end scrollable */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   Micro-components
   ============================================================ */

function ScoreRing({ score, color, size = 36 }) {
  const r = size * 0.415
  const circ = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={size*0.083}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={size*0.083} strokeLinecap="round"
          strokeDasharray={`${(score/100)*circ} ${circ}`}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-extrabold text-navy-900"
        style={{ fontSize: size * 0.275 }}>
        {score}
      </div>
    </div>
  )
}

function Tag({ label, color }) {
  const styles = {
    amber:   'bg-amber-100 text-amber-700',
    rose:    'bg-rose-100 text-rose-700',
    indigo:  'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider ${styles[color] || ''}`}>
      {label}
    </span>
  )
}

function QuickBtn({ icon: Icon, title, hoverColor }) {
  return (
    <button title={title} className={`w-6 h-6 rounded-md ${hoverColor} flex items-center justify-center transition`}>
      <Icon size={12}/>
    </button>
  )
}

function ActionBtn({ icon: Icon, label, color, href }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    orange:  'bg-orange-50  text-orange-700  hover:bg-orange-100  border-orange-200',
    indigo:  'bg-indigo-50  text-indigo-700  hover:bg-indigo-100  border-indigo-200',
  }
  const Tag = href ? 'a' : 'button'
  return (
    <Tag href={href}
      className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-semibold transition ${colors[color]}`}>
      <Icon size={18}/>
      {label}
    </Tag>
  )
}

function InfoCell({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        <Icon size={10}/> {label}
      </div>
      <div className={`text-sm font-semibold text-navy-900 truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  )
}

function Divider() {
  return <div className="mx-5 h-px bg-slate-100" />
}

function DragDots() {
  return (
    <svg width={12} height={16} viewBox="0 0 12 16" fill="currentColor" className="text-slate-400">
      <circle cx="3" cy="3"  r="1.5"/><circle cx="9" cy="3"  r="1.5"/>
      <circle cx="3" cy="8"  r="1.5"/><circle cx="9" cy="8"  r="1.5"/>
      <circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/>
    </svg>
  )
}

/* ============================================================
   KPI strip card
   ============================================================ */
function StatCard({ icon: Icon, label, value, tone = 'orange' }) {
  const tones = {
    orange:  'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    navy:    'bg-navy-900 text-white',
  }
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-soft flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${tones[tone]} flex items-center justify-center shrink-0`}>
        <Icon size={18}/>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 truncate">{label}</div>
        <div className="font-extrabold text-navy-900 text-base lg:text-lg truncate">{value}</div>
      </div>
    </div>
  )
}

/* Expose I.Clock and I.Globe used in InfoCell — add if not already in ui.jsx */
I.Clock ??= (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
I.Globe ??= (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
