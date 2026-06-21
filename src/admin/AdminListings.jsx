import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Counter, Button, Avatar, Badge } from '../lib/ui.jsx'
import { PasmalSelect } from '../components/ui/PasmalSelect'

/* ============================================================
   Super Admin — Listings Moderation
   Cards/table hybrid · premium moderation dashboard
   ============================================================ */

const u = (id, w = 320) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const SEED_LISTINGS = [
  { id: 'PSM-2421', title: 'Studio cosy Bastille',         city: 'Paris 11ᵉ',   price: 320000, type: 'acheter', owner: 'Camille Lefèvre', owner_kind: 'particulier', trust_score: 92, status: 'pending',  is_featured: false, fraud: false, reports: 0, created_at: '2026-05-16', signals: ['Photos HD', 'KYC validé', 'Prix marché'] , img: u('photo-1502672260266-1c1ef2d93688') },
  { id: 'PSM-2422', title: 'T3 balcon vue dégagée',         city: 'Lyon 6ᵉ',     price: 485000, type: 'acheter', owner: 'Foncia Premium',   owner_kind: 'agence',       trust_score: 96, status: 'pending',  is_featured: false, fraud: false, reports: 0, created_at: '2026-05-16', signals: ['Agence vérifiée', 'Description complète'], img: u('photo-1560448204-e02f11c3d0e2') },
  { id: 'PSM-2423', title: 'Maison 200m² NEUVE — URGENT',   city: 'Bordeaux',    price: 220000, type: 'acheter', owner: 'Pierre Martin',    owner_kind: 'particulier', trust_score: 28, status: 'pending',  is_featured: false, fraud: true,  reports: 0, created_at: '2026-05-15', signals: ['Prix anormal -55%', 'KYC manquant', 'Photos stock', 'Spam: WhatsApp + pas d\'agence'], img: u('photo-1564013799919-ab600027ffc6') },

  { id: 'PSM-2418', title: 'Loft industriel Joliette',      city: 'Marseille',   price: 690000, type: 'acheter', owner: 'Engel & Völkers',  owner_kind: 'agence',       trust_score: 94, status: 'approved', is_featured: true,  fraud: false, reports: 0, created_at: '2026-05-12', signals: ['Agence verified', 'Photos HD'], img: u('photo-1493809842364-78817add7ffb') },
  { id: 'PSM-2417', title: 'T2 Capitole',                   city: 'Toulouse',    price: 245000, type: 'acheter', owner: 'Inès Martin',      owner_kind: 'particulier', trust_score: 88, status: 'approved', is_featured: false, fraud: false, reports: 0, created_at: '2026-05-13', signals: ['KYC validé', 'Description complète'], img: u('photo-1600585154340-be6161a56a0c') },
  { id: 'PSM-2416', title: 'Villa avec piscine',            city: 'Aix-en-Provence', price: 1850000, type: 'acheter', owner: 'BARNES Premium', owner_kind: 'agence',     trust_score: 98, status: 'approved', is_featured: true,  fraud: false, reports: 0, created_at: '2026-05-08', signals: ['Agence premium', 'Photos pro'], img: u('photo-1613490493576-7fde63acd811') },

  { id: 'PSM-2413', title: 'Appartement 50m² Nice centre',  city: 'Nice',        price: 95000,  type: 'acheter', owner: 'inconnu_492',      owner_kind: 'particulier', trust_score: 18, status: 'reported', is_featured: false, fraud: true,  reports: 7, created_at: '2026-05-16', signals: ['Duplicate 94% avec PSM-2401', 'Watermark sur photos', 'Crypto + Western Union'], img: u('photo-1554995207-c18c203602cb') },
  { id: 'PSM-2419', title: 'Coloc design 4 ch.',            city: 'Nantes',      price: 590,    type: 'colocation', owner: 'Thomas Robert', owner_kind: 'particulier', trust_score: 54, status: 'reported', is_featured: false, fraud: false, reports: 3, created_at: '2026-05-14', signals: ['Téléphone non vérifié', 'Photos basse résolution'], img: u('photo-1522708323590-d24dbb6b0267') },

  { id: 'PSM-2398', title: 'Appartement Lille — URGENT',    city: 'Lille',       price: 89000,  type: 'acheter', owner: 'fast_seller_22',   owner_kind: 'particulier', trust_score: 12, status: 'rejected', is_featured: false, fraud: true,  reports: 12, created_at: '2026-05-09', signals: ['Western Union', 'Sans visite', 'Duplicate confirmé'], img: u('photo-1554995207-c18c203602cb') },
  { id: 'PSM-2401', title: 'Studio Nice (rejeté)',          city: 'Nice',        price: 92000,  type: 'acheter', owner: 'spam_account_88',  owner_kind: 'particulier', trust_score: 22, status: 'rejected', is_featured: false, fraud: true,  reports: 5,  created_at: '2026-05-10', signals: ['Compte fraude confirmé'], img: u('photo-1554995207-c18c203602cb') },
]

const STATUS_META = {
  pending:   { label: 'En attente',  short: 'Pending',   tone: 'bg-amber-500/15 text-amber-500',     dot: 'bg-amber-500',   accent: '#F59E0B' },
  approved:  { label: 'Approuvée',   short: 'Approved',  tone: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500', accent: '#10B981' },
  reported:  { label: 'Signalée',    short: 'Reported',  tone: 'bg-rose-500/15 text-rose-500',       dot: 'bg-rose-500',    accent: '#E11D48' },
  rejected:  { label: 'Rejetée',     short: 'Rejected',  tone: 'bg-current/10 text-current opacity-70', dot: 'bg-current/40', accent: '#94A3B8' },
}

const TABS = [
  { id: 'pending',   label: 'En attente',  icon: I.Eye },
  { id: 'approved',  label: 'Approuvées',  icon: I.CheckCircle },
  { id: 'reported',  label: 'Signalées',   icon: I.Flag },
  { id: 'rejected',  label: 'Rejetées',    icon: I.Trash },
]

const fmtPrice = (l) => {
  const v = l.price.toLocaleString('fr-FR') + ' €'
  return l.type === 'louer' || l.type === 'colocation' ? `${v}/mois` : v
}

export default function AdminListings() {
  const [listings, setListings] = useState(SEED_LISTINGS)
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent') // 'recent' | 'score' | 'reports'
  const [selected, setSelected] = useState(new Set())
  const [openId, setOpenId] = useState(null)

  /* Counts by status */
  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, reported: 0, rejected: 0, fraud: 0, featured: 0 }
    for (const l of listings) {
      c[l.status]++
      if (l.fraud) c.fraud++
      if (l.is_featured) c.featured++
    }
    return c
  }, [listings])

  const filtered = useMemo(() => {
    let arr = listings.filter((l) => l.status === tab)
    if (search) {
      const q = search.toLowerCase()
      arr = arr.filter((l) => `${l.title} ${l.city} ${l.owner} ${l.id}`.toLowerCase().includes(q))
    }
    if (sort === 'score')   arr = [...arr].sort((a, b) => a.trust_score - b.trust_score)
    if (sort === 'reports') arr = [...arr].sort((a, b) => b.reports - a.reports)
    return arr
  }, [listings, tab, search, sort])

  /* Mutations */
  const update = (id, patch) => setListings((arr) => arr.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const approve  = (id) => { update(id, { status: 'approved' }); setSelected((s) => { const n = new Set(s); n.delete(id); return n }) }
  const reject   = (id) => { update(id, { status: 'rejected' }); setSelected((s) => { const n = new Set(s); n.delete(id); return n }) }
  const remove   = (id) => { update(id, { status: 'rejected', is_featured: false }) }
  const feature  = (id) => { update(id, { is_featured: true, status: 'approved' }) }
  const unfeature= (id) => update(id, { is_featured: false })

  const bulk = (fn) => { for (const id of selected) fn(id); setSelected(new Set()) }

  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => {
    const allOn = filtered.length > 0 && filtered.every((l) => selected.has(l.id))
    setSelected((s) => {
      const n = new Set(s)
      if (allOn) filtered.forEach((l) => n.delete(l.id))
      else filtered.forEach((l) => n.add(l.id))
      return n
    })
  }
  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id))

  const opened = listings.find((l) => l.id === openId)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Modération</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Annonces</h1>
          <p className="opacity-60 mt-1 text-sm">
            {counts.pending + counts.reported} dossiers à traiter · {counts.featured} mises en avant · {counts.fraud} signaux fraude
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><I.Download size={14}/> Exporter</Button>
          <Button size="sm"><I.Sparkles size={14}/> Re-scanner</Button>
        </div>
      </div>

      {/* Status tiles (also act as primary filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TABS.map((t) => {
          const Icon = t.icon
          const meta = STATUS_META[t.id]
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelected(new Set()) }}
              className={`text-left rounded-2xl p-4 lg:p-5 border-2 transition hover:-translate-y-0.5 ${
                active ? 'border-orange-500 bg-orange-500/[0.04] shadow-card' : 'border-current/10 bg-current/[0.03] hover:bg-current/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tone}`}>
                  <Icon size={15}/>
                </span>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${meta.tone} px-1.5 py-0.5 rounded inline-flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}/> {meta.label}
                </div>
              </div>
              <div className="text-2xl lg:text-[26px] font-extrabold tracking-tight leading-none">
                <Counter to={counts[t.id]}/>
              </div>
              <div className="text-[11px] opacity-60 mt-1.5">
                {t.id === 'pending'  && 'à valider'}
                {t.id === 'approved' && 'en ligne'}
                {t.id === 'reported' && 'signalées par les utilisateurs'}
                {t.id === 'rejected' && 'supprimées de la marketplace'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-2 flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 h-10 bg-current/[0.04] border border-current/10 rounded-xl">
          <I.Search size={14} className="opacity-50"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher annonce, ville, propriétaire, ID…" className="flex-1 bg-transparent text-sm focus:outline-none"/>
        </div>

        <PasmalSelect
          value={sort}
          onChange={setSort}
          options={[
            { value: 'recent',  label: 'Plus récentes' },
            { value: 'score',   label: 'Score le plus faible' },
            { value: 'reports', label: 'Plus de signalements' },
          ]}
          size="sm"
          dark
        />

        <button onClick={toggleAll} className="h-10 px-3 rounded-xl bg-current/[0.04] border border-current/10 text-xs font-semibold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
          <I.Check size={12}/> {allChecked ? 'Tout déselectionner' : 'Tout sélectionner'}
        </button>
      </div>

      {/* Bulk toolbar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white shadow-card flex-wrap"
          >
            <I.Check size={14}/>
            <span className="text-sm font-semibold">{selected.size} annonce{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}</span>
            <div className="flex-1"/>
            {(tab === 'pending' || tab === 'reported') && (
              <button onClick={() => bulk(approve)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center gap-1"><I.Check size={12}/> Approuver</button>
            )}
            {tab === 'pending' && (
              <button onClick={() => bulk(reject)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1"><I.X size={12}/> Rejeter</button>
            )}
            {tab === 'approved' && (
              <button onClick={() => bulk(feature)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-1"><I.Star size={12} fill="white"/> Featurer</button>
            )}
            <button onClick={() => bulk(remove)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1"><I.Trash size={12}/> Supprimer</button>
            <button onClick={() => setSelected(new Set())} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><I.X size={14}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings grid */}
      {filtered.length === 0 ? (
        <EmptyState tab={tab}/>
      ) : (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        >
          {filtered.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              checked={selected.has(l.id)}
              onToggle={() => toggleOne(l.id)}
              onOpen={() => setOpenId(l.id)}
              onApprove={() => approve(l.id)}
              onReject={() => reject(l.id)}
              onRemove={() => remove(l.id)}
              onFeature={() => feature(l.id)}
              onUnfeature={() => unfeature(l.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {opened && (
          <DetailDrawer
            key={opened.id}
            listing={opened}
            onClose={() => setOpenId(null)}
            onApprove={() => { approve(opened.id); setOpenId(null) }}
            onReject={() => { reject(opened.id); setOpenId(null) }}
            onRemove={() => { remove(opened.id); setOpenId(null) }}
            onFeature={() => feature(opened.id)}
            onUnfeature={() => unfeature(opened.id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ============================================================
   Listing card (hybrid : horizontal layout)
   ============================================================ */
function ListingCard({ listing: l, checked, onToggle, onOpen, onApprove, onReject, onRemove, onFeature, onUnfeature }) {
  const meta = STATUS_META[l.status]

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
      whileHover={{ y: -3 }}
      className={`relative rounded-2xl border bg-current/[0.03] hover:bg-current/[0.05] transition overflow-hidden ${
        checked ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-current/10'
      } ${l.fraud ? 'ring-1 ring-rose-500/40' : ''}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-44 aspect-[16/10] sm:aspect-auto sm:h-auto shrink-0 overflow-hidden cursor-pointer" onClick={onOpen}>
          <img src={l.img} alt={l.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"/>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none"/>

          {l.fraud && (
            <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-soft">
              <I.Alert size={11}/> Fraude suspectée
            </div>
          )}
          {l.is_featured && (
            <div className="absolute top-2 right-2 inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-soft">
              <I.Star size={11} fill="white"/> À la une
            </div>
          )}
          {l.reports > 0 && (
            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-white/90 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">
              <I.Flag size={10}/> {l.reports} signalement{l.reports > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          <div className="flex items-start gap-2">
            <input type="checkbox" checked={checked} onChange={onToggle} onClick={(e) => e.stopPropagation()} className="mt-1 accent-orange-500 shrink-0"/>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono opacity-50">{l.id}</span>
                <StatusPill status={l.status}/>
              </div>
              <div className="font-bold text-sm lg:text-base mt-0.5 truncate">{l.title}</div>
              <div className="text-[11px] opacity-65 truncate flex items-center gap-1 mt-0.5">
                <I.MapPin size={11}/>{l.city}
                <span className="opacity-40">·</span>
                <span>{new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
            <ScoreGauge score={l.trust_score} size={36}/>
          </div>

          {/* Owner + price line */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={l.owner} size={22}/>
              <div className="min-w-0">
                <div className="font-semibold truncate">{l.owner}</div>
                <div className="opacity-50 text-[10px] capitalize">{l.owner_kind}</div>
              </div>
            </div>
            <div className="font-extrabold text-base text-current shrink-0">{fmtPrice(l)}</div>
          </div>

          {/* Signals chips (top 3) */}
          {l.signals?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {l.signals.slice(0, 3).map((s, i) => (
                <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${l.fraud ? 'bg-rose-500/15 text-rose-500' : 'bg-current/[0.08] opacity-75'}`}>
                  {s}
                </span>
              ))}
              {l.signals.length > 3 && (
                <span className="text-[10px] opacity-50">+{l.signals.length - 3}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-1 mt-auto flex-wrap" onClick={(e) => e.stopPropagation()}>
            {(l.status === 'pending' || l.status === 'reported') && (
              <button onClick={onApprove} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-full transition">
                <I.Check size={12}/> Approuver
              </button>
            )}
            {l.status === 'pending' && (
              <button onClick={onReject} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-full transition">
                <I.X size={12}/> Rejeter
              </button>
            )}
            {l.status === 'approved' && (
              l.is_featured ? (
                <button onClick={onUnfeature} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-current/[0.08] hover:bg-current/[0.14] px-2.5 py-1.5 rounded-full transition">
                  <I.Star size={12}/> Retirer "À la une"
                </button>
              ) : (
                <button onClick={onFeature} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-full transition">
                  <I.Star size={12} fill="white"/> Mettre à la une
                </button>
              )
            )}
            {l.status !== 'rejected' && (
              <button onClick={onRemove} className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-full transition">
                <I.Trash size={12}/> Supprimer
              </button>
            )}
            <button onClick={onOpen} className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold opacity-70 hover:opacity-100 hover:text-orange-500 px-2.5 py-1.5 rounded-full transition">
              Détails <I.ArrowRight size={11}/>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Detail slide-over
   ============================================================ */
function DetailDrawer({ listing: l, onClose, onApprove, onReject, onRemove, onFeature, onUnfeature }) {
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
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-white text-navy-900 shadow-cardHover overflow-y-auto"
      >
        {/* Hero image */}
        <div className="relative">
          <img src={l.img.replace('w=320', 'w=900')} alt={l.title} className="w-full h-56 object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-transparent"/>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-navy-900 flex items-center justify-center"><I.X size={16}/></button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="text-[10px] font-mono text-white/70 mb-0.5">{l.id}</div>
            <h2 className="text-lg font-extrabold leading-tight">{l.title}</h2>
            <div className="text-xs text-white/85 mt-0.5 flex items-center gap-1"><I.MapPin size={11}/>{l.city}</div>
          </div>
          {l.fraud && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-soft">
              <I.Alert size={11}/> Fraude suspectée
            </div>
          )}
          {l.is_featured && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-soft">
              <I.Star size={11} fill="white"/> À la une
            </div>
          )}
        </div>

        {/* Status + score */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <ScoreGauge score={l.trust_score} size={64} animated/>
          <div className="flex-1 min-w-0">
            <StatusPill status={l.status}/>
            <div className="text-lg font-extrabold mt-1.5">Score {l.trust_score}/100</div>
            <div className="text-xs text-slate-600 mt-0.5">
              {l.fraud ? 'Indices forts de fraude — examen prioritaire' : 'Aucun signal majeur'}
            </div>
          </div>
        </div>

        {/* Owner + price */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={l.owner} size={36}/>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{l.owner}</div>
              <div className="text-[11px] text-slate-500 capitalize">{l.owner_kind}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold tracking-tight">{fmtPrice(l)}</div>
            <div className="text-[10px] text-slate-500 capitalize">{l.type}</div>
          </div>
        </div>

        {/* Signals */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="font-bold mb-3">Signaux automatiques</div>
          <ul className="space-y-2">
            {l.signals.map((s, i) => (
              <li key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${l.fraud ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {l.fraud ? <I.Alert size={14} className="mt-0.5 shrink-0"/> : <I.Check size={14} className="mt-0.5 shrink-0"/>}
                <span className="text-[12px] font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta */}
        <div className="px-6 py-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <Row k="Publiée le" v={new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}/>
          <Row k="Signalements" v={l.reports || '0'}/>
          <Row k="Mise en avant" v={l.is_featured ? '✓ Oui' : '— Non'} tone={l.is_featured ? 'emerald' : null}/>
          <Row k="ID interne" v={<span className="font-mono text-xs">{l.id}</span>}/>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2">
          <div className="flex gap-2">
            {l.status === 'approved' && (
              l.is_featured ? (
                <button onClick={onUnfeature} className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-sm transition">
                  <I.Star size={14}/> Retirer "À la une"
                </button>
              ) : (
                <button onClick={onFeature} className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition">
                  <I.Star size={14} fill="white"/> Mettre à la une
                </button>
              )
            )}
          </div>
          <div className="flex gap-2">
            {(l.status === 'pending' || l.status === 'reported') && (
              <button onClick={onApprove} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition">
                <I.Check size={14}/> Approuver
              </button>
            )}
            {l.status === 'pending' && (
              <button onClick={onReject} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition">
                <I.X size={14}/> Rejeter
              </button>
            )}
            {l.status !== 'rejected' && (
              <button onClick={onRemove} className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition">
                <I.Trash size={14}/> Supprimer
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* ============================================================
   Small bits
   ============================================================ */
function StatusPill({ status }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${m.tone}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}/> {m.label}
    </span>
  )
}

function ScoreGauge({ score, size = 36, animated = false }) {
  const color = score >= 85 ? '#10B981' : score >= 65 ? '#F59E0B' : score >= 40 ? '#FF6B00' : '#E11D48'
  const dash = (score / 100) * 87.96
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3"/>
        {animated ? (
          <motion.circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
            initial={{ strokeDasharray: '0 87.96' }} animate={{ strokeDasharray: `${dash} 87.96` }} transition={{ duration: 0.8 }}/>
        ) : (
          <circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${dash} 87.96`}/>
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-extrabold" style={{ fontSize: size <= 36 ? 10 : 13 }}>
        {score}
      </div>
    </div>
  )
}

function EmptyState({ tab }) {
  const map = {
    pending:   { icon: I.CheckCircle, title: 'Aucune annonce en attente',  text: 'Tout est à jour — bravo l\'équipe modération.', tone: 'emerald' },
    approved:  { icon: I.Building,    title: 'Aucune annonce approuvée',   text: 'Les annonces validées apparaîtront ici.',         tone: 'navy' },
    reported:  { icon: I.Flag,        title: 'Aucun signalement',          text: 'Aucune annonce signalée pour le moment.',         tone: 'emerald' },
    rejected:  { icon: I.Trash,       title: 'Aucune annonce rejetée',     text: 'Pas d\'annonces supprimées dans cette période.', tone: 'navy' },
  }[tab]
  const Icon = map.icon
  const bubble = { emerald: 'bg-emerald-500/15 text-emerald-500', navy: 'bg-current/10 text-current' }[map.tone]
  return (
    <div className="rounded-3xl border border-current/10 bg-current/[0.03] p-12 text-center">
      <div className={`w-14 h-14 rounded-2xl ${bubble} flex items-center justify-center mx-auto mb-4`}>
        <Icon size={22}/>
      </div>
      <div className="font-bold">{map.title}</div>
      <div className="text-xs opacity-60 mt-1">{map.text}</div>
    </div>
  )
}

function Row({ k, v, tone }) {
  const tones = { emerald: 'text-emerald-700' }
  return (
    <>
      <div className="text-xs text-slate-500">{k}</div>
      <div className={`text-sm font-semibold ${tones[tone] || 'text-navy-900'} truncate`}>{v}</div>
    </>
  )
}
