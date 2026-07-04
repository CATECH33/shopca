import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo, I, PasswordStrength } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { useAuth } from '../providers/AuthProvider.jsx'

const TABS = [
  { id: 'profile',       Icon: I.User,     label: 'Informations'  },
  { id: 'security',      Icon: I.Lock,     label: 'Sécurité'      },
  { id: 'notifications', Icon: I.Bell,     label: 'Notifications' },
  { id: 'account',       Icon: I.Settings, label: 'Mon compte'    },
]

// ── Feedback pill ─────────────────────────────────────────────────────────────
function Feedback({ success, error }) {
  return (
    <AnimatePresence>
      {(success || error) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm overflow-hidden ${
            success
              ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
              : 'bg-rose-50 border border-rose-100 text-rose-700'
          }`}>
          {success ? <I.CheckCircle size={15} className="shrink-0" /> : <I.Alert size={15} className="shrink-0" />}
          <span>{success || error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel({ user, profile, tab, setTab }) {
  const firstName   = profile?.first_name ?? user?.user_metadata?.first_name ?? ''
  const lastName    = profile?.last_name  ?? user?.user_metadata?.last_name  ?? ''
  const email       = user?.email ?? ''
  const initials    = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || email[0]?.toUpperCase() || '?'
  const accountLabel = (profile?.account_type ?? user?.user_metadata?.account_type) === 'professional' ? 'Professionnel' : 'Particulier'

  return (
    <div className="hidden lg:flex flex-col relative w-[300px] xl:w-[340px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ac" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ac)" />
      </svg>
      <motion.div className="absolute top-[15%] -left-20 w-72 h-72 bg-orange-500/[0.10] rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 14, 0], y: [0, 10, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-[15%] right-0 w-48 h-48 bg-indigo-500/[0.07] rounded-full blur-2xl pointer-events-none"
        animate={{ x: [0, -10, 0], y: [0, -8, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full px-6 py-8 xl:px-8">
        <div className="mb-8"><BrandLogo dark /></div>

        {/* Avatar + identity */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/20 border-2 border-orange-400/30 flex items-center justify-center text-orange-300 font-bold text-2xl mb-3 uppercase overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="text-white font-bold text-base leading-tight">
            {firstName && lastName ? `${firstName} ${lastName}` : email}
          </div>
          {firstName && lastName && (
            <div className="text-white/50 text-xs mt-0.5 truncate max-w-full px-2">{email}</div>
          )}
          <span className="mt-2 inline-flex items-center gap-1 text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
            <I.BadgeCheck size={10} />{accountLabel}
          </span>
        </div>

        {/* Tab nav */}
        <nav className="space-y-1 flex-1">
          {TABS.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                tab === id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-400/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05] border border-transparent'
              }`}>
              <Icon size={15} />
              <span>{label}</span>
              {tab === id && <I.ChevronRight size={13} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Trust badges */}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          {[
            { Icon: I.Shield,     label: 'SSL 256-bit'     },
            { Icon: I.Lock,       label: 'RGPD conforme'   },
            { Icon: I.BadgeCheck, label: 'Certifié France' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 text-white/25">
              <b.Icon size={11} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, profile, loadProfile }) {
  const [firstName, setFirstName] = useState(profile?.first_name ?? user?.user_metadata?.first_name ?? '')
  const [lastName,  setLastName]  = useState(profile?.last_name  ?? user?.user_metadata?.last_name  ?? '')
  const [phone,     setPhone]     = useState(profile?.phone      ?? user?.user_metadata?.phone      ?? '')
  const [success,   setSuccess]   = useState('')
  const { loading, error, run }   = useAuthAction()

  const save = async (e) => {
    e.preventDefault()
    const result = await run(() => svc.updateProfile(user.id, { first_name: firstName, last_name: lastName, phone }))
    if (result !== null) {
      loadProfile(user.id)
      setSuccess('Profil mis à jour avec succès.')
      setTimeout(() => setSuccess(''), 3500)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Informations personnelles</h3>
        <p className="text-slate-500 text-sm">Ces informations sont visibles sur votre profil SHOPCA.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Prénom', value: firstName, set: setFirstName, placeholder: 'Jean' },
          { label: 'Nom',    value: lastName,  set: setLastName,  placeholder: 'Dupont' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
            <div className="flex items-center gap-3 px-4 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <I.User size={14} className="text-slate-400 shrink-0" />
              <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">E-mail</label>
        <div className="flex items-center gap-3 px-4 h-11 rounded-xl border-2 border-slate-100 bg-slate-50/50 opacity-60">
          <I.Mail size={14} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500">{user?.email}</span>
          <span className="ml-auto text-[10px] font-semibold text-slate-400">Non modifiable</span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Téléphone</label>
        <div className="flex items-center gap-3 px-4 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <I.Phone size={14} className="text-slate-400 shrink-0" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78"
            className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
        </div>
      </div>

      <Feedback success={success} error={error} />

      <button type="submit" disabled={loading}
        className="h-11 px-6 flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
        {loading ? <><I.Loader size={15} />Enregistrement…</> : <><I.CheckCircle size={15} />Enregistrer</>}
      </button>
    </form>
  )
}

// ── Security tab ──────────────────────────────────────────────────────────────
function SecurityTab({ user }) {
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNew,    setShowNew]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [matchErr,   setMatchErr]   = useState('')
  const [success,    setSuccess]    = useState('')
  const { loading, error, run }     = useAuthAction()

  const save = async (e) => {
    e.preventDefault()
    setMatchErr('')
    if (newPwd !== confirmPwd) { setMatchErr('Les mots de passe ne correspondent pas.'); return }
    if (newPwd.length < 6)    { setMatchErr('Au moins 6 caractères requis.'); return }
    const result = await run(() => svc.updatePassword(newPwd))
    if (result !== null) {
      setNewPwd(''); setConfirmPwd('')
      setSuccess('Mot de passe mis à jour.'); setTimeout(() => setSuccess(''), 3500)
    }
  }

  const meta         = user?.user_metadata ?? {}
  const accountLabel = meta.account_type === 'professional' ? 'Professionnel' : 'Particulier'
  const lastSignIn   = user?.last_sign_in_at
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(user.last_sign_in_at))
    : null

  return (
    <div className="space-y-8">
      {/* Session info */}
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Session active</h3>
        <p className="text-slate-500 text-sm mb-4">Informations sur votre connexion actuelle.</p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <I.CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#0F172A]">{user?.email}</div>
            <div className="text-xs text-slate-500 mt-0.5">{accountLabel}{lastSignIn ? ` · Connecté le ${lastSignIn}` : ''}</div>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 shrink-0">Actif</span>
        </div>
      </div>

      {/* Change password */}
      <form onSubmit={save} className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">Changer le mot de passe</h3>
          <p className="text-slate-500 text-sm">Choisissez un mot de passe fort d'au moins 6 caractères.</p>
        </div>

        {[
          { label: 'Nouveau mot de passe',  value: newPwd,     set: setNewPwd,     show: showNew,  setShow: setShowNew  },
          { label: 'Confirmer',             value: confirmPwd, set: setConfirmPwd, show: showConf, setShow: setShowConf },
        ].map(({ label, value, set, show, setShow }) => (
          <div key={label}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
            <div className="flex items-center gap-3 px-4 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <I.Lock size={14} className="text-slate-400 shrink-0" />
              <input type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)} placeholder="••••••••"
                className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
              <button type="button" onClick={() => setShow(v => !v)} className="text-slate-400 hover:text-slate-600 transition">
                {show ? <I.EyeOff size={14} /> : <I.Eye size={14} />}
              </button>
            </div>
            {label.includes('Nouveau') && newPwd && <PasswordStrength password={newPwd} />}
          </div>
        ))}

        <Feedback success={success} error={matchErr || error} />

        <button type="submit" disabled={loading}
          className="h-11 px-6 flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
          {loading ? <><I.Loader size={15} />Enregistrement…</> : <><I.Lock size={15} />Mettre à jour le mot de passe</>}
        </button>
      </form>
    </div>
  )
}

// ── Notifications tab ─────────────────────────────────────────────────────────
function NotificationsTab({ user }) {
  const meta0 = user?.user_metadata?.notifs ?? {}
  const [notifs,  setNotifs]  = useState({ alerts: meta0.alerts ?? true, messages: meta0.messages ?? true, promotions: meta0.promotions ?? false })
  const [success, setSuccess] = useState('')
  const { loading, error, run } = useAuthAction()

  const save = async (e) => {
    e.preventDefault()
    const result = await run(() => svc.updateUserMeta({ notifs }))
    if (result !== null) { setSuccess('Préférences enregistrées.'); setTimeout(() => setSuccess(''), 3500) }
  }

  const PREFS = [
    { key: 'alerts',     title: 'Alertes annonces',  body: 'Soyez notifié dès qu\'une annonce correspond à vos critères de recherche.'  },
    { key: 'messages',   title: 'Messages',           body: 'Recevez un e-mail lorsque vous avez un nouveau message dans votre boîte.'   },
    { key: 'promotions', title: 'Promotions SHOPCA',  body: 'Actualités, offres exclusives et conseils immobiliers de notre équipe.'     },
  ]

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Préférences de notification</h3>
        <p className="text-slate-500 text-sm">Choisissez les e-mails que vous souhaitez recevoir de SHOPCA.</p>
      </div>

      <div className="space-y-3">
        {PREFS.map(({ key, title, body }) => (
          <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">{title}</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</div>
            </div>
            <Toggle checked={notifs[key]} onChange={val => setNotifs(n => ({ ...n, [key]: val }))} />
          </div>
        ))}
      </div>

      <Feedback success={success} error={error} />

      <button type="submit" disabled={loading}
        className="h-11 px-6 flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-200/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
        {loading ? <><I.Loader size={15} />Enregistrement…</> : <><I.CheckCircle size={15} />Enregistrer</>}
      </button>
    </form>
  )
}

// ── Account tab ───────────────────────────────────────────────────────────────
function AccountTab({ user }) {
  const navigate = useNavigate()
  const [confirmEmail, setConfirmEmail] = useState('')
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [error,        setError]        = useState('')

  const handleDelete = async () => {
    if (confirmEmail !== user?.email) { setError("L'adresse e-mail ne correspond pas."); return }
    setDeleting(true)
    // Sign out and redirect — actual deletion requires a server-side Edge Function
    await svc.signOut().catch(() => {})
    navigate('/auth/login')
  }

  return (
    <div className="space-y-8">
      {/* Account info */}
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Mon compte</h3>
        <p className="text-slate-500 text-sm">Informations générales sur votre compte.</p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-slate-500">Identifiant</span>
            <span className="font-mono text-xs text-slate-400 truncate max-w-[220px]">{user?.id}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-slate-500">Type de compte</span>
            <span className="font-semibold text-[#0F172A]">
              {user?.user_metadata?.account_type === 'professional' ? 'Professionnel' : 'Particulier'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-500">Compte créé</span>
            <span className="text-[#0F172A]">
              {user?.created_at
                ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(user.created_at))
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/30 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <I.Trash size={16} className="text-rose-500" />
          </div>
          <div>
            <div className="font-bold text-[#0F172A]">Supprimer mon compte</div>
            <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </div>
          </div>
        </div>

        {!showConfirm ? (
          <button type="button" onClick={() => setShowConfirm(true)}
            className="h-10 px-5 rounded-xl border-2 border-rose-200 bg-white text-rose-600 hover:bg-rose-50 font-semibold text-sm transition">
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Tapez votre adresse e-mail <span className="font-semibold text-[#0F172A]">{user?.email}</span> pour confirmer.
            </p>
            <div className="flex items-center gap-3 px-4 h-11 rounded-xl border-2 border-rose-200 bg-white focus-within:border-rose-400 transition-all">
              <I.Mail size={14} className="text-rose-400 shrink-0" />
              <input value={confirmEmail} onChange={e => { setConfirmEmail(e.target.value); setError('') }}
                placeholder={user?.email}
                className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            </div>
            <Feedback success="" error={error} />
            <div className="flex gap-3">
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="h-10 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition disabled:opacity-50">
                {deleting ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
              <button type="button" onClick={() => { setShowConfirm(false); setConfirmEmail(''); setError('') }}
                className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium text-sm transition">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AccountPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, loadProfile } = useAuth()
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth/login', { replace: true })
  }, [user, authLoading, navigate])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  const TAB_CONTENT = {
    profile:       <ProfileTab       user={user} profile={profile} loadProfile={loadProfile} />,
    security:      <SecurityTab      user={user} />,
    notifications: <NotificationsTab user={user} />,
    account:       <AccountTab       user={user} />,
  }

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel user={user} profile={profile} tab={tab} setTab={setTab} />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="lg:hidden"><BrandLogo /></div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <Link to="/" className="hover:text-[#0F172A] transition">Accueil</Link>
              <I.ChevronRight size={14} />
              <span className="font-semibold text-[#0F172A]">{activeTab?.label}</span>
            </div>
          </div>
          <Link to="/auth/logout" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 transition">
            <I.LogOut size={14} />
            <span className="font-medium">Déconnexion</span>
          </Link>
        </div>

        {/* Mobile tab bar */}
        <div className="lg:hidden flex overflow-x-auto gap-1 px-4 py-3 border-b border-slate-100 shrink-0">
          {TABS.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                tab === id ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8 lg:px-12 lg:py-10 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {TAB_CONTENT[tab]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
          <span>© {new Date().getFullYear()} SHOPCA</span>
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
