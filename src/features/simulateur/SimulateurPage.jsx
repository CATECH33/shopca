import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'

/* ── Data ─────────────────────────────────────────────────────── */

const SIMUL_PRESETS = [
  { label: 'Studio Paris',    prix: 280000, apport: 40000 },
  { label: 'T3 Lyon',         prix: 350000, apport: 60000 },
  { label: 'Maison Bordeaux', prix: 480000, apport: 80000 },
  { label: 'Investissement',  prix: 200000, apport: 30000 },
]

/* ── Sub-components ───────────────────────────────────────────── */

function SliderField({ label, value, onChange, min, max, step, fmt: format }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-navy-700">{label}</span>
        <span className="text-sm font-bold text-orange-600">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500" />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function SimulateurPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState('mensualite')
  const [prix, setPrix] = useState(350000)
  const [apport, setApport] = useState(60000)
  const [taux, setTaux] = useState(3.52)
  const [duree, setDuree] = useState(20)
  const [typeLogement, setTypeLogement] = useState('ancien')
  const [revenus, setRevenus] = useState(5000)
  const [tauxEndt, setTauxEndt] = useState(35)

  const fmt = (n) => Math.round(n).toLocaleString('fr-FR')

  const emprunt = Math.max(0, prix - apport)
  const tauxMensuel = taux / 100 / 12
  const nbMois = duree * 12
  const mensualite = tauxMensuel > 0
    ? Math.round(emprunt * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nbMois)))
    : Math.round(emprunt / nbMois)
  const coutTotal = mensualite * nbMois
  const interetsTotal = coutTotal - emprunt
  const fraisNotaire = Math.round(prix * (typeLogement === 'neuf' ? 0.025 : 0.075))
  const assuranceMensuelle = Math.round(emprunt * 0.0035 / 12)

  const amoByYear = []
  let capitalRestant = emprunt
  for (let yr = 1; yr <= Math.min(duree, 30); yr++) {
    let capAnnuel = 0, intAnnuel = 0
    for (let m = 0; m < 12 && capitalRestant > 0; m++) {
      const intMois = capitalRestant * tauxMensuel
      const capMois = Math.min(mensualite - intMois, capitalRestant)
      intAnnuel += intMois
      capAnnuel += capMois
      capitalRestant = Math.max(0, capitalRestant - capMois)
    }
    amoByYear.push({ yr, cap: Math.round(capAnnuel), int: Math.round(intAnnuel) })
  }
  const maxAnnuel = Math.max(1, ...amoByYear.map(a => a.cap + a.int))

  const mensualiteMax = Math.round(revenus * tauxEndt / 100)
  const capaciteEmprunt = tauxMensuel > 0
    ? Math.round(mensualiteMax * (1 - Math.pow(1 + tauxMensuel, -nbMois)) / tauxMensuel)
    : mensualiteMax * nbMois
  const prixMaxBien = capaciteEmprunt + apport

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/annonces')} className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Annonces</button>
            <button onClick={() => navigate('/agences')}  className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Agences</button>
            <button onClick={() => navigate('/tarifs')}   className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Tarifs</button>
          </nav>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-800 transition-colors">
            <I.ArrowLeft size={15} /> Retour
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-14 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <I.CreditCard size={14} /> Simulateur de financement
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Simulez votre prêt immobilier</h1>
            <p className="text-white/70 max-w-xl">Mensualité, capacité d'emprunt, frais de notaire — tous vos calculs en temps réel.</p>
          </motion.div>
          <div className="flex flex-wrap gap-2 mt-6">
            {SIMUL_PRESETS.map((p, i) => (
              <button key={i} onClick={() => { setPrix(p.prix); setApport(p.apport) }}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-orange-500 border border-white/15 hover:border-orange-500 text-white/80 hover:text-white transition-all">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 mb-8 w-fit">
          {[
            { id: 'mensualite', label: 'Calculer ma mensualité' },
            { id: 'capacite',   label: "Capacité d'emprunt" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-navy-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Inputs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-7">
            {tab === 'mensualite' ? (
              <>
                <SliderField label="Prix du bien" value={prix} onChange={setPrix} min={50000} max={2000000} step={5000} fmt={v => `${fmt(v)} €`} />
                <SliderField label="Apport personnel" value={apport} onChange={setApport} min={0} max={Math.min(prix, 600000)} step={5000} fmt={v => `${fmt(v)} €`} />
                <div className="bg-orange-50 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
                  <span className="text-slate-600">Montant emprunté</span>
                  <span className="font-bold text-orange-600">{fmt(emprunt)} €</span>
                </div>
              </>
            ) : (
              <>
                <SliderField label="Revenus mensuels nets" value={revenus} onChange={setRevenus} min={1500} max={20000} step={100} fmt={v => `${fmt(v)} €/mois`} />
                <SliderField label="Taux d'endettement max" value={tauxEndt} onChange={setTauxEndt} min={20} max={40} step={1} fmt={v => `${v} %`} />
                <SliderField label="Apport personnel" value={apport} onChange={setApport} min={0} max={500000} step={5000} fmt={v => `${fmt(v)} €`} />
              </>
            )}
            <SliderField label="Taux d'intérêt annuel" value={taux} onChange={setTaux} min={0.5} max={7} step={0.01} fmt={v => `${v.toFixed(2)} %`} />
            <SliderField label="Durée du prêt" value={duree} onChange={setDuree} min={5} max={30} step={1} fmt={v => `${v} ans`} />
            {tab === 'mensualite' && (
              <div>
                <div className="text-sm font-medium text-navy-700 mb-2">Type de logement</div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'ancien', label: 'Ancien' }, { id: 'neuf', label: 'Neuf / VEFA' }].map(t => (
                    <button key={t.id} onClick={() => setTypeLogement(t.id)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${typeLogement === t.id ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-500 border-slate-200 hover:border-navy-300'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-5">
            {tab === 'mensualite' ? (
              <>
                <motion.div key={`${mensualite}-${emprunt}`} initial={{ scale: 0.97, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 280 }}
                  className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-7 text-white">
                  <div className="text-white/60 text-sm mb-1">Mensualité hors assurance</div>
                  <div className="text-5xl font-extrabold">{fmt(mensualite)} <span className="text-2xl font-normal text-white/60">€/mois</span></div>
                  <div className="text-white/50 text-xs mt-2">
                    Avec assurance (0,35 %) : <span className="text-orange-300 font-semibold">{fmt(mensualite + assuranceMensuelle)} €/mois</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/15">
                    {[
                      { label: 'Capital',    value: `${fmt(emprunt)} €` },
                      { label: 'Intérêts',   value: `${fmt(interetsTotal)} €` },
                      { label: 'Coût total', value: `${fmt(coutTotal)} €` },
                    ].map((k, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 mb-0.5">{k.label}</div>
                        <div className="text-sm font-bold">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Frais de notaire */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-navy-800">Frais de notaire estimés</div>
                    <div className="text-xs text-slate-400 mt-0.5">{typeLogement === 'neuf' ? '≈ 2,5 % · VEFA / neuf' : '≈ 7,5 % · bien ancien'}</div>
                  </div>
                  <div className="text-xl font-bold text-navy-900">{fmt(fraisNotaire)} €</div>
                </div>

                {/* Amortization chart */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-navy-800">Amortissement annuel</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-orange-500" /> Capital</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-slate-200" /> Intérêts</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1">
                    {amoByYear.map(({ yr, cap, int }) => (
                      <div key={yr} className="grid items-center gap-2" style={{ gridTemplateColumns: '38px 1fr 72px' }}>
                        <div className="text-[10px] text-slate-400 font-medium">An {yr}</div>
                        <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-50">
                          <motion.div className="h-full bg-orange-500 rounded-l-full"
                            initial={{ width: 0 }} animate={{ width: `${(cap / maxAnnuel) * 100}%` }} transition={{ delay: 0.02 * yr, duration: 0.5, ease: 'easeOut' }} />
                          <div className="h-full bg-slate-200" style={{ width: `${(int / maxAnnuel) * 100}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-500 text-right">{fmt(cap + int)} €</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <motion.div key={`cap-${capaciteEmprunt}`} initial={{ scale: 0.97, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 280 }}
                  className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-7 text-white">
                  <div className="text-white/60 text-sm mb-1">Capacité d'emprunt estimée</div>
                  <div className="text-5xl font-extrabold">{fmt(capaciteEmprunt)} <span className="text-2xl font-normal text-white/60">€</span></div>
                  <div className="text-white/50 text-xs mt-2">
                    Prix maxi du bien (avec apport) : <span className="text-orange-300 font-semibold">{fmt(prixMaxBien)} €</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/15">
                    {[
                      { label: 'Mensualité max', value: `${fmt(mensualiteMax)} €` },
                      { label: 'Durée',          value: `${duree} ans` },
                      { label: 'Taux',           value: `${taux.toFixed(2)} %` },
                    ].map((k, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 mb-0.5">{k.label}</div>
                        <div className="text-sm font-bold">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Endettement gauge */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="text-sm font-semibold text-navy-800 mb-4">Taux d'endettement</div>
                  <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${tauxEndt}%` }} transition={{ duration: 0.4 }}
                      style={{ background: tauxEndt <= 33 ? '#10B981' : tauxEndt <= 35 ? '#F59E0B' : '#EF4444' }} />
                    <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left: '33%' }} />
                    <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left: '35%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-3">
                    <span>Confortable (≤33 %)</span><span>Limite 35 %</span><span>Risqué</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tauxEndt <= 33
                      ? "Taux d'endettement confortable — bonne marge de sécurité pour votre dossier."
                      : tauxEndt <= 35
                      ? "Vous approchez de la limite réglementaire de 35 %. Soignez votre dossier bancaire."
                      : "Au-delà de 35 %, l'octroi du prêt nécessitera une dérogation bancaire."}
                  </p>
                </div>

                {/* Profil */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <div className="text-sm font-semibold text-navy-800 mb-2">Profil financier</div>
                  {[
                    { label: 'Revenus nets',        value: `${fmt(revenus)} €/mois` },
                    { label: 'Mensualité maximale', value: `${fmt(mensualiteMax)} €/mois` },
                    { label: 'Reste à vivre',       value: `${fmt(revenus - mensualiteMax)} €/mois` },
                    { label: 'Apport personnel',    value: `${fmt(apport)} €` },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                      <span className="text-slate-500">{r.label}</span>
                      <span className="font-semibold text-navy-800">{r.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/annonces')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                <I.Sparkles size={13} className="inline mr-1.5 -mt-0.5" /> Voir les annonces
              </button>
              <button onClick={() => navigate('/tarifs')}
                className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                Nos offres
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400">Simulation indicative non contractuelle. Consultez un courtier pour un plan de financement personnalisé.</p>
          </div>
        </div>
      </div>

      {/* ── Footer minimal ── */}
      <footer className="border-t border-slate-100 mt-12 py-8 px-6 text-center text-xs text-slate-400">
        © 2026 SHOPCA — Simulation indicative, non contractuelle.
      </footer>
    </div>
  )
}
