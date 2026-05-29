import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthLayout from './AuthLayout.jsx'
import PersonalRegisterForm from './PersonalRegisterForm.jsx'
import ProfessionalRegisterForm from './ProfessionalRegisterForm.jsx'
import { I } from '../lib/ui.jsx'

export default function Register() {
  const [accountType, setAccountType] = useState(null)

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

  if (accountType === 'professional') {
    return (
      <AuthLayout
        title="Créer un compte pro"
        subtitle="Onboarding agence — 5 étapes."
        footer={<>Déjà inscrit ?{' '}<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Se connecter</Link></>}
      >
        <ProfessionalRegisterForm onBack={() => setAccountType(null)} />
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4">
          {[
            { value: 'personal',     label: 'Particulier',   sub: 'Pour vous',         Icon: I.User     },
            { value: 'professional', label: 'Professionnel', sub: 'Pour votre agence', Icon: I.Building },
          ].map(({ value, label, sub, Icon }) => (
            <button key={value} type="button" onClick={() => setAccountType(value)}
              className="relative rounded-2xl border-2 px-4 py-4 text-left transition-all border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 hover:shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 bg-slate-100 text-slate-600">
                <Icon size={17} />
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
              <p className="text-sm font-bold text-navy-900 mt-0.5">{sub}</p>
            </button>
          ))}
        </motion.div>
        <p className="text-center text-xs text-slate-400">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="underline hover:text-navy-900">CGU</a>{' '}et notre{' '}
          <a href="#" className="underline hover:text-navy-900">politique de confidentialité</a>.
        </p>
      </div>
    </AuthLayout>
  )
}
