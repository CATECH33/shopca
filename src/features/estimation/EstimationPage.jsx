import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'

/* ── Data ─────────────────────────────────────────────────────── */

const EST_PROPERTY_TYPES = [
  { id: 'appartement', label: 'Appartement', icon: I.Building },
  { id: 'maison',      label: 'Maison',       icon: I.Home    },
  { id: 'studio',      label: 'Studio',       icon: I.Building },
  { id: 'villa',       label: 'Villa',        icon: I.Home    },
]

const EST_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux',
  'Strasbourg', 'Lille', 'Rennes', 'Montpellier', 'Grenoble', 'Toulon',
  'Angers', 'Tours', 'Dijon', 'Reims', 'Brest', 'Saint-Étienne', 'Le Havre',
]

const BASE_M2_EST = {
  Paris: 10200, Lyon: 4800, Marseille: 3200, Bordeaux: 4500, Nice: 4700, Toulouse: 3700,
  Nantes: 3600, Strasbourg: 3300, Lille: 2900, Rennes: 3400, Montpellier: 3500,
  Grenoble: 2800, Toulon: 2800, Angers: 2700, Tours: 2700, Dijon: 2600,
  Reims: 2400, Brest: 2300, 'Saint-Étienne': 1900, 'Le Havre': 2100,
}

const EST_DPE_COLORS = {
  A: '#047857', B: '#10B981', C: '#84CC16', D: '#F59E0B',
  E: '#F97316', F: '#EF4444', G: '#991B1B',
}

const EST_ETATS = [
  { id: 'renove',  label: 'Rénové / Neuf',  desc: 'Travaux récents ou programme neuf', mult: 1.08 },
  { id: 'bon',     label: 'Bon état',        desc: 'Entretenu, habitable sans travaux',  mult: 1.0  },
  { id: 'travaux', label: 'À rénover',       desc: 'Rafraîchissement nécessaire',        mult: 0.85 },
]

const EST_STEPS = ['Type', 'Localisation', 'Caractéristiques', 'Atouts', 'Résultat']

/* ── Page ─────────────────────────────────────────────────────── */

export default function EstimationPage() {
  const navigate = useNavigate()

  const [step,        setStep]        = useState(0)
  const [propType,    setPropType]    = useState('')
  const [city,        setCity]        = useState('')
  const [cityInput,   setCityInput]   = useState('')
  const [showCList,   setShowCList]   = useState(false)
  const [surface,     setSurface]     = useState(60)
  const [rooms,       setRooms]       = useState(3)
  const [yearBuilt,   setYearBuilt]   = useState(1990)
  const [dpe,         setDpe]         = useState('C')
  const [hasParking,  setHasParking]  = useState(false)
  const [hasCellar,   setHasCellar]   = useState(false)
  const [hasBalcony,  setHasBalcony]  = useState(false)
  const [hasTerrace,  setHasTerrace]  = useState(false)
  const [hasElevator, setHasElevator] = useState(false)
  const [hasView,     setHasView]     = useState(false)
  const [etat,        setEtat]        = useState('bon')
  const [loading,     setLoading]     = useState(false)
  const [animPrice,   setAnimPrice]   = useState(0)

  /* ── Price estimation ── */
  const cityBase = BASE_M2_EST[city] || 3200
  let ppm = cityBase
  if (propType === 'studio') ppm *= 1.08
  if (propType === 'villa')  ppm *= 1.30
  if (propType === 'maison') ppm *= 0.92
  const DPE_ADJ = { A: 1.05, B: 1.03, C: 1.0, D: 0.97, E: 0.93, F: 0.87, G: 0.81 }
  ppm *= (DPE_ADJ[dpe] || 1.0)
  if (hasParking)  ppm += 90
  if (hasTerrace)  ppm += 140
  if (hasBalcony)  ppm += 70
  if (hasElevator) ppm += 40
  if (hasCellar)   ppm += 25
  if (hasView)     ppm += 180
  ppm *= (EST_ETATS.find(e => e.id === etat)?.mult || 1)
  const age = 2026 - yearBuilt
  if (age > 30) ppm *= 0.97
  if (age > 60) ppm *= 0.95
  const estMid  = Math.round(surface * ppm / 5000) * 5000
  const estMin  = Math.round(estMid * 0.87 / 5000) * 5000
  const estMax  = Math.round(estMid * 1.13 / 5000) * 5000
  const estPpm  = Math.round(ppm)
  const ppmDiff = Math.round((estPpm - cityBase) / cityBase * 100)
  const confidence = Math.min(95, 70 + (city ? 8 : 0) + (propType ? 5 : 0) + (yearBuilt > 1950 ? 5 : 0) + (dpe !== 'C' ? 4 : 0) + (etat !== 'bon' ? 3 : 0))
  const sellDays = etat === 'renove' ? 32 : etat === 'travaux' ? 87 : 55

  /* ── Animate price count-up ── */
  useEffect(() => {
    if (step !== 4) return
    setLoading(true)
    setAnimPrice(0)
    const timer = setTimeout(() => {
      setLoading(false)
      const end = estMid
      const t0 = performance.now()
      const dur = 1100
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        setAnimPrice(Math.round((1 - Math.pow(1 - p, 3)) * end))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 750)
    return () => clearTimeout(timer)
  }, [step])

  const filteredCities = cityInput.length > 0
    ? EST_CITIES.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase())).slice(0, 6)
    : EST_CITIES.slice(0, 6)

  const canNext = ([!!propType, !!city, surface >= 10, true][step]) ?? true

  const goNext = () => { setStep(s => Math.min(4, s + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goBack = () => { setStep(s => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <BrandLogo />
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-800 transition-colors">
            <I.ArrowLeft size={15} /> Retour
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy-900 via-[#0e1f3a] to-[#162E52] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
            <I.Sparkles size={12} /> Estimation gratuite
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Quelle est la valeur<br /><span className="text-orange-400">de votre bien ?</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base">
            Estimation personnalisée basée sur les données du marché et les caractéristiques de votre bien.
          </p>
        </div>
      </section>

      {/* ── Step progress (sticky) ── */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-1">
            {EST_STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-emerald-500 text-white'
                    : i === step ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                    : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? <I.Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-orange-600' : 'text-slate-400'}`}>{label}</span>
                </div>
                {i < EST_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full mb-3" style={{ background: i < step ? '#10B981' : '#E2E8F0' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* Step 0 — Type de bien */}
          {step === 0 && (
            <motion.div key="est0" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}>
              <h2 className="text-xl font-extrabold text-navy-900 mb-1">Type de bien</h2>
              <p className="text-slate-500 text-sm mb-6">Sélectionnez le type de votre propriété.</p>
              <div className="grid grid-cols-2 gap-4">
                {EST_PROPERTY_TYPES.map(pt => {
                  const Ic = pt.icon
                  const active = propType === pt.id
                  return (
                    <button key={pt.id} onClick={() => setPropType(pt.id)}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:-translate-y-0.5 ${active ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Ic size={24} />
                      </div>
                      <span className={`font-semibold text-sm ${active ? 'text-orange-600' : 'text-navy-900'}`}>{pt.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 1 — Localisation */}
          {step === 1 && (
            <motion.div key="est1" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}>
              <h2 className="text-xl font-extrabold text-navy-900 mb-1">Localisation</h2>
              <p className="text-slate-500 text-sm mb-6">Dans quelle ville se situe votre bien ?</p>
              <div className="relative mb-3">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><I.MapPin size={16} /></div>
                <input type="text" placeholder="Tapez une ville…" value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setCity(''); setShowCList(true) }}
                  onFocus={() => setShowCList(true)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-orange-400 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-medium outline-none transition-colors" />
                {city && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><I.Check size={16} /></div>}
              </div>
              {showCList && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden mb-4">
                  {filteredCities.length > 0 ? filteredCities.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCityInput(c); setShowCList(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 text-left transition-colors ${c === city ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-navy-900'}`}>
                      <I.MapPin size={13} className="text-slate-400 shrink-0" />
                      {c}
                      {BASE_M2_EST[c] && <span className="ml-auto text-xs text-slate-400">{BASE_M2_EST[c].toLocaleString('fr-FR')} €/m²</span>}
                    </button>
                  )) : <div className="px-4 py-4 text-sm text-slate-400 text-center">Aucune ville trouvée</div>}
                </div>
              )}
              {city && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <I.MapPin size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-800">{city}</div>
                    <div className="text-xs text-emerald-600">Prix moyen : {(BASE_M2_EST[city] || 3200).toLocaleString('fr-FR')} €/m²</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Caractéristiques */}
          {step === 2 && (
            <motion.div key="est2" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-1">Caractéristiques</h2>
                <p className="text-slate-500 text-sm">Renseignez les détails de votre bien.</p>
              </div>
              {/* Surface */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy-900 text-sm">Surface habitable</span>
                  <span className="text-2xl font-extrabold text-orange-500">{surface} <span className="text-base font-normal text-slate-400">m²</span></span>
                </div>
                <input type="range" min={10} max={400} step={5} value={surface}
                  onChange={e => setSurface(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-orange-500 cursor-pointer" />
                <div className="flex justify-between mt-2 text-xs text-slate-300"><span>10 m²</span><span>200 m²</span><span>400 m²</span></div>
              </div>
              {/* Rooms */}
              <div className="bg-white rounded-2xl p-5 shadow-soft flex items-center justify-between">
                <span className="font-semibold text-navy-900 text-sm">Nombre de pièces</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRooms(r => Math.max(1, r - 1))}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors text-lg font-bold leading-none">−</button>
                  <span className="text-xl font-extrabold text-navy-900 w-8 text-center">{rooms}</span>
                  <button onClick={() => setRooms(r => Math.min(12, r + 1))}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors text-lg font-bold leading-none">+</button>
                </div>
              </div>
              {/* Year built */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy-900 text-sm">Année de construction</span>
                  <span className="text-2xl font-extrabold text-navy-900">{yearBuilt}</span>
                </div>
                <input type="range" min={1880} max={2024} step={1} value={yearBuilt}
                  onChange={e => setYearBuilt(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-indigo-500 cursor-pointer" />
                <div className="flex justify-between mt-2 text-xs text-slate-300"><span>1880</span><span>1950</span><span>2000</span><span>2024</span></div>
              </div>
              {/* DPE */}
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-3">Classe DPE</div>
                <div className="flex gap-2 flex-wrap">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(d => (
                    <button key={d} onClick={() => setDpe(d)}
                      className={`w-11 h-11 rounded-xl font-extrabold text-sm border-2 transition-all ${dpe === d ? 'text-white border-transparent scale-110 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:scale-105'}`}
                      style={{ background: dpe === d ? EST_DPE_COLORS[d] : undefined }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Atouts */}
          {step === 3 && (
            <motion.div key="est3" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-navy-900 mb-1">Atouts du bien</h2>
                <p className="text-slate-500 text-sm">Sélectionnez les équipements et précisez l'état général.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-4">Équipements et prestations</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'parking',  label: 'Parking',   state: hasParking,  set: setHasParking  },
                    { key: 'balcony',  label: 'Balcon',    state: hasBalcony,  set: setHasBalcony  },
                    { key: 'terrace',  label: 'Terrasse',  state: hasTerrace,  set: setHasTerrace  },
                    { key: 'cellar',   label: 'Cave',      state: hasCellar,   set: setHasCellar   },
                    { key: 'elevator', label: 'Ascenseur', state: hasElevator, set: setHasElevator },
                    { key: 'view',     label: 'Belle vue', state: hasView,     set: setHasView     },
                  ].map(f => (
                    <button key={f.key} onClick={() => f.set(v => !v)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${f.state ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${f.state ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                        {f.state && <I.Check size={11} className="text-white" />}
                      </div>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="font-semibold text-navy-900 text-sm mb-4">État général du bien</div>
                <div className="space-y-2.5">
                  {EST_ETATS.map(e => (
                    <button key={e.id} onClick={() => setEtat(e.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${etat === e.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${etat === e.id ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                        {etat === e.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${etat === e.id ? 'text-orange-700' : 'text-navy-900'}`}>{e.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.desc}</div>
                      </div>
                      <div className="ml-auto text-xs font-bold shrink-0" style={{ color: e.mult >= 1 ? '#10B981' : '#EF4444' }}>
                        {e.mult >= 1 ? `+${Math.round((e.mult - 1) * 100)}%` : `${Math.round((e.mult - 1) * 100)}%`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Résultat */}
          {step === 4 && (
            <motion.div key="est4" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <I.Loader size={32} className="text-orange-500" />
                  </div>
                  <div className="text-navy-900 font-semibold">Analyse en cours…</div>
                  <div className="text-slate-400 text-sm">Données marché · DPE · Prestations</div>
                </div>
              ) : (
                <>
                  {/* Main price card */}
                  <div className="bg-gradient-to-br from-navy-900 to-[#162E52] rounded-2xl p-7 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-52 h-52 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                    <div className="text-white/60 text-sm mb-2">Valeur estimée</div>
                    <div className="text-5xl font-extrabold tracking-tight mb-1" style={{ color: '#FB923C' }}>
                      {animPrice.toLocaleString('fr-FR')} <span className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>€</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-5">
                      <div className="text-center">
                        <div className="text-white/40 text-xs">Fourchette basse</div>
                        <div className="text-white/80 font-bold text-sm mt-0.5">{estMin.toLocaleString('fr-FR')} €</div>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-white/40 text-xs">Fourchette haute</div>
                        <div className="text-white/80 font-bold text-sm mt-0.5">{estMax.toLocaleString('fr-FR')} €</div>
                      </div>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Prix/m²',     value: `${estPpm.toLocaleString('fr-FR')} €`, sub: ppmDiff > 0 ? `+${ppmDiff}% moy.` : `${ppmDiff}% moy.`, color: ppmDiff >= 0 ? '#10B981' : '#EF4444' },
                      { label: 'Fiabilité',   value: `${confidence}%`, sub: 'confiance', color: confidence >= 85 ? '#10B981' : '#F97316' },
                      { label: 'Délai vente', value: `${sellDays}j`,   sub: 'estimé',    color: '#6366F1' },
                    ].map(m => (
                      <div key={m.label} className="bg-white rounded-2xl p-4 text-center shadow-soft">
                        <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                        <div className="font-extrabold text-lg" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Market comparison */}
                  {city && (
                    <div className="bg-white rounded-2xl p-5 shadow-soft">
                      <div className="font-semibold text-navy-900 text-sm mb-4">Comparaison marché — {city}</div>
                      {[
                        { label: 'Votre bien',    value: estPpm,   color: '#F97316' },
                        { label: `Moy. ${city}`,  value: cityBase, color: '#6366F1' },
                      ].map(bar => {
                        const max = Math.max(estPpm, cityBase) * 1.15
                        return (
                          <div key={bar.label} className="mb-3 last:mb-0">
                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                              <span>{bar.label}</span>
                              <span className="font-bold">{bar.value.toLocaleString('fr-FR')} €/m²</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                initial={{ width: 0 }} animate={{ width: `${(bar.value / max) * 100}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                                style={{ background: bar.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Confidence gauge */}
                  <div className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-navy-900 text-sm">Indice de fiabilité</span>
                      <span className="text-lg font-extrabold" style={{ color: confidence >= 85 ? '#10B981' : '#F97316' }}>{confidence}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${confidence}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                        style={{ background: confidence >= 85 ? '#10B981' : '#F97316' }} />
                    </div>
                    <p className="text-xs text-slate-400">Basé sur {city ? `les données de ${city}` : 'les données nationales'}, les caractéristiques saisies et les tendances du marché.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="font-semibold text-navy-900 text-sm mb-3">Récapitulatif</div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {[
                        ['Type',     EST_PROPERTY_TYPES.find(pt => pt.id === propType)?.label || '—'],
                        ['Ville',    city || '—'],
                        ['Surface',  `${surface} m²`],
                        ['Pièces',   rooms],
                        ['Construit', yearBuilt],
                        ['DPE',      dpe],
                        ['État',     EST_ETATS.find(e => e.id === etat)?.label || '—'],
                        ['Atouts',   [hasParking && 'Parking', hasBalcony && 'Balcon', hasTerrace && 'Terrasse', hasCellar && 'Cave', hasElevator && 'Ascenseur', hasView && 'Vue'].filter(Boolean).join(', ') || 'Aucun'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs text-slate-400">{k}</div>
                          <div className="text-sm font-semibold text-navy-900 truncate">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3 pt-1">
                    <button onClick={() => navigate('/annonces')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm">
                      <I.Plus size={16} /> Voir les annonces SHOPCA
                    </button>
                    <button onClick={() => navigate('/simulateur')}
                      className="w-full bg-white border-2 border-slate-200 hover:border-orange-300 text-navy-900 font-semibold py-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
                      <I.CreditCard size={15} /> Simuler mon financement
                    </button>
                    <button onClick={() => navigate('/')}
                      className="w-full bg-white border-2 border-slate-200 hover:border-orange-300 text-navy-900 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                      Retour à l'accueil
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-400 leading-relaxed">
                    Estimation indicative non contractuelle. Basée sur les données de marché disponibles et les informations saisies.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 4 && (
          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors">
                <I.ChevronLeft size={16} /> Retour
              </button>
            )}
            <button onClick={goNext} disabled={!canNext}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${canNext ? 'bg-orange-600 hover:bg-orange-700 text-white hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              {step === 3 ? 'Voir mon estimation' : 'Continuer'} <I.ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
