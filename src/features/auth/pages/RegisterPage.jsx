import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo, PasswordStrength } from '../../../lib/ui.jsx'
import { useAuthAction, svc } from '../hooks/useAuth.js'
import { isValidEmail } from '../validators/authValidators.js'
import { startPremiumAlertsCheckout } from '../../subscription/subscriptionService.js'
import { postAuthRedirect } from '../services/redirect.js'
import { ShopCAInput } from '../../../components/ui/ShopCAInput'
import { ShopCACheckbox } from '../../../components/ui/ShopCACheckbox'

const DRAFT_KEY = 'shopca_pro_reg_draft'

const STEPS = {
  personal: ['Identité', 'Sécurité', 'Préférences', 'Confirmation'],
  pro:      ['Entreprise', 'Contact', 'Médias', 'Documents', 'Paramètres', 'Vérification'],
}

const PREFS = [
  { key: 'achat',          label: 'Achat',         desc: 'Acquérir un bien',      Icon: I.Home       },
  { key: 'location',       label: 'Location',       desc: 'Trouver à louer',       Icon: I.Key        },
  { key: 'colocation',     label: 'Colocation',     desc: 'Partager un logement',  Icon: I.Users      },
]

const BUSINESS_TYPES = [
  { key: 'agence',        label: 'Agence',        Icon: I.Building   },
  { key: 'mandataire',    label: 'Mandataire',    Icon: I.Briefcase  },
  { key: 'promoteur',     label: 'Promoteur',     Icon: I.Star       },
  { key: 'investisseur',  label: 'Investisseur',  Icon: I.TrendingUp },
  { key: 'artisan',       label: 'Artisan',       Icon: I.Zap        },
]

const slide = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit:  (d) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
}

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[460px] xl:w-[500px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rg)" />
      </svg>
      <div className="absolute top-[28%] -left-24 w-80 h-80 bg-orange-500/[0.14] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[22%] right-0 w-60 h-60 bg-orange-400/[0.08] rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>
        <div className="flex justify-center mb-8">
          <svg width="230" height="172" viewBox="0 0 260 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8"  y="108" width="28" height="80" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
            <rect x="12" y="90"  width="20" height="18" rx="1" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.07" strokeWidth="0.5"/>
            <rect x="42" y="78"  width="48" height="110" rx="2" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
            <rect x="50" y="88"  width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            <rect x="68" y="88"  width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            <rect x="50" y="106" width="11" height="11" rx="1" fill="white" fillOpacity="0.06"/>
            <rect x="68" y="106" width="11" height="11" rx="1" fill="#FB923C" fillOpacity="0.28" stroke="#FB923C" strokeOpacity="0.42" strokeWidth="0.5"/>
            <path d="M118 70 L168 22 L218 70 V182 H118Z" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.12" strokeWidth="1.2"/>
            <path d="M108 75 L168 14 L228 75" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="146" y="132" width="44" height="50" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.09" strokeWidth="1"/>
            <rect x="124" y="92"  width="22" height="16" rx="2" fill="#FB923C" fillOpacity="0.18" stroke="#FB923C" strokeOpacity="0.32" strokeWidth="0.8"/>
            <rect x="190" y="92"  width="22" height="16" rx="2" fill="#FB923C" fillOpacity="0.18" stroke="#FB923C" strokeOpacity="0.32" strokeWidth="0.8"/>
            <line x1="0" y1="184" x2="260" y2="184" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
            <polyline points="18,177 62,163 108,169 155,146 202,154 250,124" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.72"/>
            <circle cx="250" cy="124" r="4" fill="#FB923C" opacity="0.72"/>
          </svg>
        </div>
        <h1 className="text-[27px] font-extrabold text-white leading-snug mb-3">
          Investissez dans votre<br/>
          <span className="text-orange-400">avenir immobilier</span>
        </h1>
        <p className="text-white/55 text-sm leading-relaxed mb-8">
          Accédez aux meilleures opportunités du marché français. Achat, location, investissement — tout en un.
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {[{ v: '50K+', l: 'Biens' }, { v: '98%', l: 'Satisfaits' }, { v: '12 ans', l: 'Expertise' }].map(s => (
            <div key={s.l} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-white">{s.v}</div>
              <div className="text-[10px] text-white/45 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-8">
          <div className="flex gap-0.5 mb-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#FB923C">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <p className="text-white/75 text-sm italic leading-relaxed mb-3">
            "Grâce à SHOPCA, j'ai trouvé mon appartement en 3 semaines. Service exceptionnel et équipe très réactive."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">MD</div>
            <div>
              <div className="text-white text-xs font-semibold">Marie D.</div>
              <div className="text-white/40 text-[10px]">Propriétaire depuis 2023</div>
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-5 flex-wrap">
          {[
            { Icon: I.Shield,     label: 'SSL 256-bit'    },
            { Icon: I.Lock,       label: 'RGPD conforme'  },
            { Icon: I.BadgeCheck, label: 'Certifié France' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/35">
              <b.Icon size={13} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step progress ─────────────────────────────────────────────────────────────
function StepProgress({ steps, current }) {
  return (
    <div className="flex items-center gap-1 mb-7">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1 shrink-0">
            <motion.div layout
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${
                i < current   ? 'bg-emerald-500 text-white' :
                i === current ? 'bg-orange-500 text-white shadow-md shadow-orange-200' :
                                'bg-slate-100 text-slate-400'
              }`}>
              {i < current ? <I.Check size={11} /> : i + 1}
            </motion.div>
            <span className={`text-[10px] font-semibold hidden sm:block transition-colors duration-200 ${
              i === current ? 'text-[#0F172A]' : i < current ? 'text-emerald-600' : 'text-slate-400'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px rounded-full transition-colors duration-300 min-w-0 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, optional, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
        {optional && <span className="ml-1.5 normal-case font-normal text-slate-400">(optionnel)</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Text input (delegates to Design System) ───────────────────────────────────
function TextInput({ value, onChange, placeholder, type = 'text', icon: Icon, error }) {
  return (
    <ShopCAInput
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      icon={Icon ? <Icon size={15} /> : undefined}
      error={error}
    />
  )
}

// ── Password input (delegates to Design System) ───────────────────────────────
function PwdInput({ label, value, onChange, showStrength, error }) {
  return (
    <Field label={label} error={error}>
      <ShopCAInput
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="••••••••"
        icon={<I.Lock size={15} />}
      />
      {showStrength && value && <PasswordStrength password={value} />}
    </Field>
  )
}

// ── Avatar upload ─────────────────────────────────────────────────────────────
function AvatarUpload({ avatarUrl, onFile }) {
  const ref = useRef()
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => ref.current?.click()}
        className="relative w-16 h-16 rounded-full cursor-pointer group shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-orange-400 group-hover:bg-orange-50/40 transition-all">
            <I.User size={22} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <I.Camera size={16} className="text-white" />
        </div>
      </button>
      <div>
        <button type="button" onClick={() => ref.current?.click()}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition block">
          {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
        <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG · max 5 Mo · optionnel</p>
        {avatarUrl && (
          <button type="button" onClick={() => onFile(null)} className="text-[11px] text-slate-400 hover:text-rose-500 transition mt-0.5 block">
            Supprimer
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ label, optional, accept, acceptDesc, file, onFile, previewUrl, error }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
        {optional && <span className="ml-1.5 normal-case font-normal text-slate-400">(optionnel)</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={e => { e.preventDefault(); setDrag(false) }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          drag  ? 'border-orange-400 bg-orange-50/60 scale-[1.01]' :
          file  ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400' :
          error ? 'border-rose-300 bg-rose-50/20' :
                  'border-slate-200 hover:border-orange-300 hover:bg-orange-50/20'
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3 p-4">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <I.FileText size={22} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{file.name}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <I.Check size={10} />Ajouté · {(file.size / 1024).toFixed(0)} Ko
              </p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); onFile(null) }}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition shrink-0">
              <I.X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 py-7 px-4 text-center">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${drag ? 'bg-orange-100' : 'bg-slate-100'}`}>
              <I.Upload size={18} className={drag ? 'text-orange-500' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-sm text-slate-600">
                {drag
                  ? <span className="font-semibold text-orange-600">Relâcher pour déposer</span>
                  : <><span className="text-orange-600 font-semibold">Parcourir</span> ou glisser-déposer</>}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{acceptDesc}</p>
            </div>
          </div>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <button type="button" onClick={() => onChange(v => !v)}
      className="flex w-full items-center justify-between gap-4 py-3.5 px-1 group text-left">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0F172A] group-hover:text-orange-600 transition-colors">{label}</p>
        {desc && <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${checked ? 'bg-orange-500' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
        <motion.div layout
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 22 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}

// ── Checkbox (delegates to Design System) ────────────────────────────────────
function Checkbox({ checked, onChange, children, error }) {
  return (
    <div>
      <ShopCACheckbox
        checked={checked}
        onChange={() => onChange(v => !v)}
        label={children}
        className="px-1 py-2 rounded-xl hover:bg-orange-50/60 transition-colors"
      />
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 ml-1 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Premium alerts modal ─────────────────────────────────────────────────────
function PremiumAlertsModal({ open, onClose, onSubscribe }) {
  const BENEFITS = [
    'Alertes email en temps réel',
    'Nouvelles annonces selon vos critères',
    'Achat, location ou colocation',
    'Désabonnement en 1 clic',
    'Aucun engagement',
  ]
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="pm-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[#0B1F3A]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div key="pm-card"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 28 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden pointer-events-auto"
              onClick={e => e.stopPropagation()}>

              {/* Glow accents */}
              <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />

              {/* Close button */}
              <button onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0F172A] transition">
                <I.X size={14} />
              </button>

              <div className="relative z-10 px-7 pt-8 pb-7">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-orange-500/25 mx-auto"
                >
                  <I.Bell size={28} className="text-white" />
                </motion.div>

                {/* Title */}
                <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-xl font-extrabold text-[#0F172A] text-center leading-snug mb-2">
                  Recevez les nouvelles annonces<br />avant tout le monde
                </motion.h3>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
                  className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                  Soyez alerté immédiatement lorsqu'un bien correspondant à vos critères est publié.
                </motion.p>

                {/* Benefits */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                  className="bg-gradient-to-br from-slate-50 to-orange-50/40 border border-slate-100 rounded-2xl p-5 mb-6">
                  <div className="space-y-3">
                    {BENEFITS.map((b, i) => (
                      <motion.div key={b} className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.32 + i * 0.06 }}>
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                          <I.Check size={10} className="text-white" />
                        </div>
                        <span className="text-sm text-[#0F172A] font-medium">{b}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Price */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
                  className="flex items-center justify-center gap-3 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">7,50 €</span>
                    <span className="text-sm text-slate-500 font-medium">/ mois</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                    Sans engagement
                  </span>
                </motion.div>

                {/* Buttons */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
                  className="space-y-2.5">
                  <button type="button" onClick={onSubscribe}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0">
                    <I.Bell size={15} />
                    Continuer avec l'abonnement
                  </button>
                  <button type="button" onClick={onClose}
                    className="w-full h-11 flex items-center justify-center rounded-2xl border-2 border-slate-200 text-sm font-semibold text-slate-500 hover:text-[#0F172A] hover:border-slate-300 hover:bg-slate-50 transition-all">
                    Non merci
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Preferences step (personal) ───────────────────────────────────────────────
function PreferencesStep({ prefs, setPrefs, emailOptIn, setEmailOptIn }) {
  const [showModal, setShowModal] = useState(false)
  const toggle = (key) =>
    setPrefs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const handleOptInClick = () => {
    if (emailOptIn) {
      setEmailOptIn(false)
    } else {
      setShowModal(true)
    }
  }

  return (
    <div className="space-y-5">
      <PremiumAlertsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubscribe={() => { setEmailOptIn(true); setShowModal(false) }}
      />
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Vos projets{' '}
          <span className="normal-case font-normal text-slate-400">(plusieurs choix possibles)</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {PREFS.map(({ key, label, desc, Icon }) => {
            const on = prefs.includes(key)
            return (
              <button key={key} type="button" onClick={() => toggle(key)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  on ? 'border-orange-400 bg-orange-50 shadow-sm shadow-orange-100'
                     : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/30'
                }`}>
                {on && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <I.Check size={9} className="text-white" />
                  </motion.div>
                )}
                <Icon size={20} className={`mb-2 ${on ? 'text-orange-500' : 'text-slate-400'}`} />
                <div className={`text-sm font-semibold ${on ? 'text-orange-700' : 'text-[#0F172A]'}`}>{label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
              </button>
            )
          })}
        </div>
      </div>
      <div onClick={handleOptInClick}
        className="flex items-start gap-3 cursor-pointer group px-1 py-2 rounded-xl hover:bg-slate-50 transition-colors">
        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          emailOptIn ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-orange-400'
        }`}>
          {emailOptIn && <I.Check size={11} className="text-white" />}
        </div>
        <div className="select-none">
          <div className="text-sm text-slate-700 font-medium">Recevoir les meilleures opportunités</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Alertes nouvelles annonces, conseils marché. Désabonnement en 1 clic.</div>
        </div>
      </div>
    </div>
  )
}

// ── Personal confirm step ─────────────────────────────────────────────────────
function PersonalConfirmStep({ rows, avatarUrl, prefs, cgu, setCgu, rgpd, setRgpd, errors }) {
  const prefLabels = prefs.map(k => PREFS.find(p => p.key === k)?.label).filter(Boolean).join(', ')
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Récapitulatif</span>
          {avatarUrl && <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" />}
        </div>
        <div className="px-5 py-4 divide-y divide-slate-100">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="text-slate-500 shrink-0">{r.l}</span>
              <span className="font-semibold text-[#0F172A] truncate max-w-[58%] text-right ml-4">{r.v || '—'}</span>
            </div>
          ))}
          {prefLabels && (
            <div className="flex items-center justify-between py-2.5 text-sm last:pb-0">
              <span className="text-slate-500 shrink-0">Projets</span>
              <span className="font-semibold text-[#0F172A] truncate max-w-[58%] text-right ml-4">{prefLabels}</span>
            </div>
          )}
        </div>
      </div>
      <Checkbox checked={cgu} onChange={setCgu} error={errors.cgu}>
        J'accepte les{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">CGU</a>{' '}
        et la{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">politique de confidentialité</a>{' '}
        de SHOPCA.
      </Checkbox>
      <Checkbox checked={rgpd} onChange={setRgpd} error={errors.rgpd}>
        Je consens au traitement de mes données personnelles conformément au{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">RGPD</a>{' '}
        aux seules fins de la gestion de mon compte et des services SHOPCA.
      </Checkbox>
    </div>
  )
}

// ── Pro verification step ─────────────────────────────────────────────────────
function ProVerificationStep({ rows, logoUrl, cgu, setCgu, rgpd, setRgpd, errors }) {
  const kyc = [
    { label: 'Documents transmis',  status: 'done',    eta: null     },
    { label: 'Vérification SIRET',  status: 'pending', eta: '1–2 j.' },
    { label: 'Validation manuelle', status: 'waiting', eta: '1–2 j.' },
    { label: 'Badge Professionnel', status: 'waiting', eta: null     },
  ]
  return (
    <div className="space-y-4">
      {/* Recap */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <I.Building size={12} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Récapitulatif</span>
          </div>
          {logoUrl && <img src={logoUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-100" />}
        </div>
        <div className="px-4 py-3 divide-y divide-slate-100 max-h-44 overflow-y-auto">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
              <span className="text-slate-500 shrink-0 text-xs">{r.l}</span>
              <span className="font-semibold text-[#0F172A] truncate max-w-[60%] text-right ml-3 text-xs">{r.v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KYC status + progress */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <I.Shield size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Vérification KYC en attente</p>
            <p className="text-[11px] text-amber-600">Délai estimé : 2–3 jours ouvrés</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Progression du dossier</span>
            <span className="text-[10px] font-bold text-amber-700">25%</span>
          </div>
          <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '25%' }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
              className="h-full bg-amber-500 rounded-full" />
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="space-y-2">
          {kyc.map((k, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                k.status === 'done'    ? 'bg-emerald-500' :
                k.status === 'pending' ? 'bg-amber-400'   : 'bg-amber-200'
              }`}>
                {k.status === 'done'    && <I.Check  size={10} className="text-white" />}
                {k.status === 'pending' && <I.Loader size={9}  className="text-white" />}
              </div>
              <span className={`text-xs font-medium flex-1 ${
                k.status === 'done'    ? 'text-emerald-700' :
                k.status === 'pending' ? 'text-amber-700'   : 'text-amber-400'
              }`}>{k.label}</span>
              {k.eta && <span className="text-[10px] text-amber-500 shrink-0">{k.eta}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Verified badge preview */}
      <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center opacity-40 shrink-0">
          <I.BadgeCheck size={26} className="text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-500">Badge Professionnel vérifié</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Visible sur vos annonces après validation</p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">BIENTÔT</span>
      </div>

      <Checkbox checked={cgu} onChange={setCgu} error={errors.cgu}>
        J'accepte les{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">CGU professionnelles</a>{' '}
        et la{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">politique de confidentialité</a>{' '}
        de SHOPCA.
      </Checkbox>
      <Checkbox checked={rgpd} onChange={setRgpd} error={errors.rgpd}>
        Je consens au traitement de mes données professionnelles conformément au{' '}
        <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">RGPD</a>{' '}
        aux fins de la gestion de mon compte professionnel SHOPCA.
      </Checkbox>
    </div>
  )
}

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({ email, isPro }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center px-8 max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${
            isPro ? 'bg-orange-500 shadow-orange-200/70' : 'bg-emerald-500 shadow-emerald-200/70'
          }`}>
          {isPro ? <I.Shield size={36} className="text-white" /> : <I.CheckCircle size={36} className="text-white" />}
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="text-[26px] font-extrabold text-[#0F172A] mb-3">
          {isPro ? 'Dossier soumis !' : 'Bienvenue sur SHOPCA !'}
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="text-slate-500 text-sm leading-relaxed">
          {isPro ? (
            <>
              Votre dossier professionnel a été transmis à nos équipes.<br />
              Confirmation envoyée à{' '}
              <strong className="text-[#0F172A]">{email}</strong>.<br />
              <span className="text-amber-600 font-semibold">Vérification sous 2–3 jours ouvrés.</span>
            </>
          ) : (
            <>
              Un e-mail de confirmation a été envoyé à{' '}
              <strong className="text-[#0F172A] font-semibold">{email}</strong>.
              <br />Cliquez sur le lien pour activer votre compte.
            </>
          )}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3">
          <Link to="/auth/verify-pending" state={{ email }}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:-translate-y-0.5">
            <I.Mail size={15} />
            Voir les instructions
          </Link>
          <Link to="/auth/login" className="text-sm text-slate-400 hover:text-[#0F172A] transition font-medium">
            Se connecter
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-5">
          {[
            { Icon: I.Shield,     label: 'SSL 256-bit'    },
            { Icon: I.Lock,       label: 'RGPD conforme'  },
            { Icon: I.BadgeCheck, label: 'Certifié France' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-slate-300">
              <b.Icon size={12} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Step content ──────────────────────────────────────────────────────────────
function StepContent({ tab, step, s, set, errors }) {
  // ── Personal ──
  if (tab === 'personal') {
    if (step === 0) return (
      <div className="space-y-5">
        <AvatarUpload avatarUrl={s.avatarUrl} onFile={set.avatarFile} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" error={errors.firstName}>
            <TextInput value={s.firstName} onChange={set.firstName} placeholder="Jean" icon={I.User} error={errors.firstName} />
          </Field>
          <Field label="Nom" error={errors.lastName}>
            <TextInput value={s.lastName} onChange={set.lastName} placeholder="Dupont" icon={I.User} error={errors.lastName} />
          </Field>
        </div>
        <Field label="Téléphone" optional>
          <TextInput value={s.phone} onChange={set.phone} placeholder="+33 6 00 00 00 00" icon={I.Phone} />
        </Field>
      </div>
    )
    if (step === 1) return (
      <div className="space-y-4">
        <Field label="E-mail" error={errors.email}>
          <TextInput type="email" value={s.email} onChange={set.email} placeholder="vous@exemple.fr" icon={I.Mail} error={errors.email} />
        </Field>
        <PwdInput label="Mot de passe" value={s.password} onChange={set.password} showStrength error={errors.password} />
        <PwdInput label="Confirmer le mot de passe" value={s.confirmPwd} onChange={set.confirmPwd} error={errors.confirmPwd} />
      </div>
    )
    if (step === 2) return (
      <PreferencesStep prefs={s.prefs} setPrefs={set.prefs} emailOptIn={s.emailOptIn} setEmailOptIn={set.emailOptIn} />
    )
    if (step === 3) return (
      <PersonalConfirmStep
        rows={[
          { l: 'Prénom',    v: s.firstName },
          { l: 'Nom',       v: s.lastName  },
          { l: 'E-mail',    v: s.email     },
          ...(s.phone ? [{ l: 'Téléphone', v: s.phone }] : []),
        ]}
        avatarUrl={s.avatarUrl} prefs={s.prefs}
        cgu={s.cgu} setCgu={set.cgu} rgpd={s.rgpd} setRgpd={set.rgpd} errors={errors}
      />
    )
  }

  // ── Pro ──
  if (tab === 'pro') {
    if (step === 0) return (
      <div className="space-y-4">
        <Field label="Raison sociale" error={errors.companyName}>
          <TextInput value={s.companyName} onChange={set.companyName} placeholder="Immobilier & Co." icon={I.Building} error={errors.companyName} />
        </Field>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Type d'activité</label>
          <div className="grid grid-cols-5 gap-1.5">
            {BUSINESS_TYPES.map(({ key, label, Icon }) => {
              const on = s.activityType === key
              return (
                <button key={key} type="button" onClick={() => set.activityType(key)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-center transition-all ${
                    on ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/30'
                  }`}>
                  <Icon size={15} className={on ? 'text-orange-500' : 'text-slate-400'} />
                  <span className={`text-[10px] font-semibold leading-tight ${on ? 'text-orange-700' : 'text-slate-600'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Field label="SIRET" error={errors.siret}>
          <TextInput value={s.siret} onChange={set.siret} placeholder="362 521 879 00034" icon={I.FileText} error={errors.siret} />
        </Field>

        <Field label="Adresse" error={errors.address}>
          <TextInput value={s.address} onChange={set.address} placeholder="12 rue de la Paix" icon={I.MapPin} error={errors.address} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville" error={errors.city}>
            <TextInput value={s.city} onChange={set.city} placeholder="Paris" icon={I.MapPin} error={errors.city} />
          </Field>
          <Field label="Code postal" error={errors.postalCode}>
            <TextInput value={s.postalCode} onChange={set.postalCode} placeholder="75001" error={errors.postalCode} />
          </Field>
        </div>
      </div>
    )

    if (step === 1) return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" error={errors.firstName}>
            <TextInput value={s.firstName} onChange={set.firstName} placeholder="Jean" icon={I.User} error={errors.firstName} />
          </Field>
          <Field label="Nom" error={errors.lastName}>
            <TextInput value={s.lastName} onChange={set.lastName} placeholder="Dupont" icon={I.User} error={errors.lastName} />
          </Field>
        </div>
        <Field label="E-mail professionnel" error={errors.email}>
          <TextInput type="email" value={s.email} onChange={set.email} placeholder="contact@agence.fr" icon={I.Mail} error={errors.email} />
        </Field>
        <Field label="Téléphone" error={errors.phone}>
          <TextInput value={s.phone} onChange={set.phone} placeholder="+33 1 00 00 00 00" icon={I.Phone} error={errors.phone} />
        </Field>
        <PwdInput label="Mot de passe" value={s.password} onChange={set.password} showStrength error={errors.password} />
        <PwdInput label="Confirmer" value={s.confirmPwd} onChange={set.confirmPwd} error={errors.confirmPwd} />
      </div>
    )

    if (step === 2) return (
      <div className="space-y-5">
        <DropZone
          label="Logo de l'agence"
          optional
          accept="image/*"
          acceptDesc="PNG, JPG, SVG · max 5 Mo"
          file={s.logoFile}
          onFile={set.logoFile}
          previewUrl={s.logoUrl}
        />
        <DropZone
          label="Image de couverture"
          optional
          accept="image/*"
          acceptDesc="PNG, JPG · 1200×400 recommandé · max 10 Mo"
          file={s.coverFile}
          onFile={set.coverFile}
          previewUrl={s.coverUrl}
        />
      </div>
    )

    if (step === 3) return (
      <div className="space-y-5">
        <DropZone
          label="Extrait Kbis"
          accept=".pdf,application/pdf"
          acceptDesc="PDF uniquement · max 10 Mo · moins de 3 mois"
          file={s.kbisFile}
          onFile={set.kbisFile}
          error={errors.kbis}
        />
        <DropZone
          label="Pièce d'identité"
          accept="image/*,.pdf,application/pdf"
          acceptDesc="CNI, passeport · JPG, PNG ou PDF · max 5 Mo"
          file={s.idDocFile}
          onFile={set.idDocFile}
          previewUrl={s.idDocUrl}
          error={errors.idDoc}
        />
      </div>
    )

    if (step === 4) return (
      <div className="space-y-1">
        <Field label="Site web" optional error={errors.website}>
          <TextInput value={s.website} onChange={set.website} placeholder="https://mon-agence.fr" icon={I.Globe} error={errors.website} />
        </Field>

        <div className="mt-5 mb-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Préférences de contact</p>
          <div className="divide-y divide-slate-100">
            <Toggle
              checked={s.showPhone}
              onChange={set.showPhone}
              label="Afficher mon téléphone publiquement"
              desc="Visible sur vos annonces et votre profil professionnel."
            />
            <Toggle
              checked={s.receiveLeads}
              onChange={set.receiveLeads}
              label="Recevoir les leads par e-mail"
              desc="Notification instantanée à chaque nouvelle mise en relation."
            />
            <Toggle
              checked={s.whatsapp}
              onChange={set.whatsapp}
              label="Activer le contact WhatsApp"
              desc="Un bouton WhatsApp apparaîtra sur vos annonces."
            />
          </div>
        </div>
      </div>
    )

    if (step === 5) return (
      <ProVerificationStep
        rows={[
          { l: 'Entreprise', v: s.companyName },
          { l: 'Type',       v: BUSINESS_TYPES.find(b => b.key === s.activityType)?.label },
          { l: 'SIRET',      v: s.siret       },
          { l: 'Adresse',    v: s.address     },
          { l: 'Ville',      v: s.city && s.postalCode ? `${s.city} ${s.postalCode}` : s.city },
          { l: 'Contact',    v: `${s.firstName} ${s.lastName}`.trim() },
          { l: 'E-mail',     v: s.email       },
          { l: 'Téléphone',  v: s.phone       },
          ...(s.website ? [{ l: 'Site web', v: s.website }] : []),
        ]}
        logoUrl={s.logoUrl}
        cgu={s.cgu}   setCgu={set.cgu}
        rgpd={s.rgpd} setRgpd={set.rgpd}
        errors={errors}
      />
    )
  }

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { loading, error: apiError, run } = useAuthAction()

  const [tab,    setTab]    = useState('personal')
  const [step,   setStep]   = useState(0)
  const [dir,    setDir]    = useState(1)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Shared
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [cgu,        setCgu]        = useState(false)
  const [rgpd,       setRgpd]       = useState(false)

  // Personal
  const [avatarFile,  setAvatarFile]  = useState(null)
  const [avatarUrl,   setAvatarUrl]   = useState('')
  const [prefs,       setPrefs]       = useState([])
  const [emailOptIn,  setEmailOptIn]  = useState(false)

  // Pro
  const [companyName,   setCompanyName]   = useState('')
  const [activityType,  setActivityType]  = useState('agence')
  const [siret,         setSiret]         = useState('')
  const [address,       setAddress]       = useState('')
  const [city,          setCity]          = useState('')
  const [postalCode,    setPostalCode]    = useState('')
  const [website,       setWebsite]       = useState('')
  const [showPhone,     setShowPhone]     = useState(false)
  const [receiveLeads,  setReceiveLeads]  = useState(true)
  const [whatsapp,      setWhatsapp]      = useState(false)
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoUrl,       setLogoUrl]       = useState('')
  const [coverFile,     setCoverFile]     = useState(null)
  const [coverUrl,      setCoverUrl]      = useState('')
  const [kbisFile,      setKbisFile]      = useState(null)
  const [idDocFile,     setIdDocFile]     = useState(null)
  const [idDocUrl,      setIdDocUrl]      = useState('')
  const [draftRestored, setDraftRestored] = useState(false)

  // Autosave — load draft on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      if (!saved) return
      if (saved.companyName)  setCompanyName(saved.companyName)
      if (saved.activityType) setActivityType(saved.activityType)
      if (saved.siret)        setSiret(saved.siret)
      if (saved.address)      setAddress(saved.address)
      if (saved.city)         setCity(saved.city)
      if (saved.postalCode)   setPostalCode(saved.postalCode)
      if (saved.website)      setWebsite(saved.website)
      if (saved.firstName)    setFirstName(saved.firstName)
      if (saved.lastName)     setLastName(saved.lastName)
      if (saved.email)        setEmail(saved.email)
      if (saved.phone)        setPhone(saved.phone)
      if (typeof saved.showPhone    === 'boolean') setShowPhone(saved.showPhone)
      if (typeof saved.receiveLeads === 'boolean') setReceiveLeads(saved.receiveLeads)
      if (typeof saved.whatsapp     === 'boolean') setWhatsapp(saved.whatsapp)
      setDraftRestored(true)
    } catch {}
  }, [])

  // Autosave — persist on every change (pro tab only)
  useEffect(() => {
    if (tab !== 'pro') return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        companyName, activityType, siret, address, city, postalCode, website,
        firstName, lastName, email, phone, showPhone, receiveLeads, whatsapp,
      }))
    } catch {}
  }, [tab, companyName, activityType, siret, address, city, postalCode, website,
      firstName, lastName, email, phone, showPhone, receiveLeads, whatsapp])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setDraftRestored(false)
    setCompanyName(''); setActivityType('agence'); setSiret(''); setAddress('')
    setCity(''); setPostalCode(''); setWebsite('')
    setFirstName(''); setLastName(''); setEmail(''); setPhone('')
    setShowPhone(false); setReceiveLeads(true); setWhatsapp(false)
  }

  const clearErr = (...keys) => setErrors(e => {
    const n = { ...e }; keys.forEach(k => delete n[k]); return n
  })

  const handleAvatarFile  = (f) => { setAvatarFile(f); setAvatarUrl(f ? URL.createObjectURL(f) : '') }
  const handleLogoFile    = (f) => { setLogoFile(f);   setLogoUrl(f ? URL.createObjectURL(f) : '') }
  const handleCoverFile   = (f) => { setCoverFile(f);  setCoverUrl(f ? URL.createObjectURL(f) : '') }
  const handleKbisFile    = (f) => { setKbisFile(f);   clearErr('kbis') }
  const handleIdDocFile   = (f) => {
    setIdDocFile(f)
    setIdDocUrl(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : '')
    clearErr('idDoc')
  }

  const s = {
    firstName, lastName, phone, email, password, confirmPwd, cgu, rgpd,
    avatarUrl, prefs, emailOptIn,
    companyName, activityType, siret, address, city, postalCode, website,
    showPhone, receiveLeads, whatsapp,
    logoFile, logoUrl, coverFile, coverUrl, kbisFile, idDocFile, idDocUrl,
  }

  const set = {
    firstName:    (v) => { setFirstName(v);   clearErr('firstName')   },
    lastName:     (v) => { setLastName(v);    clearErr('lastName')    },
    phone:        (v) => { setPhone(v);       clearErr('phone')       },
    email:        (v) => { setEmail(v);       clearErr('email')       },
    password:     (v) => { setPassword(v);    clearErr('password')    },
    confirmPwd:   (v) => { setConfirmPwd(v);  clearErr('confirmPwd')  },
    cgu:          setCgu,
    rgpd:         setRgpd,
    avatarFile:   handleAvatarFile,
    prefs:        setPrefs,
    emailOptIn:   setEmailOptIn,
    companyName:  (v) => { setCompanyName(v); clearErr('companyName') },
    activityType: setActivityType,
    siret:        (v) => { setSiret(v);       clearErr('siret')       },
    address:      (v) => { setAddress(v);     clearErr('address')     },
    city:         (v) => { setCity(v);        clearErr('city')        },
    postalCode:   (v) => { setPostalCode(v);  clearErr('postalCode')  },
    website:      (v) => { setWebsite(v);     clearErr('website')     },
    showPhone:    setShowPhone,
    receiveLeads: setReceiveLeads,
    whatsapp:     setWhatsapp,
    logoFile:     handleLogoFile,
    coverFile:    handleCoverFile,
    kbisFile:     handleKbisFile,
    idDocFile:    handleIdDocFile,
  }

  const steps  = STEPS[tab]
  const isLast = step === steps.length - 1

  const validate = () => {
    const e = {}
    if (tab === 'personal') {
      if (step === 0) {
        if (!firstName.trim()) e.firstName = 'Prénom requis'
        if (!lastName.trim())  e.lastName  = 'Nom requis'
      } else if (step === 1) {
        if (!isValidEmail(email))    e.email      = 'E-mail invalide'
        if (password.length < 8)     e.password   = 'Minimum 8 caractères'
        if (confirmPwd !== password) e.confirmPwd = 'Les mots de passe ne correspondent pas'
      } else if (step === 3) {
        if (!cgu)  e.cgu  = 'Veuillez accepter les CGU pour continuer'
        if (!rgpd) e.rgpd = 'Veuillez accepter le consentement RGPD'
      }
    } else {
      if (step === 0) {
        if (!companyName.trim())  e.companyName = 'Raison sociale requise'
        if (!siret.trim())        e.siret       = 'SIRET requis'
        if (!address.trim())      e.address     = 'Adresse requise'
        if (!city.trim())         e.city        = 'Ville requise'
        if (!/^\d{5}$/.test(postalCode.trim())) e.postalCode = 'Code postal invalide (5 chiffres)'
      } else if (step === 1) {
        if (!firstName.trim())    e.firstName  = 'Prénom requis'
        if (!lastName.trim())     e.lastName   = 'Nom requis'
        if (!isValidEmail(email)) e.email      = 'E-mail invalide'
        if (!phone.trim())        e.phone      = 'Téléphone requis'
        if (password.length < 8)  e.password   = 'Minimum 8 caractères'
        if (confirmPwd !== password) e.confirmPwd = 'Les mots de passe ne correspondent pas'
      } else if (step === 3) {
        if (!kbisFile)   e.kbis  = 'Extrait Kbis requis'
        if (!idDocFile)  e.idDoc = "Pièce d'identité requise"
      } else if (step === 4) {
        if (website && !/^https?:\/\/.+\..+/.test(website))
          e.website = 'URL invalide (ex: https://mon-agence.fr)'
      } else if (step === 5) {
        if (!cgu)  e.cgu  = 'Veuillez accepter les CGU pour continuer'
        if (!rgpd) e.rgpd = 'Veuillez accepter le consentement RGPD'
      }
    }
    return e
  }

  const advance = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (isLast) {
      const meta = tab === 'pro'
        ? {
            account_type: 'professional',
            first_name: firstName, last_name: lastName,
            company_name: companyName, business_type: activityType, siret,
            address, city, postal_code: postalCode, website, phone,
            show_phone: showPhone, receive_leads: receiveLeads, whatsapp,
          }
        : { account_type: 'personal', first_name: firstName, last_name: lastName, phone, preferences: prefs, email_opt_in: emailOptIn }
      const files = tab === 'pro'
        ? { avatar: avatarFile || undefined, logo: logoFile || undefined, cover: coverFile || undefined, kbis: kbisFile || undefined, idDoc: idDocFile || undefined }
        : { avatar: avatarFile || undefined }
      const result = await run(() => svc.signUp(email, password, meta, files))
      if (result) {
        if (tab === 'pro') localStorage.removeItem(DRAFT_KEY)

        // Supabase anti-enumeration: existing confirmed email returns identities:[]
        // No email is sent — redirect to login with a helpful message instead
        if (result.user?.identities?.length === 0) {
          navigate('/auth/login', { state: { existingEmail: email } })
          return
        }

        // If user opted in for premium alerts, attempt Stripe Checkout
        if (tab === 'personal' && emailOptIn && result.session) {
          try {
            localStorage.setItem('shopca_premium_pending', 'true')
            await startPremiumAlertsCheckout()
            return // Stripe will redirect — don't show success overlay
          } catch (stripeErr) {
            console.warn('[premium] Stripe checkout deferred:', stripeErr.message)
            // Fall through — auto-redirect below
          }
        }

        // Auto-connect: if signup returned a session (mailer_autoconfirm=true or
        // OAuth path), skip the email-confirmation overlay and go straight to
        // the right dashboard.
        if (result.session) {
          const dest = postAuthRedirect(
            { account_type: tab === 'pro' ? 'professional' : 'personal', preferences: prefs },
            result.user,
            { preferOnboarding: tab !== 'pro' }
          )
          navigate(dest, { replace: true })
          return
        }

        setSuccess(true)
      }
      return
    }
    setDir(1)
    setStep(n => n + 1)
  }

  const back = () => { setErrors({}); setDir(-1); setStep(n => n - 1) }

  const switchTab = (t) => {
    if (t === 'pro') { navigate('/auth/register/pro'); return }
    setTab(t); setStep(0); setDir(1); setErrors({})
  }

  if (success) return <SuccessOverlay email={email} isPro={tab === 'pro'} />

  return (
    <div className="min-h-screen flex bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 lg:px-10 lg:pt-6">
          <div className="lg:hidden"><BrandLogo /></div>
          <div className="hidden lg:block" />
          <Link to="/auth/login"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition">
            <I.ArrowLeft size={14} />
            Déjà inscrit ?{' '}
            <span className="text-orange-600 font-semibold ml-1">Se connecter</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[440px]">

            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Créer un compte</h2>
              <p className="text-slate-500 text-sm mt-1">Rejoignez des milliers de clients qui font confiance à SHOPCA.</p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 mb-6">
              {[
                { key: 'personal', label: 'Particulier',   Icon: I.User     },
                { key: 'pro',      label: 'Professionnel', Icon: I.Building },
              ].map(t => (
                <button key={t.key} type="button" onClick={() => switchTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tab === t.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'
                  }`}>
                  <t.Icon size={14} />{t.label}
                </button>
              ))}
            </div>

            {/* Draft restored banner (pro only) */}
            <AnimatePresence>
              {draftRestored && tab === 'pro' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5">
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <I.Sparkles size={13} />
                      Brouillon restauré
                    </div>
                    <button type="button" onClick={clearDraft}
                      className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold transition">
                      Effacer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <StepProgress steps={steps} current={step} />

            {/* Step content */}
            <div className="min-h-[240px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={`${tab}-${step}`} custom={dir}
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
                  <StepContent tab={tab} step={step} s={s} set={set} errors={errors} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* API error */}
            <AnimatePresence>
              {isLast && apiError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden">
                  <I.Alert size={15} className="mt-0.5 shrink-0" /><span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className={`mt-5 flex gap-3 ${step > 0 ? '' : 'justify-end'}`}>
              {step > 0 && (
                <button type="button" onClick={back} disabled={loading}
                  className="flex items-center gap-2 px-5 h-12 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition shrink-0 disabled:opacity-40 disabled:pointer-events-none">
                  <I.ArrowLeft size={15} />Retour
                </button>
              )}
              <button type="button" onClick={advance} disabled={loading}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none">
                {loading
                  ? <><I.Loader size={16} />Envoi…</>
                  : isLast
                    ? <><I.CheckCircle size={16} />{tab === 'pro' ? 'Soumettre le dossier' : 'Créer mon compte'}</>
                    : <>Continuer <I.ArrowRight size={15} /></>}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              En créant un compte vous acceptez nos{' '}
              <a href="#" className="underline hover:text-[#0F172A]">CGU</a> et notre{' '}
              <a href="#" className="underline hover:text-[#0F172A]">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
