import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { updateProfile } from '../../features/auth/services/profileService.js'

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

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors duration-200 ${
        checked ? 'bg-orange-500 border-orange-500' : 'bg-slate-200 border-slate-200'
      } disabled:opacity-40`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </button>
  )
}

export default function PageSettings({ dark }) {
  const { user, profile, loadProfile } = useAuth()

  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [phone,        setPhone]        = useState('')
  const [savingAcct,   setSavingAcct]   = useState(false)
  const [acctSaved,    setAcctSaved]    = useState(false)
  const [acctError,    setAcctError]    = useState('')

  const [emailLeads,   setEmailLeads]   = useState(true)
  const [notifInApp,   setNotifInApp]   = useState(true)
  const [savingNotif,  setSavingNotif]  = useState(false)
  const [notifSaved,   setNotifSaved]   = useState(false)

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.first_name ?? '')
    setLastName(profile.last_name  ?? '')
    setPhone(profile.phone         ?? '')
    setEmailLeads(profile.email_opt_in  !== false)
    setNotifInApp(profile.notif_in_app  !== false)
  }, [profile])

  const saveAccount = async () => {
    if (!user) return
    setSavingAcct(true)
    setAcctError('')
    try {
      await updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        phone:      phone.trim(),
      })
      await loadProfile(user.id)
      setAcctSaved(true)
      setTimeout(() => setAcctSaved(false), 2500)
    } catch (err) {
      setAcctError(err?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSavingAcct(false)
    }
  }

  const saveNotifications = async () => {
    if (!user) return
    setSavingNotif(true)
    try {
      await updateProfile(user.id, {
        email_opt_in: emailLeads,
        notif_in_app: notifInApp,
      })
      await loadProfile(user.id)
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2500)
    } catch {}
    finally { setSavingNotif(false) }
  }

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-[#0F172A]'
  const sx = dark ? 'text-white/50' : 'text-slate-400'
  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-orange-400'
      : 'bg-white border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.10)]'
  }`

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      {/* ── Compte ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
        className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
        <Section title="Compte" Icon={I.User} iconColor="#F97316">
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Prénom</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className={inputCls}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Nom</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className={inputCls}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>Téléphone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inputCls}
                placeholder="+33 6 00 00 00 00"
                type="tel"
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${sx}`}>E-mail</label>
              <input
                value={user?.email ?? ''}
                readOnly
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
              <p className={`text-[11px] mt-1 ${sx}`}>Pour changer d'e-mail, contactez le support.</p>
            </div>

            {acctError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                <I.Alert size={14} className="shrink-0" />
                {acctError}
              </div>
            )}

            <button
              onClick={saveAccount}
              disabled={savingAcct}
              className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {savingAcct
                ? <><I.Loader size={14} /> Enregistrement…</>
                : acctSaved
                  ? <><I.Check size={14} /> Sauvegardé</>
                  : 'Sauvegarder'}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* ── Notifications ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
        <Section title="Notifications" Icon={I.Bell} iconColor="#3B82F6">
          <div className="space-y-3 mt-3">
            {[
              {
                label: 'E-mails de leads',
                sub:   'Recevoir un e-mail à chaque nouveau message sur vos annonces',
                value: emailLeads,
                set:   setEmailLeads,
                live:  true,
              },
              {
                label: 'Notifications in-app',
                sub:   'Afficher les alertes dans le tableau de bord',
                value: notifInApp,
                set:   setNotifInApp,
                live:  true,
              },
              {
                label: 'Newsletter SHOPCA',
                sub:   'Conseils, actualités marché et nouveautés — bientôt disponible',
                value: false,
                set:   null,
                live:  false,
              },
              {
                label: 'Notifications navigateur',
                sub:   'Notifications push dans le navigateur — bientôt disponible',
                value: false,
                set:   null,
                live:  false,
              },
            ].map(({ label, sub, value, set, live }) => (
              <div key={label} className={`flex items-center justify-between gap-4 py-2.5 border-b last:border-0 ${dark ? 'border-white/5' : 'border-slate-50'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${live ? tx : sx}`}>{label}</p>
                  <p className={`text-[11px] mt-0.5 ${sx}`}>{sub}</p>
                </div>
                <Toggle checked={value} onChange={set ?? (() => {})} disabled={!live} />
              </div>
            ))}

            <button
              onClick={saveNotifications}
              disabled={savingNotif}
              className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {savingNotif
                ? <><I.Loader size={14} /> Enregistrement…</>
                : notifSaved
                  ? <><I.Check size={14} /> Sauvegardé</>
                  : 'Sauvegarder les préférences'}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* ── Confidentialité ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`rounded-2xl border shadow-sm p-5 space-y-4 ${bd}`}>
        <Section title="Confidentialité" Icon={I.Eye} iconColor="#8B5CF6">
          <div className="space-y-1 mt-3">
            {[
              {
                label: 'Afficher mon téléphone sur les annonces',
                sub:   'Les acheteurs/locataires verront votre numéro directement',
              },
              {
                label: 'Afficher mon e-mail sur les annonces',
                sub:   'Les acheteurs/locataires pourront vous écrire directement',
              },
            ].map(({ label, sub }) => (
              <div key={label} className={`flex items-center justify-between gap-4 py-2.5 border-b last:border-0 ${dark ? 'border-white/5' : 'border-slate-50'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${sx}`}>{label}</p>
                  <p className={`text-[11px] mt-0.5 ${sx}`}>{sub}</p>
                </div>
                <Toggle checked={false} onChange={() => {}} disabled />
              </div>
            ))}
            <p className={`text-[11px] pt-2 ${sx}`}>
              La gestion fine de la confidentialité sera disponible prochainement.
            </p>
          </div>
        </Section>
      </motion.div>

    </div>
  )
}
