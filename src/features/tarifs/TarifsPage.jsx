import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'
import { checkout } from '../subscription/checkoutService.js'

// Wraps a checkout call — shows loading/error without crashing the page
function useCheckout() {
  const [loading, setLoading] = useState(null) // stores the priceType being processed
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  const pay = async (priceType, fn) => {
    setError('')
    const { data: { session } } = await import('../../lib/supabase.js')
      .then(m => m.supabase.auth.getSession())
    if (!session) { navigate('/auth/login', { state: { redirect: '/tarifs' } }); return }

    setLoading(priceType)
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return { pay, loading, error, setError }
}

const unsplash = (id, w = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/* ── Data ─────────────────────────────────────────────────────── */

const PLANS = [
  {
    name: 'Gratuit',
    price: '0', period: '€', duration: '7 jours en ligne',
    desc: 'Pour publier sans engagement et tester SHOPCA.',
    features: ['3 photos par annonce', 'Visibilité standard', 'Messagerie incluse', 'Annonce active 7 jours'],
    cta: 'Commencer gratuitement', highlight: false,
  },
  {
    name: 'Pack Visibilité',
    price: '9,90', period: '€', duration: '30 jours en ligne',
    desc: "Le plus populaire — jusqu'à 4× plus de contacts qualifiés.",
    features: ['8 photos par annonce', 'Boost visibilité +200%', 'Annonce active 30 jours', 'Statistiques de base', 'Support prioritaire'],
    cta: 'Choisir Visibilité', highlight: true,
    badge: { label: 'Nouveau', tone: 'bg-orange-100 text-orange-700 ring-orange-200' },
  },
  {
    name: 'Premium',
    price: '14,90', period: '€', duration: '30 jours en ligne',
    desc: 'Pour vendre vite, en haut des résultats.',
    features: ['12 photos par annonce', 'Top placement dans les résultats', 'Analytics avancés', 'Annonce active 30 jours', 'Support dédié'],
    cta: 'Passer Premium', highlight: false,
    badge: { label: 'Urgent', tone: 'bg-rose-100 text-rose-700 ring-rose-200' },
  },
]

const AGENCY_PLANS = [
  {
    name: 'Starter', tagline: 'Agences indépendantes', price: 49,
    desc: 'Démarrez avec les essentiels pour gérer vos premières annonces.',
    features: ["Jusqu'à 20 annonces actives", 'CRM basique pour vos leads', "Profil d'agence personnalisable", 'Messagerie sécurisée intégrée', 'Support par e-mail (48h)'],
    cta: 'Démarrer Starter', highlight: false,
  },
  {
    name: 'Pro', tagline: 'Agences en croissance', price: 129,
    desc: "Le standard du marché — toutes les agences performantes l'utilisent.",
    features: ['Annonces illimitées', 'CRM avancé + pipeline Kanban', 'Comptes multi-agents (5 inclus)', 'Analytics complets en temps réel', 'Boost visibilité +200%', 'Support prioritaire 7j/7'],
    cta: 'Passer Pro', highlight: true, badge: 'MOST POPULAR',
  },
  {
    name: 'Enterprise', tagline: 'Réseaux & groupes', price: 399,
    desc: 'Pour les groupes immobiliers et réseaux nationaux.',
    features: ['API REST + webhooks', 'Visibilité premium garantie', 'Account manager dédié', 'Onboarding personnalisé', 'SLA 99,9% + contrat sur mesure', 'Comptes agents illimités'],
    cta: 'Contacter les ventes', highlight: false, badge: 'ENTERPRISE',
  },
]

const TESTIMONIALS = [
  { name: 'Camille Lefèvre', role: 'Acquéreuse à Paris',   text: "J'ai trouvé mon T3 en 11 jours. L'interface est limpide et les annonces sont vraiment qualitatives.", avatar: unsplash('photo-1494790108377-be9c29b29330'), rating: 5 },
  { name: 'Julien Moreau',   role: 'Propriétaire bailleur', text: 'Pack Visibilité activé un lundi, mon studio loué le vendredi. Rapport qualité-prix imbattable.',        avatar: unsplash('photo-1500648767791-00dcc994a43e'), rating: 5 },
  { name: 'Sofia Benali',    role: 'Investisseuse',         text: 'Le seul service Premium qui tient ses promesses. Annonces ciblées, contacts sérieux, zéro spam.',         avatar: unsplash('photo-1438761681033-6461ffad8d80'), rating: 5 },
]

const TARIFS_FAQ = [
  { q: "Puis-je changer de plan en cours d'utilisation ?",          a: "Oui, vous pouvez passer à un plan supérieur à tout moment. La différence de prix est calculée au prorata. Pour passer à un plan inférieur, le changement prend effet à la prochaine échéance." },
  { q: "Comment fonctionne le paiement ?",                           a: "Les paiements sont sécurisés via Stripe. Vous pouvez régler par carte bancaire (Visa, Mastercard, CB) ou virement SEPA pour les plans agences. Une facture est automatiquement générée après chaque transaction." },
  { q: "Puis-je annuler à tout moment ?",                            a: "Absolument. Aucun engagement, aucune pénalité. Pour les annonces à la durée, l'annonce reste en ligne jusqu'à expiration. Pour les abonnements agences, l'accès est maintenu jusqu'à la fin de la période payée." },
  { q: "Y a-t-il des frais cachés ?",                                a: "Non. Le prix affiché est le prix payé, TVA incluse. Il n'y a pas de frais d'activation, de setup ou de commission sur vos transactions immobilières." },
  { q: "Quelle est la différence entre visibilité standard et boostée ?", a: "La visibilité standard place votre annonce dans le flux normal. La visibilité boostée (+200 %) la propulse en tête des résultats, ce qui multiplie en moyenne par 4 le nombre de contacts reçus." },
  { q: "Mon annonce reste-t-elle visible après expiration ?",         a: "Non. À l'expiration, votre annonce est automatiquement désactivée et retirée des résultats. Elle reste accessible dans votre espace pour être réactivée ou modifiée à tout moment." },
]

const COMP_PERSO = {
  headers: ['Gratuit', 'Pack Visibilité', 'Premium'], highlight: 1,
  rows: [
    { feature: 'Prix annonce',      values: ['0 €',       '9,90 €',      '14,90 €'] },
    { feature: 'Durée en ligne',    values: ['7 jours',   '30 jours',    '30 jours'] },
    { feature: 'Photos',            values: ['3',         '8',           '12'] },
    { feature: 'Visibilité',        values: ['Standard',  '+200 %',      'Top résultats'] },
    { feature: 'Badge sur annonce', values: [false,       '"Nouveau"',   '"Urgent"'] },
    { feature: 'Statistiques',      values: [false,       'Basiques',    'Avancées'] },
    { feature: 'Messagerie',        values: [true,        true,          true] },
    { feature: 'Support',           values: [false,       'Prioritaire', 'Dédié'] },
  ],
}

const COMP_PRO = {
  headers: ['Starter', 'Pro', 'Enterprise'], highlight: 1,
  rows: [
    { feature: 'Annonces actives',  values: ['20',         'Illimitées',      'Illimitées'] },
    { feature: 'Agents inclus',     values: ['1',          '5',               'Illimités'] },
    { feature: 'CRM',               values: ['Basique',    'Avancé + Kanban', 'Avancé +'] },
    { feature: 'Analytics',         values: [false,        'Temps réel',      'Temps réel'] },
    { feature: 'Boost visibilité',  values: [false,        '+200 %',          'Garanti premium'] },
    { feature: 'API REST',          values: [false,        false,             true] },
    { feature: 'Support',           values: ['E-mail 48h', '7j/7',            'Account manager'] },
    { feature: 'SLA',               values: [false,        false,             '99,9 %'] },
  ],
}

const SIM_METRICS = {
  vendre: {
    gratuit:    { contacts: 2,  delai: 52 },
    visibilite: { contacts: 8,  delai: 18 },
    premium:    { contacts: 13, delai: 11 },
  },
  louer: {
    gratuit:    { contacts: 3,  delai: 28 },
    visibilite: { contacts: 11, delai: 8  },
    premium:    { contacts: 17, delai: 5  },
  },
}

const VERSUS_ROWS = [
  { label: 'Publication basique',      shopca: '0 €',     seloger: '~299 €/mois', lbc: '~75 €/sem.' },
  { label: 'Publication boostée',      shopca: '9,90 €',  seloger: 'inclus',      lbc: 'inclus' },
  { label: 'Sans engagement',          shopca: true,      seloger: false,         lbc: true },
  { label: 'Audience qualifiée achat', shopca: true,      seloger: true,          lbc: false },
  { label: 'Analytics vendeur',        shopca: true,      seloger: false,         lbc: false },
  { label: 'CRM leads intégré',        shopca: true,      seloger: false,         lbc: false },
  { label: 'Messagerie in-app',        shopca: true,      seloger: true,          lbc: true },
]

/* ── Sub-components ───────────────────────────────────────────── */

function Counter({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setValue(Math.round(v)) })
    return controls.stop
  }, [inView, to, duration])
  return <span ref={ref}>{value.toLocaleString('fr-FR')}{suffix}</span>
}

function PersonalPlans({ onPublish }) {
  const { pay, loading, error, setError } = useCheckout()

  // Plan → checkout type mapping
  const PLAN_CHECKOUT = {
    'Pack Visibilité': 'pack_visibilite',
    'Premium':         'listing_premium',
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Tarifs particuliers</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">Des prix simples, sans surprise</h2>
          <p className="text-slate-500 mt-3">Choisissez le pack adapté à vos besoins. Sans engagement, résiliable à tout moment.</p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto mb-6 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <I.Alert size={15} className="shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600"><I.X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p, i) => {
            const priceType = PLAN_CHECKOUT[p.name]
            const isLoading = loading === priceType
            return (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-8 transition-shadow ${p.highlight ? 'bg-[#0B1F3A] text-white border-2 border-orange-500 md:scale-[1.04] shadow-xl shadow-orange-500/20' : 'bg-white text-[#0B1F3A] border border-slate-100 shadow-sm hover:shadow-lg'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <I.Star size={10} fill="white" className="text-white" /> LE PLUS CHOISI
                  </div>
                )}
                <div className={`text-sm font-semibold mb-2 ${p.highlight ? 'text-orange-400' : 'text-orange-600'}`}>{p.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-white/60' : 'text-slate-500'}`}>{p.period}</span>
                </div>
                {p.duration && <div className={`text-[11px] font-semibold uppercase tracking-wider mb-4 ${p.highlight ? 'text-white/45' : 'text-slate-400'}`}>{p.duration}</div>}
                <p className={`text-sm mb-5 ${p.highlight ? 'text-white/70' : 'text-slate-500'}`}>{p.desc}</p>
                {p.badge && (
                  <div className={`mb-5 flex items-center gap-2 px-3 py-2 rounded-2xl ${p.highlight ? 'bg-white/10 ring-1 ring-white/15' : 'bg-slate-50 ring-1 ring-slate-100'}`}>
                    <span className={`inline-flex items-center text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ring-1 ${p.badge.tone}`}>{p.badge.label}</span>
                    <span className={`text-[11px] ${p.highlight ? 'text-white/60' : 'text-slate-400'}`}>affiché sur vos annonces</span>
                  </div>
                )}
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <I.Check size={15} className={`mt-0.5 shrink-0 ${p.highlight ? 'text-orange-400' : 'text-orange-500'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!!loading}
                  onClick={() => priceType
                    ? pay(priceType, () => checkout[priceType === 'pack_visibilite' ? 'packVisibilite' : 'listingPremium']())
                    : onPublish()
                  }
                  className={`w-full py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 ${p.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30' : 'bg-slate-100 hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A]'}`}>
                  {isLoading ? <><I.Loader size={14} /> Redirection…</> : p.cta}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Alertes Premium Banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-orange-500/20 relative"
          style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #1a2740 60%, #0F2D50 100%)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-32 bg-orange-500/10 blur-3xl rounded-full" />
          </div>
          <div className="relative z-10 px-7 py-5 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <I.Bell size={22} className="text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-extrabold">Alertes Premium</span>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-full">7,50 € / mois</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">Sans engagement</span>
                </div>
                <p className="text-white/55 text-sm">Recevez les nouvelles annonces avant tout le monde · Alertes email en temps réel</p>
              </div>
            </div>
            <button
              disabled={loading === 'premium_alerts'}
              onClick={() => pay('premium_alerts', checkout.premiumAlerts)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 shrink-0 disabled:opacity-60 disabled:pointer-events-none">
              {loading === 'premium_alerts' ? <><I.Loader size={14} />Redirection…</> : <><I.Bell size={14} />S'abonner</>}
            </button>
          </div>
        </motion.div>

        {/* À la carte — Pack Photos Pro supprimé */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div className="text-center mb-7">
            <div className="text-orange-600 font-semibold text-xs tracking-wider uppercase mb-1">À la carte</div>
            <h3 className="text-xl font-extrabold text-[#0B1F3A]">Boostez selon vos besoins</h3>
            <p className="text-slate-500 text-sm mt-1">Disponibles avec tous les plans, sans engagement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { Icon: I.Zap, title: 'Remonter en tête', price: '4,90 €', sub: 'paiement unique',
                desc: 'Première position des résultats pendant 72h. Effet immédiat.',
                cta: 'Activer le boost', tag: null, color: '#F97316',
                action: () => pay('boost_top', checkout.boostTop) },
              { Icon: I.Sparkles, title: 'Estimation IA', price: '0 €', sub: 'gratuit',
                desc: "Valeur vénale estimée en 30 secondes par notre modèle propriétaire.",
                cta: 'Estimer maintenant', tag: 'Gratuit', color: '#10B981',
                action: onPublish },
            ].map(({ Icon, title, price, sub, desc, cta, tag, color, action }, ai) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: ai * 0.1 }}
                className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                {tag && (
                  <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                    style={{ background: color + '18', color, borderColor: color + '60' }}>{tag}</span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '18' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="font-extrabold text-[#0B1F3A] mb-0.5">{title}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-extrabold text-[#0B1F3A]">{price}</span>
                  <span className="text-xs text-slate-400">{sub}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                <button
                  disabled={loading === 'boost_top' && title === 'Remonter en tête'}
                  onClick={action}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all bg-slate-50 hover:bg-[#0B1F3A] hover:text-white border border-slate-100 hover:border-[#0B1F3A] disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {loading === 'boost_top' && title === 'Remonter en tête' ? <><I.Loader size={12} />Redirection…</> : cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AgencyPlans() {
  const [billing, setBilling] = useState('monthly')
  const yearly = billing === 'yearly'
  const price = (base) => yearly ? Math.round(base * 0.8) : base
  const { pay, loading, error, setError } = useCheckout()

  const AGENCY_CHECKOUT = {
    'Starter':    (y) => pay(y ? 'agency_starter_yearly' : 'agency_starter_monthly', () => checkout.agencyStarter(y)),
    'Pro':        (y) => pay(y ? 'agency_pro_yearly'     : 'agency_pro_monthly',     () => checkout.agencyPro(y)),
    'Enterprise': () => { /* Contact sales */ window.location.href = 'mailto:sales@shopca.fr?subject=Offre Enterprise' },
  }

  return (
    <section className="relative py-20 overflow-hidden bg-[#0B1F3A] text-white">
      <div className="absolute -top-40 left-1/4 w-[480px] h-[480px] rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[520px] h-[520px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">
            <I.Building size={12} className="text-orange-400" /> Solution Agences · B2B
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">La plateforme pour <span className="text-orange-400">les pros de l'immobilier</span></h2>
          <p className="text-white/60 leading-relaxed">Conçu pour les agences, réseaux et groupes immobiliers. Pipeline de leads, comptes agents, analytics, API.</p>
          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center bg-white/5 border border-white/10 p-1 rounded-full">
            {[{ id: 'monthly', label: 'Mensuel' }, { id: 'yearly', label: 'Annuel · -20%' }].map(b => (
              <button key={b.id} onClick={() => setBilling(b.id)}
                className={`relative text-sm font-semibold px-5 py-2 rounded-full transition ${billing === b.id ? 'text-[#0B1F3A]' : 'text-white/70 hover:text-white'}`}>
                {billing === b.id && <motion.span layoutId="billingPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
                <span className="relative flex items-center gap-1.5">
                  {b.label}
                  {b.id === 'yearly' && billing !== 'yearly' && <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">-20%</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {AGENCY_PLANS.map((p, i) => {
            const p_ = price(p.price)
            return (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-7 lg:p-8 ${p.highlight ? 'bg-gradient-to-br from-[#162E52] to-[#1e3a62] border-2 border-orange-500 lg:scale-[1.04] shadow-xl shadow-orange-500/20' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                {p.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1 ${p.highlight ? 'bg-orange-500 text-white' : 'bg-white text-[#0B1F3A]'}`}>
                    {p.highlight && <I.Star size={10} fill="white" className="text-white" />} {p.badge}
                  </div>
                )}
                <div className="text-orange-400 text-sm font-semibold mb-1">{p.name}</div>
                <div className="text-white/50 text-[11px] uppercase tracking-wider mb-4">{p.tagline}</div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-5xl font-extrabold text-white">{p_}</span>
                  <span className="text-sm text-white/55">€/mois</span>
                </div>
                <div className="text-[11px] text-white/35 mb-5">{yearly ? `Soit ${(p_ * 12).toLocaleString('fr-FR')} € facturés annuellement` : 'Facturé mensuellement, résiliable à tout moment'}</div>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">{p.desc}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${p.highlight ? 'bg-orange-500/25 text-orange-400' : 'bg-white/10'}`}>
                        <I.Check size={11} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!!loading}
                  onClick={() => AGENCY_CHECKOUT[p.name]?.(yearly)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none ${p.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30' : 'bg-white/10 hover:bg-white text-white hover:text-[#0B1F3A] border border-white/15'}`}>
                  {loading && loading.startsWith('agency_' + p.name.toLowerCase())
                    ? <><I.Loader size={14} />Redirection…</>
                    : <>{p.cta} <I.ArrowRight size={14} /></>
                  }
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Inclus dans tous les plans */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 max-w-6xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-white/45 md:border-r border-white/10 md:pr-4">Inclus dans tous les plans</div>
              {[
                { Icon: I.Shield,    label: 'RGPD · hébergement FR' },
                { Icon: I.CreditCard, label: 'Stripe Connect intégré' },
                { Icon: I.Sparkles,  label: 'Modération IA anti-fraude' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Icon size={14} className="text-orange-400" /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Demo CTA */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-5 bg-white/5 border border-white/10 rounded-full p-2 pl-5">
            <span className="text-sm text-white/80">Besoin d'une démo personnalisée ?</span>
            <a href="mailto:contact@shopca.fr?subject=Demande%20de%20d%C3%A9mo"
              className="inline-flex items-center gap-2 bg-white text-[#0B1F3A] hover:bg-orange-50 font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
              Nous écrire <I.ArrowRight size={14} />
            </a>
          </div>
          <div className="text-[11px] text-white/35 mt-3">Réponse sous 24h ouvrées</div>
        </div>
      </div>
    </section>
  )
}

/* ── Main page ────────────────────────────────────────────────── */

export default function TarifsPage() {
  const navigate = useNavigate()
  const [audience, setAudience] = useState('particulier')
  const [simMode,  setSimMode]  = useState('vendre')
  const [openFaq,  setOpenFaq]  = useState(null)

  const isPro = audience === 'pro'
  const comp  = isPro ? COMP_PRO : COMP_PERSO

  const CellVal = ({ val, hi }) => {
    if (val === true)  return <I.Check size={16} className={hi ? 'text-orange-500' : 'text-emerald-500'} />
    if (val === false) return <span className="text-slate-300 text-lg leading-none">—</span>
    return <span className={`text-sm font-semibold ${hi ? 'text-orange-600' : 'text-[#0B1F3A]'}`}>{val}</span>
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')}><BrandLogo /></button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/annonces" className="hover:text-[#0B1F3A] transition">Annonces</Link>
            <Link to="/agences"  className="hover:text-[#0B1F3A] transition">Agences</Link>
            <span className="text-orange-600 font-semibold">Tarifs</span>
          </nav>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A] transition">
            <I.ArrowLeft size={15} /><span className="hidden sm:inline">Retour</span>
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 bg-gradient-to-br from-[#0B1F3A] via-[#0e1f3a] to-[#162E52] overflow-hidden">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-5">
            <I.BadgeCheck size={12} /> Tarification transparente
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Des prix simples,<br />un retour mesurable.
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto mb-10">
            Sans engagement, sans frais cachés. Commencez gratuitement, upgradez quand vous en avez besoin.
          </p>

          {/* Audience toggle */}
          <div className="inline-flex items-center bg-white/10 border border-white/15 p-1 rounded-full mb-10">
            {[
              { id: 'particulier', label: 'Je suis particulier',   Icon: I.User     },
              { id: 'pro',         label: 'Je suis professionnel', Icon: I.Building },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setAudience(id)}
                className={`relative flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition ${audience === id ? 'text-[#0B1F3A]' : 'text-white/70 hover:text-white'}`}>
                {audience === id && <motion.span layoutId="audiencePill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
                <span className="relative flex items-center gap-2"><Icon size={15} /> {label}</span>
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { Icon: I.Shield,      text: 'Satisfait ou remboursé 30j' },
              { Icon: I.CheckCircle, text: 'Sans engagement' },
              { Icon: I.CreditCard,  text: 'Paiement sécurisé Stripe' },
              { Icon: I.Users,       text: '1 850+ clients actifs' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/55 text-sm">
                <Icon size={14} className="text-orange-400 shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 4,       suffix: '×',  label: 'Plus de contacts avec Pack Visibilité' },
              { value: 2400000, suffix: '',   label: 'Visiteurs par mois sur la plateforme' },
              { value: 11,      suffix: ' j', label: 'Délai moyen pour trouver un acheteur' },
              { value: 98,      suffix: '%',  label: 'Propriétaires satisfaits de SHOPCA' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative">
                <div className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A] tabular-nums">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1.5 leading-tight">{s.label}</div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-px h-10 bg-slate-100 -translate-y-1/2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isPro ? (
          <motion.div key="perso" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <PersonalPlans onPublish={() => navigate('/auth/register')} />
          </motion.div>
        ) : (
          <motion.div key="pro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <AgencyPlans />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Simulateur (particuliers only) ───────────────────── */}
      {!isPro && (
        <section className="py-16 bg-orange-50/60 border-y border-orange-100/70">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
                <I.TrendingUp size={11} /> Simulateur
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">Estimez l'impact sur votre vente</h2>
              <p className="text-slate-500 text-sm mt-2">Contacts reçus et délai moyen constatés sur SHOPCA selon votre plan.</p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-white border border-slate-200 p-1 rounded-full shadow-sm">
                {[{ id: 'vendre', label: 'Je vends' }, { id: 'louer', label: 'Je loue' }].map(({ id, label }) => (
                  <button key={id} onClick={() => setSimMode(id)}
                    className={`relative px-5 py-2 rounded-full text-sm font-bold transition-colors ${simMode === id ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}>
                    {simMode === id && <motion.span layoutId="simPill" className="absolute inset-0 bg-[#0B1F3A] rounded-full shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={simMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'gratuit',    label: 'Gratuit',         price: '0 €',     color: '#94A3B8', accent: 'border-slate-200 bg-white' },
                  { key: 'visibilite', label: 'Pack Visibilité',  price: '9,90 €',  color: '#F97316', accent: 'border-orange-400 bg-orange-50 shadow-md', hi: true },
                  { key: 'premium',    label: 'Premium',          price: '14,90 €', color: '#0B1F3A', accent: 'border-slate-300 bg-white' },
                ].map(({ key, label, price, color, accent, hi }, pi) => {
                  const m = SIM_METRICS[simMode][key]
                  const maxC = simMode === 'vendre' ? 13 : 17
                  return (
                    <div key={key} className={`rounded-2xl border-2 p-5 ${accent}`}>
                      {hi && <div className="text-center mb-3"><span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500 text-white">Le plus populaire</span></div>}
                      <div className="font-extrabold text-[#0B1F3A] mb-0.5">{label}</div>
                      <div className="text-xs text-slate-500 mb-5">{price} par annonce</div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contacts / sem.</span>
                          <span className="text-sm font-extrabold" style={{ color }}>{m.contacts}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div key={`${simMode}-${key}`}
                            initial={{ width: 0 }} animate={{ width: `${Math.round((m.contacts / maxC) * 100)}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: pi * 0.08 }}
                            className="h-full rounded-full" style={{ background: color }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3.5 border-t border-black/[0.06]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Délai moyen</span>
                        <span className="text-sm font-extrabold text-[#0B1F3A]">{m.delai} jours</span>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
            <p className="text-center text-[10px] text-slate-400 mt-5">Données moyennes constatées sur SHOPCA. Résultats variables selon le bien, la ville et le marché.</p>
          </div>
        </section>
      )}

      {/* ── Tableau comparatif ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Comparatif</div>
            <h2 className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">Tout ce qui est inclus</h2>
            <p className="text-slate-500 mt-2">Comparez les plans {isPro ? 'professionnels' : 'particuliers'} en un coup d'œil.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">Fonctionnalité</th>
                  {comp.headers.map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-center text-sm font-extrabold ${i === comp.highlight ? 'bg-[#0B1F3A] text-white' : 'text-[#0B1F3A]'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comp.rows.map((row, ri) => (
                  <motion.tr key={row.feature}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: ri * 0.04 }}
                    className={`border-b border-slate-50 last:border-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.feature}</td>
                    {row.values.map((val, ci) => (
                      <td key={ci} className={`px-6 py-4 text-center ${ci === comp.highlight ? 'bg-orange-50/60' : ''}`}>
                        <CellVal val={val} hi={ci === comp.highlight} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2">Ils nous font confiance</div>
            <h2 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">Ce que disent nos clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => <I.Star key={j} size={14} fill="#F97316" className="text-orange-500" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-[#0B1F3A] text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logos partenaires ────────────────────────────────── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.22em] mb-7">Des milliers d'agences & particuliers nous font confiance</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['BARNES', 'FONCIA', 'ORPI', 'LAFORET', 'CENTURY 21', 'GUY HOQUET', 'NEXITY', 'ERA'].map(name => (
              <span key={name} className="text-slate-200 hover:text-slate-400 font-extrabold text-base tracking-wider transition-colors cursor-default select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Versus (particuliers only) ───────────────────────── */}
      {!isPro && (
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-10">
              <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">Pourquoi SHOPCA ?</div>
              <h2 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">Comparez par vous-même</h2>
              <p className="text-slate-500 text-sm mt-2">Des fonctionnalités pro à une fraction du prix des grandes plateformes.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-2/5" />
                    <th className="px-5 py-4 text-center bg-[#0B1F3A] text-white text-sm font-extrabold">
                      <div className="flex flex-col items-center gap-1"><span>SHOPCA</span><span className="text-orange-400 text-[10px] font-semibold">dès 0 €</span></div>
                    </th>
                    <th className="px-5 py-4 text-center text-slate-400 text-xs font-bold">SeLoger<br /><span className="text-[10px] font-normal">≈ 299 €/mois</span></th>
                    <th className="px-5 py-4 text-center text-slate-400 text-xs font-bold">LeBonCoin<br /><span className="text-[10px] font-normal">≈ 75 €/sem.</span></th>
                  </tr>
                </thead>
                <tbody>
                  {VERSUS_ROWS.map((row, ri) => (
                    <motion.tr key={row.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: ri * 0.04 }}
                      className={`border-b border-slate-50 last:border-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.label}</td>
                      <td className="px-5 py-3.5 text-center bg-orange-50/40">
                        {row.shopca === true ? <I.CheckCircle size={16} className="text-orange-500 mx-auto" />
                          : row.shopca === false ? <span className="text-slate-300 text-base">—</span>
                          : <span className="text-sm font-bold text-orange-600">{row.shopca}</span>}
                      </td>
                      {[row.seloger, row.lbc].map((v, ci) => (
                        <td key={ci} className="px-5 py-3.5 text-center">
                          {v === true ? <I.Check size={15} className="text-emerald-500 mx-auto" />
                            : v === false ? <span className="text-slate-300 text-base">—</span>
                            : <span className="text-xs text-slate-500 font-medium">{v}</span>}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4">Tarifs indicatifs publics au 2026. Offres pouvant varier selon les packs et promotions en cours.</p>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-3">FAQ</div>
            <h2 className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">Questions fréquentes</h2>
          </div>
          <div className="space-y-3">
            {TARIFS_FAQ.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border transition-all ${isOpen ? 'border-orange-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                    <span className={`font-semibold text-sm leading-snug ${isOpen ? 'text-orange-600' : 'text-[#0B1F3A]'}`}>{item.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-slate-400">
                      <I.ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <p className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ───────────────────────────────────── */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#0B1F3A] to-[#162E52] rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/75 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  <I.Building size={12} /> Sur mesure
                </div>
                <h3 className="text-white text-2xl font-extrabold mb-2">Vous avez des besoins spécifiques ?</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">Volume important, intégration API, multi-sites, SLA personnalisé... Notre équipe commerciale vous propose une offre adaptée à votre structure.</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {['API & webhooks', 'White-label', 'SLA garanti', 'Account manager', 'Onboarding dédié'].map(f => (
                    <span key={f} className="text-xs font-semibold text-white/65 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <a href="mailto:contact@shopca.fr?subject=Offre%20Enterprise"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 whitespace-nowrap">
                  <I.Mail size={15} /> Nous contacter
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#0B1F3A] via-[#0e1f3a] to-[#162E52] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Garantie 30 jours — satisfait ou remboursé
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Prêt à booster vos annonces ?</h2>
          <p className="text-white/65 text-lg mb-8 max-w-xl mx-auto">Rejoignez plus de 1 850 propriétaires et agences qui font confiance à SHOPCA pour leurs transactions immobilières.</p>
          <div className="flex justify-center">
            <button onClick={() => navigate('/auth/register')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Publier gratuitement <I.ArrowRight size={16} />
            </button>
          </div>
          <p className="text-white/35 text-xs mt-6">Aucune carte requise pour le plan gratuit · Résiliable en 1 clic</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-6 px-8 flex items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} SHOPCA</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600 transition">Aide</a>
          <a href="#" className="hover:text-slate600 transition">Confidentialité</a>
          <a href="#" className="hover:text-slate-600 transition">CGU</a>
        </div>
      </footer>

    </div>
  )
}
