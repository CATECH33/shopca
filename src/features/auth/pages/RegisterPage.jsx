import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthLayout from '../components/AuthLayout.jsx'
import { FormField, PasswordField } from '../components/FormField.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { validateRegisterForm } from '../validators/authValidators.js'
import { I } from '../../../lib/ui.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { loading, error, setError, run } = useAuthAction()
  const [accountType, setAccountType] = useState('personal')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const err = validateRegisterForm({ email, password })
    if (err) { setError(err); return }
    const result = await run(() => svc.signUp(email, password, { account_type: accountType }))
    if (result) navigate('/auth/verify-pending', { state: { email } })
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Choisissez votre type de compte et renseignez vos informations."
      footer={
        <>Déjà inscrit ?{' '}
          <Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Se connecter</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {/* Account type */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3">
          {[
            { value: 'personal',     label: 'Particulier',   sub: 'Pour vous',         Icon: I.User     },
            { value: 'professional', label: 'Professionnel', sub: 'Pour votre agence', Icon: I.Building },
          ].map(({ value, label, sub, Icon }) => (
            <button key={value} type="button" onClick={() => setAccountType(value)}
              className={`rounded-2xl border-2 px-4 py-3.5 text-left transition-all ${
                accountType === value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'
              }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                accountType === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}><Icon size={15} /></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
              <p className="text-sm font-bold text-navy-900 mt-0.5">{sub}</p>
            </button>
          ))}
        </motion.div>

        <FormField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.fr" icon={I.Mail} />
        <PasswordField label="Mot de passe" value={password} onChange={setPassword} />

        <ErrorBanner msg={error} />

        <button type="submit" disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-50">
          {loading ? <I.Loader size={16} /> : <>Créer mon compte <I.ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-xs text-slate-400">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="underline hover:text-navy-900">CGU</a>{' '}et notre{' '}
          <a href="#" className="underline hover:text-navy-900">politique de confidentialité</a>.
        </p>
      </form>
    </AuthLayout>
  )
}
