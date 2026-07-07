import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '../../lib/ui.jsx'

/* ── Inline SVG icons (no external lib) ───────────────────────── */
const S = (size = 22) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round', strokeLinejoin: 'round',
})
const Ic = {
  Home:        (p) => <svg {...S(p?.size)}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building:    (p) => <svg {...S(p?.size)}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/></svg>,
  Building2:   (p) => <svg {...S(p?.size)}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  Warehouse:   (p) => <svg {...S(p?.size)}><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>,
  Villa:       (p) => <svg {...S(p?.size)}><path d="M3 12 L12 4 L21 12"/><path d="M5 10 V20 H19 V10"/><path d="M9 20 V14 H15 V20"/><path d="M19 5 V8"/></svg>,
  Users:       (p) => <svg {...S(p?.size)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Car:         (p) => <svg {...S(p?.size)}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
  MapPin:      (p) => <svg {...S(p?.size)}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  TrendingUp:  (p) => <svg {...S(p?.size)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Briefcase:   (p) => <svg {...S(p?.size)}><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Zap:         (p) => <svg {...S(p?.size)}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  Maximize:    (p) => <svg {...S(p?.size)}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>,
  Search:      (p) => <svg {...S(p?.size)}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  X:           (p) => <svg {...S(p?.size)}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ChevronLeft: (p) => <svg {...S(p?.size)}><path d="m15 18-6-6 6-6"/></svg>,
  ArrowRight:  (p) => <svg {...S(p?.size)}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Star:        (p) => <svg {...S(p?.size)} fill={p?.fill || 'none'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

/* ── Données catégories ────────────────────────────────────────── */
const ALL_CATS = [
  /* ── Résidentiel ── */
  {
    label: 'Studio',
    icon:  Ic.Home,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Idéal pour les étudiants et jeunes actifs en ville',
    count: 1240,
    badge: null,
    params: 'propertyType=Studio',
  },
  {
    label: 'Appartement T2',
    icon:  Ic.Building2,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Parfait pour un couple ou seul avec espace de vie',
    count: 980,
    badge: null,
    params: 'propertyType=T2',
  },
  {
    label: 'Appartement T3',
    icon:  Ic.Building,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Confort familial avec séjour et chambres séparées',
    count: 756,
    badge: null,
    params: 'propertyType=T3',
  },
  {
    label: 'Appartement T4+',
    icon:  Ic.Building,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Grand appartement pour toute la famille',
    count: 432,
    badge: null,
    params: 'propertyType=Appartement',
  },
  {
    label: 'Maison',
    icon:  Ic.Warehouse,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Maison individuelle avec jardin privatif',
    count: 623,
    badge: null,
    params: 'propertyType=Maison',
  },
  {
    label: 'Villa',
    icon:  Ic.Villa,
    tags:  ['tout', 'achat', 'prestige'],
    desc:  "Résidences d'exception avec piscine et prestations haut de gamme",
    count: 187,
    badge: 'Prestige',
    params: 'propertyType=Villa',
  },
  {
    label: 'Colocation',
    icon:  Ic.Users,
    tags:  ['tout', 'location'],
    desc:  'Partagez votre logement intelligemment, charges comprises',
    count: 445,
    badge: null,
    params: 'propertyType=Colocation&transaction=louer',
  },
  {
    label: 'Loft',
    icon:  Ic.Maximize,
    tags:  ['tout', 'achat', 'location', 'prestige'],
    desc:  'Espaces atypiques et généreux, style industriel ou contemporain',
    count: 134,
    badge: null,
    params: 'propertyType=Loft',
  },
  {
    label: 'Duplex',
    icon:  Ic.Building2,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Appartement sur deux niveaux avec escalier intérieur',
    count: 211,
    badge: null,
    params: 'propertyType=Duplex',
  },
  {
    label: 'Penthouse',
    icon:  Ic.Building,
    tags:  ['tout', 'achat', 'prestige'],
    desc:  'Le summum du luxe au dernier étage avec terrasse panoramique',
    count: 67,
    badge: 'Prestige',
    params: 'propertyType=Penthouse',
  },
  /* ── Commercial & Professionnel ── */
  {
    label: 'Local commercial',
    icon:  Ic.Briefcase,
    tags:  ['tout', 'achat', 'location'],
    desc:  "Boutiques, restaurants, commerces en pied d'immeuble",
    count: 312,
    badge: null,
    params: 'propertyType=Local commercial',
  },
  {
    label: 'Bureau',
    icon:  Ic.Building2,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Espaces de travail professionnels et open spaces',
    count: 289,
    badge: null,
    params: 'propertyType=Bureau',
  },
  /* ── Terrain & Investissement ── */
  {
    label: 'Terrain',
    icon:  Ic.MapPin,
    tags:  ['tout', 'achat', 'investissement'],
    desc:  'Terrains constructibles, agricoles ou à bâtir',
    count: 398,
    badge: null,
    params: 'propertyType=Terrain',
  },
  {
    label: 'Immeuble',
    icon:  Ic.Building,
    tags:  ['tout', 'achat', 'investissement'],
    desc:  'Investissement patrimonial en bloc, rendement locatif garanti',
    count: 124,
    badge: null,
    params: 'propertyType=Immeuble',
  },
  {
    label: 'Parking',
    icon:  Ic.Car,
    tags:  ['tout', 'achat', 'location', 'investissement'],
    desc:  'Places de parking, box et caves en sous-sol',
    count: 567,
    badge: null,
    params: 'propertyType=Parking',
  },
  {
    label: 'Garage',
    icon:  Ic.Car,
    tags:  ['tout', 'achat', 'location'],
    desc:  'Box fermés et garages individuels sécurisés',
    count: 334,
    badge: null,
    params: 'propertyType=Garage',
  },
  /* ── Neuf ── */
  {
    label: 'Programme neuf',
    icon:  Ic.Zap,
    tags:  ['tout', 'achat', 'neuf'],
    desc:  'Appartements et maisons neufs en VEFA, normes RE2020',
    count: 245,
    badge: 'Neuf',
    params: 'propertyType=Programme neuf',
  },
]

const FILTER_TABS = [
  { id: 'tout',           label: 'Toutes les catégories' },
  { id: 'achat',          label: 'Achat' },
  { id: 'location',       label: 'Location' },
  { id: 'investissement', label: 'Investissement' },
  { id: 'neuf',           label: 'Neuf' },
  { id: 'prestige',       label: 'Prestige' },
]

const BADGE_STYLES = {
  Prestige: 'bg-amber-50 text-amber-700 border border-amber-200',
  Neuf:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

/* ── Card ──────────────────────────────────────────────────────── */
function CategoryCard({ cat, index, onClick }) {
  const Icon = cat.icon
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-[0_8px_30px_rgba(11,31,58,0.10)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Icône + badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center shrink-0 transition-colors duration-200">
          <span className="text-slate-600 group-hover:text-orange-600 transition-colors duration-200">
            <Icon size={22} />
          </span>
        </div>
        {cat.badge && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_STYLES[cat.badge] || 'bg-slate-100 text-slate-500'}`}>
            {cat.badge}
          </span>
        )}
      </div>

      {/* Texte */}
      <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-orange-700 transition-colors duration-150">
        {cat.label}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-5">
        {cat.desc}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
          {cat.count.toLocaleString('fr-FR')} annonces
        </span>
        <span className="flex items-center gap-1 text-orange-600 text-sm font-semibold opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all duration-200">
          Explorer <Ic.ArrowRight size={14} />
        </span>
      </div>
    </motion.button>
  )
}

/* ── Page principale ───────────────────────────────────────────── */
export default function CategoriesPage() {
  const navigate = useNavigate()
  const [search, setSearch]           = useState('')
  const [activeFilter, setActiveFilter] = useState('tout')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ALL_CATS.filter(c => {
      const matchFilter = c.tags.includes(activeFilter)
      const matchSearch = !q || c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [search, activeFilter])

  const handleCardClick = (cat) => {
    navigate(`/recherche?${cat.params}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header fixe ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="shrink-0">
            <BrandLogo />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/recherche" className="hover:text-[#0B1F3A] transition-colors">Annonces</Link>
            <Link to="/agences"   className="hover:text-[#0B1F3A] transition-colors">Agences</Link>
            <span className="text-orange-600 font-semibold">Catégories</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#0B1F3A] hover:bg-[#162E52] text-white px-4 py-2 rounded-full transition-colors"
            >
              <Ic.ChevronLeft size={14} />
              Accueil
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0e2040] to-[#162E52] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {ALL_CATS.length} catégories disponibles
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Toutes les catégories
          </h1>
          <p className="text-white/65 text-lg max-w-xl mb-10 leading-relaxed">
            Explorez l'ensemble de notre catalogue immobilier et trouvez exactement le type de bien que vous recherchez.
          </p>

          {/* Barre de recherche */}
          <div className="relative max-w-lg">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Ic.Search size={17} />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une catégorie…"
              className="w-full bg-white rounded-2xl pl-11 pr-10 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xl"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
              >
                <Ic.X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtres (sticky) ────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {FILTER_TABS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                  activeFilter === f.id
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille de catégories ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-20">

        {/* Compteur */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            <span className="font-semibold text-slate-700">{filtered.length}</span>
            {' '}catégorie{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'tout' && (
              <> · filtre : <span className="text-orange-600 font-semibold">{FILTER_TABS.find(f => f.id === activeFilter)?.label}</span></>
            )}
          </p>
          {(search || activeFilter !== 'tout') && (
            <button
              onClick={() => { setSearch(''); setActiveFilter('tout') }}
              className="text-sm text-slate-500 hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
            >
              <Ic.X size={12} /> Réinitialiser
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Ic.Search size={24} />
              </div>
              <p className="text-slate-600 font-semibold mb-2">Aucune catégorie trouvée</p>
              <p className="text-slate-400 text-sm mb-6">Essayez avec d'autres mots-clés ou réinitialisez les filtres.</p>
              <button
                onClick={() => { setSearch(''); setActiveFilter('tout') }}
                className="text-orange-600 font-semibold hover:text-orange-500 transition-colors text-sm"
              >
                Voir toutes les catégories
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filtered.map((cat, i) => (
                <CategoryCard
                  key={cat.label}
                  cat={cat}
                  index={i}
                  onClick={() => handleCardClick(cat)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── CTA footer ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0B1F3A] to-[#162E52] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-orange-400 mb-4">
            <Ic.Star size={14} fill="#FB923C" /><Ic.Star size={14} fill="#FB923C" /><Ic.Star size={14} fill="#FB923C" /><Ic.Star size={14} fill="#FB923C" /><Ic.Star size={14} fill="#FB923C" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Publiez votre recherche et laissez les propriétaires venir à vous. Alertes personnalisées, 100 % gratuit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/recherche"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors shadow-[0_8px_24px_rgba(255,107,0,0.35)]"
            >
              <Ic.Search size={18} /> Recherche avancée
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-2xl transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
