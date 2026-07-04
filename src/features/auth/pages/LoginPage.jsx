import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { supabase } from '../../../lib/supabase.js'
import { useAuth } from '../providers/AuthProvider.jsx'
import { validateLoginForm } from '../validators/authValidators.js'
import { ShopCAInput } from '../../../components/ui/ShopCAInput'

const FEATURES = [
  { Icon: I.Home,       label: 'Annonces illimitées',      sub: 'Publiez sans restriction'          },
  { Icon: I.Shield,     label: 'Transactions sécurisées',  sub: 'Paiements via Stripe Connect'      },
  { Icon: I.BadgeCheck, label: 'Vérification KYC',         sub: 'Vendeurs et agences certifiés'     },
  { Icon: I.Sparkles,   label: 'Modération IA',            sub: 'Annonces vérifiées en temps réel'  },
]

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lg)" />
      </svg>
      {/* Animated glow blobs */}
      <motion.div className="absolute top-[20%] -left-24 w-80 h-80 bg-orange-500/[0.14] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 20, 0], y: [0, 14, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[20%] right-0 w-64 h-64 bg-indigo-500/[0.08] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -16, 0], y: [0, -12, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        {/* Logo */}
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Badge */}
        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Premium Estate
        </motion.span>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[28px] font-extrabold text-white leading-snug mb-3">
          Le marché immobilier<br />
          <span className="text-orange-400">pour les exigeants.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="text-white/55 text-sm leading-relaxed mb-10">
          Achetez, vendez et investissez en toute confiance grâce à notre plateforme vérifiée et sécurisée.
        </motion.p>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {FEATURES.map(({ Icon, label, sub }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center shrink-0">
                <Icon size={17} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/45 text-xs truncate">{sub}</div>
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <I.Check size={10} className="text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-auto flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {['JD', 'SB', 'ML', 'PK'].map(init => (
              <div key={init}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-[#0D1B2A] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {init}
              </div>
            ))}
          </div>
          <p className="text-white/45 text-xs leading-snug">
            <span className="text-white font-bold">86 400+</span> utilisateurs vérifiés<br />nous font confiance
          </p>
        </motion.div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center gap-5 flex-wrap">
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
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, setError, run } = useAuthAction()
  const { user, loading: authLoading } = useAuth()
  const existingEmail = location.state?.existingEmail || ''
  const [email,        setEmail]        = useState(existingEmail)
  const [password,     setPassword]     = useState('')
  const [oauthLoading, setOauthLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  const signInWithGoogle = async () => {
    setOauthLoading(true)
    await run(() => svc.googleSignIn())
    setOauthLoading(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const err = validateLoginForm({ email, password })
    if (err) { setError(err); return }
    let unconfirmed = false
    const result = await run(async () => {
      try {
        return await svc.signIn(email, password)
      } catch (e) {
        if (/email not confirmed/i.test(e?.message)) unconfirmed = true
        throw e
      }
    })
    if (result) {
      // Fetch real role from profiles table (authoritative source)
      try {
        const { data } = await supabase.from('profiles').select('role').eq('id', result.user.id).single()
        const PRO_ROLES = ['pro_user', 'agency', 'agency_admin', 'super_admin']
        navigate(PRO_ROLES.includes(data?.role) ? '/pro' : '/')
      } catch {
        const isPro = result.user?.user_metadata?.account_type === 'professional'
        navigate(isPro ? '/pro' : '/')
      }
    } else if (unconfirmed) navigate('/auth/verify-pending', { state: { email } })
  }

  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6">
          <div className="lg:hidden"><BrandLogo /></div>
          <div className="hidden lg:block" />
          <Link to="/auth/register" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition">
            Pas de compte ?{' '}
            <span className="text-orange-600 font-semibold ml-1">S'inscrire</span>
            <I.ArrowRight size={14} />
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <motion.div className="w-full max-w-[400px]"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Bon retour parmi nous</h2>
              <p className="text-slate-500 text-sm mt-1">Connectez-vous pour accéder à vos annonces et favoris.</p>
            </div>

            {/* Banner: email already exists */}
            <AnimatePresence>
              {existingEmail && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 px-4 py-3.5 mb-5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                  <I.BadgeCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-800">Ce compte existe déjà.</span>
                    <span className="text-blue-700 ml-1">Connectez-vous avec vos identifiants.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google OAuth */}
            <button type="button" onClick={signInWithGoogle} disabled={oauthLoading || loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold text-[#0F172A] transition disabled:opacity-50 mb-5">
              {oauthLoading
                ? <I.Loader size={16} />
                : <I.Google size={18} />}
              Continuer avec Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">ou par e-mail</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Email + password form */}
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

              {/* Password */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-600">Mot de passe</span>
                  <Link to="/auth/forgot" className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold transition">
                    Oublié ?
                  </Link>
                </div>
                <ShopCAInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  icon={<I.Lock size={15} />}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden">
                    <I.Alert size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button type="submit" disabled={loading || oauthLoading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
                {loading
                  ? <><I.Loader size={16} />Connexion…</>
                  : <>Se connecter <I.ArrowRight size={15} /></>}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-slate-500 mt-8">
              Pas encore de compte ?{' '}
              <Link to="/auth/register" className="text-orange-600 font-semibold hover:underline">Créer un compte</Link>
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
