import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

const TOTAL_STEPS = 4 // welcome, goal, location, done

const GOALS = [
  { id: 'buy',    Icon: I.Home,       label: 'Acheter',    sub: 'Trouver mon bien idéal'    },
  { id: 'rent',   Icon: I.Key,        label: 'Louer',      sub: 'Trouver une location'       },
  { id: 'invest', Icon: I.TrendingUp, label: 'Investir',   sub: 'Rendement & patrimoine'     },
  { id: 'sell',   Icon: I.Upload,     label: 'Vendre',     sub: 'Publier une annonce'        },
]

// ── Slide variants ────────────────────────────────────────────────────────────
const variants = {
  enter: (d) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function WelcomeStep({ user }) {
  const name = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'là'

  return (
    <div className="text-center">
      {/* Illustration */}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex justify-center mb-8">
        <svg width="160" height="160" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* House body */}
          <rect x="46" y="92" width="88" height="68" rx="6" fill="#FFF7ED" stroke="#FB923C" strokeOpacity="0.4" strokeWidth="1.5"/>
          {/* Roof */}
          <path d="M34 96 L90 46 L146 96" fill="#FB923C" fillOpacity="0.15" stroke="#FB923C" strokeOpacity="0.5" strokeWidth="2" strokeLinejoin="round"/>
          {/* Door */}
          <rect x="78" y="124" width="24" height="36" rx="4" fill="#FB923C" fillOpacity="0.3" stroke="#FB923C" strokeOpacity="0.4" strokeWidth="1"/>
          {/* Windows */}
          <rect x="54" y="104" width="22" height="18" rx="3" fill="#FB923C" fillOpacity="0.2" stroke="#FB923C" strokeOpacity="0.3" strokeWidth="1"/>
          <rect x="104" y="104" width="22" height="18" rx="3" fill="#FB923C" fillOpacity="0.2" stroke="#FB923C" strokeOpacity="0.3" strokeWidth="1"/>
          {/* Sparkles */}
          <motion.g animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M148 44 L151 36 L154 44 L162 47 L154 50 L151 58 L148 50 L140 47 Z" fill="#FB923C" fillOpacity="0.6"/>
          </motion.g>
          <motion.g animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
            <path d="M22 68 L24 63 L26 68 L31 70 L26 72 L24 77 L22 72 L17 70 Z" fill="#FB923C" fillOpacity="0.4"/>
          </motion.g>
          <circle cx="148" cy="80" r="3" fill="#FB923C" fillOpacity="0.3"/>
          <circle cx="30" cy="110" r="2" fill="#FB923C" fillOpacity="0.2"/>
          <circle cx="160" cy="120" r="2.5" fill="#FB923C" fillOpacity="0.25"/>
        </svg>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="text-3xl font-extrabold text-[#0F172A] leading-tight mb-3">
        Bienvenue,<br/>
        <span className="text-orange-500">{name}&nbsp;!</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
        className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
        Votre compte est prêt. Prenons deux minutes pour personnaliser votre expérience PASMAL.
      </motion.p>
    </div>
  )
}

// ── Step 1: Goal ──────────────────────────────────────────────────────────────
function GoalStep({ goal, setGoal }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Votre objectif principal</h2>
        <p className="text-slate-500 text-sm">Sélectionnez ce qui vous correspond le mieux.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(({ id, Icon, label, sub }) => (
          <button key={id} type="button" onClick={() => setGoal(id)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all ${
              goal === id
                ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-100'
                : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
            }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              goal === id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Icon size={22} />
            </div>
            <div className="font-bold text-[#0F172A] text-sm">{label}</div>
            <div className="text-slate-400 text-xs leading-tight">{sub}</div>
            {goal === id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <I.Check size={11} className="text-white" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Location ──────────────────────────────────────────────────────────
function LocationStep({ location, setLocation }) {
  return (
    <div>
      <div className="text-center mb-8">
        {/* Map pin illustration */}
        <div className="flex justify-center mb-6">
          <svg width="100" height="100" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" fill="#FFF7ED" stroke="#FB923C" strokeOpacity="0.2" strokeWidth="1"/>
            <circle cx="55" cy="55" r="34" fill="white" stroke="#FB923C" strokeOpacity="0.15" strokeWidth="1"/>
            <path d="M55 24 C42 24 32 34 32 47 C32 60 55 86 55 86 C55 86 78 60 78 47 C78 34 68 24 55 24 Z"
              fill="#FB923C" fillOpacity="0.2" stroke="#FB923C" strokeOpacity="0.6" strokeWidth="1.5"/>
            <circle cx="55" cy="47" r="8" fill="#FB923C" fillOpacity="0.7"/>
            {/* Rings */}
            <circle cx="55" cy="88" rx="14" ry="4" fill="#FB923C" fillOpacity="0.12" stroke="none"/>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Où cherchez-vous ?</h2>
        <p className="text-slate-500 text-sm">Ville, arrondissement ou région — vous pourrez affiner plus tard.</p>
      </div>

      <div className="flex items-center gap-3 px-4 h-13 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        <I.MapPin size={16} className="text-slate-400 shrink-0" />
        <input
          value={location} onChange={e => setLocation(e.target.value)}
          placeholder="Ex : Paris, Lyon, Bordeaux…"
          className="flex-1 py-3 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none"
          autoFocus
        />
        {location && (
          <button type="button" onClick={() => setLocation('')} className="text-slate-400 hover:text-slate-600 transition">
            <I.X size={14} />
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        Vous pouvez passer cette étape et configurer votre zone de recherche plus tard.
      </p>
    </div>
  )
}

// ── Step 3: Done ──────────────────────────────────────────────────────────────
function DoneStep({ goal }) {
  const goalLabel = GOALS.find(g => g.id === goal)?.label ?? 'vos objectifs'

  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
        <I.CheckCircle size={44} className="text-emerald-500" />
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="text-2xl font-extrabold text-[#0F172A] mb-2">
        Tout est prêt !
      </motion.h2>

      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
        className="text-slate-500 text-sm leading-relaxed mb-8">
        Votre profil a été configuré pour {goalLabel.toLowerCase()}. Découvrez les annonces qui correspondent à vos critères.
      </motion.p>

      {/* Summary chips */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}
        className="flex items-center justify-center gap-2 flex-wrap mb-8">
        {[
          { Icon: I.CheckCircle, label: 'Compte vérifié'       },
          { Icon: I.CheckCircle, label: 'Objectif défini'      },
          { Icon: I.CheckCircle, label: 'Profil complété'      },
        ].map(({ Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 text-xs font-semibold">
            <Icon size={12} />{label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate()

  const [user,     setUser]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [step,     setStep]     = useState(0)
  const [dir,      setDir]      = useState(1)
  const [saving,   setSaving]   = useState(false)

  // Collected data
  const [goal,     setGoal]     = useState(null)
  const [location, setLocation] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth/login'); return }
      if (session.user?.user_metadata?.onboarded) { navigate('/'); return }
      setUser(session.user)
      setLoading(false)
    })
  }, [navigate])

  const advance = async () => {
    // Before moving to done step, persist data
    if (step === TOTAL_STEPS - 2) {
      setSaving(true)
      await supabase.auth.updateUser({
        data: { goal: goal ?? 'buy', preferred_location: location || null, onboarded: true },
      }).catch(() => {})
      setSaving(false)
    }
    setDir(1)
    setStep(s => s + 1)
  }

  const back = () => { setDir(-1); setStep(s => s - 1) }

  const canAdvance = () => {
    if (step === 1 && !goal) return false
    return true
  }

  const isWelcome = step === 0
  const isDone    = step === TOTAL_STEPS - 1
  const progress  = ((step) / (TOTAL_STEPS - 1)) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="shrink-0">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 lg:px-10">
          <BrandLogo />
          {!isWelcome && !isDone && (
            <span className="text-xs font-semibold text-slate-400">
              Étape {step} sur {TOTAL_STEPS - 2}
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <motion.div className="h-full bg-orange-500 rounded-r-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeInOut' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir}
              variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}>

              {step === 0 && <WelcomeStep  user={user} />}
              {step === 1 && <GoalStep     goal={goal}         setGoal={setGoal} />}
              {step === 2 && <LocationStep location={location} setLocation={setLocation} />}
              {step === 3 && <DoneStep     goal={goal} />}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {!isWelcome && !isDone && (
              <button type="button" onClick={back}
                className="h-12 px-5 rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold text-sm transition flex items-center gap-2">
                <I.ArrowLeft size={15} />Retour
              </button>
            )}

            {isDone ? (
              <button type="button" onClick={() => navigate('/')}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5">
                Explorer PASMAL <I.ArrowRight size={15} />
              </button>
            ) : step === 2 ? (
              /* Location step: skip option */
              <>
                <button type="button" onClick={advance} disabled={saving}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5 disabled:opacity-50">
                  {saving ? <><I.Loader size={15} />Enregistrement…</> : <>Continuer <I.ArrowRight size={15} /></>}
                </button>
                {!location && (
                  <button type="button" onClick={advance} disabled={saving}
                    className="h-12 px-5 rounded-xl border-2 border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-medium text-sm transition whitespace-nowrap">
                    Passer
                  </button>
                )}
              </>
            ) : (
              <button type="button" onClick={advance} disabled={!canAdvance() || saving}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
                {isWelcome ? <>C'est parti <I.ArrowRight size={15} /></> : <>Continuer <I.ArrowRight size={15} /></>}
              </button>
            )}
          </div>

          {/* Step dots */}
          {!isWelcome && !isDone && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: TOTAL_STEPS - 2 }, (_, i) => (
                <div key={i} className={`rounded-full transition-all ${
                  i + 1 === step ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-slate-200'
                }`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 pb-5 flex items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} PASMAL</span>
        {!isDone && (
          <button type="button" onClick={() => navigate('/')} className="hover:text-slate-600 transition">
            Passer l'onboarding
          </button>
        )}
      </div>
    </div>
  )
}
