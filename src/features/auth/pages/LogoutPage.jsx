import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

const formatDate = (iso) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : null

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lo)" />
      </svg>
      <motion.div className="absolute top-[22%] -left-24 w-80 h-80 bg-orange-500/[0.10] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 16, 0], y: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[20%] right-0 w-60 h-60 bg-indigo-500/[0.06] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer shield */}
            <path d="M100 16 L168 44 L168 108 C168 148 136 174 100 186 C64 174 32 148 32 108 L32 44 Z"
              fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Orange inner shield */}
            <path d="M100 30 L156 54 L156 108 C156 140 128 162 100 172 C72 162 44 140 44 108 L44 54 Z"
              fill="none" stroke="#FB923C" strokeOpacity="0.2" strokeWidth="1" strokeLinejoin="round"/>
            {/* User silhouette */}
            <circle cx="100" cy="90" r="16" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.25" strokeWidth="1.2"/>
            <path d="M70 138 C70 118 130 118 130 138" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Check badge */}
            <circle cx="148" cy="56" r="16" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1"/>
            <path d="M140 56 L145 62 L156 50" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85"/>
            {/* Dots */}
            <circle cx="44" cy="62" r="3" fill="#FB923C" fillOpacity="0.3"/>
            <circle cx="38" cy="80" r="2" fill="white" fillOpacity="0.1"/>
            <circle cx="164" cy="140" r="2.5" fill="#FB923C" fillOpacity="0.2"/>
          </svg>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
            Votre session,<br/>
            <span className="text-orange-400">votre contrôle.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Déconnectez-vous de cet appareil ou de tous vos appareils simultanément pour protéger votre compte.
          </p>
        </motion.div>

        {/* Tips */}
        <div className="space-y-3 mb-10">
          {[
            { Icon: I.Shield,    title: 'Déconnexion sécurisée',      body: 'Votre session est immédiatement invalidée côté serveur.'         },
            { Icon: I.Globe,     title: 'Tous les appareils',          body: 'Déconnectez-vous de tous vos appareils en un seul clic.'          },
            { Icon: I.Lock,      title: 'Compte protégé',              body: 'Personne ne pourra accéder à votre compte après déconnexion.'     },
          ].map(({ Icon, title, body }, i) => (
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
export default function LogoutPage() {
  const navigate = useNavigate()

  // 'loading' | 'confirm' | 'signing-out' | 'done' | 'guest'
  const [status,    setStatus]    = useState('loading')
  const [user,      setUser]      = useState(null)
  const [scopeDone, setScopeDone] = useState('local')
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); setStatus('confirm') }
      else setStatus('guest')
    })
  }, [])

  const handleSignOut = async (scope) => {
    setScopeDone(scope)
    setStatus('signing-out')
    await supabase.auth.signOut({ scope }).catch(() => {})
    setStatus('done')
  }

  // Countdown after done
  useEffect(() => {
    if (status !== 'done') return
    if (countdown === 0) { navigate('/auth/login'); return }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown, navigate])

  // Derived session info
  const meta          = user?.user_metadata ?? {}
  const email         = user?.email ?? ''
  const firstName     = meta.first_name ?? ''
  const lastName      = meta.last_name  ?? ''
  const initials      = (firstName[0] ?? '') + (lastName[0] ?? '') || email[0]?.toUpperCase() || '?'
  const accountLabel  = meta.account_type === 'professional' ? 'Compte Professionnel' : 'Compte Particulier'
  const lastSignIn    = formatDate(user?.last_sign_in_at)

  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6">
          <div className="lg:hidden"><BrandLogo /></div>
          <div className="hidden lg:block" />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition">
            <I.ArrowLeft size={14} />
            <span className="text-orange-600 font-semibold">Retour à l'accueil</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            <AnimatePresence mode="wait">

              {/* ── Loading */}
              {status === 'loading' && (
                <motion.div key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">Chargement de la session…</p>
                </motion.div>
              )}

              {/* ── Not logged in */}
              {status === 'guest' && (
                <motion.div key="guest"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center mx-auto mb-6">
                    <I.User size={36} className="text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Aucune session active</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Vous n'êtes pas connecté à PASMAL en ce moment.
                  </p>
                  <Link to="/auth/login"
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                    <I.ArrowRight size={15} />Se connecter
                  </Link>
                </motion.div>
              )}

              {/* ── Confirm */}
              {status === 'confirm' && (
                <motion.div key="confirm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
                      <I.LogOut size={22} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Déconnexion</h2>
                    <p className="text-slate-500 text-sm mt-1">Choisissez comment vous souhaitez vous déconnecter.</p>
                  </div>

                  {/* Session card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-base shrink-0 uppercase">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0F172A] text-sm truncate">{email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{accountLabel}</div>
                      {lastSignIn && (
                        <div className="text-slate-400 text-[10px] mt-0.5">Dernière connexion : {lastSignIn}</div>
                      )}
                    </div>
                    <div className="ml-auto shrink-0">
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-bold">
                        <I.CheckCircle size={10} />Actif
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button onClick={() => handleSignOut('local')}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:-translate-y-0.5">
                      <I.LogOut size={16} />Se déconnecter de cet appareil
                    </button>

                    <button onClick={() => handleSignOut('global')}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition-all">
                      <I.Globe size={16} />Se déconnecter de tous les appareils
                    </button>

                    <button onClick={() => navigate(-1)}
                      className="w-full h-10 flex items-center justify-center gap-2 text-slate-500 hover:text-[#0F172A] text-sm font-medium transition">
                      <I.ArrowLeft size={14} />Annuler
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Signing out */}
              {status === 'signing-out' && (
                <motion.div key="signing-out"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-5" />
                  <p className="text-slate-600 font-medium">Déconnexion en cours…</p>
                  <p className="text-slate-400 text-sm mt-1">Invalidation de votre session.</p>
                </motion.div>
              )}

              {/* ── Done */}
              {status === 'done' && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="text-center">

                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <I.CheckCircle size={38} className="text-emerald-500" />
                  </motion.div>

                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Vous êtes déconnecté</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {scopeDone === 'global'
                      ? 'Vous avez été déconnecté de tous vos appareils.'
                      : 'Vous avez été déconnecté de cet appareil.'}
                  </p>

                  {/* Countdown */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 mb-6 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 text-xs font-semibold">Redirection vers la connexion</span>
                      <span className="text-slate-500 text-xs font-bold">{countdown}s</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <motion.div className="h-full bg-orange-400 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(countdown / 4) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }} />
                    </div>
                  </div>

                  <Link to="/auth/login"
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200">
                    <I.ArrowRight size={15} />Se reconnecter
                  </Link>
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
