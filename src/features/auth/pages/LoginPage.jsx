import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { validateLoginForm } from '../validators/authValidators.js'

const FEATURES = [
  { Icon: I.Home,       label: 'Annonces illimitées',     sub: 'Publiez sans restriction'       },
  { Icon: I.Shield,     label: 'Transactions sécurisées', sub: 'Paiements via Stripe Connect'   },
  { Icon: I.BadgeCheck, label: 'Vérification KYC',        sub: 'Vendeurs et agences certifiés'  },
  { Icon: I.Sparkles,   label: 'Modération IA',           sub: 'Annonces vérifiées en temps réel' },
]

const BG = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loading, error, setError, run } = useAuthAction()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const signInWithGoogle = async () => {
    setOauthLoading(true)
    await run(() => svc.googleSignIn())
    setOauthLoading(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const err = validateLoginForm({ email, password })
    if (err) { setError(err); return }
    const result = await run(() => svc.signIn(email, password))
    if (result) navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden bg-[#0B1F3A]">
        <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A]/90 to-[#0B1F3A]/70" />
        <motion.div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none"
          animate={{ x: [0, 24, 0], y: [0, 18, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500 opacity-10 blur-3xl pointer-events-none"
          animate={{ x: [0, -20, 0], y: [0, -16, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <BrandLogo dark />
          <div className="flex-1 flex flex-col justify-center mt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" /> Premium Estate
              </span>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                Le marché immobilier<br /><span className="text-orange-400">pour les exigeants.</span>
              </h1>
              <p className="text-slate-300 text-base leading-relaxed max-w-md mb-10">
                Achetez, vendez et investissez en toute confiance grâce à notre plateforme vérifiée et sécurisée.
              </p>
              <div className="space-y-4">
                {FEATURES.map(({ Icon, label, sub }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{label}</div>
                      <div className="text-slate-400 text-xs">{sub}</div>
                    </div>
                    <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <I.Check size={10} className="text-emerald-400" strokeWidth={3} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3 mt-12">
            <div className="flex -space-x-2.5">
              {['JD', 'SB', 'ML', 'PK'].map(init => (
                <div key={init} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 border-2 border-[#0B1F3A] flex items-center justify-center text-[10px] font-bold text-white">{init}</div>
              ))}
            </div>
            <p className="text-slate-400 text-xs"><span className="text-white font-bold">86 400+</span> utilisateurs vérifiés nous font confiance</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden px-6 pt-8 pb-2">
          <Link to="/"><BrandLogo /></Link>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <motion.div className="w-full max-w-md mx-auto" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <h2 className="text-2xl xl:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1">Bon retour parmi nous</h2>
            <p className="text-slate-500 text-sm mb-8">Connectez-vous pour accéder à vos annonces et favoris.</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
                <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition">
                  <I.Mail size={16} className="text-slate-400 shrink-0" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr"
                    className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Mot de passe</label>
                  <Link to="/auth/forgot" className="text-xs text-orange-600 hover:text-orange-700 font-medium">Oublié ?</Link>
                </div>
                <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition">
                  <I.Lock size={16} className="text-slate-400 shrink-0" />
                  <input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
                  <button type="button" onClick={() => setShow(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {show ? <I.EyeOff size={16} /> : <I.Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm">
                  <I.Alert size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                {loading ? <><I.Loader size={16} /> Connexion…</> : <>Se connecter <I.ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="mt-8 text-sm text-slate-500 text-center">
              Pas encore de compte ?{' '}
              <Link to="/auth/register" className="text-orange-600 font-semibold hover:underline">Créer un compte</Link>
            </p>
          </motion.div>
        </div>
        <div className="px-10 pb-6 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} PASMAL</span>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-slate-600">Aide</Link>
            <Link to="#" className="hover:text-slate-600">Confidentialité</Link>
            <Link to="#" className="hover:text-slate-600">CGU</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
