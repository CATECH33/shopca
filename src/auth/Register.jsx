import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from './AuthLayout.jsx'
import PersonalRegisterForm from './PersonalRegisterForm.jsx'
import { I } from '../lib/ui.jsx'

export default function Register() {
  const [accountType, setAccountType] = useState(null)

  /* once an account type is chosen, show its specific form */
  if (accountType === 'personal') {
    return (
      <AuthLayout
        title="Créer un compte"
        subtitle="Renseignez vos informations personnelles."
        footer={<>Déjà inscrit ?{' '}<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Se connecter</Link></>}
      >
        <PersonalRegisterForm onBack={() => setAccountType(null)} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Choisissez votre type de compte pour commencer."
      footer={<>Déjà inscrit ?{' '}<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Se connecter</Link></>}
    >
      <div className="space-y-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: 'personal',     label: 'Particulier',   sub: 'Pour vous',          Icon: I.User,     disabled: false },
              { value: 'professional', label: 'Professionnel', sub: 'Pour votre agence',  Icon: I.Building, disabled: true  },
            ].map(({ value, label, sub, Icon, disabled }) => (
              <button key={value} type="button"
                onClick={() => !disabled && setAccountType(value)}
                disabled={disabled}
                className={`relative rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                  disabled
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 hover:shadow-sm'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                  disabled ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600 group-hover:bg-orange-500 group-hover:text-white'
                }`}>
                  <Icon size={17} />
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm font-bold text-navy-900 mt-0.5">{sub}</p>
                {disabled && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Bientôt
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
        <p className="text-center text-xs text-slate-400">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="underline hover:text-navy-900">CGU</a>{' '}et notre{' '}
          <a href="#" className="underline hover:text-navy-900">politique de confidentialité</a>.
        </p>
      </div>
    </AuthLayout>
  )
}
