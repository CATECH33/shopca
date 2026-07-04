import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cb" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cb)" />
      </svg>
      <motion.div className="absolute top-[20%] -left-24 w-80 h-80 bg-emerald-500/[0.10] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 16, 0], y: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[22%] right-0 w-60 h-60 bg-orange-500/[0.08] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -12, 0], y: [0, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration — confirmed envelope */}
        <div className="flex justify-center mb-8">
          <svg width="200" height="175" viewBox="0 0 220 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Envelope body */}
            <rect x="20" y="65" width="180" height="120" rx="10" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.14" strokeWidth="1.5"/>
            {/* Envelope flap (open) */}
            <path d="M20 75 L110 133 L200 75" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Left fold */}
            <path d="M20 185 L80 133" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
            {/* Right fold */}
            <path d="M200 185 L140 133" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
            {/* Big emerald check badge centre */}
            <circle cx="110" cy="60" r="36" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeOpacity="0.35" strokeWidth="1.5"/>
            <circle cx="110" cy="60" r="26" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeOpacity="0.2" strokeWidth="1"/>
            <path d="M97 60 L106 70 L124 48" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95"/>
            {/* Confetti dots */}
            <circle cx="46" cy="40" r="4" fill="#FB923C" fillOpacity="0.45"/>
            <circle cx="174" cy="34" r="3" fill="#10B981" fillOpacity="0.5"/>
            <circle cx="196" cy="56" r="2" fill="#FB923C" fillOpacity="0.3"/>
            <circle cx="26" cy="54" r="2" fill="white" fillOpacity="0.15"/>
            <circle cx="162" cy="22" r="2.5" fill="white" fillOpacity="0.15"/>
            <circle cx="60" cy="20" r="2" fill="#10B981" fillOpacity="0.35"/>
            {/* Stars */}
            <path d="M188 90 L190 84 L192 90 L198 92 L192 94 L190 100 L188 94 L182 92 Z"
              fill="#FB923C" fillOpacity="0.3"/>
            <path d="M30 110 L31.5 106 L33 110 L37 111.5 L33 113 L31.5 117 L30 113 L26 111.5 Z"
              fill="white" fillOpacity="0.1"/>
          </svg>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
            Bienvenue dans<br/>
            <span className="text-orange-400">la communauté SHOPCA.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Votre compte est activé. Accédez à des milliers d'annonces immobilières et gérez vos projets en toute sérénité.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <div className="space-y-3 mb-10">
          {[
            { Icon: I.Home,        title: 'Annonces vérifiées',   body: 'Chaque bien est contrôlé par notre équipe avant publication.' },
            { Icon: I.Bell,        title: 'Alertes personnalisées', body: "Soyez notifié dès qu'un bien correspond à vos critères."      },
            { Icon: I.Shield,      title: 'Transactions sécurisées', body: 'Vos données et paiements sont protégés à chaque étape.'     },
          ].map(({ Icon, title, body }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{title}</div>
                <div className="text-white/45 text-xs mt-0.5 leading-relaxed">{body}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-auto flex items-center gap-5 flex-wrap">
          {[
            { Icon: I.Shield,     label: 'SSL 256-bit'     },
            { Icon: I.Lock,       label: 'RGPD conforme'   },
            { Icon: I.BadgeCheck, label: 'Certifié France' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/30">
              <b.Icon size={12} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CallbackPage() {
  const navigate = useNavigate()
  const [status,    setStatus]    = useState('loading') // 'loading' | 'success' | 'error'
  const [countdown, setCountdown] = useState(4)

  // Listen for SIGNED_IN fired when Supabase processes the confirmation token
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setStatus('success')
      }
    })
    // Also check for an existing session (user refreshed the page after confirming)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus('success')
    })
    const timer = setTimeout(() => {
      setStatus(prev => prev === 'loading' ? 'error' : prev)
    }, 6000)
    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  // Countdown + auto-redirect after success
  useEffect(() => {
    if (status !== 'success') return
    if (countdown === 0) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const isPro = session?.user?.user_metadata?.account_type === 'professional'
        navigate(isPro ? '/pro' : '/onboarding')
      })
      return
    }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown, navigate])

  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6">
          <div className="lg:hidden"><BrandLogo /></div>
          <div className="hidden lg:block" />
          <Link to="/auth/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition">
            <I.ArrowLeft size={14} />
            <span className="text-orange-600 font-semibold">Retour à la connexion</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait">

              {/* ── Loading */}
              {status === 'loading' && (
                <motion.div key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-5" />
                  <h2 className="text-xl font-bold text-[#0F172A] mb-2">Confirmation en cours…</h2>
                  <p className="text-slate-500 text-sm">Validation de votre adresse e-mail.</p>
                </motion.div>
              )}

              {/* ── Success */}
              {status === 'success' && (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="text-center">

                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <I.CheckCircle size={38} className="text-emerald-500" />
                  </motion.div>

                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">E-mail confirmé !</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Votre compte SHOPCA est maintenant actif. Bienvenue !
                  </p>

                  {/* Countdown progress */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 mb-6 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-700 text-xs font-semibold">Redirection automatique</span>
                      <span className="text-emerald-600 text-xs font-bold">{countdown}s</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                      <motion.div className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(countdown / 4) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }} />
                    </div>
                  </div>

                  <button onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession()
                    const isPro = session?.user?.user_metadata?.account_type === 'professional'
                    navigate(isPro ? '/pro' : '/onboarding')
                  }}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5">
                    <I.Home size={15} />Accéder à SHOPCA
                  </button>
                </motion.div>
              )}

              {/* ── Error */}
              {status === 'error' && (
                <motion.div key="error"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center">

                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center mx-auto mb-6">
                    <I.Alert size={38} className="text-rose-400" />
                  </motion.div>

                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Lien invalide</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Ce lien de confirmation a expiré ou a déjà été utilisé. Vous pouvez vous reconnecter si votre compte est déjà actif, ou recommencer l'inscription.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link to="/auth/login"
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                      <I.ArrowRight size={15} />Se connecter
                    </Link>
                    <Link to="/auth/register"
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 text-[#0F172A] font-semibold text-sm transition">
                      Recommencer l'inscription
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-5 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} SHOPCA</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600 transition">Aide</a>
            <a href="#" className="hover:text-slate-600 transition">Confidentialité</a>
            <a href="#" className="hover:text-slate-600 transition">CGU</a>
          </div>
        </div>
      </div>
    </div>
  )
}
