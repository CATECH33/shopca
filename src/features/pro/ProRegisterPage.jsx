import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo } from '../../lib/ui.jsx'
import { svc } from '../auth/hooks/useAuth.js'

const PRO_DRAFT_KEY = 'pasmal_pro_draft'

function UploadZone({ label, hint, accept, icon: Icon = I.Upload, file, onFile, optional = false }) {
  const ref = useRef(null)
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
        {optional && <span className="text-[10px] text-slate-400">(optionnel)</span>}
      </div>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all group ${
          file
            ? 'border-emerald-400 bg-emerald-50/60'
            : 'border-slate-200 hover:border-orange-300 bg-slate-50/60 hover:bg-orange-50/20'
        }`}
      >
        <input ref={ref} type="file" accept={accept} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
        {file ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <I.Check size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-emerald-700 truncate">{file.name}</div>
              <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · fichier sélectionné</div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onFile(null) }}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
              <I.X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-orange-300 group-hover:bg-orange-50 flex items-center justify-center shrink-0 transition-colors">
              <Icon size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 group-hover:text-navy-900 transition-colors">
                Cliquez pour importer
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{hint}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, value, set, placeholder, hint, type = 'text', required = false }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="flex items-center gap-3 px-4 h-12 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-300 transition-all">
        <Icon size={15} className="text-slate-400 shrink-0" />
        <input type={type} required={required} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
      </div>
      {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}

function AgencyPreviewCard({ agencyName, city, agencyType, logoUrl, plan }) {
  const TYPE_LABELS = { agence: 'Agence immobilière', agent: 'Agent indépendant', promoteur: 'Promoteur immobilier', investisseur: 'Investisseur' }
  const PLAN_STYLES = { starter: 'text-slate-600 bg-slate-50 border-slate-200', business: 'text-orange-600 bg-orange-50 border-orange-200', enterprise: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  const PLAN_LABELS = { starter: 'Starter', business: 'Business ★', enterprise: 'Enterprise' }
  const initials = agencyName ? agencyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AG'
  return (
    <div className="sticky top-28">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        Aperçu en direct
      </div>
      <motion.div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="h-20 bg-gradient-to-br from-[#0B1F3A] via-[#0F2D50] to-[#1a3a5e] relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(249,115,22,0.25) 0%, transparent 60%)' }} />
        </div>
        <div className="px-5 -mt-7 mb-3 flex items-end justify-between">
          <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl
              ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-extrabold text-base">{initials}</span>
            }
          </div>
          {plan && PLAN_LABELS[plan] && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLES[plan]}`}>{PLAN_LABELS[plan]}</span>
          )}
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-extrabold text-[#0F172A] text-base leading-tight">
              {agencyName || <span className="text-slate-300 font-normal text-sm">Nom de l'agence</span>}
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              <I.BadgeCheck size={10} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">En attente</span>
            </span>
          </div>
          <div className="text-xs text-slate-500 mb-3">
            {TYPE_LABELS[agencyType] || 'Type de structure'}{city ? ` · ${city}` : ''}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <div className="text-base font-extrabold text-[#0F172A]">0</div>
              <div className="text-[10px] text-slate-500">Annonces</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <div className="text-base font-extrabold text-[#0F172A]">—</div>
              <div className="text-[10px] text-slate-500">Avis clients</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <I.Check size={11} className="shrink-0" />
            <span>Vérification KYC en cours</span>
          </div>
        </div>
      </motion.div>
      <div className="mt-4 space-y-1.5">
        {[
          { label: 'Informations entreprise', done: !!agencyName },
          { label: 'Vérification identité',   done: false },
          { label: 'Branding agence',          done: !!logoUrl },
          { label: 'Abonnement choisi',        done: !!plan },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              {done && <I.Check size={8} className="text-white" />}
            </div>
            <span className={done ? 'text-[#0F172A] font-medium' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WizStep1({ agencyType, setAgencyType, agencyName, setAgencyName, siret, setSiret, phone, setPhone, city, setCity, address, setAddress, website, setWebsite }) {
  const TYPES = [
    { value: 'agence',       icon: I.Building,    label: 'Agence',       desc: 'Structure avec salariés' },
    { value: 'agent',        icon: I.User,         label: 'Agent',        desc: 'Auto-entrepreneur, EI' },
    { value: 'promoteur',    icon: I.Home,         label: 'Promoteur',    desc: 'Construction & VEFA' },
    { value: 'investisseur', icon: I.TrendingUp,   label: 'Investisseur', desc: 'Patrimoine & gestion' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Informations entreprise</h2>
        <p className="text-slate-500 text-sm">Parlez-nous de votre structure professionnelle.</p>
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Type de structure *</div>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(({ value, icon: Icon, label, desc }) => {
            const active = agencyType === value
            return (
              <motion.button key={value} type="button" onClick={() => setAgencyType(value)}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${active ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={16} />
                </div>
                <div className="text-sm font-bold text-[#0F172A]">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                {active && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <I.Check size={10} className="text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
      <div className="space-y-4">
        <Field label="Nom de l'agence *" icon={I.Building} value={agencyName} set={setAgencyName} placeholder="Agence Immobilière du Lac" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="SIRET *" icon={I.BadgeCheck} value={siret} set={setSiret} placeholder="12345678900012" hint="14 chiffres" required />
          <Field label="Téléphone *" icon={I.Phone} value={phone} set={setPhone} placeholder="+33 6 12 34 56 78" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ville *" icon={I.MapPin} value={city} set={setCity} placeholder="Paris" required />
          <Field label="Site web" icon={I.Globe} value={website} set={setWebsite} placeholder="https://mon-agence.fr" />
        </div>
        <Field label="Adresse professionnelle" icon={I.MapPin} value={address} set={setAddress} placeholder="12 rue du Commerce, 75011 Paris" />
      </div>
    </div>
  )
}

function WizStep2({ fullName, setFullName, email, setEmail, password, setPassword, confirmPwd, setConfirmPwd, show, setShow }) {
  const score = [password.length >= 6, password.length >= 10, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const bars   = ['bg-rose-400', 'bg-rose-400', 'bg-amber-400', 'bg-amber-400', 'bg-emerald-500']
  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent']
  const match  = confirmPwd.length > 0 && password === confirmPwd
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Vérification identité</h2>
        <p className="text-slate-500 text-sm">Vos identifiants de connexion sécurisés.</p>
      </div>
      <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <I.Shield size={17} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">Vos informations sont protégées par chiffrement SSL 256-bit et ne seront jamais partagées.</p>
      </div>
      <div className="space-y-4">
        <Field label="Nom complet du responsable *" icon={I.User} value={fullName} set={setFullName} placeholder="Jean Kevin PEMOU" required />
        <Field label="E-mail professionnel *" icon={I.Mail} value={email} set={setEmail} placeholder="direction@agence.fr" type="email" required />
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mot de passe *</div>
          <div className="flex items-center gap-3 px-4 h-12 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-300 transition-all">
            <I.Lock size={15} className="text-slate-400 shrink-0" />
            <input type={show ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-700 transition-colors">
              {show ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0,1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < score ? bars[score - 1] : 'bg-slate-200'}`} />)}
              </div>
              <div className="text-[11px] text-slate-500">Force : <span className="font-semibold">{labels[score - 1] || 'Trop court'}</span></div>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirmer le mot de passe *</div>
          <div className={`flex items-center gap-3 px-4 h-12 bg-white border rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/25 transition-all ${
            confirmPwd.length > 0 ? (match ? 'border-emerald-400' : 'border-rose-400') : 'border-slate-200 focus-within:border-orange-300'
          }`}>
            <I.Lock size={15} className="text-slate-400 shrink-0" />
            <input type={show ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••" className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
            {confirmPwd.length > 0 && (match
              ? <I.Check size={15} className="text-emerald-500 shrink-0" />
              : <I.X size={15} className="text-rose-500 shrink-0" />
            )}
          </div>
          {confirmPwd.length > 0 && !match && <div className="text-[11px] text-rose-500 mt-1">Les mots de passe ne correspondent pas.</div>}
        </div>
      </div>
    </div>
  )
}

function WizStep3({ logo, setLogo, logoUrl, description, setDescription, linkedin, setLinkedin }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Branding agence</h2>
        <p className="text-slate-500 text-sm">Donnez de la visibilité à votre marque.</p>
      </div>
      <UploadZone label="Logo de l'agence" hint="PNG ou JPG, fond transparent recommandé · max 5 Mo" accept="image/*"
        icon={I.Image} file={logo} onFile={setLogo} optional />
      {logoUrl && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <img src={logoUrl} alt="Aperçu" className="w-14 h-14 object-contain rounded-xl border border-emerald-200 bg-white" />
          <div>
            <div className="text-sm font-semibold text-emerald-700">Logo chargé</div>
            <div className="text-xs text-slate-500">{logo?.name} · {logo ? (logo.size / 1024).toFixed(0) : 0} KB</div>
          </div>
        </motion.div>
      )}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Description <span className="text-slate-400 normal-case font-normal text-[11px]">(optionnel)</span>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={500}
          placeholder="Notre agence accompagne acheteurs et vendeurs depuis 2010, avec une expertise reconnue..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-300 transition-all resize-none" />
        <div className="text-right text-[10px] text-slate-400 mt-1">{description.length}/500</div>
      </div>
      <Field label="Page LinkedIn" icon={I.Globe} value={linkedin} set={setLinkedin} placeholder="https://linkedin.com/company/mon-agence" />
    </div>
  )
}

const PRO_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 29, yearly: 24,
    highlight: false,
    badge: null,
    features: ['5 annonces actives', 'Statistiques simples', 'Badge Pro', 'Support e-mail'],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 79, yearly: 66,
    highlight: true,
    badge: 'Recommandé',
    features: ['Annonces illimitées', 'CRM leads intégré', 'Boost visibilité ×3', 'Analytics avancés', 'Support prioritaire'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 199, yearly: 166,
    highlight: false,
    badge: null,
    features: ['Multi-agents', 'Accès API complet', 'Support dédié', 'Import massif', 'SLA garanti'],
  },
]

function WizStep4({ plan, setPlan }) {
  const [billing, setBilling] = useState('monthly')
  const yearly = billing === 'yearly'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Abonnement & visibilité</h2>
        <p className="text-slate-500 text-sm">Choisissez le plan qui propulsera votre agence en tête des résultats.</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => setBilling('monthly')}
          className={`text-sm font-semibold transition-colors ${billing === 'monthly' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'}`}>
          Mensuel
        </button>
        <button type="button" onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${yearly ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${yearly ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <button type="button" onClick={() => setBilling('yearly')}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${yearly ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'}`}>
          Annuel
          <AnimatePresence>
            {yearly && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                2 mois offerts
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PRO_PLANS.map((p) => {
          const active  = plan === p.id
          const price   = yearly ? p.yearly : p.monthly

          return (
            <motion.button key={p.id} type="button" onClick={() => setPlan(p.id)}
              whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-200 ${
                p.highlight
                  ? 'border-orange-500 bg-[#0B1F3A] shadow-2xl shadow-orange-500/25'
                  : active
                  ? 'border-orange-500 bg-white shadow-lg shadow-orange-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none" />
              )}

              <div className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-orange-500 bg-orange-500' : p.highlight ? 'border-white/30' : 'border-slate-300'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {p.badge && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${p.highlight ? 'text-orange-400' : 'text-slate-500'}`}>
                  {p.name}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <motion.span key={`${p.id}-${billing}`}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`text-3xl font-extrabold ${p.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                    {price}€
                  </motion.span>
                  <span className={`text-xs ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mois</span>
                </div>
                {yearly && (
                  <div className={`text-[11px] mb-1 ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    soit {price * 12}€/an
                  </div>
                )}

                <div className={`h-px my-4 ${p.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />

                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${p.highlight ? 'bg-orange-500/25' : 'bg-emerald-50'}`}>
                        <I.Check size={9} strokeWidth={3} className={p.highlight ? 'text-orange-400' : 'text-emerald-600'} />
                      </span>
                      <span className={p.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {p.highlight && (
                <div className="px-5 pb-5 relative z-10">
                  <div className={`w-full py-2 rounded-xl text-center text-sm font-bold transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'}`}>
                    {active ? 'Sélectionné ✓' : 'Choisir Business'}
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <I.CreditCard size={13} className="text-slate-400" />
        Paiement sécurisé via{' '}
        <span className="font-bold text-slate-500">Stripe</span>
        <span className="text-slate-300">·</span>
        Résiliable à tout moment
        <span className="text-slate-300">·</span>
        Pas d'engagement
      </div>
    </div>
  )
}

function WizStep5Review({ fullName, email, agencyName, siret, agencyType, city, phone, website, logo, plan, legalDoc, idDoc, onEditPlan }) {
  const TYPE_LABELS = { agence: 'Agence immobilière', agent: 'Agent indépendant', promoteur: 'Promoteur', investisseur: 'Investisseur' }
  const rows = [
    { l: 'Structure',   v: TYPE_LABELS[agencyType] || '—' },
    { l: 'Agence',      v: agencyName || '—' },
    { l: 'SIRET',       v: siret || '—' },
    { l: 'Responsable', v: fullName || '—' },
    { l: 'E-mail',      v: email || '—' },
    { l: 'Ville',       v: city || '—' },
  ]
  const docs = [
    { label: 'Logo agence',           file: logo,     optional: true },
    { label: 'Document légal (KBIS)', file: legalDoc, optional: false },
    { label: "Pièce d'identité",      file: idDoc,    optional: false },
  ]
  const selectedPlan = PRO_PLANS.find((p) => p.id === plan) || PRO_PLANS[1]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Confirmation</h2>
        <p className="text-slate-500 text-sm">Vérifiez vos informations avant d'envoyer votre dossier.</p>
      </div>

      <div className={`relative overflow-hidden rounded-2xl border-2 ${selectedPlan.highlight ? 'border-orange-500 bg-[#0B1F3A]' : 'border-slate-200 bg-white'}`}>
        {selectedPlan.highlight && (
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500 opacity-15 blur-3xl pointer-events-none" />
        )}
        <div className="relative z-10 px-5 py-4">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selectedPlan.highlight ? 'text-orange-400' : 'text-slate-400'}`}>
            Plan sélectionné
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedPlan.highlight ? 'bg-orange-500/20' : 'bg-slate-100'}`}>
                {selectedPlan.highlight
                  ? <I.Sparkles size={18} className="text-orange-400" />
                  : selectedPlan.id === 'enterprise'
                    ? <I.Shield size={18} className="text-indigo-500" />
                    : <I.BadgeCheck size={18} className="text-slate-500" />
                }
              </div>
              <div>
                <div className={`font-extrabold text-base leading-tight ${selectedPlan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                  {selectedPlan.name}
                  {selectedPlan.badge && (
                    <span className="ml-2 text-[10px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider align-middle">
                      {selectedPlan.badge}
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Facturation mensuelle · résiliable à tout moment
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <span className={`text-2xl font-extrabold ${selectedPlan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                  {selectedPlan.monthly}€
                </span>
                <span className={`text-xs ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mois</span>
              </div>
              <button type="button" onClick={onEditPlan}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${selectedPlan.highlight ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}>
                <I.ChevronLeft size={11} />
                Modifier
              </button>
            </div>
          </div>

          <div className={`h-px my-3 ${selectedPlan.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {selectedPlan.features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${selectedPlan.highlight ? 'bg-orange-500/25' : 'bg-emerald-50'}`}>
                  <I.Check size={8} strokeWidth={3} className={selectedPlan.highlight ? 'text-orange-400' : 'text-emerald-600'} />
                </span>
                <span className={selectedPlan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={`px-5 py-2.5 flex items-center gap-2 border-t ${selectedPlan.highlight ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
          <I.CreditCard size={12} className="text-slate-400" />
          <span className={`text-[11px] ${selectedPlan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
            Paiement sécurisé via <span className="font-bold text-slate-500">Stripe</span>
          </span>
          <div className="ml-auto flex items-center gap-1">
            <I.Shield size={11} className="text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600">SSL</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
        {rows.map(({ l, v }) => (
          <div key={l} className="flex items-center justify-between px-5 py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</span>
            <span className="text-sm font-medium text-[#0F172A] text-right max-w-[55%] truncate">{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents</div>
        <div className="space-y-2.5">
          {docs.map(({ label, file, optional }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${file ? 'bg-emerald-500' : optional ? 'bg-slate-200' : 'bg-rose-400'}`}>
                {file ? <I.Check size={9} className="text-white" /> : <I.X size={9} className="text-white" />}
              </div>
              <span className="text-sm text-slate-700">{label}</span>
              {file && <span className="text-xs text-slate-400 truncate max-w-[140px]">{file.name}</span>}
              {!file && optional && <span className="text-xs text-slate-400">optionnel</span>}
              {!file && !optional && <span className="text-xs text-rose-500 font-medium">manquant</span>}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        En soumettant, vous acceptez nos <a href="#" className="underline hover:text-orange-600">CGU professionnelles</a> et notre <a href="#" className="underline hover:text-orange-600">politique de confidentialité</a>. Votre dossier sera examiné sous 24h.
      </p>
    </div>
  )
}

function ProSuccessScreen({ email, agencyName, plan, onHome }) {
  const PLAN_LABELS = { starter: 'Starter', business: 'Business', enterprise: 'Enterprise' }
  const PLAN_PRICES = { starter: '29€', business: '79€', enterprise: '199€' }
  const NEXT_STEPS = [
    { Icon: I.Mail,       label: 'E-mail de confirmation envoyé',           delay: 0.45 },
    { Icon: I.FileText,   label: "Dossier transmis à l'équipe KYC",         delay: 0.58 },
    { Icon: I.BadgeCheck, label: `Plan ${PLAN_LABELS[plan] || 'Business'} activé`, delay: 0.71 },
    { Icon: I.Shield,     label: 'Badge "Agence vérifiée" après validation', delay: 0.84 },
  ]
  return (
    <div className="relative min-h-screen bg-[#0B1F3A] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute -top-48 -left-48 w-[560px] h-[560px] rounded-full bg-orange-500 opacity-[0.08] blur-[110px]"
          animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-48 -right-48 w-[480px] h-[480px] rounded-full bg-indigo-500 opacity-[0.09] blur-[100px]"
          animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full text-center">

        <div className="relative inline-flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
          >
            <I.Check size={44} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <motion.div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/50"
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.7, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
          <motion.div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/25"
            animate={{ scale: [1, 1.8, 2.2], opacity: [0.5, 0.1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }} />
        </div>

        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold text-white mb-2">Dossier envoyé !</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
          className="text-slate-400 mb-1">
          <span className="font-semibold text-white">{agencyName || 'Votre agence'}</span> est en cours de vérification.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="text-sm text-slate-500 mb-7">
          Confirmation envoyée à <span className="font-medium text-slate-300">{email}</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.48, type: 'spring' }}
          className="inline-flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <I.Sparkles size={13} className="text-orange-400" />
          <span className="text-sm font-bold text-white">Plan {PLAN_LABELS[plan] || 'Business'}</span>
          <span className="text-slate-500">·</span>
          <span className="text-orange-400 font-bold">{PLAN_PRICES[plan] || '79€'}/mois</span>
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-7 text-left space-y-3 backdrop-blur-sm">
          {NEXT_STEPS.map(({ Icon, label, delay }) => (
            <motion.div key={label} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }}>
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{label}</span>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-7">
          <I.Alert size={12} />
          Délai de vérification estimé :
          <span className="font-semibold text-slate-400">24 à 48 h ouvrées</span>
        </motion.p>

        <motion.button onClick={onHome}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(234,88,12,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20">
          Retour à l'accueil
        </motion.button>
      </motion.div>
    </div>
  )
}

export default function ProRegisterPage() {
  const navigate = useNavigate()

  const STEPS = [
    { n: 1, label: 'Entreprise',   desc: 'Structure & coordonnées' },
    { n: 2, label: 'Identité',     desc: 'Responsable & accès' },
    { n: 3, label: 'Branding',     desc: 'Logo & présentation' },
    { n: 4, label: 'Abonnement',   desc: 'Plan & visibilité' },
    { n: 5, label: 'Confirmation', desc: 'Vérification & envoi' },
  ]

  const [step,      setStep]      = useState(1)
  const [dir,       setDir]       = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const [agencyType, setAgencyType] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [siret,      setSiret]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [city,       setCity]       = useState('')
  const [address,    setAddress]    = useState('')
  const [website,    setWebsite]    = useState('')

  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [show,       setShow]       = useState(false)

  const [logo,        setLogo]        = useState(null)
  const [logoUrl,     setLogoUrl]     = useState('')
  const [description, setDescription] = useState('')
  const [linkedin,    setLinkedin]    = useState('')

  const [plan, setPlan] = useState('business')

  const [legalDoc, setLegalDoc] = useState(null)
  const [idDoc,    setIdDoc]    = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(PRO_DRAFT_KEY, JSON.stringify({ agencyType, agencyName, siret, phone, city, address, website, fullName, email, description, linkedin, plan }))
    } catch {}
  }, [agencyType, agencyName, siret, phone, city, address, website, fullName, email, description, linkedin, plan])

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(PRO_DRAFT_KEY) || '{}')
      if (d.agencyType)  setAgencyType(d.agencyType)
      if (d.agencyName)  setAgencyName(d.agencyName)
      if (d.siret)       setSiret(d.siret)
      if (d.phone)       setPhone(d.phone)
      if (d.city)        setCity(d.city)
      if (d.address)     setAddress(d.address)
      if (d.website)     setWebsite(d.website)
      if (d.fullName)    setFullName(d.fullName)
      if (d.email)       setEmail(d.email)
      if (d.description) setDescription(d.description)
      if (d.linkedin)    setLinkedin(d.linkedin)
      if (d.plan)        setPlan(d.plan)
    } catch {}
  }, [])

  useEffect(() => {
    if (!logo) { setLogoUrl(''); return }
    const url = URL.createObjectURL(logo)
    setLogoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logo])

  const validate = (s) => {
    if (s === 1) {
      if (!agencyType) return 'Sélectionnez un type de structure.'
      if (!agencyName.trim()) return "Le nom de l'agence est requis."
      if (siret.replace(/\s/g, '').length !== 14) return 'Le SIRET doit comporter exactement 14 chiffres.'
      if (!phone.trim()) return 'Le téléphone professionnel est requis.'
      if (!city.trim()) return 'La ville est requise.'
    }
    if (s === 2) {
      if (!fullName.trim()) return 'Le nom du responsable est requis.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Adresse e-mail invalide.'
      if (password.length < 6) return 'Le mot de passe doit comporter au moins 6 caractères.'
      if (password !== confirmPwd) return 'Les mots de passe ne correspondent pas.'
    }
    if (s === 5) {
      if (!legalDoc) return 'Le document légal (KBIS) est requis.'
      if (!idDoc) return "La pièce d'identité est requise."
    }
    return null
  }

  const goTo = (n) => {
    if (n > step) {
      const err = validate(step)
      if (err) { setError(err); return }
    }
    setError('')
    setDir(n > step ? 1 : -1)
    setStep(n)
  }

  const submit = async () => {
    const err = validate(5)
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const nameParts = fullName.trim().split(/\s+/)
      const firstName = nameParts[0] ?? ''
      const lastName  = nameParts.slice(1).join(' ')
      await svc.signUp(
        email,
        password,
        {
          account_type:  'professional',
          first_name:    firstName,
          last_name:     lastName,
          company_name:  agencyName,
          business_type: agencyType,
          siret:         siret.replace(/\s/g, ''),
          phone,
          city,
          address,
          website,
          plan,
          description,
        },
        { logo, kbis: legalDoc, idDoc },
      )
      try { localStorage.removeItem(PRO_DRAFT_KEY) } catch {}
      setSubmitted(true)
    } catch (err) {
      const msg = err?.message || ''
      if (/already registered|already exists/i.test(msg)) setError('Cet e-mail est déjà utilisé.')
      else if (/password/i.test(msg)) setError('Le mot de passe doit comporter au moins 6 caractères.')
      else setError(msg || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  if (submitted) return <ProSuccessScreen email={email} agencyName={agencyName} plan={plan} onHome={() => navigate('/')} />

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] overflow-x-hidden">

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <motion.div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-orange-400 opacity-[0.035] blur-[130px]"
          animate={{ x: [0, 50, 0], y: [0, 35, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/2 -right-56 w-[550px] h-[550px] rounded-full bg-indigo-500 opacity-[0.04] blur-[110px]"
          animate={{ x: [0, -35, 0], y: [0, 45, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-amber-400 opacity-[0.03] blur-[100px]"
          animate={{ x: [0, 25, 0], y: [0, -25, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 h-14">
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-[#0F172A] transition-colors shrink-0">
              <I.ChevronLeft size={16} /> Accueil
            </button>
            <div className="flex-1 mx-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">
                  {STEPS[step - 1].label}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{step} / {STEPS.length}</span>
              </div>
              <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <BrandLogo compact />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex gap-6 lg:gap-8 xl:gap-12">

          <div className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-24">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-5 px-1">Progression</div>
              <div className="relative">
                <div className="absolute left-[15px] top-5 bottom-5 w-px bg-slate-200" />
                <div className="space-y-1.5">
                  {STEPS.map((s) => {
                    const done   = s.n < step
                    const active = s.n === step
                    return (
                      <div key={s.n} className={`relative flex items-start gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${active ? 'bg-white shadow-sm border border-slate-100' : ''}`}>
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 transition-all duration-200 ${
                          done   ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                 : active ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/40 ring-4 ring-orange-500/15'
                                 : 'bg-white border-2 border-slate-200 text-slate-300'
                        }`}>
                          {done ? <I.Check size={11} /> : s.n}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <div className={`text-xs font-bold leading-snug transition-colors ${active ? 'text-[#0F172A]' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                            {s.label}
                          </div>
                          {(active || done) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-200/50 overflow-hidden">

              <div className="px-7 sm:px-10 pt-9 pb-8">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={(d) => ({ opacity: 0, x: d * 36 })}
                    animate={{ opacity: 1, x: 0 }}
                    exit={(d) => ({ opacity: 0, x: d * -36 })}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && <WizStep1 {...{ agencyType, setAgencyType, agencyName, setAgencyName, siret, setSiret, phone, setPhone, city, setCity, address, setAddress, website, setWebsite }} />}
                    {step === 2 && <WizStep2 {...{ fullName, setFullName, email, setEmail, password, setPassword, confirmPwd, setConfirmPwd, show, setShow }} />}
                    {step === 3 && <WizStep3 {...{ logo, setLogo, logoUrl, description, setDescription, linkedin, setLinkedin }} />}
                    {step === 4 && <WizStep4 {...{ plan, setPlan }} />}
                    {step === 5 && (
                      <div className="space-y-6">
                        <WizStep5Review {...{ fullName, email, agencyName, siret, agencyType, city, phone, website, logo, plan, legalDoc, idDoc, onEditPlan: () => goTo(4) }} />
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents requis *</div>
                          <UploadZone label="Document légal (KBIS / Sirene)" hint="Extrait de moins de 3 mois · PDF ou image" accept=".pdf,image/*" icon={I.FileText} file={legalDoc} onFile={setLegalDoc} />
                          <UploadZone label="Pièce d'identité du responsable" hint="CNI ou passeport recto-verso" accept=".pdf,image/*" icon={I.User} file={idDoc} onFile={setIdDoc} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mx-7 sm:mx-10 mb-2"
                  >
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-2xl text-sm">
                      <I.Alert size={15} className="mt-0.5 shrink-0 text-rose-500" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between px-7 sm:px-10 py-5 border-t border-slate-100 bg-slate-50/60">
                <button type="button" onClick={() => step > 1 ? goTo(step - 1) : navigate('/')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-[#0F172A] hover:bg-white border border-slate-200 transition-all hover:shadow-sm">
                  <I.ChevronLeft size={14} />
                  {step > 1 ? 'Retour' : 'Accueil'}
                </button>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Brouillon sauvegardé
                  </span>
                  {step < 5 ? (
                    <motion.button type="button" onClick={() => goTo(step + 1)}
                      whileHover={{ scale: 1.025, boxShadow: '0 14px 36px rgba(234,88,12,0.32)' }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/25">
                      Continuer <I.ArrowRight size={14} />
                    </motion.button>
                  ) : (
                    <motion.button type="button" onClick={submit} disabled={loading}
                      whileHover={!loading ? { scale: 1.025, boxShadow: '0 14px 36px rgba(234,88,12,0.32)' } : {}}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                      {loading
                        ? <><I.Loader size={14} /><span>Envoi en cours…</span></>
                        : <><span>Soumettre mon dossier</span><I.ArrowRight size={14} /></>
                      }
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-60 xl:w-72 shrink-0 overflow-hidden">
            <AgencyPreviewCard agencyName={agencyName} city={city} agencyType={agencyType} logoUrl={logoUrl} plan={plan} />
          </div>
        </div>
      </div>
    </div>
  )
}
