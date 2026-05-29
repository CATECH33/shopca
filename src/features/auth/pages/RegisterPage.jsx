import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo, PasswordStrength } from '../../../lib/ui.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = {
  personal: ['Identité', 'Accès', 'Confirmation'],
  pro:      ['Entreprise', 'Contact', 'Accès', 'Confirmation'],
}

const slide = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit:  (d) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
}

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rg)" />
      </svg>
      {/* Glow blobs */}
      <div className="absolute top-[28%] -left-24 w-80 h-80 bg-orange-500/[0.14] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[22%] right-0 w-60 h-60 bg-orange-400/[0.08] rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        {/* Logo */}
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <svg width="230" height="172" viewBox="0 0 260 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left buildings */}
            <rect x="8"  y="108" width="28" height="80" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
            <rect x="12" y="90"  width="20" height="18" rx="1" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.07" strokeWidth="0.5"/>
            <rect x="42" y="78"  width="48" height="110" rx="2" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
            <rect x="50" y="88"  width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            <rect x="68" y="88"  width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            <rect x="50" y="106" width="11" height="11" rx="1" fill="white" fillOpacity="0.06"/>
            <rect x="68" y="106" width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            {/* Main house */}
            <path d="M118 70 L168 22 L218 70 V182 H118Z" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.12" strokeWidth="1.2"/>
            <path d="M108 75 L168 14 L228 75" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="146" y="132" width="44" height="50" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.09" strokeWidth="1"/>
            <rect x="124" y="92"  width="22" height="16" rx="2" fill="#FB923C" fillOpacity="0.18" stroke="#FB923C" strokeOpacity="0.32" strokeWidth="0.8"/>
            <rect x="190" y="92"  width="22" height="16" rx="2" fill="#FB923C" fillOpacity="0.18" stroke="#FB923C" strokeOpacity="0.32" strokeWidth="0.8"/>
            {/* Ground */}
            <line x1="0" y1="184" x2="260" y2="184" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
            {/* Growth trend */}
            <polyline points="18,177 62,163 108,169 155,146 202,154 250,124" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.72"/>
            <circle cx="250" cy="124" r="4" fill="#FB923C" opacity="0.72"/>
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
          Investissez dans votre<br/>
          <span className="text-orange-400">avenir immobilier</span>
        </h1>
        <p className="text-white/55 text-sm leading-relaxed mb-8">
          Accédez aux meilleures opportunités du marché français. Achat, location, investissement — tout en un.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {[
            { v: '50K+',   l: 'Biens' },
            { v: '98%',    l: 'Satisfaits' },
            { v: '12 ans', l: 'Expertise' },
          ].map(s => (
            <div key={s.l} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-white">{s.v}</div>
              <div className="text-[10px] text-white/45 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-8">
          <div className="flex gap-0.5 mb-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#FB923C">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <p className="text-white/75 text-sm italic leading-relaxed mb-3">
            "Grâce à PASMAL, j'ai trouvé mon appartement en 3 semaines. Service exceptionnel et équipe très réactive."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              MD
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Marie D.</div>
              <div className="text-white/40 text-[10px]">Propriétaire depuis 2023</div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-auto flex items-center gap-5 flex-wrap">
          {[
            { Icon: I.Shield,     label: 'SSL 256-bit' },
            { Icon: I.Lock,       label: 'RGPD conforme' },
            { Icon: I.BadgeCheck, label: 'Certifié France' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/35">
              <b.Icon size={13} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step progress ─────────────────────────────────────────────────────────────
function StepProgress({ steps, current }) {
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.div layout
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${
                i < current   ? 'bg-emerald-500 text-white' :
                i === current ? 'bg-orange-500 text-white shadow-md shadow-orange-200' :
                                'bg-slate-100 text-slate-400'
              }`}>
              {i < current ? <I.Check size={11} /> : i + 1}
            </motion.div>
            <span className={`text-[11px] font-semibold hidden sm:block transition-colors duration-200 ${
              i === current ? 'text-[#0F172A]' :
              i < current   ? 'text-emerald-600' :
                              'text-slate-400'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px rounded-full transition-colors duration-300 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, optional, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
        {optional && <span className="ml-1.5 normal-case font-normal text-slate-400">(optionnel)</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Text input ────────────────────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder, type = 'text', icon: Icon, error }) {
  return (
    <div className={`flex items-center gap-3 px-4 h-12 rounded-xl border-2 bg-slate-50 transition-all ${
      error
        ? 'border-rose-300 bg-rose-50/50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100'
        : 'border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'
    }`}>
      {Icon && <Icon size={15} className={`shrink-0 ${error ? 'text-rose-400' : 'text-slate-400'}`} />}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
    </div>
  )
}

// ── Password input ────────────────────────────────────────────────────────────
function PwdInput({ label, value, onChange, showStrength, error }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        <I.Lock size={15} className="text-slate-400 shrink-0" />
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
        <button type="button" onClick={() => setShow(s => !s)}
          className="text-slate-400 hover:text-slate-600 transition shrink-0">
          {show ? <I.EyeOff size={14} /> : <I.Eye size={14} />}
        </button>
      </div>
      {showStrength && value && <PasswordStrength password={value} />}
    </Field>
  )
}

// ── Confirm step ──────────────────────────────────────────────────────────────
function ConfirmStep({ rows, cgu, setCgu, error }) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-white border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Récapitulatif</span>
        </div>
        <div className="px-5 py-4 divide-y divide-slate-100">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="text-slate-500 shrink-0">{r.l}</span>
              <span className="font-semibold text-[#0F172A] truncate max-w-[58%] text-right ml-4">{r.v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div onClick={() => setCgu(c => !c)}
        className="flex items-start gap-3 cursor-pointer group px-1 py-2 rounded-xl hover:bg-orange-50/60 transition-colors">
        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          cgu ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-orange-400'
        }`}>
          {cgu && <I.Check size={11} className="text-white" />}
        </div>
        <span className="text-sm text-slate-600 leading-relaxed select-none">
          J'accepte les{' '}
          <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">CGU</a>{' '}
          et la{' '}
          <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">politique de confidentialité</a>{' '}
          de PASMAL.
        </span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Step content ──────────────────────────────────────────────────────────────
function StepContent({ tab, step, s, set, errors }) {
  // Personal
  if (tab === 'personal') {
    if (step === 0) return (
      <div className="space-y-4">
        <Field label="Prénom" error={errors.firstName}>
          <TextInput value={s.firstName} onChange={set.firstName} placeholder="Jean" icon={I.User} error={errors.firstName} />
        </Field>
        <Field label="Nom" error={errors.lastName}>
          <TextInput value={s.lastName} onChange={set.lastName} placeholder="Dupont" icon={I.User} error={errors.lastName} />
        </Field>
        <Field label="Téléphone" optional>
          <TextInput value={s.phone} onChange={set.phone} placeholder="+33 6 00 00 00 00" icon={I.Phone} />
        </Field>
      </div>
    )

    if (step === 1) return (
      <div className="space-y-4">
        <Field label="E-mail" error={errors.email}>
          <TextInput type="email" value={s.email} onChange={set.email} placeholder="vous@exemple.fr" icon={I.Mail} error={errors.email} />
        </Field>
        <PwdInput label="Mot de passe" value={s.password} onChange={set.password} showStrength error={errors.password} />
        <PwdInput label="Confirmer le mot de passe" value={s.confirmPwd} onChange={set.confirmPwd} error={errors.confirmPwd} />
      </div>
    )

    if (step === 2) return (
      <ConfirmStep
        rows={[
          { l: 'Prénom',    v: s.firstName },
          { l: 'Nom',       v: s.lastName  },
          { l: 'E-mail',    v: s.email     },
          ...(s.phone ? [{ l: 'Téléphone', v: s.phone }] : []),
        ]}
        cgu={s.cgu} setCgu={set.cgu} error={errors.cgu}
      />
    )
  }

  // Pro
  if (tab === 'pro') {
    if (step === 0) return (
      <div className="space-y-4">
        <Field label="Raison sociale" error={errors.companyName}>
          <TextInput value={s.companyName} onChange={set.companyName} placeholder="Immobilier & Co." icon={I.Building} error={errors.companyName} />
        </Field>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Type d'activité</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['agent',       'Agent immobilier'],
              ['promoteur',   'Promoteur'],
              ['gestionnaire','Gestionnaire'],
              ['autre',       'Autre'],
            ].map(([k, l]) => (
              <button key={k} type="button" onClick={() => set.activityType(k)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 text-left transition-all ${
                  s.activityType === k
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50/40'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <Field label="SIRET" optional>
          <TextInput value={s.siret} onChange={set.siret} placeholder="123 456 789 00012" icon={I.FileText} />
        </Field>
      </div>
    )

    if (step === 1) return (
      <div className="space-y-4">
        <Field label="Prénom" error={errors.firstName}>
          <TextInput value={s.firstName} onChange={set.firstName} placeholder="Jean" icon={I.User} error={errors.firstName} />
        </Field>
        <Field label="Nom" error={errors.lastName}>
          <TextInput value={s.lastName} onChange={set.lastName} placeholder="Dupont" icon={I.User} error={errors.lastName} />
        </Field>
        <Field label="E-mail professionnel" error={errors.email}>
          <TextInput type="email" value={s.email} onChange={set.email} placeholder="vous@agence.fr" icon={I.Mail} error={errors.email} />
        </Field>
      </div>
    )

    if (step === 2) return (
      <div className="space-y-4">
        <PwdInput label="Mot de passe" value={s.password} onChange={set.password} showStrength error={errors.password} />
        <PwdInput label="Confirmer le mot de passe" value={s.confirmPwd} onChange={set.confirmPwd} error={errors.confirmPwd} />
      </div>
    )

    if (step === 3) return (
      <ConfirmStep
        rows={[
          { l: 'Entreprise', v: s.companyName },
          { l: 'Activité',   v: s.activityType },
          ...(s.siret ? [{ l: 'SIRET', v: s.siret }] : []),
          { l: 'Prénom',     v: s.firstName },
          { l: 'Nom',        v: s.lastName  },
          { l: 'E-mail',     v: s.email     },
        ]}
        cgu={s.cgu} setCgu={set.cgu} error={errors.cgu}
      />
    )
  }

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [tab, setTab]   = useState('personal')
  const [step, setStep] = useState(0)
  const [dir, setDir]   = useState(1)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [phone,        setPhone]        = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPwd,   setConfirmPwd]   = useState('')
  const [companyName,  setCompanyName]  = useState('')
  const [siret,        setSiret]        = useState('')
  const [activityType, setActivityType] = useState('agent')
  const [cgu,          setCgu]          = useState(false)

  const s   = { firstName, lastName, phone, email, password, confirmPwd, companyName, siret, activityType, cgu }
  const set = {
    firstName: setFirstName, lastName: setLastName, phone: setPhone,
    email: setEmail, password: setPassword, confirmPwd: setConfirmPwd,
    companyName: setCompanyName, siret: setSiret,
    activityType: setActivityType, cgu: setCgu,
  }

  const steps  = STEPS[tab]
  const isLast = step === steps.length - 1

  const validate = () => {
    const e = {}
    if (tab === 'personal') {
      if (step === 0) {
        if (!firstName.trim()) e.firstName = 'Prénom requis'
        if (!lastName.trim())  e.lastName  = 'Nom requis'
      } else if (step === 1) {
        if (!email.includes('@')) e.email = 'E-mail invalide'
        if (password.length < 6) e.password = 'Minimum 6 caractères'
        if (confirmPwd !== password) e.confirmPwd = 'Les mots de passe ne correspondent pas'
      } else if (step === 2) {
        if (!cgu) e.cgu = 'Veuillez accepter les CGU pour continuer'
      }
    } else {
      if (step === 0) {
        if (!companyName.trim()) e.companyName = 'Raison sociale requise'
      } else if (step === 1) {
        if (!firstName.trim())   e.firstName = 'Prénom requis'
        if (!lastName.trim())    e.lastName  = 'Nom requis'
        if (!email.includes('@')) e.email    = 'E-mail invalide'
      } else if (step === 2) {
        if (password.length < 6)     e.password   = 'Minimum 6 caractères'
        if (confirmPwd !== password) e.confirmPwd = 'Les mots de passe ne correspondent pas'
      } else if (step === 3) {
        if (!cgu) e.cgu = 'Veuillez accepter les CGU pour continuer'
      }
    }
    return e
  }

  const advance = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (isLast) { setDone(true); return }
    setDir(1)
    setStep(n => n + 1)
  }

  const back = () => {
    setErrors({})
    setDir(-1)
    setStep(n => n - 1)
  }

  const switchTab = (t) => {
    setTab(t); setStep(0); setDir(1); setErrors({})
  }

  // ── Success screen
  if (done) return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />
      <div className="flex-1 flex items-center justify-center p-10">
        <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center max-w-sm w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <I.CheckCircle size={40} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Compte créé !</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Bienvenue sur PASMAL. Vérifiez votre boîte mail pour activer votre compte.
          </p>
          <Link to="/auth/login"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
            Accéder à mon compte <I.ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </div>
  )

  // ── Register screen
  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6">
          <div className="lg:hidden"><BrandLogo /></div>
          <div className="hidden lg:block" />
          <Link to="/auth/login"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition">
            <I.ArrowLeft size={14} />
            Déjà inscrit ?{' '}
            <span className="text-orange-600 font-semibold ml-1">Se connecter</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Créer un compte</h2>
              <p className="text-slate-500 text-sm mt-1">Rejoignez des milliers de clients qui font confiance à PASMAL.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 mb-7">
              {[
                { key: 'personal', label: 'Particulier',   Icon: I.User     },
                { key: 'pro',      label: 'Professionnel', Icon: I.Building },
              ].map(t => (
                <button key={t.key} type="button" onClick={() => switchTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tab === t.key
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-500 hover:text-[#0F172A]'
                  }`}>
                  <t.Icon size={14} />{t.label}
                </button>
              ))}
            </div>

            {/* Progress */}
            <StepProgress steps={steps} current={step} />

            {/* Step content — min-h prevents layout jump */}
            <div className="min-h-[272px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={`${tab}-${step}`} custom={dir}
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
                  <StepContent tab={tab} step={step} s={s} set={set} errors={errors} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className={`mt-7 flex gap-3 ${step > 0 ? '' : 'justify-end'}`}>
              {step > 0 && (
                <button type="button" onClick={back}
                  className="flex items-center gap-2 px-5 h-12 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition shrink-0">
                  <I.ArrowLeft size={15} />Retour
                </button>
              )}
              <button type="button" onClick={advance}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5">
                {isLast
                  ? <><I.CheckCircle size={16} />Créer mon compte</>
                  : <>Continuer <I.ArrowRight size={15} /></>}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-6">
              En créant un compte vous acceptez nos{' '}
              <a href="#" className="underline hover:text-[#0F172A]">CGU</a> et notre{' '}
              <a href="#" className="underline hover:text-[#0F172A]">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
