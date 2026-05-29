import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

export default function VerifyPendingPage() {
  const location = useLocation()
  const email    = location.state?.email || 'votre adresse'
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const resend = async () => {
    if (!location.state?.email) return
    setLoading(true)
    try {
      await supabase.auth.resend({ type: 'signup', email: location.state.email })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Vérifiez votre boîte mail"
      subtitle={`Nous avons envoyé un lien de confirmation à ${email}. Cliquez dessus pour activer votre compte.`}
      footer={<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Retour à la connexion</Link>}
    >
      <div className="bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl p-5 flex items-start gap-3">
        <I.Mail size={20} className="mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <div className="font-semibold text-navy-900">Lien valide pendant 24h</div>
          <div className="text-orange-700/85 mt-1">Pensez à vérifier votre dossier spam. Vous pouvez relancer l'e-mail si besoin.</div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <button type="button" disabled={loading || sent} onClick={resend}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-sm font-semibold text-navy-900 transition disabled:opacity-50">
          {sent ? <><I.CheckCircle size={16} className="text-emerald-500" /> E-mail renvoyé</>
                : loading ? <><I.Loader size={16} /> Envoi…</>
                : <>Renvoyer l'e-mail de confirmation</>}
        </button>
        <a href="https://mail.google.com" target="_blank" rel="noreferrer"
          className="text-center text-sm text-slate-600 hover:text-orange-600">
          Ouvrir Gmail →
        </a>
      </div>
    </AuthLayout>
  )
}
