import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I, PasswordStrength } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'
import { useAuthAction, svc } from '../hooks/useAuth.js'

const TIPS = [
  { Icon: I.Shield,  title: 'Mot de passe fort',     body: 'Mélangez majuscules, chiffres et symboles pour maximiser la sécurité.' },
  { Icon: I.Key,     title: 'Usage unique',           body: 'N\'utilisez pas ce mot de passe sur d\'autres sites ou services.' },
  { Icon: I.Lock,    title: 'Lien à usage unique',    body: 'Ce lien de réinitialisation expire après utilisation.' },
]

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rp)" />
      </svg>
      <motion.div className="absolute top-[25%] -left-24 w-80 h-80 bg-orange-500/[0.13] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 18, 0], y: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[22%] right-0 w-60 h-60 bg-emerald-500/[0.07] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="72" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.1" strokeWidth="1.5"/>
            {/* Inner ring */}
            <circle cx="100" cy="100" r="52" fill="white" fillOpacity="0.03" stroke="#FB923C" strokeOpacity="0.18" strokeWidth="1"/>
            {/* Open lock body */}
            <rect x="72" y="104" width="56" height="44" rx="8" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.2" strokeWidth="1.2"/>
            {/* Open shackle (swung open to the right) */}
            <path d="M80 104 L80 88 A20 20 0 0 1 120 88 L120 78"
              fill="none" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
            {/* Keyhole */}
            <circle cx="100" cy="122" r="6" fill="#FB923C" fillOpacity="0.7"/>
            <rect x="97.5" y="126" width="5" height="11" rx="1.5" fill="#FB923C" fillOpacity="0.7"/>
            {/* Sparkle top-left */}
            <path d="M44 56 L46 50 L48 56 L54 58 L48 60 L46 66 L44 60 L38 58 Z"
              fill="#FB923C" fillOpacity="0.4"/>
            {/* Check badge bottom-right */}
            <circle cx="152" cy="148" r="16" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1"/>
            <path d="M144 148 L149 154 L160 142" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
            {/* Dots */}
            <circle cx="152" cy="56" r="3" fill="#FB923C" fillOpacity="0.3"/>
            <circle cx="40" cy="140" r="2" fill="white" fillOpacity="0.1"/>
            <circle cx="164" cy="90" r="2" fill="#FB923C" fillOpacity="0.2"/>
          </svg>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
            Un nouveau départ,<br/>
            <span className="text-orange-400">en toute sécurité.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Choisissez un mot de passe fort que vous n'utilisez nulle part ailleurs.
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
export default function ResetPage() {
  const navigate = useNavigate()
  const { loading, error, run } = useAuthAction()

  const [sessionReady, setSessionReady] = useState(null) // null=loading, true=ready, false=invalid
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [matchError,  setMatchError]  = useState('')
  const [done,        setDone]        = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    // If no PASSWORD_RECOVERY event fires within 4s, the link is invalid/expired
    const timer = setTimeout(() => {
      setSessionReady(prev => prev === null ? false : prev)
    }, 4000)
    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setMatchError('')
    if (password !== confirm) { setMatchError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6)  { setMatchError('Le mot de passe doit comporter au moins 6 caractères.'); return }
    const result = await run(() => svc.updatePassword(password))
    if (result !== null) setDone(true)
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

              {/* ── Loading state */}
              {sessionReady === null && (
                <motion.div key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">Vérification du lien en cours…</p>
                </motion.div>
              )}

              {/* ── Invalid link state */}
              {sessionReady === false && (
                <motion.div key="invalid"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center">
                  <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center mx-auto mb-6">
                    <I.Alert size={36} className="text-rose-400" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Lien invalide</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Ce lien a expiré ou a déjà été utilisé. Veuillez refaire une demande de réinitialisation de mot de passe.
                  </p>
                  <Link to="/auth/forgot"
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                    <I.Key size={15} />Nouvelle demande
                  </Link>
                </motion.div>
              )}

              {/* ── Success state */}
              {done && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <I.CheckCircle size={36} className="text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Mot de passe mis à jour !</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                  <Link to="/auth/login"
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                    <I.ArrowRight size={15} />Se connecter
                  </Link>
                </motion.div>
              )}

              {/* ── Form state */}
              {sessionReady === true && !done && (
                <motion.div key="form"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                  {/* Heading */}
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
                      <I.Key size={22} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Nouveau mot de passe</h2>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      Choisissez un mot de passe sécurisé d'au moins 6 caractères.
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-4">
                    {/* New password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Nouveau mot de passe
                      </label>
                      <div className="flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <I.Lock size={15} className="text-slate-400 shrink-0" />
                        <input type={showPwd ? 'text' : 'password'} required value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
                        <button type="button" onClick={() => setShowPwd(v => !v)} className="text-slate-400 hover:text-slate-600 transition">
                          {showPwd ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
                        </button>
                      </div>
                      {password && <PasswordStrength password={password} />}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Confirmer le mot de passe
                      </label>
                      <div className="flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <I.Lock size={15} className="text-slate-400 shrink-0" />
                        <input type={showConfirm ? 'text' : 'password'} required value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-slate-400 hover:text-slate-600 transition">
                          {showConfirm ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Validation / API errors */}
                    <AnimatePresence>
                      {(matchError || error) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden">
                          <I.Alert size={15} className="mt-0.5 shrink-0" />
                          <span>{matchError || error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
                      {loading
                        ? <><I.Loader size={16} />Mise à jour…</>
                        : <><I.CheckCircle size={15} />Définir le mot de passe</>}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-5 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} PASMAL</span>
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
