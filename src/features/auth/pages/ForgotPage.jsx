import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { ShopCAInput } from '../../../components/ui/ShopCAInput'

const TIPS = [
  { Icon: I.Mail,    title: 'Vérifiez vos spams',       body: 'Le lien peut atterrir dans votre dossier indésirables.' },
  { Icon: I.Key,     title: 'Lien valide 24h',           body: 'Le lien de réinitialisation expire après 24 heures.'    },
  { Icon: I.Shield,  title: 'Connexion chiffrée',        body: 'Vos données sont protégées par un chiffrement SSL 256-bit.' },
]

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="fg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fg)" />
      </svg>
      <motion.div className="absolute top-[25%] -left-24 w-80 h-80 bg-orange-500/[0.13] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 18, 0], y: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[22%] right-0 w-60 h-60 bg-indigo-500/[0.07] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer shield */}
            <path d="M100 16 L168 44 L168 108 C168 148 136 174 100 186 C64 174 32 148 32 108 L32 44 Z"
              fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Orange shield glow */}
            <path d="M100 30 L156 54 L156 108 C156 140 128 162 100 172 C72 162 44 140 44 108 L44 54 Z"
              fill="none" stroke="#FB923C" strokeOpacity="0.25" strokeWidth="1" strokeLinejoin="round"/>
            {/* Lock body */}
            <rect x="76" y="102" width="48" height="38" rx="6" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.2" strokeWidth="1.2"/>
            {/* Lock shackle */}
            <path d="M84 102 L84 88 A16 16 0 0 1 116 88 L116 102"
              fill="none" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85"/>
            {/* Keyhole */}
            <circle cx="100" cy="117" r="5" fill="#FB923C" fillOpacity="0.7"/>
            <rect x="98" y="120" width="4" height="10" rx="1" fill="#FB923C" fillOpacity="0.7"/>
            {/* Check mark overlay */}
            <circle cx="148" cy="56" r="16" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1"/>
            <path d="M140 56 L145 62 L156 50" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85"/>
            {/* Decorative dots */}
            <circle cx="42" cy="60" r="3" fill="#FB923C" fillOpacity="0.3"/>
            <circle cx="36" cy="80" r="2" fill="white" fillOpacity="0.1"/>
            <circle cx="164" cy="140" r="2.5" fill="#FB923C" fillOpacity="0.25"/>
          </svg>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
            Votre sécurité,<br/>
            <span className="text-orange-400">notre priorité.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Réinitialisez votre mot de passe en toute sécurité. Le lien envoyé par e-mail est chiffré et à usage unique.
          </p>
        </motion.div>

        {/* Tips */}
        <div className="space-y-3 mb-10">
          {TIPS.map(({ Icon, title, body }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-orange-400" />
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
export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)
  const { loading, error, run } = useAuthAction()

  const submit = async (e) => {
    e.preventDefault()
    const result = await run(() => svc.resetPasswordForEmail(email))
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
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait">

              {/* ── Sent state */}
              {sent ? (
                <motion.div key="sent"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <I.Mail size={36} className="text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Vérifiez vos mails</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-2">
                    Si un compte est associé à
                  </p>
                  <p className="font-semibold text-[#0F172A] text-sm mb-4 break-all">{email}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    vous recevrez un lien de réinitialisation d'ici quelques minutes.
                  </p>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 flex items-start gap-3 text-left mb-8">
                    <I.Alert size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Pensez à vérifier votre dossier <span className="font-semibold">spam ou indésirables</span> si vous ne voyez pas l'e-mail dans les 5 minutes.
                    </p>
                  </div>

                  <Link to="/auth/login"
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                    <I.ArrowLeft size={15} />Retour à la connexion
                  </Link>
                </motion.div>

              ) : (

                /* ── Form state */
                <motion.div key="form"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                  {/* Heading */}
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
                      <I.Key size={22} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Mot de passe oublié ?</h2>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation sécurisé.
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-4">
                    {/* Email */}
                    <ShopCAInput
                      type="email"
                      label="E-mail"
                      placeholder="vous@exemple.fr"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      icon={<I.Mail size={15} />}
                    />

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden">
                          <I.Alert size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
                      {loading
                        ? <><I.Loader size={16} />Envoi…</>
                        : <>Envoyer le lien <I.ArrowRight size={15} /></>}
                    </button>
                  </form>

                  <p className="text-center text-sm text-slate-500 mt-8">
                    Vous vous souvenez ?{' '}
                    <Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Se connecter</Link>
                  </p>
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
