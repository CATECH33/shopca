import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../lib/ui.jsx'
import { supabase } from '../../lib/supabase.js'
import { FALLBACK, AGENCIES, DPE_COLORS, enrich, fmtPrice, fmtPricePerSqm, unsplash } from './listingsData.js'
import { ShopCAInput } from '../../components/ui/ShopCAInput'
import { ShopCATextarea } from '../../components/ui/ShopCATextarea'

// ── Extra gallery images per property type ────────────────────────────────────
const GALLERY_POOL = [
  'photo-1484154218962-a197022b5858',
  'photo-1556909114-f6e7ad7d3136',
  'photo-1555041469-a586c61ea9bc',
  'photo-1571055107559-3e67626fa8be',
  'photo-1524758631624-e2822e304c36',
  'photo-1598928506311-c55ded91a20c',
  'photo-1617104678098-de229db51175',
  'photo-1600047509807-ba8f99d2cdde',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1583608205776-bfd35f0d9f83',
]

function extraImages(l) {
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(1) || 1) : 1
  return [0, 1, 2].map(i => unsplash(GALLERY_POOL[(seed + i * 3) % GALLERY_POOL.length], 600))
}

// ── Deterministic listing extras ──────────────────────────────────────────────
const HEATINGS   = ['Électrique','Gaz naturel','Pompe à chaleur','Poêle à granulés','Fioul']
const EXPOSURES  = ['Sud','Est','Ouest','Sud-Est','Sud-Ouest']
const CONDS      = ['Excellent état','Très bon état','À rafraîchir','À rénover']
const FLOORS_FR  = ['RDC','1ᵉʳ','2ᵉ','3ᵉ','4ᵉ','5ᵉ','6ᵉ','7ᵉ','8ᵉ','9ᵉ','10ᵉ']

function extras(l) {
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(1) || 1) : 1
  const pt = (l.property_type || '').toLowerCase()
  const isApt = ['appartement','studio','t2','t3','colocation','loft'].includes(pt)
  return {
    year:     1920 + ((seed * 47 + 13) % 100),
    floor:    isApt ? FLOORS_FR[seed % 10] : null,
    heating:  HEATINGS[seed % HEATINGS.length],
    exposure: EXPOSURES[(seed * 3) % EXPOSURES.length],
    cond:     CONDS[seed % CONDS.length],
    charges:  isApt ? Math.round((l.surface || 50) * 2.5 / 5) * 5 : null,
    ges:      ['A','B','C','D','E'][seed % 5],
  }
}

function descriptionFor(l) {
  const isRent = l.type === 'louer'
  const intro = isRent
    ? `À louer : ${l.title} de ${l.surface} m² idéalement situé${l.location ? ' à ' + l.location : ''}.`
    : `À vendre : ${l.title} de ${l.surface} m² ${l.location ? 'situé à ' + l.location : ''}.`
  const pt = (l.property_type || '').toLowerCase()
  const body = pt === 'maison' || pt === 'villa'
    ? `La propriété dispose d'un beau jardin arboré, d'une terrasse ensoleillée et d'un garage double. Intérieur entièrement rénové avec des matériaux haut de gamme : parquet massif, cuisine équipée ouverte, salle de bains en marbre. Double vitrage, volets roulants motorisés.`
    : `L'espace de vie est lumineux et traversant, bénéficiant d'une belle hauteur sous plafond. La cuisine est entièrement équipée (plaque induction, four, réfrigérateur). Parquet stratifié dans les pièces de vie, carrelage dans les pièces humides. Placard intégré dans chaque chambre.`
  const outro = `Quartier dynamique à proximité des commerces, transports en commun et écoles. ${pt !== 'studio' ? 'Gardien, digicode.' : ''} Disponible rapidement — Visites sur rendez-vous.`
  return [intro, body, outro]
}

// ── Similar listing mini-card ─────────────────────────────────────────────────
function SimilarCard({ raw, idx }) {
  const l = enrich(raw, idx)
  const navigate = useNavigate()
  const [err, setErr] = useState(false)
  const fb = unsplash('photo-1560448204-e02f11c3d0e2')
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/annonces/${l.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img src={err ? fb : (l.image_url || fb)} onError={() => setErr(true)} alt={l.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <div className="p-4">
        <h4 className="font-bold text-[#0F172A] text-sm line-clamp-1 mb-1">{l.title}</h4>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          <I.MapPin size={11} className="text-orange-500 shrink-0" />{l.location}
        </div>
        <div className="font-extrabold text-[#0F172A] text-base">{fmtPrice(l)}</div>
      </div>
    </motion.div>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ l }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const imgs = [l.image_url || unsplash('photo-1560448204-e02f11c3d0e2'), ...extraImages(l)]

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] sm:h-[500px]">
        {/* Main image */}
        <div className="col-span-4 sm:col-span-3 row-span-2 relative overflow-hidden rounded-2xl sm:rounded-tl-2xl sm:rounded-bl-2xl cursor-pointer group"
          onClick={() => { setActive(0); setLightbox(true) }}>
          <img src={imgs[0]} alt={l.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur flex items-center gap-1.5">
            <I.Camera size={12} /> Voir toutes les photos ({imgs.length})
          </div>
        </div>
        {/* Thumbnails */}
        {imgs.slice(1, 3).map((src, i) => (
          <div key={i}
            className={`col-span-2 sm:col-span-1 relative overflow-hidden cursor-pointer group ${i === 0 ? 'sm:rounded-tr-2xl' : 'sm:rounded-br-2xl'}`}
            onClick={() => { setActive(i + 1); setLightbox(true) }}>
            <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              onClick={() => setLightbox(false)}>
              <I.X size={20} />
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + imgs.length) % imgs.length) }}>
              <I.ChevronLeft size={22} />
            </button>
            <motion.img key={active} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              src={imgs[active]} alt="" onClick={e => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % imgs.length) }}>
              <I.ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${active === i ? 'bg-white scale-125' : 'bg-white/40'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Contact card ──────────────────────────────────────────────────────────────
function ContactCard({ l }) {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [msg,     setMsg]     = useState(`Bonjour, je suis intéressé(e) par ce bien : « ${l.title} ». Pourriez-vous me recontacter pour organiser une visite ?`)
  const [sent,    setSent]    = useState(false)
  const ppsqm = fmtPricePerSqm(l)

  const submit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 sticky top-24">
      {/* Price */}
      <div className="mb-5">
        <div className="text-2xl font-extrabold text-[#0F172A]">{fmtPrice(l)}</div>
        {ppsqm && <div className="text-sm text-slate-400 mt-0.5">{ppsqm}</div>}
        {l.viewers > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mt-2">
            <I.Eye size={12} /> {l.viewers} personnes consultent cette annonce
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 mb-5" />

      {sent ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-3">
            <I.CheckCircle size={24} className="text-emerald-500" />
          </div>
          <div className="font-bold text-[#0F172A] mb-1">Message envoyé !</div>
          <div className="text-slate-500 text-sm">L'agence vous contactera dans les plus brefs délais.</div>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <ShopCAInput required size="sm" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" icon={<I.User size={14}/>} />
          <ShopCAInput type="tel" size="sm" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Votre téléphone" icon={<I.Phone size={14}/>} />
          <ShopCATextarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Votre message…" />
          <motion.button type="submit" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 flex items-center justify-center gap-2">
            <I.Send size={15} /> Contacter l'agence
          </motion.button>
          <button type="button"
            className="w-full py-3 rounded-xl border-2 border-slate-200 hover:border-orange-300 bg-white text-[#0F172A] font-semibold text-sm transition flex items-center justify-center gap-2">
            <I.Calendar size={15} /> Planifier une visite
          </button>
        </form>
      )}

      <div className="h-px bg-slate-100 my-5" />

      {/* Agency */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0">
          <I.Building size={18} className="text-orange-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#0F172A] truncate">{l.agency}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <I.BadgeCheck size={11} /> Score de confiance : {l.trust_score}/100
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <I.Shield size={12} className="text-emerald-500" />
        Annonce vérifiée par SHOPCA · Référence #{l.id}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing,  setListing]  = useState(null)
  const [similar,  setSimilar]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const savedIds = JSON.parse(localStorage.getItem('shopca-saved') || '[]')
    setSaved(savedIds.includes(id))

    const normalize = row => ({
      ...row,
      location: row.location || [row.city, row.district].filter(Boolean).join(' · '),
      type: row.type || row.transaction_type,
    })

    const load = async () => {
      try {
        const { data } = await supabase.from('listings').select('*').eq('id', id).single()
        if (data) {
          const norm = normalize(data)
          setListing(enrich(norm))

          // Annonces similaires : même ville en priorité, sinon même type
          const { data: sameCity } = await supabase
            .from('listings').select('*')
            .eq('status', 'active').eq('city', data.city).neq('id', id).limit(3)
          const cityResults = (sameCity || []).map(normalize)

          if (cityResults.length >= 3) {
            setSimilar(cityResults.slice(0, 3))
          } else {
            const needed = 3 - cityResults.length
            const cityIds = cityResults.map(r => r.id)
            const { data: sameType } = await supabase
              .from('listings').select('*')
              .eq('status', 'active').eq('type', norm.type).neq('id', id)
              .not('id', 'in', `(${[id, ...cityIds].join(',')})`)
              .limit(needed)
            setSimilar([...cityResults, ...(sameType || []).map(normalize)])
          }

          setLoading(false); return
        }
      } catch {}
      const fb = FALLBACK.find(l => l.id === id)
      setListing(fb ? enrich(fb) : null)
      setSimilar(FALLBACK.filter(l => l.id !== id).slice(0, 3))
      setLoading(false)
    }
    load()
  }, [id])

  const toggleSave = () => {
    const prev = JSON.parse(localStorage.getItem('shopca-saved') || '[]')
    const next = saved ? prev.filter(x => x !== id) : [...prev, id]
    localStorage.setItem('shopca-saved', JSON.stringify(next))
    setSaved(!saved)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header saved={false} onSave={() => {}} />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 space-y-4">
          <div className="h-[500px] bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="h-8 bg-slate-200 rounded-full w-2/3 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-full w-1/3 animate-pulse" />
              <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <I.Alert size={40} className="text-slate-400" />
        <h2 className="text-xl font-bold text-[#0F172A]">Annonce introuvable</h2>
        <p className="text-slate-500 text-sm">Cette annonce n'existe plus ou a été retirée.</p>
        <Link to="/annonces" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition">
          Retour aux annonces
        </Link>
      </div>
    )
  }

  const ext     = extras(listing)
  const paras   = descriptionFor(listing)
  const dpeColor = DPE_COLORS[listing.dpe] || '#ccc'
  const dpeDark  = ['C','D'].includes(listing.dpe)

  const features = [
    listing.rooms    && { label: 'Pièces',        val: `${listing.rooms} p.` },
    listing.surface  && { label: 'Surface',        val: `${listing.surface} m²` },
    ext.floor        && { label: 'Étage',          val: ext.floor },
    ext.year         && { label: 'Année construct.', val: ext.year },
    listing.property_type && { label: 'Type',      val: listing.property_type },
    ext.heating      && { label: 'Chauffage',      val: ext.heating },
    ext.exposure     && { label: 'Exposition',     val: ext.exposure },
    ext.cond         && { label: 'État',           val: ext.cond },
    listing.parking  && { label: 'Parking',        val: 'Inclus' },
    listing.elevator && { label: 'Ascenseur',      val: 'Oui' },
    ext.charges      && { label: 'Charges/mois',   val: `${ext.charges} €` },
    listing.dpe      && { label: 'DPE',            val: listing.dpe },
    ext.ges          && { label: 'GES',            val: ext.ges },
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header saved={saved} onSave={toggleSave} title={listing.title} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

        {/* Gallery */}
        <div className="mb-8">
          <Gallery l={listing} />
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8 items-start">

          {/* ── Left: main content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title block */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {listing.is_prestige && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                    <I.Star size={10} fill="white" /> Prestige
                  </span>
                )}
                {listing.is_premium && !listing.is_prestige && (
                  <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                    <I.Zap size={10} /> Premium
                  </span>
                )}
                {listing.is_new && (
                  <span className="bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">Nouveau</span>
                )}
                {listing.is_urgent && (
                  <span className="bg-rose-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">Urgent</span>
                )}
                <span style={{ background: dpeColor, color: dpeDark ? '#111' : '#fff' }}
                  className="text-xs font-extrabold px-2.5 py-1 rounded-full shadow">DPE {listing.dpe}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-2 leading-snug">{listing.title}</h1>
              <div className="flex items-center gap-2 text-slate-500">
                <I.MapPin size={16} className="text-orange-500 shrink-0" />
                <span className="text-base">{listing.location}</span>
              </div>
            </div>

            {/* Key stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: I.Home,     label: 'Pièces',   val: listing.rooms ? `${listing.rooms} pièce${listing.rooms > 1 ? 's' : ''}` : '—' },
                { icon: I.Maximize, label: 'Surface',  val: listing.surface ? `${listing.surface} m²` : '—' },
                { icon: I.Calendar, label: 'Construit',val: ext.year || '—' },
                { icon: I.Key,      label: ext.floor ? 'Étage' : 'Chauffage', val: ext.floor || ext.heating },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
                    <div className="text-sm font-bold text-[#0F172A]">{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile price */}
            <div className="lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="text-2xl font-extrabold text-[#0F172A] mb-1">{fmtPrice(listing)}</div>
              {fmtPricePerSqm(listing) && <div className="text-sm text-slate-400">{fmtPricePerSqm(listing)}</div>}
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 flex items-center justify-center gap-2">
                <I.Phone size={15} /> Contacter l'agence
              </motion.button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Description</h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                {paras.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {/* Characteristics */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-5">Caractéristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
                {features.map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-[#0F172A]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DPE visual */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-5">Diagnostic énergétique (DPE)</h2>
              <div className="flex flex-wrap items-center gap-8">
                {/* Consumption bar */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  {['A','B','C','D','E','F','G'].map(band => (
                    <div key={band} className="flex items-center gap-2">
                      <div style={{ width: `${30 + ['A','B','C','D','E','F','G'].indexOf(band) * 10}%`, background: DPE_COLORS[band] }}
                        className={`h-6 rounded-r-full flex items-center justify-end pr-2 transition-all ${listing.dpe === band ? 'ring-2 ring-offset-1 ring-slate-900' : 'opacity-70'}`}>
                        <span style={{ color: ['C','D'].includes(band) ? '#111' : '#fff' }} className="text-xs font-extrabold">{band}</span>
                      </div>
                      {listing.dpe === band && (
                        <span className="text-xs font-bold text-[#0F172A]">← Ce bien</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div style={{ background: dpeColor, color: dpeDark ? '#111' : '#fff' }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg mx-auto mb-2">
                    {listing.dpe}
                  </div>
                  <div className="text-xs text-slate-500">GES : {ext.ges}</div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Localisation</h2>
              <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <I.MapPin size={22} className="text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[#0F172A]">{listing.location}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Carte interactive — bientôt disponible</div>
                </div>
              </div>
            </div>

            {/* Similar listings */}
            {similar.length > 0 && (
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] mb-5">Annonces similaires</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similar.map((raw, i) => <SimilarCard key={raw.id} raw={raw} idx={i} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky contact card ──────────────────────────────── */}
          <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
            <ContactCard l={listing} />
          </aside>
        </div>
      </main>
    </div>
  )
}

// ── Top navigation bar ────────────────────────────────────────────────────────
function Header({ saved, onSave, title }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="shrink-0">
            <BrandLogo compact />
          </Link>
          <Link to="/annonces"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition shrink-0">
            <I.ChevronLeft size={16} /> Annonces
          </Link>
          {title && (
            <div className="flex-1 min-w-0 hidden sm:block">
              <div className="text-sm font-semibold text-[#0F172A] truncate">{title}</div>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={onSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500'
              }`}>
              <I.Heart size={14} fill={saved ? '#f43f5e' : 'none'} className={saved ? 'text-rose-500' : ''} />
              {saved ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
            <Link to="/annonces"
              className="hidden lg:flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition">
              <I.X size={14} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
