import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'
import { PasmalSelect } from '../../components/ui/PasmalSelect'

const unsplash = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const AGENCIES_MOCK = [
  { id: 'barnes-paris',   name: 'BARNES Paris',         city: 'Paris',     region: 'Île-de-France',        logo: 'BA', color: '#0B1F3A', certified: 'trust',   rating: 4.9, reviews: 284, listings: 142, since: 2018, responseTime: '1h',  satisfaction: 98, score: 97, specialties: ['Luxe', 'Achat', 'Investissement'], desc: "Référence du marché parisien de prestige. Appartements haussmanniens, lofts de caractère, penthouses et propriétés d'exception.", imgId: 'photo-1502672260266-1c1ef2d93688' },
  { id: 'foncia-lyon',    name: 'FONCIA Lyon',          city: 'Lyon',      region: 'Auvergne-Rhône-Alpes', logo: 'FO', color: '#1D4ED8', certified: 'partner', rating: 4.5, reviews: 412, listings: 89,  since: 2019, responseTime: '3h',  satisfaction: 91, score: 84, specialties: ['Location', 'Gestion'],              desc: "Leader de la gestion locative à Lyon. Accompagnement propriétaires et locataires, syndic de copropriété.",                   imgId: 'photo-1522708323590-d24dbb6b0267' },
  { id: 'orpi-bordeaux',  name: 'ORPI Bordeaux',        city: 'Bordeaux',  region: 'Nouvelle-Aquitaine',   logo: 'OR', color: '#7C3AED', certified: 'partner', rating: 4.7, reviews: 198, listings: 67,  since: 2020, responseTime: '2h',  satisfaction: 95, score: 91, specialties: ['Achat', 'Vente'],                   desc: "Réseau coopératif implanté au cœur de Bordeaux. Spécialiste des biens anciens, pierres et chartrons bordelais.",            imgId: 'photo-1600585154340-be6161a56a0c' },
  { id: 'century21-nice', name: 'Century 21 Nice',      city: 'Nice',      region: 'PACA',                 logo: 'C2', color: '#0F766E', certified: 'trust',   rating: 4.8, reviews: 321, listings: 98,  since: 2017, responseTime: '2h',  satisfaction: 96, score: 94, specialties: ['Luxe', 'Achat', 'Location'],        desc: "Spécialiste niçois de l'immobilier haut de gamme. Appartements vue mer, villas Riviera, propriétés d'exception.",           imgId: 'photo-1493809842364-78817add7ffb' },
  { id: 'guy-hoquet',     name: 'Guy Hoquet Marseille', city: 'Marseille', region: 'PACA',                 logo: 'GH', color: '#B45309', certified: 'none',    rating: 4.3, reviews: 156, listings: 54,  since: 2021, responseTime: '6h',  satisfaction: 86, score: 73, specialties: ['Achat', 'Location', 'Neuf'],        desc: "Acteur majeur du marché marseillais, du studio hypercentre aux villas des quartiers résidentiels.",                          imgId: 'photo-1560448204-e02f11c3d0e2' },
  { id: 'laforet-nantes', name: 'Laforêt Nantes',       city: 'Nantes',    region: 'Pays de la Loire',     logo: 'LF', color: '#047857', certified: 'partner', rating: 4.6, reviews: 134, listings: 45,  since: 2020, responseTime: '4h',  satisfaction: 92, score: 87, specialties: ['Achat', 'Investissement'],           desc: "Cabinet fondé il y a 15 ans, spécialiste du premier achat et de l'investissement locatif nantais.",                         imgId: 'photo-1484154218962-a197022b5858' },
  { id: 'nexity-paris',   name: 'Nexity Paris',         city: 'Paris',     region: 'Île-de-France',        logo: 'NX', color: '#BE123C', certified: 'trust',   rating: 4.4, reviews: 567, listings: 213, since: 2016, responseTime: '2h',  satisfaction: 89, score: 88, specialties: ['Neuf', 'Investissement', 'Gestion'], desc: "Leader national de l'immobilier neuf. Programmes Pinel, LMNP et résidences services en Île-de-France.",                     imgId: 'photo-1556909114-f6e7ad7d3136' },
  { id: 'era-toulouse',   name: 'ERA Toulouse',         city: 'Toulouse',  region: 'Occitanie',            logo: 'ER', color: '#6D28D9', certified: 'partner', rating: 4.5, reviews: 89,  listings: 38,  since: 2022, responseTime: '5h',  satisfaction: 90, score: 80, specialties: ['Achat', 'Location', 'Viager'],      desc: "Référence sur la Ville Rose. Du studio étudiant à la villa avec piscine, en vente comme en location.",                       imgId: 'photo-1564013799919-ab600027ffc6' },
]

const AGENCY_REVIEWS_MAP = {
  'barnes-paris':   [
    { author: 'Marie T.',     rating: 5, date: 'Mars 2026',  text: 'Équipe très professionnelle, transaction rapide et sans accroc. Je recommande vivement !' },
    { author: 'Jean-Paul R.', rating: 5, date: 'Fév. 2026',  text: 'Excellent suivi, disponibles à toute heure. Mon appartement vendu en 3 semaines.' },
    { author: 'Isabelle M.',  rating: 4, date: 'Jan. 2026',  text: "Très bonne agence pour le marché parisien de luxe. Quelques délais de réponse à améliorer." },
  ],
  'foncia-lyon':    [
    { author: 'Thomas B.',    rating: 5, date: 'Avr. 2026',  text: 'Gestion locative impeccable depuis 3 ans. Jamais eu de souci.' },
    { author: 'Sophie L.',    rating: 4, date: 'Mars 2026',  text: 'Réactifs et compétents. Légèrement cher mais le service le vaut.' },
    { author: 'Marc D.',      rating: 4, date: 'Fév. 2026',  text: 'Bonne agence, dossier traité rapidement.' },
  ],
  'orpi-bordeaux':  [
    { author: 'Claire V.',    rating: 5, date: 'Avr. 2026',  text: 'Achat de notre maison bordelaise géré avec professionnalisme. Merci !' },
    { author: 'Pierre N.',    rating: 5, date: 'Mars 2026',  text: 'Excellent conseil pour notre premier achat. On se sentait accompagnés.' },
    { author: 'Aurélie P.',   rating: 4, date: 'Jan. 2026',  text: "Très bonne expérience, bien à l'écoute de notre projet." },
  ],
  'century21-nice': [
    { author: 'Hélène R.',    rating: 5, date: 'Avr. 2026',  text: "Villa trouvée en moins d'un mois. Service haut de gamme à tous les niveaux." },
    { author: 'Laurent C.',   rating: 5, date: 'Mars 2026',  text: 'Connaissance parfaite du marché niçois. Conseillers très disponibles.' },
    { author: 'Nathalie B.',  rating: 5, date: 'Fév. 2026',  text: 'Prestation irréprochable, résultat au-delà de nos attentes.' },
  ],
  'guy-hoquet':     [
    { author: 'David K.',     rating: 4, date: 'Mars 2026',  text: "Bon accompagnement dans l'ensemble. Quelques délais un peu longs." },
    { author: 'Sandra F.',    rating: 4, date: 'Fév. 2026',  text: 'Équipe sympathique et professionnelle. Je recommande.' },
    { author: 'Éric M.',      rating: 3, date: 'Jan. 2026',  text: 'Service correct, mais j\'ai dû relancer plusieurs fois.' },
  ],
  'laforet-nantes': [
    { author: 'Céline G.',    rating: 5, date: 'Mars 2026',  text: "Premier achat réalisé sereinement grâce à l'équipe Laforêt. Super expérience !" },
    { author: 'François A.',  rating: 5, date: 'Fév. 2026',  text: "Très à l'écoute, ils ont trouvé exactement ce que je cherchais." },
    { author: 'Julie T.',     rating: 4, date: 'Jan. 2026',  text: 'Bonne agence, rapport qualité-prix satisfaisant.' },
  ],
  'nexity-paris':   [
    { author: 'Alain B.',     rating: 5, date: 'Avr. 2026',  text: 'Investissement Pinel géré de A à Z. Très professionnel.' },
    { author: 'Camille P.',   rating: 4, date: 'Mars 2026',  text: 'Programme neuf livré en temps et en heure. Bon suivi.' },
    { author: 'Bruno L.',     rating: 4, date: 'Fév. 2026',  text: 'Bonne expérience avec le service Nexity Paris.' },
  ],
  'era-toulouse':   [
    { author: 'Manon S.',     rating: 5, date: 'Mars 2026',  text: 'Vente de notre maison conclue en 5 semaines. Super équipe !' },
    { author: 'Julien M.',    rating: 4, date: 'Fév. 2026',  text: 'Bon conseil, agence sérieuse et disponible.' },
    { author: 'Christine B.', rating: 5, date: 'Jan. 2026',  text: 'Très satisfaite, viager bien expliqué et bien géré.' },
  ],
}

const AGENCY_CERT = {
  trust:   { label: 'PASMAL Trust', bg: 'bg-orange-100', text: 'text-orange-600' },
  partner: { label: 'Partenaire',   bg: 'bg-indigo-100', text: 'text-indigo-600' },
  none:    null,
}

const AGENCY_FILTERS = ['Toutes', 'Luxe', 'Achat', 'Location', 'Investissement', 'Neuf', 'Gestion', 'Viager']

const AGENCY_LISTING_IMGS = [
  unsplash('photo-1502672260266-1c1ef2d93688', 400),
  unsplash('photo-1613490493576-7fde63acd811', 400),
  unsplash('photo-1560448204-e02f11c3d0e2', 400),
]

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={12} height={12} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function AgencesPage() {
  const navigate = useNavigate()
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('Toutes')
  const [sortBy,    setSortBy]    = useState('score')
  const [viewMode,  setViewMode]  = useState('grid')
  const [selected,  setSelected]  = useState(null)
  const [contacted, setContacted] = useState(false)
  const [msgName,   setMsgName]   = useState('')
  const [msgEmail,  setMsgEmail]  = useState('')
  const [msgText,   setMsgText]   = useState('')

  const filtered = useMemo(() => {
    const list = AGENCIES_MOCK.filter(a => {
      const matchSearch = search.trim() === '' ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.city.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'Toutes' || a.specialties.includes(filter)
      return matchSearch && matchFilter
    })
    if (sortBy === 'rating')   list.sort((a, b) => b.rating   - a.rating)
    if (sortBy === 'listings') list.sort((a, b) => b.listings - a.listings)
    if (sortBy === 'reviews')  list.sort((a, b) => b.reviews  - a.reviews)
    if (sortBy === 'score')    list.sort((a, b) => b.score    - a.score)
    if (sortBy === 'response') list.sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime))
    return list
  }, [search, filter, sortBy])

  const handleContact = (e) => { e.preventDefault(); setContacted(true) }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky top nav ───────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <BrandLogo />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/annonces" className="hover:text-[#0B1F3A] transition">Annonces</Link>
            <span className="text-orange-600 font-semibold">Agences</span>
          </nav>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A] transition">
            <I.ArrowLeft size={15} />
            <span className="hidden sm:inline">Retour</span>
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 bg-gradient-to-br from-[#0B1F3A] via-[#0e2040] to-[#0a1a35] overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-5">
            <I.BadgeCheck size={12} /> Agences certifiées PASMAL
          </div>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
            Votre agence idéale,<br />
            <span className="text-orange-400">vérifiée et approuvée.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Découvrez les agences partenaires PASMAL — sélectionnées pour leur sérieux, leurs résultats et la satisfaction de leurs clients.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: AGENCIES_MOCK.length, label: 'agences référencées' },
              { value: '4,6', suffix: '/5', label: 'note moyenne' },
              { value: '1 850+', label: 'clients satisfaits' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white text-2xl font-extrabold">{s.value}{s.suffix || ''}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search + filters ─────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <I.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une agence ou une ville…"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PasmalSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'score',    label: 'Score PASMAL' },
                  { value: 'rating',   label: 'Note clients' },
                  { value: 'listings', label: 'Annonces actives' },
                  { value: 'reviews',  label: "Nombre d'avis" },
                  { value: 'response', label: 'Temps de réponse' },
                ]}
                size="sm"
                searchable={false}
              />
              <div className="flex items-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {[
                  { id: 'grid', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
                  { id: 'list', icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${viewMode === v.id ? 'bg-[#0B1F3A] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">{v.icon}</svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {AGENCY_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agency results ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg font-extrabold text-[#0B1F3A]">{filtered.length}</span>
          <span className="text-sm text-slate-500">agence{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <I.Search size={20} className="text-slate-400" />
            </div>
            <p className="text-[#0B1F3A] font-semibold">Aucune agence trouvée</p>
            <p className="text-slate-400 text-sm mt-1">Essayez un autre filtre ou une autre ville.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((agency, i) => {
              const cert = AGENCY_CERT[agency.certified]
              return (
                <motion.div key={agency.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(agency)}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
                  <div className="h-2" style={{ background: agency.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold shadow-sm" style={{ background: agency.color }}>
                        {agency.logo}
                      </div>
                      {cert && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cert.bg} ${cert.text}`}>{cert.label}</span>}
                    </div>
                    <div className="font-extrabold text-[#0B1F3A] text-base mb-0.5 group-hover:text-orange-600 transition-colors">{agency.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <I.MapPin size={11} className="text-orange-500" /> {agency.city}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agency.specialties.map(s => (
                        <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <StarRow rating={agency.rating} />
                        <span className="text-xs font-bold text-[#0B1F3A]">{agency.rating}</span>
                        <span className="text-xs text-slate-400">({agency.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><I.Mail size={10} className="text-orange-500" /> Rép. {agency.responseTime}</span>
                      <span className="flex items-center gap-1"><I.Check size={10} className="text-emerald-500" /> {agency.satisfaction}% satisf.</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Score PASMAL</span>
                      <span className="text-[11px] font-extrabold text-orange-600">{agency.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${agency.score}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${agency.color}, #f97316)` }} />
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <div className="w-full py-2 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white transition-all text-center">
                      Voir le profil →
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((agency, i) => {
              const cert = AGENCY_CERT[agency.certified]
              return (
                <motion.div key={agency.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(agency)}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex">
                  <div className="w-1.5 shrink-0 rounded-l-3xl" style={{ background: agency.color }} />
                  <div className="w-32 sm:w-44 shrink-0 overflow-hidden">
                    <img src={unsplash(agency.imgId, 320)} alt={agency.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-extrabold text-[#0B1F3A] text-base group-hover:text-orange-600 transition-colors truncate">{agency.name}</span>
                          {cert && <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cert.bg} ${cert.text}`}>{cert.label}</span>}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-extrabold text-orange-600">{agency.score}</div>
                          <div className="text-[10px] text-slate-400">/ 100</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <I.MapPin size={11} className="text-orange-500" /> {agency.city} · {agency.region}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRow rating={agency.rating} />
                        <span className="text-xs font-bold text-[#0B1F3A]">{agency.rating}</span>
                        <span className="text-xs text-slate-400">({agency.reviews} avis)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {agency.specialties.map(s => (
                          <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><I.Building size={11} /> {agency.listings} annonces</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><I.Mail size={11} className="text-orange-500" /> Rép. {agency.responseTime}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><I.Check size={11} className="text-emerald-500" /> {agency.satisfaction}% satisf.</span>
                      <div className="ml-auto flex gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setSelected(agency); }}
                          className="text-xs font-semibold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition">
                          Contacter
                        </button>
                        <button onClick={e => { e.stopPropagation(); setSelected(agency); }}
                          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:border-orange-400 text-slate-600 hover:text-orange-600 rounded-xl transition">
                          Voir annonces →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Become partner CTA ───────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#0B1F3A] to-[#162E52] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-widest mb-5">
            <I.Building size={12} /> Vous êtes une agence ?
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Rejoignez le réseau PASMAL
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Obtenez le badge de certification PASMAL Trust, accédez à nos 2,4 millions de visiteurs mensuels et bénéficiez d'outils pros exclusifs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/auth/register/pro')}
              className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Demander la certification
            </button>
            <button className="px-8 py-3.5 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-full transition-all text-sm">
              En savoir plus
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {['Visibilité x4', 'Badge certifié', 'Support dédié', 'Outils CRM'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-white/50 text-xs">
                <I.Check size={12} className="text-emerald-400 shrink-0" /> {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-6 px-8 flex items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} PASMAL</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600 transition">Aide</a>
          <a href="#" className="hover:text-slate-600 transition">Confidentialité</a>
          <a href="#" className="hover:text-slate-600 transition">CGU</a>
        </div>
      </footer>

      {/* ── Agency detail modal ──────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => { setSelected(null); setContacted(false) }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 top-20 bottom-4 sm:inset-x-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[720px] z-50 bg-white rounded-3xl overflow-y-auto shadow-2xl"
            >
              <div className="h-3 rounded-t-3xl" style={{ background: selected.color }} />

              <div className="p-6 sm:p-8">
                <button onClick={() => { setSelected(null); setContacted(false) }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <I.X size={14} />
                </button>

                {/* Agency header */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0"
                    style={{ background: selected.color }}>
                    {selected.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-xl font-extrabold text-[#0B1F3A]">{selected.name}</h2>
                      {AGENCY_CERT[selected.certified] && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${AGENCY_CERT[selected.certified].bg} ${AGENCY_CERT[selected.certified].text}`}>
                          {AGENCY_CERT[selected.certified].label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                      <I.MapPin size={13} className="text-orange-500" /> {selected.city} · {selected.region}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRow rating={selected.rating} />
                      <span className="text-sm font-bold text-[#0B1F3A]">{selected.rating}</span>
                      <span className="text-sm text-slate-400">({selected.reviews} avis)</span>
                    </div>
                  </div>
                </div>

                {/* Score de performance */}
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#162E52] rounded-2xl p-4 mb-5 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <motion.circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="3"
                        strokeDasharray={`${(selected.score / 100) * 94.2} 94.2`} strokeLinecap="round"
                        initial={{ strokeDasharray: '0 94.2' }}
                        animate={{ strokeDasharray: `${(selected.score / 100) * 94.2} 94.2` }}
                        transition={{ duration: 1, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-extrabold text-sm">{selected.score}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-sm mb-0.5">Score PASMAL</div>
                    <div className="text-white/60 text-xs">Sur 100 — basé sur la réactivité, les avis et les performances.</div>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Annonces actives',  value: selected.listings },
                    { label: 'Sur PASMAL depuis', value: selected.since },
                    { label: 'Temps de réponse',  value: selected.responseTime },
                    { label: 'Satisfaction',       value: `${selected.satisfaction}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                      <div className="text-xl font-extrabold text-[#0B1F3A]">{s.value}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {selected.specialties.map(s => (
                    <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{s}</span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{selected.desc}</p>

                {/* Mock listings preview */}
                <div className="mb-6">
                  <div className="text-sm font-bold text-[#0B1F3A] mb-3">Annonces récentes</div>
                  <div className="grid grid-cols-3 gap-3">
                    {AGENCY_LISTING_IMGS.map((img, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden aspect-video relative group cursor-pointer">
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-white text-[11px] font-bold">
                          {(280000 + i * 85000).toLocaleString('fr-FR')} €
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avis clients */}
                {(() => {
                  const revs = AGENCY_REVIEWS_MAP[selected.id] || []
                  return revs.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-[#0B1F3A]">Avis clients</div>
                        <div className="flex items-center gap-1.5">
                          <StarRow rating={selected.rating} />
                          <span className="text-sm font-bold text-[#0B1F3A]">{selected.rating}</span>
                          <span className="text-xs text-slate-400">({selected.reviews} avis)</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {revs.map((r, ri) => (
                          <div key={ri} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-extrabold text-orange-600">
                                  {r.author[0]}
                                </div>
                                <span className="text-sm font-semibold text-[#0B1F3A]">{r.author}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRow rating={r.rating} />
                                <span className="text-[11px] text-slate-400">{r.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">"{r.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Contact form */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <div className="font-bold text-[#0B1F3A] text-sm mb-4">Contacter {selected.name}</div>
                  {contacted ? (
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <I.CheckCircle size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#0B1F3A] text-sm">Message envoyé !</div>
                        <div className="text-xs text-slate-500">{selected.name} vous répondra dans les 24h.</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input value={msgName} onChange={e => setMsgName(e.target.value)} required placeholder="Votre nom"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
                        <input type="email" value={msgEmail} onChange={e => setMsgEmail(e.target.value)} required placeholder="Votre e-mail"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition" />
                      </div>
                      <textarea rows={3} value={msgText} onChange={e => setMsgText(e.target.value)} required
                        placeholder="Votre message…"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
                      <button type="submit"
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                        Envoyer le message
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
