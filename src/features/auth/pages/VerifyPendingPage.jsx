import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'

const STEPS = [
  { Icon: I.User,        label: 'Compte créé',          done: true  },
  { Icon: I.Mail,        label: 'E-mail envoyé',         done: true  },
  { Icon: I.BadgeCheck,  label: 'Vérification en cours', done: false },
]

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="vp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vp)" />
      </svg>
      <motion.div className="absolute top-[25%] -left-24 w-80 h-80 bg-orange-500/[0.13] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 16, 0], y: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[20%] right-0 w-60 h-60 bg-emerald-500/[0.06] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -12, 0], y: [0, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration — envelope with floating elements */}
        <div className="flex justify-center mb-8">
          <svg width="200" height="170" viewBox="0 0 220 185" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Envelope body */}
            <rect x="20" y="60" width="180" height="120" rx="10" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.14" strokeWidth="1.5"/>
            {/* Envelope flap */}
            <path d="M20 70 L110 128 L200 70" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Envelope seal (orange diamond) */}
            <rect x="101" y="110" width="18" height="18" rx="3" fill="#FB923C" fillOpacity="0.7"
              transform="rotate(45 110 119)"/>
            {/* Left fold line */}
            <path d="M20 180 L80 128" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
            {/* Right fold line */}
            <path d="M200 180 L140 128" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
            {/* Floating star dots */}
            <circle cx="48" cy="38" r="3" fill="#FB923C" fillOpacity="0.5"/>
            <circle cx="172" cy="28" r="2" fill="white" fillOpacity="0.2"/>
            <circle cx="196" cy="50" r="1.5" fill="#FB923C" fillOpacity="0.3"/>
            <circle cx="24" cy="52" r="1.5" fill="white" fillOpacity="0.15"/>
            {/* Check badge top-right */}
            <circle cx="172" cy="52" r="18" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1"/>
            <path d="M163 52 L169 58 L181 44" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
            {/* Notification dot top-left */}
            <circle cx="48" cy="52" r="12" fill="#FB923C" fillOpacity="0.18" stroke="#FB923C" strokeOpacity="0.3" strokeWidth="1"/>
            <text x="44" y="57" fontSize="12" fill="#FB923C" fillOpacity="0.85" fontWeight="bold">1</text>
          </svg>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
            Plus qu'une étape<br/>
            <span className="text-orange-400">avant de commencer !</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Cliquez sur le lien dans votre boîte mail pour activer votre compte et accéder à toutes les fonctionnalités SHOPCA.
          </p>
        </motion.div>

        {/* Progress steps */}
        <div className="space-y-3 mb-10">
          {STEPS.map(({ Icon, label, done }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                done
                  ? 'bg-emerald-500/20 border-emerald-400/30'
                  : 'bg-orange-500/20 border-orange-400/30'
              }`}>
                {done
                  ? <I.CheckCircle size={16} className="text-emerald-400" />
                  : <Icon size={15} className="text-orange-400" />}
              </div>
              <span className={`text-sm font-medium ${done ? 'text-white/70 line-through decoration-white/30' : 'text-white'}`}>
                {label}
              </span>
              {!done && (
                <span className="ml-auto text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                  En attente
                </span>
              )}
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
export default function VerifyPendingPage() {
  const location = useLocation()
  const email    = location.state?.email || null
  const [sent, setSent] = useState(false)
  const { run, loading, error } = useAuthAction()

  const resend = async () => {
    if (!email) return
    const result = await run(() => svc.resendConfirmation(email))
    if (result !== null) setSent(true)
  }

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
          <motion.div className="w-full max-w-[400px] text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

            {/* Animated mail icon */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center mx-auto mb-6">
              <I.Mail size={36} className="text-orange-500" />
            </motion.div>

            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Vérifiez votre boîte mail</h2>

            {email ? (
              <p className="text-slate-500 text-sm leading-relaxed mb-1">
                Nous avons envoyé un lien de confirmation à
              </p>
            ) : (
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte.
              </p>
            )}
            {email && (
              <p className="font-semibold text-[#0F172A] text-sm mb-6 break-all">{email}</p>
            )}

            {/* Info card */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-4 flex items-start gap-3 text-left mb-6">
              <I.Mail size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <div className="font-semibold text-[#0F172A]">Lien valide pendant 24h</div>
                <div className="text-orange-700/80 mt-0.5 text-xs">
                  Pensez à vérifier votre dossier spam ou indésirables. Vous pouvez renvoyer l'e-mail ci-dessous si besoin.
                </div>
              </div>
            </div>

            {/* Resend button */}
            <button type="button" onClick={resend} disabled={loading || sent || !email}
              className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-all mb-3 ${
                sent
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 text-[#0F172A] disabled:opacity-40 disabled:pointer-events-none'
              }`}>
              {sent
                ? <><I.CheckCircle size={16} className="text-emerald-500" />E-mail renvoyé</>
                : loading
                  ? <><I.Loader size={16} />Envoi…</>
                  : <>Renvoyer l'e-mail de confirmation</>}
            </button>

            {/* Resend error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 px-4 py-3 mb-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden text-left">
                  <I.Alert size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gmail shortcut */}
            <a href="https://mail.google.com" target="_blank" rel="noreferrer"
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-600 transition mb-8">
              <I.Google size={16} />
              Ouvrir Gmail
            </a>

            <p className="text-xs text-slate-400">
              Mauvaise adresse ?{' '}
              <Link to="/auth/register" className="text-orange-600 font-semibold hover:underline">Recommencer l'inscription</Link>
            </p>
          </motion.div>
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
