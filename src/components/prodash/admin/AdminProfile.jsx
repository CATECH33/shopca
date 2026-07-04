import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../../lib/ui.jsx'
import { useAuth } from '../../../features/auth/providers/AuthProvider.jsx'
import { useAuthAction } from '../../../features/auth/hooks/useAuth.js'
import { updateProfile } from '../../../features/auth/services/profileService.js'
import { updatePassword } from '../../../features/auth/services/authService.js'
import { uploadAvatar } from '../../../features/auth/services/storageService.js'

export default function AdminProfile({ dark }) {
  const { user, profile, loadProfile } = useAuth()
  const { run, loading: saving, error } = useAuthAction()

  const [tab, setTab] = useState('profile')

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)

  // Password fields
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError,   setPwdError]   = useState('')
  const [pwdSaved,   setPwdSaved]   = useState(false)

  // Preferences
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [notifInApp, setNotifInApp] = useState(true)

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.first_name ?? '')
    setLastName(profile.last_name  ?? '')
    setPhone(profile.phone         ?? '')
    setAvatarUrl(profile.avatar_url ?? '')
    setEmailOptIn(profile.email_opt_in ?? false)
    setNotifInApp(profile.notif_in_app ?? true)
  }, [profile])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile(user.id, { avatar_url: url })
      setAvatarUrl(url)
      await loadProfile(user.id)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    const result = await run(() => updateProfile(user.id, {
      first_name: firstName,
      last_name:  lastName,
      phone,
      email_opt_in: emailOptIn,
      notif_in_app: notifInApp,
    }))
    if (result) {
      await loadProfile(user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const handleChangePassword = async () => {
    setPwdError('')
    if (!newPwd) { setPwdError('Entrez un nouveau mot de passe.'); return }
    if (newPwd.length < 8) { setPwdError('Minimum 8 caractères.'); return }
    if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas.'); return }
    const result = await run(() => updatePassword(newPwd))
    if (result !== null) {
      setNewPwd(''); setConfirmPwd('')
      setPwdSaved(true)
      setTimeout(() => setPwdSaved(false), 2500)
    }
  }

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'
  const inp = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-orange-400'
      : 'bg-white border-slate-200 text-navy-900 placeholder-slate-400 focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.10)]'
  }`

  const tabs = [
    { id: 'profile',      label: 'Profil',      icon: I.User  },
    { id: 'security',     label: 'Sécurité',    icon: I.Key   },
    { id: 'preferences',  label: 'Préférences', icon: I.Settings },
  ]

  const fullName   = [firstName, lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Admin'
  const initials   = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'A'

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto">
      {/* Avatar header */}
      <div className={`rounded-2xl border shadow-sm p-5 flex items-center gap-5 ${bd}`}>
        <label className="relative cursor-pointer shrink-0">
          {avatarUrl
            ? <img src={avatarUrl} alt={fullName} className="w-16 h-16 rounded-2xl object-cover" />
            : <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xl font-extrabold">
                {initials}
              </div>}
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadingAvatar ? <I.Loader size={18} className="text-white" /> : <I.Camera size={18} className="text-white" />}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
        </label>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-extrabold ${tx} truncate`}>{fullName}</p>
          <p className={`text-xs ${sx} truncate`}>{user?.email}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            <I.Shield size={10} /> Super Admin
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition ${
                tab === t.id ? 'bg-orange-500 text-white' : dark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'
              }`}>
              <Icon size={13} /> {t.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Prénom</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inp} placeholder="Prénom" />
              </div>
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Nom</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className={inp} placeholder="Nom" />
              </div>
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Email</label>
              <input value={user?.email ?? ''} disabled
                className={`${inp} opacity-50 cursor-not-allowed`} />
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Téléphone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+33 6 00 00 00 00" />
            </div>
            {error && <p className="text-rose-500 text-xs">{error}</p>}
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Enregistrement…' : saved ? '✓ Profil sauvegardé' : 'Sauvegarder le profil'}
            </button>
          </motion.div>
        )}

        {tab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
            <p className={`text-xs ${sx}`}>Choisissez un mot de passe sécurisé (minimum 8 caractères).</p>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Nouveau mot de passe</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className={inp} placeholder="••••••••" />
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Confirmer</label>
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className={inp} placeholder="••••••••" />
            </div>
            {pwdError && <p className="text-rose-500 text-xs">{pwdError}</p>}
            {error && <p className="text-rose-500 text-xs">{error}</p>}
            <button onClick={handleChangePassword} disabled={saving}
              className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Mise à jour…' : pwdSaved ? '✓ Mot de passe modifié' : 'Changer le mot de passe'}
            </button>
          </motion.div>
        )}

        {tab === 'preferences' && (
          <motion.div key="preferences" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
            <div className="space-y-3">
              {[
                { id: 'emailOptIn', label: 'Recevoir les e-mails marketing', sub: 'Offres, nouveautés et actualités SHOPCA', val: emailOptIn, set: setEmailOptIn },
                { id: 'notifInApp', label: 'Notifications dans l\'application', sub: 'Alertes en temps réel dans le dashboard', val: notifInApp, set: setNotifInApp },
              ].map(({ id, label, sub, val, set }) => (
                <label key={id} className={`flex items-center justify-between gap-4 p-3 rounded-xl cursor-pointer transition ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <div>
                    <p className={`text-sm font-semibold ${tx}`}>{label}</p>
                    <p className={`text-xs ${sx}`}>{sub}</p>
                  </div>
                  <button onClick={() => set(!val)}
                    className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${val ? 'bg-orange-500' : dark ? 'bg-white/20' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${val ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              ))}
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Enregistrement…' : saved ? '✓ Préférences sauvegardées' : 'Sauvegarder les préférences'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
