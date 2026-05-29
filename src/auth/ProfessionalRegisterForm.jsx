import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../lib/ui.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import { useAuthAction, svc } from './hooks/useAuth.js'
import { validateProStep1, validateProStep2, validateProStep3, validateProStep4, validateProStep5 } from './validators/proValidators.js'
import ProStep1 from './pro/ProStep1.jsx'
import ProStep2 from './pro/ProStep2.jsx'
import ProStep3 from './pro/ProStep3.jsx'
import ProStep4 from './pro/ProStep4.jsx'
import ProStep5 from './pro/ProStep5.jsx'

const STEPS = [
  { label: 'Société',     Icon: I.Building },
  { label: 'Branding',   Icon: I.Image    },
  { label: 'Visibilité', Icon: I.Globe    },
  { label: 'Vérif.',     Icon: I.Shield   },
  { label: 'Offre',      Icon: I.Zap      },
]

const VALIDATORS = [validateProStep1, validateProStep2, validateProStep3, validateProStep4, validateProStep5]
const STORAGE_KEY = 'pasmal_pro_reg'

const INIT = {
  companyName: '', siret: '', businessType: '', email: '', phone: '', website: '', address: '',
  logo: null, cover: null, description: '', facebook: '', instagram: '', linkedin: '',
  showPhone: true, whatsappLeads: false, publicProfile: true,
  kbis: null, idDoc: null,
  plan: 'visibility',
}

function SuccessScreen({ companyName }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <I.CheckCircle size={32} className="text-emerald-500" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-navy-900">Compte créé !</h3>
        <p className="text-sm text-slate-500 mt-1">
          Bienvenue, <span className="font-semibold text-navy-800">{companyName}</span>.<br />
          Vérifiez votre e-mail pour activer votre compte.
        </p>
      </div>
      <p className="text-xs text-slate-400 max-w-xs">
        Notre équipe examinera vos documents dans les 24 h ouvrées pour activer le badge Agence vérifiée.
      </p>
    </motion.div>
  )
}

export default function ProfessionalRegisterForm({ onBack }) {
  const navigate = useNavigate()
  const { loading, error, setError, run } = useAuthAction()
  const [step,    setStep]    = useState(0)
  const [success, setSuccess] = useState(false)
  const [data,    setData]    = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...INIT, ...JSON.parse(saved) } : INIT
    } catch { return INIT }
  })

  useEffect(() => {
    const { logo, cover, kbis, idDoc, ...serializable } = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  }, [data])

  const set = (key, value) => {
    setError('')
    setData(p => ({ ...p, [key]: value }))
  }

  const next = () => {
    const err = VALIDATORS[step](data)
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const back = () => { setError(''); setStep(s => s - 1) }

  const submit = async () => {
    const err = VALIDATORS[4](data)
    if (err) { setError(err); return }
    const result = await run(() =>
      svc.signUp(data.email, '', {
        account_type:   'professional',
        company_name:   data.companyName.trim(),
        siret:          data.siret.replace(/\s/g, ''),
        business_type:  data.businessType,
        phone:          data.phone.trim() || null,
        website:        data.website.trim() || null,
        address:        data.address.trim() || null,
        description:    data.description.trim() || null,
        show_phone:     data.showPhone,
        whatsapp_leads: data.whatsappLeads,
        public_profile: data.publicProfile,
        plan:           data.plan,
      })
    )
    if (result) {
      localStorage.removeItem(STORAGE_KEY)
      setSuccess(true)
      setTimeout(() => navigate('/auth/verify-pending', { state: { email: data.email } }), 3000)
    }
  }

  if (success) return <SuccessScreen companyName={data.companyName} />

  const stepProgress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="space-y-5">
      {/* Progress stepper */}
      <div>
        <div className="flex justify-between mb-2">
          {STEPS.map(({ label, Icon }, i) => (
            <div key={i} className="flex flex-col items-center gap-1" style={{ width: `${100 / STEPS.length}%` }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                i < step   ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-orange-500 text-white shadow-[0_0_0_3px_rgba(251,146,60,0.25)]' :
                             'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? <I.Check size={13} /> : <Icon size={13} />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${
                i === step ? 'text-orange-500' : i < step ? 'text-emerald-500' : 'text-slate-400'
              }`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            animate={{ width: `${stepProgress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      {/* Step heading */}
      <AnimatePresence mode="wait">
        <motion.div key={`h${step}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}>
          <h3 className="text-base font-extrabold text-navy-900">
            {['Identité de la société', 'Identité visuelle', 'Visibilité publique', 'Documents de vérification', 'Choisir une offre'][step]}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {['Informations légales de votre structure.', 'Logo, couverture et réseaux sociaux.', 'Contrôlez ce que les clients voient.', 'Obtenez le badge Agence vérifiée.', 'Commencez gratuitement, évoluez à tout moment.'][step]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={`s${step}`}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}>
          {step === 0 && <ProStep1 data={data} set={set} error={error} />}
          {step === 1 && <ProStep2 data={data} set={set} error={error} />}
          {step === 2 && <ProStep3 data={data} set={set} />}
          {step === 3 && <ProStep4 data={data} set={set} />}
          {step === 4 && <ProStep5 data={data} set={set} />}
        </motion.div>
      </AnimatePresence>

      {step > 0 && <ErrorBanner msg={error} />}

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={step === 0 ? onBack : back}
          className="flex items-center gap-1.5 px-4 h-11 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition shrink-0">
          <I.ArrowLeft size={14} /> Retour
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
            Continuer <I.ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-[#0B1F3A] hover:bg-[#0e2a50] text-white font-bold text-sm transition disabled:opacity-50">
            {loading ? <I.Loader size={16} /> : <>Créer mon compte pro <I.ArrowRight size={14} /></>}
          </button>
        )}
      </div>
    </div>
  )
}
