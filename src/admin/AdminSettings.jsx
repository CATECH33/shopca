import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Badge } from '../lib/ui.jsx'

const SECTIONS = [
  { id: 'general',      label: 'Général',       icon: I.Settings },
  { id: 'team',         label: 'Équipe',         icon: I.Users },
  { id: 'flags',        label: 'Feature Flags',  icon: I.Zap },
  { id: 'integrations', label: 'Intégrations',   icon: I.Globe },
]

const TEAM = [
  { id: 't1', name: 'Jean Kevin PEMOU',  email: 'admin@shopca.fr',   role: 'super_admin', avatar: 'JK', color: '#0B1F3A', lastSeen: 'En ligne',        active: true  },
  { id: 't2', name: 'Sophie Martin',     email: 'mod@shopca.fr',     role: 'moderator',   avatar: 'SM', color: '#F59E0B', lastSeen: 'Il y a 2 h',      active: true  },
  { id: 't3', name: 'Lucas Durand',      email: 'lucas@shopca.fr',   role: 'moderator',   avatar: 'LD', color: '#6366F1', lastSeen: 'Il y a 1 j',      active: true  },
  { id: 't4', name: 'Noémie Lefebvre',   email: 'noemie@shopca.fr',  role: 'admin',       avatar: 'NL', color: '#10B981', lastSeen: 'Il y a 3 j',      active: false },
]

const ROLE_LABEL = {
  super_admin: { label: 'Super Admin', cls: 'bg-rose-50 text-rose-600 ring-rose-200' },
  admin:       { label: 'Admin',       cls: 'bg-orange-50 text-orange-600 ring-orange-200' },
  moderator:   { label: 'Modérateur',  cls: 'bg-amber-50 text-amber-600 ring-amber-200' },
}

const FLAGS_INIT = [
  { id: 'f1', key: 'ai_moderation',        label: 'Modération IA',             desc: 'Analyse automatique des annonces par Claude.',          enabled: true,  env: 'production' },
  { id: 'f2', key: 'stripe_connect',       label: 'Stripe Connect',            desc: 'Paiements split agences activés.',                       enabled: true,  env: 'production' },
  { id: 'f3', key: 'kyc_verification',     label: 'Vérification KYC',          desc: 'Parcours de vérification d\'identité obligatoire.',      enabled: true,  env: 'production' },
  { id: 'f4', key: 'premium_boost',        label: 'Boost Visibilité Premium',  desc: 'Mise en avant × 3 pour les abonnés Business.',           enabled: false, env: 'staging' },
  { id: 'f5', key: 'crm_notifications',    label: 'Notifications CRM',         desc: 'Alertes Slack + e-mail pour nouveaux leads.',             enabled: true,  env: 'production' },
  { id: 'f6', key: 'agency_multi_branch',  label: 'Multi-agences',             desc: 'Un compte agence peut gérer plusieurs branches.',         enabled: false, env: 'staging' },
]

const INTEGRATIONS = [
  { id: 'i1', name: 'Stripe',      logo: '💳', status: 'connected', desc: 'Paiements & abonnements',      detail: 'Live mode · 4 produits actifs' },
  { id: 'i2', name: 'Supabase',    logo: '⚡', status: 'connected', desc: 'Base de données & auth',       detail: 'PostgreSQL · eu-west-1' },
  { id: 'i3', name: 'Anthropic',   logo: '🤖', status: 'connected', desc: 'Modération IA (Claude)',        detail: 'claude-sonnet-4-6 · API v1' },
  { id: 'i4', name: 'Resend',      logo: '📧', status: 'connected', desc: 'Transactionnel e-mail',         detail: '850 e-mails / mois' },
  { id: 'i5', name: 'Cloudinary',  logo: '🖼️', status: 'pending',   desc: 'Stockage & optimisation images', detail: 'Clé API manquante' },
  { id: 'i6', name: 'Mapbox',      logo: '🗺️', status: 'disconnected', desc: 'Cartographie annonces',      detail: 'Non configuré' },
]

export default function AdminSettings() {
  const [section, setSection] = useState('general')
  const [flags, setFlags]     = useState(FLAGS_INIT)
  const [saved,  setSaved]    = useState(false)

  const toggleFlag = (id) => setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Système</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Paramètres</h1>
          <p className="opacity-60 mt-1 text-sm">Configuration plateforme, équipe et intégrations.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm">
          {saved ? <><I.Check size={14} />Sauvegardé !</> : <><I.Download size={14} />Sauvegarder</>}
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${section === id ? 'bg-orange-500 text-white shadow-sm' : 'hover:bg-current/[0.05] opacity-70 hover:opacity-100'}`}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>

              {/* ── Général ─────────────────────────────── */}
              {section === 'general' && (
                <div className="rounded-2xl border border-current/10 p-6 space-y-5">
                  <h2 className="font-bold text-base">Informations plateforme</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Nom de la plateforme', value: 'SHOPCA', type: 'text' },
                      { label: 'Domaine',              value: 'shopca.fr',  type: 'text' },
                      { label: 'E-mail support',       value: 'support@shopca.fr', type: 'email' },
                      { label: 'Téléphone support',    value: '+33 1 23 45 67 89',   type: 'tel' },
                    ].map(({ label, value, type }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-50 mb-1.5">{label}</label>
                        <input type={type} defaultValue={value}
                          className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300 transition" />
                      </div>
                    ))}
                  </div>
                  <hr className="border-current/10" />
                  <h2 className="font-bold text-base">Limites & quotas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Annonces max (Basic)',    value: '5' },
                      { label: 'Annonces max (Business)', value: '∞' },
                      { label: 'Photos max par annonce',  value: '20' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-50 mb-1.5">{label}</label>
                        <input defaultValue={value}
                          className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Équipe ─────────────────────────────── */}
              {section === 'team' && (
                <div className="rounded-2xl border border-current/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-current/10 flex items-center justify-between">
                    <h2 className="font-bold text-base">Membres de l'équipe</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
                      <I.Plus size={12} />Inviter
                    </button>
                  </div>
                  <div className="divide-y divide-current/10">
                    {TEAM.map((member) => {
                      const roleMeta = ROLE_LABEL[member.role] || ROLE_LABEL.moderator
                      return (
                        <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold" style={{ backgroundColor: member.color }}>{member.avatar}</div>
                            {member.active && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{member.name}</div>
                            <div className="text-xs opacity-50 truncate">{member.email}</div>
                          </div>
                          <div className="hidden sm:block text-xs opacity-40 shrink-0">{member.lastSeen}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 shrink-0 ${roleMeta.cls}`}>{roleMeta.label}</span>
                          <button className="opacity-30 hover:opacity-60 transition-opacity shrink-0">
                            <I.MoreH size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Feature Flags ─────────────────────── */}
              {section === 'flags' && (
                <div className="rounded-2xl border border-current/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-current/10">
                    <h2 className="font-bold text-base">Feature Flags</h2>
                    <p className="text-xs opacity-50 mt-0.5">Activez ou désactivez des fonctionnalités sans déploiement.</p>
                  </div>
                  <div className="divide-y divide-current/10">
                    {flags.map((flag) => (
                      <div key={flag.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm">{flag.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${flag.env === 'production' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {flag.env}
                            </span>
                          </div>
                          <div className="text-xs opacity-50">{flag.desc}</div>
                          <div className="text-[10px] font-mono opacity-30 mt-0.5">{flag.key}</div>
                        </div>
                        <button
                          onClick={() => toggleFlag(flag.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${flag.enabled ? 'bg-orange-500' : 'bg-slate-200'}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Intégrations ─────────────────────── */}
              {section === 'integrations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {INTEGRATIONS.map((intg) => {
                    const STATUS = {
                      connected:    { label: 'Connecté',     cls: 'text-emerald-600 bg-emerald-50 ring-emerald-200' },
                      pending:      { label: 'En attente',   cls: 'text-amber-600 bg-amber-50 ring-amber-200' },
                      disconnected: { label: 'Non configuré',cls: 'text-slate-500 bg-slate-100 ring-slate-200' },
                    }
                    const st = STATUS[intg.status]
                    return (
                      <div key={intg.id} className="rounded-2xl border border-current/10 p-5 flex items-start gap-4">
                        <div className="text-2xl w-10 h-10 flex items-center justify-center shrink-0">{intg.logo}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-bold text-sm">{intg.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1 ${st.cls}`}>{st.label}</span>
                          </div>
                          <div className="text-xs opacity-60">{intg.desc}</div>
                          <div className="text-xs opacity-40 mt-0.5">{intg.detail}</div>
                        </div>
                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${intg.status === 'connected' ? 'border border-current/15 hover:bg-current/5' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                          {intg.status === 'connected' ? 'Gérer' : 'Connecter'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
