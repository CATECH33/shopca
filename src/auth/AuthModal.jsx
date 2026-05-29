import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../lib/ui.jsx'
import { LeftPanel } from './AuthLayout.jsx'
import { FormField, PasswordField } from './components/FormField.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import { useAuthAction, svc } from './hooks/useAuth.js'
import { validateLoginForm, validateRegisterForm } from './validators/authValidators.js'

/* ── Login form ───────────────────────────────────────────────── */
function LoginForm({ onSuccess }) {
  const { loading, error, setError, run } = useAuthAction()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const err = validateLoginForm({ email, password })
    if (err) { setError(err); return }
    const result = await run(() => svc.signIn(email, password))
    if (result) onSuccess()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <button type="button" onClick={() => svc.googleSignIn()}
        className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white font-semibold text-sm text-navy-800 transition hover:shadow-sm">
        <I.Google size={18} /> Continuer avec Google
      </button>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <div className="flex-1 h-px bg-slate-100" /><span>ou par e-mail</span><div className="flex-1 h-px bg-slate-100" />
      </div>
      <FormField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.fr" icon={I.Mail} />
      <PasswordField value={password} onChange={setPassword} />
      <div className="flex justify-end">
        <a href="/auth/forgot" className="text-xs text-orange-500 hover:text-orange-600 font-medium">Mot de passe oublié ?</a>
      </div>
      <ErrorBanner msg={error} />
      <button type="submit" disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-50">
        {loading ? <I.Loader size={16} /> : <>Se connecter <I.ArrowRight size={16} /></>}
      </button>
    </form>
  )
}

/* ── Register form ────────────────────────────────────────────── */
function RegisterForm({ onSuccess }) {
  const { loading, error, setError, run } = useAuthAction()
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('personal')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const err = validateRegisterForm({ email, password })
    if (err) { setError(err); return }
    const result = await run(() => svc.signUp(email, password, { account_type: accountType }))
    if (result) { onSuccess(); navigate('/auth/verify-pending', { state: { email } }) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'personal',     label: 'Particulier',   Icon: I.User     },
          { value: 'professional', label: 'Professionnel', Icon: I.Building },
        ].map(({ value, label, Icon }) => (
          <button key={value} type="button" onClick={() => setAccountType(value)}
            className={`rounded-2xl border-2 px-3 py-2.5 text-left transition-all ${
              accountType === value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
              accountType === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}><Icon size={14} /></div>
            <p className="text-xs font-bold text-navy-900">{label}</p>
          </button>
        ))}
      </div>
      <FormField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.fr" icon={I.Mail} />
      <PasswordField value={password} onChange={setPassword} />
      <ErrorBanner msg={error} />
      <button type="submit" disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-50">
        {loading ? <I.Loader size={16} /> : <>Continuer <I.ArrowRight size={16} /></>}
      </button>
    </form>
  )
}

/* ── AuthModal ────────────────────────────────────────────────── */
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)

  useEffect(() => { if (isOpen) setMode(initialMode) }, [isOpen, initialMode])

  const handleClose = () => { onClose(); setTimeout(() => setMode('login'), 300) }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[199] bg-navy-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 290 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden flex pointer-events-auto"
              style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
              <button onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 shadow-sm hover:bg-white flex items-center justify-center text-slate-400 hover:text-navy-900 transition hover:scale-110">
                <I.X size={15} />
              </button>

              <LeftPanel />

              <div className="flex-1 overflow-y-auto">
                <div className="min-h-full flex flex-col justify-center px-8 py-10">
                  <div className="max-w-sm mx-auto w-full">
                    <AnimatePresence mode="wait">
                      <motion.div key={mode}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-6">
                        <h2 className="text-[22px] font-extrabold text-navy-900">
                          {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                          {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
                          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-orange-500 hover:text-orange-600 font-semibold">
                            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                          </button>
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      {mode === 'login' ? (
                        <motion.div key="login"
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                          <LoginForm onSuccess={handleClose} />
                        </motion.div>
                      ) : (
                        <motion.div key="register"
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                          <RegisterForm onSuccess={handleClose} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
