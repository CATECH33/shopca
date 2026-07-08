import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SeoHead from '../components/SeoHead.jsx'
import { BrandLogo, I, Badge } from '../lib/ui.jsx'
import { useAuth } from '../features/auth/providers/AuthProvider.jsx'
import {
  startPremiumAlertsCheckout,
  getSubscriptionStatus,
} from '../features/subscription/subscriptionService.js'
import {
  fetchEarlyAccessListings,
  fetchEarlyAccessStats,
  fetchUserInterests,
  fetchInterestCounts,
  markInterest,
  updateAlertChannel,
} from './earlyAccessService.js'

/* ── Constants ─────────────────────────────────────────────────────────── */
const PREMIUM_PRICE_LABEL = '9€/mois' // aligné avec PageAbonnement.jsx

/* ── Inline icons ── */
const Crown  = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
const Clock  = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const Sms    = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.07 3.4A2 2 0 0 1 3.07 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.22 17z"/></svg>

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=70'

/* ── Countdown hook ── */
function useCountdown(endsAt) {
  const [ms, setMs] = useState(() => Math.max(0, endsAt - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, endsAt - Date.now())), 1000)
    return () => clearInterval(id)
  }, [endsAt])
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  const expired = ms === 0
  return { mins, secs, expired, label: expired ? 'Publié' : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}` }
}

/* ── Countdown badge ── */
function CountdownBadge({ label, expired, urgent }) {
  if (expired) return <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-500">Publié</span>
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${urgent ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-600 text-white'}`}>
      <Clock size={11}/> {label}
    </span>
  )
}

/* ── Premium lock overlay ── */
function PremiumLock({ onUpgrade }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy-900 flex items-center justify-center mb-3 shadow-cardHover">
        <Crown size={22} className="text-orange-400"/>
      </div>
      <div className="text-navy-900 font-extrabold text-base mb-1">Accès Premium requis</div>
      <div className="text-slate-600 text-sm mb-4 max-w-[200px]">Voyez cette annonce avant les autres utilisateurs</div>
      <button
        onClick={onUpgrade}
        data-testid="premium-lock-btn"
        className="h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition shadow-soft">
        Passer Premium — {PREMIUM_PRICE_LABEL}
      </button>
    </div>
  )
}

/* ── Listing card ── */
function EarlyCard({ listing, isPremium, onUpgrade, user, initialInterested, initialInterestCount }) {
  const { endsAt, pct } = listing
  const { mins, label, expired } = useCountdown(endsAt)
  const urgent = mins < 10
  const [interested, setInterested] = useState(!!initialInterested)
  const [count, setCount] = useState(initialInterestCount || 0)
  const [saving, setSaving] = useState(false)

  useEffect(() => setInterested(!!initialInterested), [initialInterested])
  useEffect(() => setCount(initialInterestCount || 0), [initialInterestCount])

  const handleInterest = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (interested || saving) return
    if (!user) { onUpgrade(); return } // pas connecté = passe par le flux premium/login
    setSaving(true)
    setInterested(true)
    setCount(c => c + 1)
    try {
      await markInterest(user.id, listing.id)
    } catch (err) {
      console.warn('[interest] not persisted:', err?.message)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-soft bg-white group"
      data-testid="early-card"
    >
      {isPremium && (
        <Link
          to={`/annonces/${listing.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Voir l'annonce ${listing.title}`}
          data-testid="card-link"
        />
      )}

      <div className={!isPremium ? 'blur-sm pointer-events-none select-none' : ''}>
        <div className="relative h-52 overflow-hidden">
          <img
            src={listing.img}
            alt={listing.title}
            onError={(e) => { if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent"/>

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-navy-900/90 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Crown size={10}/> EARLY ACCESS
            </span>
            <span className="bg-white/90 text-navy-900 text-[10px] font-bold px-2 py-1 rounded-full">{listing.tag}</span>
          </div>

          <div className="absolute top-3 right-3">
            <CountdownBadge label={label} expired={expired} urgent={urgent}/>
          </div>

          <div className="absolute bottom-3 left-3">
            <div className="text-white text-xl font-extrabold">{listing.price}</div>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <I.Eye size={11}/> {count} intéressés
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-2xl">
            <I.Zap size={14} className="text-orange-600 shrink-0"/>
            <span className="text-[12px] font-semibold text-orange-700">
              Vous voyez cette annonce avant <strong>{pct}%</strong> des utilisateurs
            </span>
          </div>

          <div className="font-semibold text-navy-900 mb-1 line-clamp-1">{listing.title}</div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 flex-wrap">
            {listing.loc && <span className="flex items-center gap-1"><I.MapPin size={11}/> {listing.loc}</span>}
            {listing.size > 0 && <span className="flex items-center gap-1"><I.Maximize size={11}/> {listing.size} m²</span>}
            {listing.rooms > 0 && <span className="flex items-center gap-1"><I.Bed size={11}/> {listing.rooms} pièces</span>}
          </div>

          <button
            onClick={handleInterest}
            disabled={interested || saving}
            data-testid="interest-btn"
            className={`relative z-20 w-full h-10 rounded-2xl text-sm font-semibold transition ${
              interested
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-navy-900 hover:bg-navy-700 text-white'
            }`}>
            {interested ? <><I.Check size={14} className="inline mr-1"/>Intérêt enregistré</> : 'Je suis intéressé(e)'}
          </button>
        </div>
      </div>

      {!isPremium && <PremiumLock onUpgrade={onUpgrade}/>}
    </motion.div>
  )
}

/* ── Priority alerts section ── */
function PriorityAlerts({ isPremium, user, profile }) {
  const [smsOn, setSmsOn] = useState(false)
  const [waOn, setWaOn]   = useState(false)

  useEffect(() => {
    if (profile?.alerts_sms !== undefined)      setSmsOn(!!profile.alerts_sms)
    if (profile?.alerts_whatsapp !== undefined) setWaOn(!!profile.alerts_whatsapp)
  }, [profile])

  const toggle = async (channel) => {
    const isSms = channel === 'sms'
    const next = isSms ? !smsOn : !waOn
    if (isSms) setSmsOn(next); else setWaOn(next)
    if (!user) return
    try {
      await updateAlertChannel(user.id, isSms ? 'alerts_sms' : 'alerts_whatsapp', next)
    } catch (err) {
      console.warn('[alerts] update failed:', err?.message)
    }
  }

  return (
    <section className="py-20 bg-[#0B1F3A]">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"/>Alertes prioritaires
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Soyez le premier averti</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Les abonnés Premium reçoivent les alertes instantanément — avant que l'annonce soit visible publiquement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: I.Bell,  label: 'Notification push',  desc: 'Instantanée, dès la mise en ligne',    active: true,  delay: '0s'   },
            { icon: I.Mail,  label: 'E-mail prioritaire', desc: 'Résumé complet avec photos et prix',   active: true,  delay: '30s'  },
            { icon: Sms,     label: 'SMS / WhatsApp',     desc: 'Pour ne jamais rater une opportunité', active: false, delay: 'Bêta' },
          ].map(({ icon: Icon, label, desc, active, delay }) => (
            <div key={label} className={`rounded-2xl p-5 border ${active ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <Icon size={18} className="text-orange-400"/>
                </div>
                {active
                  ? <Badge tone="emerald">Actif</Badge>
                  : <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{delay}</span>
                }
              </div>
              <div className="text-white font-semibold text-sm mb-1">{label}</div>
              <div className="text-white/50 text-xs">{desc}</div>
            </div>
          ))}
        </div>

        {isPremium && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-white font-semibold mb-0.5">SMS & WhatsApp (bêta)</div>
              <div className="text-white/50 text-sm">Activez les alertes SMS pour vos recherches critiques</div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => toggle('sms')}
                role="switch"
                aria-checked={smsOn}
                aria-label="Activer les alertes SMS"
                data-testid="toggle-sms"
                className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`w-11 h-6 rounded-full transition-colors ${smsOn ? 'bg-orange-600' : 'bg-white/20'} relative`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${smsOn ? 'left-6' : 'left-1'}`}/>
                </span>
                SMS
              </button>
              <button
                onClick={() => toggle('wa')}
                role="switch"
                aria-checked={waOn}
                aria-label="Activer les alertes WhatsApp"
                data-testid="toggle-wa"
                className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`w-11 h-6 rounded-full transition-colors ${waOn ? 'bg-emerald-600' : 'bg-white/20'} relative`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${waOn ? 'left-6' : 'left-1'}`}/>
                </span>
                WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Seller advantage section ── */
function SellerAdvantage() {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
              <I.Star size={12} fill="currentColor"/> Pour les vendeurs
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 mb-4">Premium First Exposure</h2>
            <p className="text-slate-600 mb-6">Donnez à votre bien une exposition exclusive aux acheteurs les plus qualifiés de la plateforme — avant la mise en ligne publique.</p>
            <ul className="space-y-3 mb-8">
              {[
                { icon: I.TrendingUp,  text: '4× plus de leads qualifiés en moyenne' },
                { icon: I.Users,       text: 'Acheteurs pré-sélectionnés avec budget vérifié' },
                { icon: I.Shield,      text: 'Transactions plus rapides, moins de négociations' },
                { icon: I.Zap,         text: 'Exposition 15-30 min avant le grand public' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-navy-900">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Icon size={14}/>
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
            <div className="mb-6">
              <div className="font-bold text-navy-900">Premium First Exposure</div>
              <div className="text-slate-500 text-sm">Activez cette option depuis vos annonces</div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Durée d\'exposition exclusive', value: '15-30 min' },
                { label: 'Audience premium ciblée',       value: 'Utilisateurs Premium' },
                { label: 'Taux d\'intérêt moyen',         value: '+340% (estimation)' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-sm font-bold text-orange-600">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/pro')}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-2xl transition shadow-soft">
              Gérer mes annonces
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Main page ── */
export default function EarlyAccessPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [filter, setFilter] = useState('all')
  const [demoOverride, setDemoOverride] = useState(false)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ activeListings: 0, premiumUsers: 0, txnMonth: 0 })
  const [interestSet, setInterestSet] = useState(new Set())
  const [interestCounts, setInterestCounts] = useState({})

  /* Sync statut Premium réel */
  useEffect(() => {
    if (!user) { setIsPremium(false); return }
    if (profile?.premium_alerts) { setIsPremium(true); return }
    getSubscriptionStatus(user.id)
      .then(sub => { if (sub) setIsPremium(true) })
      .catch(() => {})
  }, [user, profile])

  /* Fetch listings + stats */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchEarlyAccessListings(), fetchEarlyAccessStats()])
      .then(async ([items, s]) => {
        if (cancelled) return
        setListings(items)
        setStats(s)
        if (items.length) {
          try {
            const counts = await fetchInterestCounts(items.map(l => l.id))
            if (!cancelled) setInterestCounts(counts)
          } catch (err) { console.warn('[stats] interests failed:', err?.message) }
        }
      })
      .catch(err => { if (!cancelled) setError(err?.message || 'Erreur de chargement.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  /* Fetch user's interests once logged in */
  useEffect(() => {
    if (!user) { setInterestSet(new Set()); return }
    fetchUserInterests(user.id)
      .then(setInterestSet)
      .catch(err => console.warn('[interests] user fetch failed:', err?.message))
  }, [user])

  const effectivePremium = isPremium || demoOverride

  const handleUpgrade = useCallback(async () => {
    if (!user) {
      navigate('/auth/login', { state: { redirect: '/early-access' } })
      return
    }
    try {
      await startPremiumAlertsCheckout()
    } catch (err) {
      console.warn('[early-access] checkout error:', err?.message)
      navigate('/tarifs')
    }
  }, [user, navigate])

  const filters = [
    { key: 'all',    label: 'Toutes' },
    { key: 'apt',    label: 'Appartements' },
    { key: 'house',  label: 'Maisons' },
    { key: 'invest', label: 'Investissement' },
  ]

  const filteredListings = useMemo(
    () => filter === 'all' ? listings : listings.filter(l => l.category === filter),
    [filter, listings]
  )
  const totalFiltered = filteredListings.length
  const totalAll = listings.length

  return (
    <div className="min-h-screen bg-white">
      <SeoHead
        title="Accès anticipé Premium — Voyez les annonces en premier"
        description="Les abonnés Premium SHOPCA accèdent aux nouvelles annonces 15 à 30 minutes avant tout le monde. Alertes instantanées, biens exclusifs, sans engagement."
        canonical="/early-access"
        keywords="accès anticipé, premium, alertes immobilières, annonces exclusives, SHOPCA"
      />

      {/* Topbar */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-navy-900/95 backdrop-blur-xl border-b border-white/10 flex items-center px-4 sm:px-6 justify-between">
        <Link to="/" aria-label="Retour à l'accueil"><BrandLogo dark compact/></Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isPremium && (
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs text-white/70">
              <span>Aperçu :</span>
              <button
                onClick={() => setDemoOverride(v => !v)}
                role="switch"
                aria-checked={demoOverride}
                aria-label="Aperçu Premium (démo)"
                data-testid="demo-toggle"
                className={`font-bold transition ${demoOverride ? 'text-orange-400' : 'text-white/50'}`}>
                {demoOverride ? '⚡ Premium' : '🔒 Gratuit'}
              </button>
            </div>
          )}
          <Link to="/" className="text-white/70 hover:text-white text-sm transition" data-testid="topbar-back">← Retour</Link>
          {!effectivePremium && (
            <button
              onClick={handleUpgrade}
              data-testid="topbar-upgrade"
              className="h-8 px-3 sm:px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-full transition whitespace-nowrap">
              Passer Premium
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-14 pb-16 sm:pb-20 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#162E52] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl"/>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 pt-12 sm:pt-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Crown size={12}/> Accès Anticipé Exclusif
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Voyez les meilleures<br/>
              <span className="text-orange-400">annonces en premier</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
              Les abonnés Premium accèdent aux nouvelles annonces <strong className="text-white">15 à 30 minutes avant tout le monde</strong>. Dans un marché où les meilleurs biens partent en quelques heures, chaque minute compte.
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-sm text-white/60 mb-10">
              <span className="flex items-center gap-2"><Clock size={14} className="text-orange-400"/> Accès 15-30 min en avance</span>
              <span className="flex items-center gap-2"><I.Bell size={14} className="text-orange-400"/> Alertes instantanées</span>
              <span className="flex items-center gap-2"><Crown size={14} className="text-orange-400"/> Communauté Premium active</span>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap" data-testid="hero-stats">
              {[
                { label: 'Annonces disponibles', value: stats.activeListings, color: 'text-orange-400' },
                { label: 'Utilisateurs Premium', value: stats.premiumUsers,   color: 'text-emerald-400' },
                { label: 'Souscriptions ce mois', value: stats.txnMonth,      color: 'text-indigo-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-4 sm:px-5 py-3 text-center min-w-[110px]">
                  <div className={`text-xl sm:text-2xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-white/50 text-[11px] sm:text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Status bar */}
      {effectivePremium ? (
        <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-3 px-4 flex items-center justify-center gap-2">
          <I.CheckCircle size={16}/>
          {isPremium ? 'Vous êtes Premium — accès à toutes les annonces en avant-première' : 'Aperçu Premium activé (démo)'}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleUpgrade}
          data-testid="status-bar-upgrade"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold text-center py-3 px-4 flex items-center justify-center gap-2 transition">
          <Crown size={16}/>
          <span>Passez Premium pour voir ces annonces — <span className="underline">{PREMIUM_PRICE_LABEL}, sans engagement</span></span>
        </button>
      )}

      {/* Listings */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-start sm:items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy-900">Annonces en avant-première</h2>
              <p className="text-slate-500 text-sm mt-1">
                {loading
                  ? 'Chargement…'
                  : effectivePremium
                    ? `${totalFiltered} annonce${totalFiltered > 1 ? 's' : ''} disponible${totalFiltered > 1 ? 's' : ''} · mis à jour en temps réel`
                    : `${totalFiltered} annonce${totalFiltered > 1 ? 's' : ''} masquée${totalFiltered > 1 ? 's' : ''} · passez Premium pour y accéder`
                }
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filtres de catégories">
              {filters.map(f => (
                <button key={f.key}
                  onClick={() => setFilter(f.key)}
                  role="tab"
                  aria-selected={filter === f.key}
                  data-testid={`filter-${f.key}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    filter === f.key ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>{f.label}</button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="text-center py-16 text-red-600 bg-red-50 rounded-3xl border border-red-100">
              {error}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="rounded-3xl bg-white border border-slate-100 shadow-soft h-[420px] animate-pulse"/>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-100">
              Aucune annonce dans cette catégorie pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="listings-grid">
              <AnimatePresence mode="popLayout">
                {filteredListings.map((l, i) => (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: Math.min(i, 5) * 0.05 }}>
                    <EarlyCard
                      listing={l}
                      isPremium={effectivePremium}
                      onUpgrade={handleUpgrade}
                      user={user}
                      initialInterested={interestSet.has(String(l.id))}
                      initialInterestCount={interestCounts[String(l.id)] || 0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!effectivePremium && !loading && totalAll > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-12 rounded-3xl bg-gradient-to-br from-navy-900 to-[#162E52] p-6 sm:p-10 text-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-600/20 blur-3xl pointer-events-none"/>
              <div className="relative">
                <Crown size={32} className="text-orange-400 mx-auto mb-4"/>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Débloquez les {totalAll} annonces</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto text-sm sm:text-base">Accédez aux meilleures opportunités 15 à 30 minutes avant tout le monde. Sans engagement, résiliable à tout moment.</p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                  <button
                    onClick={handleUpgrade}
                    data-testid="unlock-cta"
                    className="h-12 px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-soft text-sm">
                    Commencer — {PREMIUM_PRICE_LABEL}
                  </button>
                  <span className="text-white/40 text-sm">ou <Link to="/tarifs" className="text-white/70 underline hover:text-white transition" data-testid="see-offers">voir les offres</Link></span>
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6 flex-wrap">
                  {['Sans engagement', 'Annulation libre', 'Paiement sécurisé Stripe'].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-white/50 text-xs">
                      <I.Check size={12} className="text-emerald-400"/> {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <PriorityAlerts isPremium={effectivePremium} user={user} profile={profile}/>
      <SellerAdvantage/>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <Crown size={36} className="text-orange-500 mx-auto mb-4"/>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-3">Prêt à prendre de l'avance ?</h2>
          <p className="text-slate-500 mb-8 text-sm sm:text-base">Rejoignez les acheteurs Premium qui trouvent leurs biens avant les autres.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => isPremium ? navigate('/mon-espace') : handleUpgrade()}
              data-testid="bottom-cta"
              className="h-12 px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-soft">
              {isPremium ? 'Gérer mon abonnement' : 'Passer Premium maintenant'}
            </button>
            <Link
              to="/annonces"
              data-testid="bottom-back"
              className="h-12 px-6 border border-slate-200 text-navy-900 font-semibold rounded-full hover:bg-slate-50 transition text-sm inline-flex items-center">
              Retour aux annonces
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
