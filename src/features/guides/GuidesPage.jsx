import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'

const unsplash = (id, w = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/* ── Data ─────────────────────────────────────────────────────── */

const ALL_GUIDES = [
  {
    id: 'primo', cat: 'Achat', featured: true,
    title: 'Primo-accédants : le guide complet 2026',
    excerpt: "Budget, apport, PTZ, frais de notaire... tout ce qu'il faut savoir avant de signer.",
    img: unsplash('photo-1554224155-6726b3ff858f', 900), time: '8 min', date: '12 mai 2026', author: 'Sophie Marchand',
    content: [
      { h: 'Définir votre budget',     p: "Calculez votre capacité d'emprunt : le taux d'endettement ne doit pas dépasser 35 % de vos revenus nets. Consultez un courtier pour comparer les offres de plusieurs banques et simuler votre mensualité." },
      { h: 'Le Prêt à Taux Zéro',      p: "Le PTZ peut financer jusqu'à 40 % du prix selon la zone géographique. Réservé aux primo-accédants achetant leur résidence principale, il ne nécessite pas de remboursement d'intérêts et s'ajoute à votre prêt principal." },
      { h: 'Les frais de notaire',      p: "Prévoyez 7-8 % du prix dans l'ancien (2-3 % dans le neuf). Ces frais incluent droits de mutation, honoraires du notaire et débours. Négligeables dans le neuf, ils pèsent lourd dans l'ancien." },
      { h: 'Checklist avant signature', p: "Vérifiez le DPE, les charges de copropriété, la taxe foncière, les travaux votés et le règlement de copropriété. Un diagnostiqueur professionnel peut vous éviter de mauvaises surprises." },
    ],
  },
  {
    id: 'bail', cat: 'Location',
    title: 'Comprendre le bail de location en 5 points',
    excerpt: "Durée, dépôt de garantie, charges récupérables : vos droits et obligations.",
    img: unsplash('photo-1560518883-ce09059eeffa', 900), time: '5 min', date: '8 mai 2026', author: 'Lucas Dupont',
    content: [
      { h: 'Durée du bail',             p: "Un bail non meublé est conclu pour 3 ans, 1 an en meublé. À l'échéance, renouvellement automatique sauf congé donné dans les délais : 3 mois côté bailleur, 1 mois côté locataire en zone tendue." },
      { h: 'Le dépôt de garantie',      p: "Limité à 1 mois en location vide, 2 mois en meublé. Il doit être restitué dans les 2 mois suivant la restitution des clés, déductions de réparations justifiées." },
      { h: 'Les charges récupérables',  p: "Le bailleur peut récupérer entretien des parties communes, eau, chauffage collectif... La liste exhaustive est fixée par décret. Un décompte annuel doit être envoyé au locataire." },
    ],
  },
  {
    id: 'lmnp', cat: 'Investissement',
    title: 'LMNP : amortir son bien et réduire ses impôts',
    excerpt: "Le statut LMNP offre des avantages fiscaux puissants souvent méconnus des investisseurs.",
    img: unsplash('photo-1486325212027-8081e485255e', 900), time: '6 min', date: '3 mai 2026', author: 'Marie Lefèvre',
    content: [
      { h: "Qu'est-ce que le LMNP ?",  p: "La Location Meublée Non Professionnelle permet de louer un bien meublé avec une fiscalité avantageuse. Vous devez percevoir moins de 23 000 € de loyers annuels ou que ceux-ci représentent moins de 50 % de vos revenus globaux." },
      { h: "L'amortissement comptable", p: "Au régime réel, vous amortissez le bien sur 25-40 ans et les meubles sur 7-10 ans. Cet amortissement vient en déduction des loyers et peut réduire votre imposition à zéro sur de nombreuses années." },
      { h: 'Micro-BIC vs réel',         p: "Le micro-BIC offre un abattement de 50 %. Le régime réel est plus avantageux si vos charges (crédit, travaux, amortissement) dépassent 50 % des recettes. Un expert-comptable peut vous accompagner." },
    ],
  },
  {
    id: 'taux', cat: 'Financement',
    title: 'Comment négocier le meilleur taux immobilier',
    excerpt: "Apport, dossier solide, courtier... les leviers pour décrocher les meilleures conditions.",
    img: unsplash('photo-1560472354-b33ff0c44a43', 900), time: '7 min', date: '28 avr. 2026', author: 'Pierre Morel',
    content: [
      { h: 'Construire un dossier solide', p: "Les banques regardent : stabilité professionnelle (CDI préféré), taux d'endettement, apport (idéalement 10-20 %), comportement bancaire (pas de découvert, épargne régulière). Préparez 3 mois de relevés et vos 3 dernières fiches de paie." },
      { h: 'Faire appel à un courtier',    p: "Un courtier compare les offres de nombreuses banques et négocie en votre nom. Sa rémunération est en général à la charge de la banque retenue. Economies potentielles : plusieurs milliers d'euros." },
      { h: "L'assurance emprunteur",       p: "Depuis la loi Lemoine, vous pouvez changer d'assurance emprunteur à tout moment. La délégation d'assurance peut vous économiser 30 à 70 % sur ce poste, soit plusieurs dizaines de milliers sur la durée du prêt." },
    ],
  },
  {
    id: 'vendre', cat: 'Vente',
    title: "Vendre au meilleur prix : les 7 règles d'or",
    excerpt: "Estimation, home staging, timing de mise en vente... les secrets des vendeurs performants.",
    img: unsplash('photo-1600585154340-be6161a56a0c', 900), time: '6 min', date: '22 avr. 2026', author: 'Sophie Marchand',
    content: [
      { h: 'Bien estimer son bien',  p: "Une surestimation fera fuir les acheteurs et rallongera les délais. Consultez plusieurs agents et les bases notariales pour les ventes récentes dans votre quartier. SHOPCA propose une estimation gratuite en ligne." },
      { h: 'Le home staging',        p: "La valorisation immobilière permet de vendre 10-15 % plus cher et 2-3× plus vite. Dépersonnalisez, désencombrez, rafraîchissez les peintures et soignez les photos (lumière naturelle, grand angle)." },
      { h: 'Choisir le bon moment',  p: "Le printemps (mars-juin) est la meilleure période de mise en vente pour les résidences principales. Évitez les fêtes et l'été. Une annonce publiée un jeudi obtient en moyenne 22 % de contacts supplémentaires." },
    ],
  },
  {
    id: 'dpe', cat: 'Travaux & DPE',
    title: 'DPE F et G : les aides à la rénovation en 2026',
    excerpt: "MaPrimeRénov', CEE, éco-PTZ... tour d'horizon des dispositifs disponibles pour rénover.",
    img: unsplash('photo-1558618666-fcd25c85cd64', 900), time: '9 min', date: '15 avr. 2026', author: 'Lucas Dupont',
    content: [
      { h: "L'urgence énergétique",  p: "Les logements G sont interdits à la location depuis 2025. Les F suivront en 2028. La rénovation thermique n'est plus seulement un choix mais une nécessité pour les propriétaires bailleurs." },
      { h: "MaPrimeRénov'",          p: "Ce dispositif de l'ANAH finance jusqu'à 70 % des travaux pour les ménages les plus modestes. Isolation, pompe à chaleur, ventilation... sont éligibles. Les démarches se font sur maprimerenov.gouv.fr." },
      { h: "L'éco-PTZ",              p: "Jusqu'à 50 000 € sans intérêts pour un bouquet de travaux de rénovation. Cumulable avec MaPrimeRénov' et accessible sans conditions de ressources depuis 2022. Durée de remboursement jusqu'à 20 ans." },
    ],
  },
  {
    id: 'copro', cat: 'Achat',
    title: 'Acheter en copropriété : les pièges à éviter',
    excerpt: "Charges, travaux votés, syndic, règlement... ce qu'il faut absolument vérifier avant de signer.",
    img: unsplash('photo-1484154218962-a197022b5858', 900), time: '6 min', date: '5 avr. 2026', author: 'Pierre Morel',
    content: [
      { h: 'Les documents à analyser', p: "Exigez les 3 derniers PV d'assemblée générale, le règlement de copropriété, le carnet d'entretien et les relevés de charges des 3 dernières années pour cerner la santé financière de la copropriété." },
      { h: 'Les travaux votés',        p: "Des travaux votés mais non payés seront à votre charge après la vente. Le diagnostic technique global (DTG) alerte sur les travaux à prévoir sur 10 ans. Demandez-le systématiquement." },
    ],
  },
  {
    id: 'meuble', cat: 'Location',
    title: 'Location meublée : équipements obligatoires et avantages',
    excerpt: "Liste du mobilier imposé, loyer majoré, bail mobilité : tout ce qu'il faut savoir.",
    img: unsplash('photo-1493809842364-78817add7ffb', 900), time: '4 min', date: '1 avr. 2026', author: 'Sophie Marchand',
    content: [
      { h: 'Le mobilier obligatoire', p: "La liste réglementaire inclut : literie, volets/rideaux en chambre, plaques de cuisson, four ou micro-ondes, réfrigérateur, table et sièges, étagères de rangement, luminaires et matériel d'entretien ménager." },
      { h: 'Les avantages fiscaux',   p: "En régime LMNP, l'amortissement comptable peut annuler l'imposition sur les loyers. Le micro-BIC offre 50 % d'abattement contre 30 % en location nue. Un avantage fiscal significatif sur le long terme." },
    ],
  },
  {
    id: 'rendement', cat: 'Investissement',
    title: "Calculer le rendement locatif net-net d'un investissement",
    excerpt: "Rendement brut, net, net-net : les vraies formules pour comparer des biens objectivement.",
    img: unsplash('photo-1556909114-f6e7ad7d3136', 900), time: '5 min', date: '25 mar. 2026', author: 'Marie Lefèvre',
    content: [
      { h: 'Le rendement brut',    p: "Rendement brut = (loyer annuel / prix d'achat) × 100. Simple à calculer mais peu représentatif de la réalité car il ignore les charges, la fiscalité et les frais d'acquisition." },
      { h: 'Le rendement net',     p: "Rendement net = ((loyer annuel − charges) / (prix + frais)) × 100. Plus précis, il intègre les charges locatives, la taxe foncière, les frais d'acquisition et l'assurance." },
      { h: 'Le rendement net-net', p: "Le rendement net-net intègre également la fiscalité applicable (TMI + prélèvements sociaux, ou régime LMNP). C'est la seule mesure vraiment comparable entre deux investissements à régimes fiscaux différents." },
    ],
  },
]

const GUIDE_CATS = ['Tous', 'Achat', 'Location', 'Vente', 'Investissement', 'Financement', 'Travaux & DPE']
const GUIDE_CAT_COLORS = {
  Achat: '#F97316', Location: '#6366F1', Vente: '#10B981',
  Investissement: '#0EA5E9', Financement: '#F59E0B', 'Travaux & DPE': '#8B5CF6',
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function GuidesPage() {
  const navigate = useNavigate()
  const [searchQ, setSearchQ] = useState('')
  const [cat,     setCat]     = useState('Tous')
  const [openId,  setOpenId]  = useState(null)

  const filtered = ALL_GUIDES.filter(g => {
    const matchCat = cat === 'Tous' || g.cat === cat
    const matchQ   = !searchQ || g.title.toLowerCase().includes(searchQ.toLowerCase()) || g.excerpt.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchQ
  })
  const featured  = filtered.find(g => g.featured) || filtered[0]
  const rest      = filtered.filter(g => g !== featured)
  const openGuide = ALL_GUIDES.find(g => g.id === openId)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/annonces')} className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Annonces</button>
            <button onClick={() => navigate('/estimation')} className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Estimation</button>
            <button onClick={() => navigate('/simulateur')} className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Simulateur</button>
          </nav>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-800 transition-colors">
            <I.ArrowLeft size={15} /> Retour
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
            <I.FileText size={12} /> Guides & conseils
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            L'immobilier,<br /><span className="text-orange-400">expliqué simplement.</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Tous les guides dont vous avez besoin pour acheter, louer, vendre et investir en toute confiance.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><I.Search size={17} /></div>
            <input type="text" placeholder="Rechercher un guide..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all" />
          </div>
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap mt-8">
            {[
              { value: `${ALL_GUIDES.length}`, label: 'guides disponibles' },
              { value: '4–9 min',              label: 'temps de lecture' },
              { value: '100 %',                label: 'gratuit' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white text-xl font-extrabold">{s.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category filters (sticky) ── */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-2 overflow-x-auto">
          {GUIDE_CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${cat === c ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              style={{ background: cat === c ? (GUIDE_CAT_COLORS[c] || '#0B1F3A') : undefined }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12">

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <I.Search size={24} className="text-orange-400" />
            </div>
            <div className="font-bold text-navy-900 mb-2">Aucun guide trouvé</div>
            <div className="text-slate-400 text-sm mb-4">Essayez d'autres mots-clés ou une autre catégorie.</div>
            <button onClick={() => { setSearchQ(''); setCat('Tous') }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold">Réinitialiser</button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all cursor-pointer"
                onClick={() => setOpenId(featured.id)}>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
                    <img src={featured.img} alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                      onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 900) }} />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">À la une</span>
                      <span className="text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: GUIDE_CAT_COLORS[featured.cat] || '#0B1F3A' }}>{featured.cat}</span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                      <span>{featured.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{featured.time} de lecture</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{featured.author}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-4 group-hover:text-orange-600 transition-colors leading-snug">{featured.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Lire le guide <I.ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-6">
                  {cat === 'Tous' ? 'Tous les guides' : `Guides — ${cat}`}
                </h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden" animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>
                  {rest.map(g => (
                    <motion.article key={g.id}
                      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                      onClick={() => setOpenId(g.id)}
                      className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer">
                      <div className="relative overflow-hidden aspect-video">
                        <img src={g.img} alt={g.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 600) }} />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ background: GUIDE_CAT_COLORS[g.cat] || '#0B1F3A' }}>{g.cat}</span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
                          <span>{g.time} de lecture</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{g.date}</span>
                        </div>
                        <h3 className="font-bold text-navy-900 text-sm leading-snug group-hover:text-orange-600 transition-colors mb-2">{g.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{g.excerpt}</p>
                        <div className="flex items-center gap-1.5 text-orange-600 text-xs font-semibold mt-4 group-hover:gap-2.5 transition-all">
                          Lire <I.ArrowRight size={13} />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Article detail overlay ── */}
      <AnimatePresence>
        {openGuide && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpenId(null)} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl top-16 bottom-4 z-[110] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header image */}
              <div className="relative h-48 shrink-0 overflow-hidden">
                <img src={openGuide.img} alt={openGuide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setOpenId(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm">
                  <I.X size={16} />
                </button>
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: GUIDE_CAT_COLORS[openGuide.cat] || '#0B1F3A' }}>{openGuide.cat}</span>
                  <span className="text-white/80 text-xs">{openGuide.time} de lecture</span>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span>{openGuide.author}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{openGuide.date}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-navy-900 leading-snug mb-4">{openGuide.title}</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 border-l-4 border-orange-200 pl-4 italic">{openGuide.excerpt}</p>
                <div className="space-y-6">
                  {openGuide.content.map((section, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}>
                      <h2 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                          style={{ background: GUIDE_CAT_COLORS[openGuide.cat] || '#0B1F3A' }}>{i + 1}</span>
                        {section.h}
                      </h2>
                      <p className="text-slate-600 text-sm leading-relaxed pl-8">{section.p}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Related */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="text-sm font-bold text-navy-900 mb-4">Guides similaires</div>
                  <div className="space-y-3">
                    {ALL_GUIDES.filter(g => g.id !== openGuide.id && g.cat === openGuide.cat).slice(0, 2).concat(
                      ALL_GUIDES.filter(g => g.id !== openGuide.id && g.cat !== openGuide.cat).slice(0, 1)
                    ).slice(0, 3).map(g => (
                      <button key={g.id} onClick={() => setOpenId(g.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors">
                        <img src={g.img} alt="" className="w-14 h-10 rounded-xl object-cover shrink-0"
                          onError={e => { e.currentTarget.src = unsplash('photo-1560448204-e02f11c3d0e2', 100) }} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-navy-900 truncate">{g.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{g.time} de lecture</div>
                        </div>
                        <I.ChevronRight size={14} className="text-slate-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* CTA */}
                <div className="mt-6 bg-gradient-to-r from-navy-900 to-[#162E52] rounded-2xl p-5 text-center">
                  <div className="text-white font-bold mb-1 text-sm">Prêt à passer à l'action ?</div>
                  <p className="text-white/60 text-xs mb-4">Trouvez votre bien idéal sur SHOPCA.</p>
                  <button onClick={() => { setOpenId(null); navigate('/annonces') }}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                    Voir les annonces <I.ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
