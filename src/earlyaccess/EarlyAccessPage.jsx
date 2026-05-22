import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I, Badge } from '../lib/ui.jsx'

/* ── Inline icons ── */
const Crown  = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
const Clock  = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const Unlock = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
const Sms    = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.07 3.4A2 2 0 0 1 3.07 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.22 17z"/></svg>
const Toggle = (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p?.className}><rect width="20" height="12" x="2" y="6" rx="6"/><circle cx={p?.on ? 15 : 9} cy="12" r="3" fill="currentColor"/></svg>

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

/* ── Mock listings ── */
const NOW = Date.now()
const LISTINGS = [
  { id: 1, title: 'T3 Paris 11e — 74 m²',         price: '680 000 €', priceRaw: 680000, size: 74,  rooms: 3, loc: 'Paris 11e',         pct: 94, endsAt: NOW + 18*60*1000,  img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=70', tag: 'Coup de cœur', interest: 7 },
  { id: 2, title: 'Villa Nice Cimiez — 220 m²',    price: '1 890 000 €', priceRaw: 1890000, size: 220, rooms: 7, loc: 'Nice',           pct: 98, endsAt: NOW + 7*60*1000,   img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=70', tag: 'Rare',        interest: 23 },
  { id: 3, title: 'Loft Bordeaux Darwin — 95 m²',  price: '498 000 €', priceRaw: 498000, size: 95,  rooms: 3, loc: 'Bordeaux',          pct: 91, endsAt: NOW + 26*60*1000,  img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=70', tag: 'Atypique',   interest: 4  },
  { id: 4, title: 'T4 Lyon Presqu\'île — 102 m²',  price: '860 000 €', priceRaw: 860000, size: 102, rooms: 4, loc: 'Lyon 2e',           pct: 96, endsAt: NOW + 12*60*1000,  img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=70', tag: 'Prestige',   interest: 11 },
  { id: 5, title: 'Studio investissement Nantes',   price: '165 000 €', priceRaw: 165000, size: 26,  rooms: 1, loc: 'Nantes',            pct: 89, endsAt: NOW + 29*60*1000,  img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=70', tag: 'Rentabilité', interest: 3 },
  { id: 6, title: 'Maison Montpellier — 145 m²',   price: '595 000 €', priceRaw: 595000, size: 145, rooms: 5, loc: 'Montpellier',        pct: 92, endsAt: NOW + 21*60*1000,  img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=70', tag: 'Jardin',     interest: 9  },
]

/* ── Countdown badge ── */
function CountdownBadge({ endsAt, urgent }) {
  const { label, expired } = useCountdown(endsAt)
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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy-900 flex items-center justify-center mb-3 shadow-cardHover">
        <Crown size={22} className="text-orange-400"/>
      </div>
      <div className="text-navy-900 font-extrabold text-base mb-1">Accès Premium requis</div>
      <div className="text-slate-600 text-sm mb-4 max-w-[200px]">Voyez cette annonce avant les autres utilisateurs</div>
      <button onClick={onUpgrade}
        className="h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition shadow-soft">
        Passer Premium — 29€/mois
      </button>
    </div>
  )
}

/* ── Listing card ── */
function EarlyCard({ listing, isPremium, onUpgrade }) {
  const { endsAt, pct, interest } = listing
  const { mins } = useCountdown(endsAt)
  const urgent = mins < 10
  const [interested, setInterested] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-soft bg-white group"
    >
      {/* Blurred content for non-premium */}
      <div className={!isPremium ? 'blur-sm pointer-events-none select-none' : ''}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent"/>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-navy-900/90 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Crown size={10}/> EARLY ACCESS
            </span>
            <span className="bg-white/90 text-navy-900 text-[10px] font-bold px-2 py-1 rounded-full">{listing.tag}</span>
          </div>

          {/* Countdown */}
          <div className="absolute top-3 right-3">
            <CountdownBadge endsAt={endsAt} urgent={urgent}/>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <div className="text-white text-xl font-extrabold">{listing.price}</div>
          </div>

          {/* Interest count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <I.Eye size={11}/> {interest + (interested ? 1 : 0)} intéressés
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Advantage bar */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-2xl">
            <I.Zap size={14} className="text-orange-600 shrink-0"/>
            <span className="text-[12px] font-semibold text-orange-700">
              Vous voyez cette annonce avant <strong>{pct}%</strong> des utilisateurs
            </span>
          </div>

          <div className="font-semibold text-navy-900 mb-1">{listing.title}</div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><I.MapPin size={11}/> {listing.loc}</span>
            <span className="flex items-center gap-1"><I.Maximize size={11}/> {listing.size} m²</span>
            <span className="flex items-center gap-1"><I.Bed size={11}/> {listing.rooms} pièces</span>
          </div>

          <button
            onClick={() => setInterested(true)}
            className={`w-full h-10 rounded-2xl text-sm font-semibold transition ${
              interested
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-navy-900 hover:bg-navy-700 text-white'
            }`}>
            {interested ? <><I.Check size={14} className="inline mr-1"/>Intérêt enregistré</> : 'Je suis intéressé(e)'}
          </button>
        </div>
      </div>

      {/* Lock overlay */}
      {!isPremium && <PremiumLock onUpgrade={onUpgrade}/>}
    </motion.div>
  )
}

/* ── Priority alerts section ── */
function PriorityAlerts({ isPremium }) {
  const [smsOn, setSmsOn] = useState(false)
  const [waOn, setWaOn]   = useState(false)

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
            { icon: I.Bell,          label: 'Notification push',  desc: 'Instantanée, dès la mise en ligne', active: true,   delay: '0s'   },
            { icon: I.Mail,          label: 'E-mail prioritaire', desc: 'Résumé complet avec photos et prix', active: true,   delay: '30s'  },
            { icon: Sms,             label: 'SMS / WhatsApp',     desc: 'Pour ne jamais rater une opportunité', active: false, delay: 'Bientôt' },
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
              <button onClick={() => setSmsOn(s => !s)} className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`w-11 h-6 rounded-full transition-colors ${smsOn ? 'bg-orange-600' : 'bg-white/20'} relative`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${smsOn ? 'left-6' : 'left-1'}`}/>
                </span>
                SMS
              </button>
              <button onClick={() => setWaOn(s => !s)} className="flex items-center gap-2 text-sm font-semibold text-white">
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
  const [enabled, setEnabled] = useState(false)

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
              <I.Star size={12} fill="currentColor"/> Pour les vendeurs
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 mb-4">Premium First Exposure</h2>
            <p className="text-slate-600 mb-6">Donnez à votre bien une exposition exclusive aux acheteurs les plus qualifiés de la plateforme — avant la mise en ligne publique. Résultat : des contacts de meilleure qualité et moins de visites inutiles.</p>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-bold text-navy-900">Premium First Exposure</div>
                <div className="text-slate-500 text-sm">Pour cette annonce</div>
              </div>
              <button onClick={() => setEnabled(e => !e)}
                className={`w-14 h-7 rounded-full transition-colors relative ${enabled ? 'bg-orange-600' : 'bg-slate-200'}`}>
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? 'left-8' : 'left-1'}`}/>
              </button>
            </div>

            <AnimatePresence>
              {enabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="space-y-3 mb-5">
                    {[
                      { label: 'Durée d\'exposition exclusive', value: '15-30 min' },
                      { label: 'Audience premium ciblée', value: '~2 400 utilisateurs' },
                      { label: 'Taux d\'intérêt moyen', value: '+340%' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <span className="text-sm text-slate-600">{label}</span>
                        <span className="text-sm font-bold text-orange-600">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl">
                    <I.CheckCircle size={14} className="shrink-0"/>
                    Exposition Premium First activée pour cette annonce
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!enabled && (
              <div className="text-center py-6 text-slate-400 text-sm">
                Activez pour exposer votre bien aux acheteurs Premium en priorité.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Main page ── */
export default function EarlyAccessPage() {
  const navigate = useNavigate()
  const [isPremium, setIsPremium] = useState(false)
  const [filter, setFilter] = useState('all')

  const filters = [
    { key: 'all',       label: 'Toutes' },
    { key: 'apt',       label: 'Appartements' },
    { key: 'house',     label: 'Maisons' },
    { key: 'invest',    label: 'Investissement' },
  ]

  const total   = LISTINGS.length
  const unlockedCount = isPremium ? total : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <div className="fixed top-0 inset-x-0 z-50 h-14 bg-navy-900/95 backdrop-blur-xl border-b border-white/10 flex items-center px-6 justify-between">
        <Link to="/"><BrandLogo dark compact/></Link>
        <div className="flex items-center gap-3">
          {/* Demo toggle */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs text-white/70">
            <span>Démo :</span>
            <button onClick={() => setIsPremium(p => !p)} className={`font-bold transition ${isPremium ? 'text-orange-400' : 'text-white/50'}`}>
              {isPremium ? '⚡ Premium' : '🔒 Gratuit'}
            </button>
          </div>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition">← Retour</Link>
          {!isPremium && (
            <button onClick={() => setIsPremium(true)}
              className="h-8 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-full transition">
              Passer Premium
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-14 pb-20 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#162E52] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl"/>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 pt-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Crown size={12}/> Accès Anticipé Exclusif
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Voyez les meilleures<br/>
              <span className="text-orange-400">annonces en premier</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              Les abonnés Premium accèdent aux nouvelles annonces <strong className="text-white">15 à 30 minutes avant tout le monde</strong>. Dans un marché où les meilleurs biens partent en quelques heures, chaque minute compte.
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-white/60 mb-10">
              <span className="flex items-center gap-2"><Clock size={14} className="text-orange-400"/> Accès 15-30 min en avance</span>
              <span className="flex items-center gap-2"><I.Bell size={14} className="text-orange-400"/> Alertes instantanées</span>
              <span className="flex items-center gap-2"><Crown size={14} className="text-orange-400"/> Visible par {total} acheteurs Premium</span>
            </div>

            {/* Live stats */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { label: 'Annonces disponibles', value: total, color: 'text-orange-400' },
                { label: 'Utilisateurs connectés', value: 2847, color: 'text-emerald-400' },
                { label: 'Transactions aujourd\'hui', value: 12, color: 'text-indigo-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-5 py-3 text-center">
                  <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Status bar */}
      {isPremium ? (
        <div className="bg-emerald-600 text-white text-sm font-semibold text-center py-3 flex items-center justify-center gap-2">
          <I.CheckCircle size={16}/> Vous êtes Premium — vous accédez à toutes les annonces en avant-première
        </div>
      ) : (
        <div className="bg-orange-600 text-white text-sm font-semibold text-center py-3 flex items-center justify-center gap-2 cursor-pointer" onClick={() => setIsPremium(true)}>
          <Crown size={16}/> Passez Premium pour voir ces annonces — <span className="underline">29€/mois, sans engagement</span>
        </div>
      )}

      {/* Listings */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy-900">Annonces en avant-première</h2>
              <p className="text-slate-500 text-sm mt-1">
                {isPremium
                  ? `${total} annonces disponibles · mis à jour en temps réel`
                  : `${total} annonces masquées · passez Premium pour y accéder`
                }
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {filters.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    filter === f.key ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LISTINGS.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <EarlyCard listing={l} isPremium={isPremium} onUpgrade={() => setIsPremium(true)}/>
              </motion.div>
            ))}
          </div>

          {!isPremium && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-12 rounded-3xl bg-gradient-to-br from-navy-900 to-[#162E52] p-10 text-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-600/20 blur-3xl"/>
              <div className="relative">
                <Crown size={32} className="text-orange-400 mx-auto mb-4"/>
                <h3 className="text-2xl font-extrabold text-white mb-2">Débloquez les {total} annonces</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">Accédez aux meilleures opportunités 15 à 30 minutes avant tout le monde. Sans engagement, résiliable à tout moment.</p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button onClick={() => setIsPremium(true)}
                    className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-soft text-sm">
                    Commencer — 29€/mois
                  </button>
                  <span className="text-white/40 text-sm">ou <button className="text-white/70 underline">voir les offres</button></span>
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
                  {['Sans engagement', 'Annulation libre', '7j d\'essai gratuit'].map(t => (
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

      <PriorityAlerts isPremium={isPremium}/>
      <SellerAdvantage/>

      {/* Bottom CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <Crown size={36} className="text-orange-500 mx-auto mb-4"/>
          <h2 className="text-3xl font-extrabold text-navy-900 mb-3">Prêt à prendre de l'avance ?</h2>
          <p className="text-slate-500 mb-8">Rejoignez les 2 400+ acheteurs Premium qui trouvent leurs biens avant les autres.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/dashboard/subscription')}
              className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-soft">
              Passer Premium maintenant
            </button>
            <Link to="/" className="h-12 px-6 border border-slate-200 text-navy-900 font-semibold rounded-full hover:bg-slate-50 transition text-sm inline-flex items-center">
              Retour aux annonces
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
