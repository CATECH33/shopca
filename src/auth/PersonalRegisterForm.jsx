import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../lib/ui.jsx'
import { FormField, PasswordField } from './components/FormField.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import PasswordStrength, { getStrength } from './components/PasswordStrength.jsx'
import AvatarUpload from './components/AvatarUpload.jsx'
import { useAuthAction, svc } from './hooks/useAuth.js'
import { isValidEmail } from './validators/authValidators.js'

/* ── inline validators ─────────────────────────────────────── */
function validateStep1({ firstName, lastName, email, password, confirm }) {
  if (!firstName.trim())           return 'Le prénom est requis.'
  if (!lastName.trim())            return 'Le nom est requis.'
  if (!isValidEmail(email))        return 'Adresse e-mail invalide.'
  if (getStrength(password) < 2)   return 'Mot de passe trop faible (min. 8 caractères).'
  if (password !== confirm)        return 'Les mots de passe ne correspondent pas.'
  return null
}
function validateStep2({ phone, city }) {
  if (phone && !/^[\d\s+\-().]{7,20}$/.test(phone)) return 'Numéro de téléphone invalide.'
  return null
}

/* ── step indicator ────────────────────────────────────────── */
function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{ scale: step === i ? 1 : 0.85 }}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
              step > i  ? 'bg-emerald-500 text-white' :
              step === i ? 'bg-orange-500 text-white' :
                           'bg-slate-100 text-slate-400'
            }`}
          >
            {step > i ? <I.Check size={12} /> : i}
          </motion.div>
          {i < 2 && <div className={`h-px w-8 transition-colors ${step > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
        </div>
      ))}
      <span className="text-xs text-slate-400 ml-1">{step}/2</span>
    </div>
  )
}

/* ── success screen ────────────────────────────────────────── */
function SuccessScreen({ email }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-6 gap-4"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <I.CheckCircle size={32} className="text-emerald-500" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-navy-900">Compte créé !</h3>
        <p className="text-sm text-slate-500 mt-1">
          Un lien de vérification a été envoyé à<br />
          <span className="font-semibold text-navy-800">{email}</span>
        </p>
      </div>
      <p className="text-xs text-slate-400 max-w-xs">
        Cliquez sur le lien dans l'e-mail pour activer votre compte. Vérifiez vos spams si nécessaire.
      </p>
    </motion.div>
  )
}

/* ── main component ────────────────────────────────────────── */
export default function PersonalRegisterForm({ onBack }) {
  const navigate = useNavigate()
  const { loading, error, setError, run } = useAuthAction()

  const [step, setStep]           = useState(1)
  const [success, setSuccess]     = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [phone,     setPhone]     = useState('')
  const [city,      setCity]      = useState('')
  const [avatar,    setAvatar]    = useState(null)
  const [txType,    setTxType]    = useState('buy')

  const txOptions = [
    { value: 'buy',    label: 'Acheter',   Icon: I.Home },
    { value: 'rent',   label: 'Louer',     Icon: I.Key },
    { value: 'invest', label: 'Investir',  Icon: I.TrendingUp },
  ]

  /* inline field errors */
  const [fe, setFe] = useState({})
  const touch = (field, value) => {
    if (!value?.trim() && ['firstName','lastName'].includes(field))
      setFe(p => ({ ...p, [field]: 'Requis' }))
    else if (field === 'email' && value && !isValidEmail(value))
      setFe(p => ({ ...p, email: 'E-mail invalide' }))
    else if (field === 'confirm' && value !== password)
      setFe(p => ({ ...p, confirm: 'Ne correspond pas' }))
    else
      setFe(p => { const n = { ...p }; delete n[field]; return n })
  }

  const nextStep = () => {
    const err = validateStep1({ firstName, lastName, email, password, confirm })
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const submit = async () => {
    const err = validateStep2({ phone, city })
    if (err) { setError(err); return }
    const result = await run(() =>
      svc.signUp(email, password, {
        account_type: 'personal',
        first_name:   firstName.trim(),
        last_name:    lastName.trim(),
        phone:        phone.trim() || null,
        city:         city.trim()  || null,
        tx_preference: txType,
      })
    )
    if (result) {
      setSuccess(true)
      setTimeout(() => navigate('/auth/verify-pending', { state: { email } }), 2800)
    }
  }

  if (success) return <SuccessScreen email={email} />

  return (
    <div className="space-y-1">
      <StepDots step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prénom" value={firstName} onChange={v => { setFirstName(v); touch('firstName', v) }}
                placeholder="Jean" icon={I.User} error={fe.firstName} />
              <FormField label="Nom" value={lastName} onChange={v => { setLastName(v); touch('lastName', v) }}
                placeholder="Dupont" icon={I.User} error={fe.lastName} />
            </div>
            <FormField label="E-mail" type="email" value={email} onChange={v => { setEmail(v); touch('email', v) }}
              placeholder="vous@exemple.fr" icon={I.Mail} error={fe.email} />
            <div>
              <PasswordField label="Mot de passe" value={password} onChange={setPassword} />
              <PasswordStrength value={password} />
            </div>
            <FormField label="Confirmer le mot de passe" type="password"
              value={confirm} onChange={v => { setConfirm(v); touch('confirm', v) }}
              placeholder="••••••••" icon={I.Lock} error={fe.confirm} />
            <ErrorBanner msg={error} />
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 px-4 h-11 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition">
                <I.ArrowLeft size={14} /> Retour
              </button>
              <button type="button" onClick={nextStep}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
                Continuer <I.ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="space-y-5"
          >
            <AvatarUpload value={avatar} onChange={setAvatar} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Téléphone" value={phone} onChange={setPhone}
                placeholder="+33 6 12 34 56 78" icon={I.Phone} />
              <FormField label="Ville" value={city} onChange={setCity}
                placeholder="Paris" icon={I.MapPin} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Je cherche à…
              </label>
              <div className="grid grid-cols-3 gap-2">
                {txOptions.map(({ value, label, Icon }) => (
                  <button key={value} type="button" onClick={() => setTxType(value)}
                    className={`rounded-2xl border-2 py-3 flex flex-col items-center gap-1.5 transition-all ${
                      txType === value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      txType === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}><Icon size={15} /></div>
                    <span className="text-xs font-bold text-navy-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <ErrorBanner msg={error} />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="flex items-center gap-1.5 px-4 h-11 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition">
                <I.ArrowLeft size={14} /> Retour
              </button>
              <button type="button" onClick={submit} disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-50">
                {loading ? <I.Loader size={16} /> : <>Créer mon compte <I.ArrowRight size={14} /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
