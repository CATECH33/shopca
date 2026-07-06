import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../lib/ui.jsx'
import { ShopCASelect } from '../../components/ui/ShopCASelect'
import { ShopCAInput } from '../../components/ui/ShopCAInput'
import { supabase } from '../../lib/supabase.js'

// ── Data ──────────────────────────────────────────────────────────────────────
const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const FALLBACK = [
  { id:'f1', title:'Studio cosy lumineux',       location:'Paris 11ᵉ · Bastille',  price:320000,  rooms:1, surface:28,  type:'acheter', property_type:'Studio',     is_premium:true,    image_url:unsplash('photo-1502672260266-1c1ef2d93688') },
  { id:'f2', title:'T3 avec balcon vue dégagée', location:'Lyon 6ᵉ · Foch',        price:485000,  rooms:3, surface:65,  type:'acheter', property_type:'T3',         is_exclusive:true,  image_url:unsplash('photo-1560448204-e02f11c3d0e2') },
  { id:'f3', title:'Maison contemporaine',        location:'Bordeaux · Caudéran',   price:780000,  rooms:5, surface:142, type:'acheter', property_type:'Maison',                         image_url:unsplash('photo-1564013799919-ab600027ffc6') },
  { id:'f4', title:'Colocation design 4 ch.',     location:'Nantes · Centre',       price:590,     rooms:4, surface:110, type:'louer',   property_type:'Colocation',                     image_url:unsplash('photo-1522708323590-d24dbb6b0267') },
  { id:'f5', title:'Loft industriel rénové',      location:'Marseille · Joliette',  price:1450,    rooms:2, surface:72,  type:'louer',   property_type:'T2',         is_premium:true,    image_url:unsplash('photo-1493809842364-78817add7ffb') },
  { id:'f6', title:'Appartement haussmannien',    location:'Paris 8ᵉ · Monceau',   price:1250000, rooms:4, surface:98,  type:'acheter', property_type:'Appartement',is_prestige:true,   image_url:unsplash('photo-1600585154340-be6161a56a0c') },
  { id:'f7', title:'Studio étudiant moderne',     location:'Toulouse · Capitole',   price:620,     rooms:1, surface:24,  type:'louer',   property_type:'Studio',                         image_url:unsplash('photo-1554995207-c18c203602cb') },
  { id:'f8', title:'Villa avec piscine',          location:'Nice · Cimiez',         price:2100000, rooms:6, surface:220, type:'acheter', property_type:'Villa',      is_prestige:true,   image_url:unsplash('photo-1613490493576-7fde63acd811') },
  { id:'f9', title:'T2 vue mer',                  location:'Biarritz · Grande Plage',price:390000, rooms:2, surface:48,  type:'acheter', property_type:'T2',         is_premium:true,    image_url:unsplash('photo-1499793983690-e29da59ef1c2') },
  { id:'f10',title:'Maison de village rénovée',   location:'Aix-en-Provence',       price:650000,  rooms:4, surface:120, type:'acheter', property_type:'Maison',                         image_url:unsplash('photo-1568605114967-8130f3a36994') },
  { id:'f11',title:'Studio lumineux centre-ville',location:'Strasbourg · Petite France',price:750, rooms:1, surface:32,  type:'louer',   property_type:'Studio',                         image_url:unsplash('photo-1536376072261-38c75010e6c9') },
  { id:'f12',title:'Penthouse terrasse panorama', location:'Paris 16ᵉ · Trocadéro', price:2800000, rooms:5, surface:180, type:'acheter', property_type:'Appartement',is_prestige:true,   image_url:unsplash('photo-1512917774080-9991f1c4c750') },
]

const AGENCIES = ['Foncia Premium','Century 21 Élite','SHOPCA Verified','Sotheby\'s Realty','BARNES','Engel & Völkers']
const DPE_COLORS = { A:'#00A651',B:'#51B948',C:'#BECE00',D:'#FECB00',E:'#FB7A08',F:'#EE3424',G:'#C50D13' }
const PROPERTY_TYPES = ['Appartement','Maison','Studio','Villa','Loft']

function enrich(l, idx = 0) {
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(1) || idx + 1) : idx + 1
  return {
    ...l,
    agency:        l.agency        ?? AGENCIES[seed % AGENCIES.length],
    trust_score:   l.trust_score   ?? (90 + ((idx * 7) % 9)),
    viewers:       l.viewers       ?? (4 + ((seed * 3 + idx * 5) % 24)),
    contacts_today:l.contacts_today ?? ((seed + idx * 2) % 8),
    is_new:        l.is_new        ?? ((seed + idx) % 4 === 0),
    is_urgent:     l.is_urgent     ?? ((seed + idx) % 7 === 1),
    dpe:           l.dpe           ?? ['A','B','C','D','E'][seed % 5],
    parking:       l.parking       ?? ((seed + idx) % 3 === 0),
    elevator:      l.elevator      ?? ((seed * 2 + idx) % 4 === 0),
  }
}

function fmtPrice(l) {
  if (l.price_label) return l.price_label
  if (typeof l.price !== 'number') return l.price ?? ''
  const s = l.price.toLocaleString('fr-FR') + ' €'
  return (l.type === 'louer' || l.type === 'colocation') ? `${s}/mois` : s
}

function fmtPricePerSqm(l) {
  if (!l.surface || !l.price || l.type === 'louer' || l.type === 'colocation') return null
  return Math.round(l.price / l.surface).toLocaleString('fr-FR') + ' €/m²'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-5 bg-slate-200 rounded-full w-2/5" />
      </div>
    </div>
  )
}

// ── Property Card (grid) ──────────────────────────────────────────────────────
function PropertyCard({ raw, idx, onSave, saved }) {
  const l = useMemo(() => enrich(raw, idx), [raw, idx])
  const [imgErr, setImgErr] = useState(false)
  const navigate = useNavigate()
  const fallbackImg = unsplash('photo-1560448204-e02f11c3d0e2')
  const ppsqm = fmtPricePerSqm(l)

  return (
    <motion.article
      layout
      variants={{ hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } }}
      whileHover={{ y:-5, transition:{ duration:0.2 } }}
      onClick={() => navigate(`/annonces/${l.id}`)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-shadow duration-300 cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={imgErr ? fallbackImg : (l.image_url || fallbackImg)}
          alt={l.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {l.is_prestige && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              <I.Star size={9} fill="white" /> Prestige
            </span>
          )}
          {l.is_premium && !l.is_prestige && (
            <span className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              <I.Zap size={9} /> Premium
            </span>
          )}
          {l.is_new && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              Nouveau
            </span>
          )}
          {l.is_urgent && (
            <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              Urgent
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onSave?.(l.id) }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95"
        >
          <I.Heart size={15} fill={saved ? '#f43f5e' : 'none'} className={saved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'} />
        </button>

        {/* Trust score */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur text-[#0F172A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
          <I.BadgeCheck size={12} className="text-emerald-500" /> {l.trust_score}/100
        </div>

        {/* DPE badge */}
        <div
          style={{ background: DPE_COLORS[l.dpe] || '#ccc', color: ['C','D'].includes(l.dpe) ? '#111' : '#fff' }}
          className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold shadow"
        >
          {l.dpe}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-[#0F172A] text-[15px] leading-snug line-clamp-2 flex-1">{l.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
          <I.MapPin size={13} className="text-orange-500 shrink-0" />
          <span className="truncate">{l.location}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          {l.rooms   && <span className="flex items-center gap-1"><I.Home size={12} className="text-slate-400" />{l.rooms} p.</span>}
          {l.surface && <span className="flex items-center gap-1"><I.Maximize size={12} className="text-slate-400" />{l.surface} m²</span>}
          {l.parking && <span className="flex items-center gap-1"><I.Key size={12} className="text-slate-400" />Parking</span>}
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-extrabold text-[#0F172A]">{fmtPrice(l)}</div>
              {ppsqm && <div className="text-[11px] text-slate-400">{ppsqm}</div>}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 leading-tight">{l.agency}</div>
              {l.viewers > 0 && (
                <div className="flex items-center justify-end gap-1 text-[10px] text-orange-500 font-semibold mt-0.5">
                  <I.Eye size={10} /> {l.viewers} en ce moment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ── Property Row (list view) ──────────────────────────────────────────────────
function PropertyRow({ raw, idx, onSave, saved }) {
  const l = useMemo(() => enrich(raw, idx), [raw, idx])
  const [imgErr, setImgErr] = useState(false)
  const navigate = useNavigate()
  const fallbackImg = unsplash('photo-1560448204-e02f11c3d0e2')

  return (
    <motion.article
      layout
      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: idx * 0.04, duration:0.35 }}
      onClick={() => navigate(`/annonces/${l.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-pointer flex items-stretch"
    >
      <div className="relative w-44 sm:w-56 shrink-0 overflow-hidden">
        <img
          src={imgErr ? fallbackImg : (l.image_url || fallbackImg)}
          alt={l.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {(l.is_prestige || l.is_premium) && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full text-white ${l.is_prestige ? 'bg-amber-500' : 'bg-orange-500'}`}>
            {l.is_prestige ? 'Prestige' : 'Premium'}
          </div>
        )}
        <div
          style={{ background: DPE_COLORS[l.dpe] || '#ccc', color: ['C','D'].includes(l.dpe) ? '#111' : '#fff' }}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shadow"
        >
          {l.dpe}
        </div>
      </div>

      <div className="flex-1 min-w-0 px-4 sm:px-5 py-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0F172A] text-sm sm:text-[15px] leading-snug line-clamp-1 flex-1">{l.title}</h3>
            <button
              onClick={e => { e.stopPropagation(); onSave?.(l.id) }}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-rose-50 transition"
            >
              <I.Heart size={13} fill={saved ? '#f43f5e' : 'none'} className={saved ? 'text-rose-500' : 'text-slate-400'} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm">
            <I.MapPin size={12} className="text-orange-500 shrink-0" />
            <span className="truncate">{l.location}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-2.5">
            <span className="text-base sm:text-lg font-extrabold text-[#0F172A]">{fmtPrice(l)}</span>
            {l.rooms   && <span className="flex items-center gap-1 text-xs text-slate-500"><I.Home size={12} /> {l.rooms} p.</span>}
            {l.surface && <span className="flex items-center gap-1 text-xs text-slate-500"><I.Maximize size={12} /> {l.surface} m²</span>}
            {l.parking && <span className="flex items-center gap-1 text-xs text-slate-500"><I.Key size={12} /> Parking</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-400">{l.agency}</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
              <I.BadgeCheck size={10} /> {l.trust_score}/100
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-center justify-center gap-2 pr-4 shrink-0">
        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
          <I.ArrowRight size={14} />
        </div>
      </div>
    </motion.article>
  )
}

// ── Sidebar filter panel ──────────────────────────────────────────────────────
function FilterPanel({ params, set, resetAll, activeCount }) {
  const priceMin     = params.get('priceMin')     || ''
  const priceMax     = params.get('priceMax')     || ''
  const surfaceMin   = params.get('surfaceMin')   || ''
  const roomsMin     = Number(params.get('roomsMin') || 0)
  const propertyType = params.get('propertyType') || ''
  const dpe          = params.get('dpe')          ? params.get('dpe').split(',') : []
  const parking      = params.get('parking')      === 'true'
  const elevator     = params.get('elevator')     === 'true'
  const furnished    = params.get('furnished')    === 'true'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#0F172A]">Filtres</span>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition">
            Tout effacer ({activeCount})
          </button>
        )}
      </div>

      {/* Budget */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-2">Budget</div>
        <div className="grid grid-cols-2 gap-2">
          <ShopCAInput type="number" size="sm" value={priceMin} onChange={e => set('priceMin', e.target.value)} placeholder="Min €" />
          <ShopCAInput type="number" size="sm" value={priceMax} onChange={e => set('priceMax', e.target.value)} placeholder="Max €" />
        </div>
      </div>

      {/* Surface */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-2">Surface min. (m²)</div>
        <ShopCAInput type="number" size="sm" value={surfaceMin} onChange={e => set('surfaceMin', e.target.value)} placeholder="ex. 40" />
      </div>

      {/* Rooms */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pièces minimum</div>
        <div className="flex gap-1">
          {[0,1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('roomsMin', n === 0 ? '' : String(n))}
              className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${
                roomsMin === n ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {n === 0 ? 'Tt' : n === 5 ? '5+' : n}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Type de bien</div>
        <div className="space-y-1">
          {['', ...PROPERTY_TYPES].map(t => (
            <button key={t || 'all'} onClick={() => set('propertyType', t)}
              className={`w-full px-3 py-2 rounded-xl text-sm text-left font-medium transition-all ${
                propertyType === t ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {t || 'Tous types'}
            </button>
          ))}
        </div>
      </div>

      {/* DPE */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">DPE</div>
        <div className="flex gap-1.5 flex-wrap">
          {['A','B','C','D','E','F','G'].map(band => {
            const active = dpe.includes(band)
            return (
              <button key={band}
                onClick={() => {
                  const next = active ? dpe.filter(d => d !== band) : [...dpe, band]
                  set('dpe', next.length ? next.join(',') : '')
                }}
                style={active ? { background: DPE_COLORS[band], color: ['C','D'].includes(band) ? '#111' : '#fff' } : {}}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  active ? 'shadow-md scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {band}
              </button>
            )
          })}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Équipements</div>
        <div className="space-y-2">
          {[
            { key:'parking',   label:'Parking / Garage', val:parking   },
            { key:'elevator',  label:'Ascenseur',         val:elevator  },
            { key:'furnished', label:'Meublé',            val:furnished },
          ].map(({ key, label, val }) => (
            <button key={key} onClick={() => set(key, val ? '' : 'true')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                val ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
              {label}
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${val ? 'bg-orange-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const PER_PAGE = 9

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings,  setListings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [savedIds,  setSavedIds]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopca-saved') || '[]') } catch { return [] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Read params ────────────────────────────────────────────────────────────
  const type         = searchParams.get('type')         || 'acheter'
  const location     = searchParams.get('location')     || ''
  const priceMin     = searchParams.get('priceMin')     || ''
  const priceMax     = searchParams.get('priceMax')     || ''
  const surfaceMin   = searchParams.get('surfaceMin')   || ''
  const roomsMin     = Number(searchParams.get('roomsMin') || 0)
  const propertyType = searchParams.get('propertyType') || ''
  const dpeRaw       = searchParams.get('dpe')          || ''
  const dpe          = dpeRaw ? dpeRaw.split(',') : []
  const parking      = searchParams.get('parking')      === 'true'
  const elevator     = searchParams.get('elevator')     === 'true'
  const furnished    = searchParams.get('furnished')    === 'true'
  const sort         = searchParams.get('sort')         || 'relevance'
  const view         = searchParams.get('view')         || 'grid'
  const page         = Number(searchParams.get('page')  || 1)

  // ── Write a single param ───────────────────────────────────────────────────
  const set = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null) next.delete(key)
      else next.set(key, value)
      next.set('page', '1')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setType = v => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('type', v)
    next.set('page', '1')
    return next
  }, { replace: true })

  const setView = v => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('view', v)
    return next
  }, { replace: true })

  const setSort = v => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('sort', v)
    next.set('page', '1')
    return next
  }, { replace: true })

  const setPage = v => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('page', String(v))
    return next
  }, { replace: true })

  const resetAll = () => {
    const next = new URLSearchParams()
    next.set('type', type)
    setSearchParams(next, { replace: true })
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const load = async () => {
      try {
        const { data, error } = await supabase.from('listings').select('*').limit(100)
        if (!cancelled) {
          if (error || !data?.length) {
            setListings(FALLBACK)
          } else {
            const normalized = data.map(row => ({
              ...row,
              location: row.location || [row.city, row.district].filter(Boolean).join(' · '),
              type: row.type || row.transaction_type,
            }))
            setListings(normalized)
          }
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setListings(FALLBACK); setLoading(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Save to localStorage ────────────────────────────────────────────────────
  const toggleSave = id => {
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('shopca-saved', JSON.stringify(next))
      return next
    })
  }

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (type !== 'all' && l.type !== type && !(type === 'acheter' && l.type === 'investir')) return false
      if (location && !l.location?.toLowerCase().includes(location.toLowerCase())) return false
      if (priceMin   && (l.price || 0) < Number(priceMin))   return false
      if (priceMax   && (l.price || 0) > Number(priceMax))   return false
      if (surfaceMin && (l.surface || 0) < Number(surfaceMin)) return false
      if (roomsMin   && (l.rooms || 0) < roomsMin)           return false
      if (propertyType && l.property_type?.toLowerCase() !== propertyType.toLowerCase()) return false
      const el = enrich(l)
      if (dpe.length > 0 && !dpe.includes(el.dpe))           return false
      if (parking    && !el.parking)    return false
      if (elevator   && !el.elevator)   return false
      if (furnished  && !l.furnished)   return false
      return true
    })
  }, [listings, type, location, priceMin, priceMax, surfaceMin, roomsMin, propertyType, dpe, parking, elevator])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'price-asc')  arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === 'price-desc') arr.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sort === 'surface')    arr.sort((a, b) => (b.surface || 0) - (a.surface || 0))
    return arr
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Active filter count (excludes type + location which live in the top bar)
  const activeCount = [priceMin, priceMax, surfaceMin, roomsMin > 0 ? 'x' : '', propertyType, dpeRaw, parking ? 'x' : '', elevator ? 'x' : '', furnished ? 'x' : ''].filter(Boolean).length

  // ── Location search state (local, committed on Enter / button click) ───────
  const [locDraft, setLocDraft] = useState(location)
  useEffect(() => { setLocDraft(location) }, [location])
  const commitLocation = () => set('location', locDraft.trim())

  const typeLabel = type === 'louer' ? 'à louer' : type === 'investir' ? 'à investir' : 'à acheter'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 h-16">
            <Link to="/" className="shrink-0">
              <BrandLogo compact />
            </Link>

            {/* Type tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
              {[['acheter','Acheter'],['louer','Louer']].map(([val, lbl]) => (
                <button key={val} onClick={() => setType(val)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    type === val ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Location search */}
            <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all min-w-0">
              <I.MapPin size={15} className="text-slate-400 shrink-0" />
              <input
                value={locDraft}
                onChange={e => setLocDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitLocation()}
                placeholder="Ville, quartier, code postal…"
                className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none min-w-0"
              />
              {locDraft && (
                <button onClick={() => { setLocDraft(''); set('location', '') }} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <I.X size={13} />
                </button>
              )}
            </div>

            <button onClick={commitLocation}
              className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition shrink-0">
              <I.Search size={14} /> Rechercher
            </button>

            <Link to="/" className="hidden lg:flex items-center gap-1 text-sm text-slate-500 hover:text-[#0F172A] transition shrink-0">
              <I.ChevronLeft size={14} /> Accueil
            </Link>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="flex gap-8 items-start">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <FilterPanel params={searchParams} set={set} resetAll={resetAll} activeCount={activeCount} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">

              {/* Mobile filter button */}
              <button onClick={() => setDrawerOpen(true)}
                className={`lg:hidden flex items-center gap-1.5 h-9 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  activeCount > 0 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                <I.Filter size={13} />
                Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>

              {/* Mobile type tabs */}
              <div className="sm:hidden flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                {[['acheter','Acheter'],['louer','Louer']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setType(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      type === val ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500'
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 mr-auto">
                <ShopCASelect
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'relevance',  label: 'Pertinence' },
                    { value: 'price-asc',  label: 'Prix croissant' },
                    { value: 'price-desc', label: 'Prix décroissant' },
                    { value: 'surface',    label: 'Surface' },
                  ]}
                  size="sm"
                  searchable={false}
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-0.5 p-1 bg-white border border-slate-200 rounded-xl">
                {[
                  { id:'grid', svg: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
                  { id:'list', svg: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="0.5" fill="currentColor"/><circle cx="3.5" cy="12" r="0.5" fill="currentColor"/><circle cx="3.5" cy="18" r="0.5" fill="currentColor"/></> },
                ].map(({ id, svg }) => (
                  <button key={id} onClick={() => setView(id)}
                    className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${view === id ? 'bg-[#0F172A] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{svg}</svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick pill filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label:'DPE A-B', active: dpe.includes('A') && dpe.includes('B'), fn: () => {
                  const next = (dpe.includes('A') && dpe.includes('B')) ? dpe.filter(d => d !== 'A' && d !== 'B') : [...new Set([...dpe,'A','B'])]
                  set('dpe', next.length ? next.join(',') : '')
                }},
                { label:'Parking',   active: parking,  fn: () => set('parking',  parking  ? '' : 'true') },
                { label:'Ascenseur', active: elevator, fn: () => set('elevator', elevator ? '' : 'true') },
                { label:'Neuf',      active: false,    fn: () => {} },
              ].map(({ label, active, fn }) => (
                <button key={label} onClick={fn}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-400 hover:text-orange-600'
                  }`}>
                  {active && <I.Check size={10} />}{label}
                </button>
              ))}
            </div>

            {/* Result count + active chips */}
            {!loading && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex items-baseline gap-1.5 mr-auto">
                  <span className="text-xl font-extrabold text-[#0F172A]">{sorted.length}</span>
                  <span className="text-sm text-slate-500">bien{sorted.length !== 1 ? 's' : ''} {typeLabel}
                    {location && <span className="text-orange-600"> · {location}</span>}
                  </span>
                </div>
                {activeCount > 0 && (
                  <button onClick={resetAll} className="text-xs text-slate-400 hover:text-rose-500 transition">
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}

            {/* Active filter chips */}
            {!loading && activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  priceMin     && { key:'priceMin',     label:`≥ ${Number(priceMin).toLocaleString('fr-FR')} €`,     fn: () => set('priceMin','') },
                  priceMax     && { key:'priceMax',     label:`≤ ${Number(priceMax).toLocaleString('fr-FR')} €`,     fn: () => set('priceMax','') },
                  surfaceMin   && { key:'surfaceMin',   label:`≥ ${surfaceMin} m²`,                                   fn: () => set('surfaceMin','') },
                  roomsMin > 0 && { key:'roomsMin',    label:`${roomsMin}+ pièces`,                                   fn: () => set('roomsMin','') },
                  propertyType && { key:'propertyType', label: propertyType,                                           fn: () => set('propertyType','') },
                  dpeRaw       && { key:'dpe',          label:`DPE : ${dpe.join(', ')}`,                              fn: () => set('dpe','') },
                  parking      && { key:'parking',      label:'Parking',                                               fn: () => set('parking','') },
                  elevator     && { key:'elevator',     label:'Ascenseur',                                             fn: () => set('elevator','') },
                ].filter(Boolean).map(chip => (
                  <motion.button key={chip.key} layout
                    initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    onClick={chip.fn}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors">
                    {chip.label} <I.X size={10} />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Cards */}
            {loading ? (
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  view === 'grid'
                    ? <CardSkeleton key={i} />
                    : <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <I.Search size={24} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Aucun bien ne correspond</h3>
                <p className="text-slate-500 text-sm mb-6">Élargissez vos critères ou changez de zone géographique.</p>
                <button onClick={resetAll}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : view === 'grid' ? (
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.06 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((raw, idx) => (
                  <PropertyCard key={raw.id} raw={raw} idx={(page-1)*PER_PAGE+idx}
                    onSave={toggleSave} saved={savedIds.includes(raw.id)} />
                ))}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {paginated.map((raw, idx) => (
                  <PropertyRow key={raw.id} raw={raw} idx={(page-1)*PER_PAGE+idx}
                    onSave={toggleSave} saved={savedIds.includes(raw.id)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && sorted.length > PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition">
                  <I.ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i-1] > 1) acc.push('…'); acc.push(n); return acc }, [])
                  .map((n, i) => n === '…'
                    ? <span key={`e${i}`} className="text-slate-400 text-sm px-1">…</span>
                    : <button key={n} onClick={() => setPage(n)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          page === n ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500'
                        }`}>{n}</button>
                  )
                }
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition">
                  <I.ChevronRight size={16} />
                </button>
              </div>
            )}
            {!loading && sorted.length > 0 && (
              <div className="text-center text-xs text-slate-400 mt-3">
                {sorted.length > PER_PAGE && <>Page {page} sur {totalPages} · </>}
                {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', damping:28, stiffness:280 }}
              className="fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="font-bold text-[#0F172A]">Filtres</div>
                <button onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                  <I.X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <FilterPanel params={searchParams} set={set} resetAll={resetAll} activeCount={activeCount} />
              </div>
              <div className="p-6 border-t border-slate-100 shrink-0">
                <button onClick={() => setDrawerOpen(false)}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-sm">
                  Voir les résultats ({sorted.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
