import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

export default function ForgotPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Vérifiez votre boîte mail"
        subtitle={`Si un compte est associé à ${email}, vous recevrez un lien de réinitialisation d'ici quelques minutes.`}
        footer={<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Retour à la connexion</Link>}
      >
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-4 rounded-2xl text-sm flex items-start gap-2.5">
          <I.CheckCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">E-mail envoyé</div>
            <div className="mt-1 text-emerald-700/80">Pensez à vérifier votre dossier spam si vous ne le voyez pas dans les 5 minutes.</div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Mot de passe oublié ?"
      subtitle="Entrez votre adresse e-mail, nous vous enverrons un lien de réinitialisation."
      footer={<Link to="/auth/login" className="text-orange-600 font-semibold hover:underline">Retour à la connexion</Link>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
          <div className="flex items-center gap-3 px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-slate-300 transition">
            <I.Mail size={16} className="text-slate-500" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr"
              className="flex-1 bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </div>
        </div>
        {error && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm">
            <I.Alert size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-50">
          {loading ? <><I.Loader size={16} /> Envoi…</> : <>Envoyer le lien <I.ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
