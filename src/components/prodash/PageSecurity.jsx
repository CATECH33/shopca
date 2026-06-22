import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'
import { updatePassword, signOut } from '../../features/auth/services/authService.js'

function Section({ title, Icon, iconColor, children }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconColor + '20', color: iconColor }}>
          <Icon size={14} />
        </div>
        <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function PageSecurity({ dark }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [oldPwd,       setOldPwd]       = useState('')
  const [newPwd,       setNewPwd]       = useState('')
  const [confirmPwd,   setConfirmPwd]   = useState('')
  const [showOld,      setShowOld]      = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [savingPwd,    setSavingPwd]    = useState(false)
  const [pwdSuccess,   setPwdSuccess]   = useState(false)
  const [pwdError,     setPwdError]     = useState('')

  const [signingOutAll, setSigningOutAll] = useState(false)

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-[#0F172A]'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-orange-400'
      : 'bg-white border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.10)]'
  }`

  const handleChangePassword = async () => {
    setPwdError('')
    if (!oldPwd) { setPwdError('Saisissez votre mot de passe actuel.'); return }
    if (newPwd.length < 8) { setPwdError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (newPwd !== confirmPwd) { setPwdError('Les deux mots de passe ne correspondent pas.'); return }

    setSavingPwd(true)
    try {
      // Verify old password by signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email:    user.email,
        password: oldPwd,
      })
      if (signInErr) { setPwdError('Mot de passe actuel incorrect.'); return }

      await updatePassword(newPwd)
      setOldPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setPwdSuccess(true)
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (err) {
      setPwdError(err?.message ?? 'Erreur lors du changement de mot de passe.')
    } finally {
      setSavingPwd(false)
    }
  }

  const handleSignOutAll = async () => {
    setSigningOutAll(true)
    try {
      await signOut('global')
      navigate('/auth/login')
    } catch {
      setSigningOutAll(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      {/* ── Changer mot de passe ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
        className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
        <Section title="Changer le mot de passe" Icon={I.Key} iconColor="#F97316">
          <div className="space-y-3 mt-3">

            {/* Old password */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPwd}
                  onChange={e => setOldPwd(e.target.value)}
                  className={`${inputCls} pr-10`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowOld(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${sx} hover:text-orange-500 transition`}>
                  {showOld ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  className={`${inputCls} pr-10`}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${sx} hover:text-orange-500 transition`}>
                  {showNew ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
                </button>
              </div>
              {newPwd.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded-full ${newPwd.length >= 8 ? 'bg-emerald-400' : 'bg-red-300'}`} />
                  <span className={`text-[10px] font-bold ${newPwd.length >= 8 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {newPwd.length >= 8 ? 'Correct' : `${8 - newPwd.length} car. manquants`}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                className={inputCls}
                placeholder="Répétez le mot de passe"
                autoComplete="new-password"
              />
              {confirmPwd.length > 0 && newPwd !== confirmPwd && (
                <p className="text-[11px] text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Error */}
            {pwdError && (
              <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                <I.Alert size={14} className="shrink-0" />
                {pwdError}
              </div>
            )}

            {/* Success */}
            {pwdSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <I.CheckCircle size={14} className="shrink-0" />
                Mot de passe modifié avec succès.
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={savingPwd || !oldPwd || !newPwd || !confirmPwd}
              className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {savingPwd ? <><I.Loader size={14} /> Modification…</> : 'Modifier le mot de passe'}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* ── Sessions actives ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
        <Section title="Sessions actives" Icon={I.Shield} iconColor="#3B82F6">
          <div className="space-y-4 mt-3">

            {/* Current session indicator */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <I.Globe size={15} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${tx}`}>Session actuelle</p>
                <p className={`text-[11px] ${sx}`}>{user?.email} · Navigateur web</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
            </div>

            <p className={`text-xs leading-relaxed ${sx}`}>
              Pour des raisons de sécurité, vous pouvez déconnecter tous vos appareils simultanément. Vous serez redirigé vers la page de connexion.
            </p>

            <button
              onClick={handleSignOutAll}
              disabled={signingOutAll}
              className={`h-10 px-5 rounded-xl border-2 text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 ${
                dark
                  ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                  : 'border-rose-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              {signingOutAll
                ? <><I.Loader size={14} /> Déconnexion…</>
                : <><I.LogOut size={14} /> Déconnecter tous les appareils</>}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* ── Double authentification ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
        <Section title="Double authentification (2FA)" Icon={I.Lock} iconColor="#8B5CF6">
          <div className={`mt-3 flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${tx}`}>Authentification à deux facteurs</p>
              <p className={`text-[11px] mt-0.5 ${sx}`}>Sécurisez votre compte avec une application TOTP — disponible prochainement</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-white/10 text-white/40' : 'bg-slate-200 text-slate-400'}`}>
              Bientôt
            </span>
          </div>
        </Section>
      </motion.div>

    </div>
  )
}
