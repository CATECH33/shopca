import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'
import { OrangeButton } from './RegisterTabs.jsx'

/* ─── Constants ───────────────────────────────────────────────── */

const STEP_LABELS = ['Entreprise', 'Adresse', 'Identité', 'Visibilité', 'Vérification']

const REGIONS = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
  'Centre-Val de Loire', 'Corse', 'Grand Est', 'Guadeloupe', 'Guyane',
  'Hauts-de-France', 'Île-de-France', 'La Réunion', 'Martinique',
  'Mayotte', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
  'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
]

const SLIDE = {
  enter:  d => ({ opacity: 0, x: d > 0 ?  22 : -22 }),
  center:     ({ opacity: 1, x: 0 }),
  exit:   d => ({ opacity: 0, x: d > 0 ? -22 :  22 }),
}

/* ─── Sub-components ──────────────────────────────────────────── */

function FloatInput({ label, type = 'text', value, onChange, error, hint, ...rest }) {
  const [focused, setFocused] = useState(false)
  const active = focused || String(value).length > 0
  return (
    <div>
      <div className={`relative h-14 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        error   ? 'border-rose-400 bg-rose-50/50' :
        focused ? 'border-orange-400 shadow-[0_0_0_4px_rgba(249,115,22,0.10)] bg-white' :
                  'border-slate-200 bg-white hover:border-slate-300'
      }`}>
        <label className={`absolute left-4 transition-all duration-150 pointer-events-none font-semibold select-none ${
          active
            ? 'top-[7px] text-[10px] text-orange-500 tracking-widest uppercase'
            : 'top-1/2 -translate-y-1/2 text-[13px] text-slate-400'
        }`}>{label}</label>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 w-full bg-transparent outline-none px-4 pt-[22px] pb-[6px] text-[13px] font-medium text-navy-900"
          {...rest}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 ml-1">
            <I.Alert size={10} /> {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[11px] text-slate-400 mt-1.5 ml-1">{hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropZone({ label, sublabel, accept, preview, onFile, tall }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const processFile = file => { if (file) onFile(file) }

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${
        drag    ? 'border-orange-400 bg-orange-50 scale-[1.015]' :
        preview ? 'border-emerald-400 bg-emerald-50/40' :
                  'border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30'
      }`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { processFile(e.target.files[0]); e.target.value = '' }} />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {preview.isImage ? (
              <img src={preview.url} alt="preview"
                className={`w-full object-cover ${tall ? 'h-36' : 'h-28'}`} />
            ) : (
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <I.FileText size={17} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-navy-900 truncate">{preview.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{(preview.size / 1024).toFixed(0)} Ko</p>
                </div>
                <I.CheckCircle size={17} className="text-emerald-500 flex-shrink-0" />
              </div>
            )}
            <button type="button"
              onClick={e => { e.stopPropagation(); onFile(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
              <I.X size={11} />
            </button>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center px-4 text-center ${tall ? 'py-9' : 'py-6'}`}>
            <div className={`rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 ${tall ? 'w-12 h-12' : 'w-9 h-9'}`}>
              <I.Upload size={tall ? 17 : 14} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-semibold text-navy-800">{label}</p>
            {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
            <p className="text-[11px] text-orange-500 font-semibold mt-1.5">
              {drag ? 'Relâcher ici' : 'Cliquer ou glisser'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CheckItem({ label, sub, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${
        checked ? 'border-orange-300 bg-orange-50/70' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}>
      <motion.div
        animate={{ backgroundColor: checked ? '#F97316' : '#f1f5f9', scale: checked ? 1 : 0.88 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
      >
        <AnimatePresence>
          {checked && (
            <motion.span key="c" initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
              <I.Check size={11} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <div>
        <p className="text-[13px] font-semibold text-navy-900">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 px-4 h-12 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-500 hover:border-slate-300 hover:text-navy-700 transition-all flex-shrink-0">
      <I.ChevronLeft size={14} /> Retour
    </button>
  )
}

function StepBar({ current }) {
  const pct = Math.round(((current + 1) / STEP_LABELS.length) * 100)
  return (
    <div className="mb-6">
      {/* Label + count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-extrabold text-orange-500 tracking-widest uppercase">
          Étape {current + 1} / {STEP_LABELS.length}
        </span>
        <span className="text-[11px] font-bold text-slate-400">{pct}% complété</span>
      </div>

      {/* Circles + connectors */}
      <div className="flex items-center mb-3">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <motion.div
              animate={{
                background: i < current ? '#10B981' : i === current ? '#F97316' : '#e2e8f0',
                scale: i === current ? 1.12 : 1,
                boxShadow: i === current ? '0 0 0 4px rgba(249,115,22,0.18)' : '0 0 0 0px transparent',
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
            >
              {i < current ? <I.Check size={12} /> : i + 1}
            </motion.div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-[2px] mx-[5px] rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                <motion.div className="h-full rounded-full" style={{ background: '#10B981' }}
                  animate={{ width: i < current ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex items-start">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ width: 28 }} className="flex-shrink-0 flex justify-center">
              <span className={`text-[8px] font-bold text-center leading-tight select-none transition-colors ${
                i === current ? 'text-orange-500' : i < current ? 'text-emerald-500' : 'text-slate-400'
              }`} style={{ width: 44, marginLeft: -8, display: 'block' }}>
                {label.toUpperCase()}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="flex-1" />}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#fb923c,#f97316)' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.34, 1.04, 0.64, 1] }} />
      </div>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────── */

export default function ProfessionalRegisterForm({ step, setStep, onClose }) {
  const [form, setForm] = useState({
    agencyName: '', siret: '', tva: '', email: '', phone: '', website: '',
    address: '', postalCode: '', city: '', region: '', country: 'France',
    description: '', agentCount: '',
    showPhone: true, showAddress: true, leadEmail: true, leadSMS: false, instantContact: true,
    acceptTerms: false,
  })
  const [logo,  setLogo]  = useState(null)
  const [cover, setCover] = useState(null)
  const [kbis,  setKbis]  = useState(null)
  const [idDoc, setIdDoc] = useState(null)

  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [dir,     setDir]     = useState(1)

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const toFile = (file) => file
    ? { url: URL.createObjectURL(file), name: file.name, size: file.size, isImage: file.type.startsWith('image') }
    : null

  const handleFile = (setter, prev) => raw => {
    if (prev?.url) URL.revokeObjectURL(prev.url)
    setter(raw ? toFile(raw) : null)
  }

  useEffect(() => {
    return () => {
      [logo, cover, kbis, idDoc].forEach(f => f?.url && URL.revokeObjectURL(f.url))
    }
  }, []) // eslint-disable-line

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.agencyName.trim())            e.agencyName = 'Nom de l\'agence requis'
      if (!/^\d{14}$/.test(form.siret.replace(/\s/g, ''))) e.siret = '14 chiffres requis'
      if (!EMAIL_RE.test(form.email))         e.email = 'E-mail valide requis'
      if (!form.phone.trim())                 e.phone = 'Téléphone requis'
    }
    if (step === 1) {
      if (!form.address.trim())    e.address    = 'Adresse requise'
      if (!form.postalCode.trim()) e.postalCode = 'Code postal requis'
      if (!form.city.trim())       e.city       = 'Ville requise'
      if (!form.region)            e.region     = 'Sélectionnez une région'
    }
    if (step === 2) {
      if (!form.description.trim()) e.description = 'Description requise'
    }
    if (step === 4) {
      if (!kbis)            e.kbis       = 'Kbis obligatoire'
      if (!idDoc)           e.idDoc      = 'Pièce d\'identité obligatoire'
      if (!form.acceptTerms) e.terms     = 'Vous devez accepter les conditions'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate()) return
    setDir(1); setErrors({}); setStep(s => s + 1)
  }
  const back = () => {
    setDir(-1); setErrors({}); setStep(s => s - 1)
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    setDone(true)
  }

  /* ── Done screen ── */
  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 }}
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <I.BadgeCheck size={36} className="text-emerald-600" />
      </motion.div>
      <h2 className="text-xl font-extrabold text-navy-900 mb-2">Dossier soumis !</h2>
      <p className="text-[13px] text-slate-500 leading-relaxed mb-4 max-w-xs mx-auto">
        Votre agence <strong className="text-navy-900">{form.agencyName}</strong> est en cours de
        vérification. Notre équipe vous contacte sous 24h.
      </p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mx-auto max-w-xs mb-6">
        <p className="text-[11px] text-orange-700 font-medium flex items-center gap-2 justify-center">
          <I.Zap size={12} /> Accès provisoire activé — tableau de bord disponible dès maintenant
        </p>
      </div>
      <button onClick={onClose}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-2xl text-[13px] transition-all shadow-sm hover:shadow-orange-200 hover:shadow-lg">
        Accéder au tableau de bord
      </button>
    </motion.div>
  )

  /* ── Form ── */
  return (
    <div>
      <StepBar current={step} />

      <AnimatePresence mode="wait" custom={dir}>

        {/* ── STEP 0 — Entreprise ── */}
        {step === 0 && (
          <motion.div key="s0" custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18 }} className="space-y-3">
            <div className="mb-1">
              <h2 className="text-[17px] font-extrabold text-navy-900">Informations entreprise</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Renseignez les informations légales de votre agence</p>
            </div>
            <FloatInput label="Nom de l'agence *" value={form.agencyName} onChange={set('agencyName')} error={errors.agencyName} />
            <div className="grid grid-cols-2 gap-2.5">
              <FloatInput label="SIRET *" value={form.siret} onChange={set('siret')} error={errors.siret} hint="14 chiffres" />
              <FloatInput label="N° TVA intracommunautaire" value={form.tva} onChange={set('tva')} hint="Optionnel" />
            </div>
            <FloatInput label="E-mail professionnel *" type="email" value={form.email} onChange={set('email')} error={errors.email} />
            <FloatInput label="Téléphone *" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <FloatInput label="Site web" value={form.website} onChange={set('website')} hint="https://…  — Optionnel" />
            <OrangeButton onClick={next}>Continuer</OrangeButton>
          </motion.div>
        )}

        {/* ── STEP 1 — Adresse ── */}
        {step === 1 && (
          <motion.div key="s1" custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18 }} className="space-y-3">
            <div className="mb-1">
              <h2 className="text-[17px] font-extrabold text-navy-900">Adresse du siège social</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Adresse officielle visible dans votre profil agence</p>
            </div>
            <FloatInput label="Adresse *" value={form.address} onChange={set('address')} error={errors.address} />
            <div className="grid grid-cols-2 gap-2.5">
              <FloatInput label="Code postal *" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} />
              <FloatInput label="Ville *" value={form.city} onChange={set('city')} error={errors.city} />
            </div>

            {/* Region select — styled to match FloatInput */}
            <div>
              <div className={`relative h-14 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                errors.region ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                {form.region && (
                  <label className="absolute left-4 top-[7px] text-[10px] font-semibold text-orange-500 tracking-widest uppercase pointer-events-none select-none">
                    Région
                  </label>
                )}
                <select value={form.region} onChange={e => set('region')(e.target.value)}
                  className={`absolute inset-0 w-full h-full bg-transparent outline-none px-4 text-[13px] font-medium text-navy-900 appearance-none cursor-pointer ${form.region ? 'pt-[22px] pb-[6px]' : ''}`}>
                  <option value="" disabled>Région *</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <I.ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {errors.region && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 ml-1">
                  <I.Alert size={10} /> {errors.region}
                </p>
              )}
            </div>

            <FloatInput label="Pays" value={form.country} onChange={set('country')} />
            <div className="flex gap-2.5">
              <BackBtn onClick={back} />
              <div className="flex-1"><OrangeButton onClick={next}>Continuer</OrangeButton></div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 — Identité visuelle ── */}
        {step === 2 && (
          <motion.div key="s2" custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18 }} className="space-y-4">
            <div className="mb-1">
              <h2 className="text-[17px] font-extrabold text-navy-900">Identité & marque</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Personnalisez votre profil visible par les clients</p>
            </div>

            {/* Logo + Cover side by side */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Logo</p>
                <DropZone label="Logo agence" sublabel="PNG, JPG, SVG" accept="image/*"
                  preview={logo} onFile={handleFile(setLogo, logo)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Couverture</p>
                <DropZone label="Image de couv." sublabel="1200 × 400 px" accept="image/*"
                  preview={cover} onFile={handleFile(setCover, cover)} />
              </div>
            </div>

            {/* Description textarea */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description de l'agence *</p>
              <textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3}
                placeholder="Décrivez votre agence, votre expertise, vos valeurs…"
                className={`w-full px-4 py-3.5 rounded-2xl border-2 text-[13px] font-medium text-navy-900 placeholder-slate-400 resize-none outline-none transition-all duration-200 ${
                  errors.description
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.10)]'
                }`} />
              {errors.description && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 ml-1">
                  <I.Alert size={10} /> {errors.description}
                </p>
              )}
            </div>

            <FloatInput label="Nombre de conseillers" type="number" value={form.agentCount}
              onChange={set('agentCount')} hint="Optionnel" />

            <div className="flex gap-2.5">
              <BackBtn onClick={back} />
              <div className="flex-1"><OrangeButton onClick={next}>Continuer</OrangeButton></div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 — Visibilité ── */}
        {step === 3 && (
          <motion.div key="s3" custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18 }} className="space-y-3">
            <div className="mb-1">
              <h2 className="text-[17px] font-extrabold text-navy-900">Préférences de visibilité</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Contrôlez ce qui est visible et comment vous êtes contacté</p>
            </div>

            <div className="space-y-2">
              <CheckItem
                label="Afficher le téléphone publiquement"
                sub="Numéro visible sur votre profil agence"
                checked={form.showPhone} onChange={v => set('showPhone')(v)} />
              <CheckItem
                label="Afficher l'adresse de l'agence"
                sub="Adresse visible sur votre fiche établissement"
                checked={form.showAddress} onChange={v => set('showAddress')(v)} />
              <CheckItem
                label="Recevoir les leads par e-mail"
                sub="Notification à chaque nouveau contact"
                checked={form.leadEmail} onChange={v => set('leadEmail')(v)} />
              <CheckItem
                label="Recevoir les leads par SMS"
                sub="Alertes SMS instantanées dès qu'un lead entre"
                checked={form.leadSMS} onChange={v => set('leadSMS')(v)} />
              <CheckItem
                label="Activer le contact instantané"
                sub="Les acheteurs peuvent vous contacter directement"
                checked={form.instantContact} onChange={v => set('instantContact')(v)} />
            </div>

            <div className="flex gap-2.5 pt-1">
              <BackBtn onClick={back} />
              <div className="flex-1"><OrangeButton onClick={next}>Continuer</OrangeButton></div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4 — Vérification ── */}
        {step === 4 && (
          <motion.div key="s4" custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18 }} className="space-y-4">
            <div className="mb-1">
              <h2 className="text-[17px] font-extrabold text-navy-900">Vérification légale</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Documents obligatoires pour valider votre compte professionnel</p>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <I.Shield size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Vos documents sont <strong>chiffrés de bout en bout</strong> et ne sont jamais partagés.
                Traitement sécurisé sous 24h par notre équipe conformité.
              </p>
            </div>

            {/* Kbis upload */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Extrait Kbis *</p>
              <DropZone label="Extrait Kbis" sublabel="PDF ou image — moins de 10 Mo" accept=".pdf,image/*"
                preview={kbis} onFile={handleFile(setKbis, kbis)} tall />
              {errors.kbis && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 ml-1">
                  <I.Alert size={10} /> {errors.kbis}
                </p>
              )}
            </div>

            {/* ID upload */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pièce d'identité *</p>
              <DropZone label="CNI ou passeport" sublabel="Recto-verso — PDF ou image" accept=".pdf,image/*"
                preview={idDoc} onFile={handleFile(setIdDoc, idDoc)} tall />
              {errors.idDoc && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 ml-1">
                  <I.Alert size={10} /> {errors.idDoc}
                </p>
              )}
            </div>

            {/* Terms */}
            <button type="button" onClick={() => set('acceptTerms')(!form.acceptTerms)}
              className="flex items-start gap-3 w-full text-left">
              <motion.div
                animate={{ backgroundColor: form.acceptTerms ? '#F97316' : '#f1f5f9', scale: form.acceptTerms ? 1 : 0.88 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <AnimatePresence>
                  {form.acceptTerms && (
                    <motion.span key="chk" initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      <I.Check size={11} className="text-white" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <p className={`text-[12px] leading-relaxed ${errors.terms ? 'text-rose-500' : 'text-slate-600'}`}>
                J'accepte les{' '}
                <span className="text-orange-500 font-semibold">conditions professionnelles PASMAL</span>
                {' '}et la{' '}
                <span className="text-orange-500 font-semibold">politique de confidentialité</span>
              </p>
            </button>
            {errors.terms && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 -mt-2 ml-8">
                <I.Alert size={10} /> {errors.terms}
              </p>
            )}

            <div className="flex gap-2.5">
              <BackBtn onClick={back} />
              <div className="flex-1">
                <OrangeButton loading={loading} onClick={submit}>Soumettre le dossier</OrangeButton>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Vérification sous 24h · Chiffrement SSL · RGPD conforme
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
