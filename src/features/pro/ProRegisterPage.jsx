import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, BrandLogo, PasswordStrength } from '../../lib/ui.jsx'
import { useAuthAction, svc } from '../auth/hooks/useAuth.js'
import { isValidEmail } from '../auth/validators/authValidators.js'
import { PasmalSelect } from '../../components/ui/PasmalSelect'

const DRAFT_KEY = 'pasmal_pro_wizard_v2'
const MAX_IMG = 5 * 1024 * 1024
const MAX_DOC = 10 * 1024 * 1024

const STEPS = [
  { label: 'Entreprise',  desc: 'Raison sociale & SIRET' },
  { label: 'Contact',     desc: 'E-mail, mot de passe, téléphone' },
  { label: 'Adresse',     desc: 'Siège social' },
  { label: 'Profil',      desc: 'Logo, couverture & liens' },
  { label: 'Visibilité',  desc: 'Préférences de contact' },
  { label: 'Vérification', desc: 'Documents KYC' },
]

const LEGAL_STATUSES = [
  'SAS', 'SARL', 'EURL', 'SA', 'SCI', 'Auto-entrepreneur', 'EI', 'Autre',
]

const slide = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
}

/* ── Reusable components ──────────────────────────────────────────────────── */

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

function TextInput({ value, onChange, placeholder, type = 'text', icon: Icon, error, maxLength }) {
  return (
    <div className={`flex items-center gap-3 px-4 h-12 rounded-xl border-2 bg-slate-50/80 transition-all ${
      error
        ? 'border-rose-300 bg-rose-50/50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100'
        : 'border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'
    }`}>
      {Icon && <Icon size={15} className={`shrink-0 ${error ? 'text-rose-400' : 'text-slate-400'}`} />}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
    </div>
  )
}

function SelectInput({ value, onChange, options, placeholder, icon: Icon, error }) {
  return (
    <PasmalSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      icon={Icon ? <Icon size={15} /> : undefined}
      error={error}
    />
  )
}

function PwdInput({ label, value, onChange, showStrength, error }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} error={error}>
      <div className={`flex items-center gap-3 px-4 h-12 rounded-xl border-2 bg-slate-50/80 transition-all ${
        error
          ? 'border-rose-300 bg-rose-50/50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100'
          : 'border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'
      }`}>
        <I.Lock size={15} className={`shrink-0 ${error ? 'text-rose-400' : 'text-slate-400'}`} />
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="flex-1 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none" />
        <button type="button" onClick={() => setShow(s => !s)} className="text-slate-400 hover:text-slate-600 transition shrink-0">
          {show ? <I.EyeOff size={14} /> : <I.Eye size={14} />}
        </button>
      </div>
      {showStrength && value && <PasswordStrength password={value} />}
    </Field>
  )
}

function DropZone({ label, optional, accept, acceptDesc, file, onFile, previewUrl, error, maxSize }) {
  const [drag, setDrag] = useState(false)
  const [sizeErr, setSizeErr] = useState('')
  const ref = useRef()

  const handleFile = (f) => {
    if (!f) { onFile(null); setSizeErr(''); return }
    if (maxSize && f.size > maxSize) {
      setSizeErr(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)} Mo)`)
      return
    }
    setSizeErr('')
    onFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const displayErr = sizeErr || error

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
          drag    ? 'border-orange-400 bg-orange-50/60 scale-[1.01]' :
          file    ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400' :
          displayErr ? 'border-rose-300 bg-rose-50/20' :
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
            <button type="button" onClick={e => { e.stopPropagation(); handleFile(null) }}
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
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      </div>
      <AnimatePresence>
        {displayErr && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 overflow-hidden">
            <I.Alert size={11} className="shrink-0" />{displayErr}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <button type="button" onClick={() => onChange(v => !v)}
      className="flex w-full items-center justify-between gap-4 py-4 px-1 group text-left">
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

function Checkbox({ checked, onChange, children, error }) {
  return (
    <div>
      <div onClick={() => onChange(v => !v)}
        className="flex items-start gap-3 cursor-pointer group px-1 py-2 rounded-xl hover:bg-orange-50/60 transition-colors">
        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          checked ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-orange-400'
        }`}>
          {checked && <I.Check size={11} className="text-white" />}
        </div>
        <span className="text-sm text-slate-600 leading-relaxed select-none">{children}</span>
      </div>
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

/* ── Step components ──────────────────────────────────────────────────────── */

function Step1_Company({ d, set, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Informations entreprise</h2>
        <p className="text-slate-500 text-sm">Renseignez les informations légales de votre structure.</p>
      </div>
      <Field label="Raison sociale" error={errors.companyName}>
        <TextInput value={d.companyName} onChange={set.companyName} placeholder="Immobilier Prestige SAS" icon={I.Building} error={errors.companyName} />
      </Field>
      <Field label="Statut juridique" error={errors.legalStatus}>
        <SelectInput value={d.legalStatus} onChange={set.legalStatus} options={LEGAL_STATUSES} placeholder="Sélectionnez un statut" icon={I.FileText} error={errors.legalStatus} />
      </Field>
      <Field label="SIRET" error={errors.siret}>
        <TextInput value={d.siret} onChange={set.siret} placeholder="362 521 879 00034" icon={I.BadgeCheck} error={errors.siret} maxLength={17} />
      </Field>
      <Field label="Numéro de TVA" optional>
        <TextInput value={d.vatNumber} onChange={set.vatNumber} placeholder="FR 12 345678901" icon={I.FileText} />
      </Field>
    </div>
  )
}

function Step2_Contact({ d, set, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Informations de contact</h2>
        <p className="text-slate-500 text-sm">Vos identifiants de connexion sécurisés.</p>
      </div>
      <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <I.Shield size={17} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">Vos informations sont protégées par chiffrement SSL 256-bit et ne seront jamais partagées.</p>
      </div>
      <Field label="E-mail professionnel" error={errors.email}>
        <TextInput type="email" value={d.email} onChange={set.email} placeholder="contact@agence.fr" icon={I.Mail} error={errors.email} />
      </Field>
      <PwdInput label="Mot de passe" value={d.password} onChange={set.password} showStrength error={errors.password} />
      <PwdInput label="Confirmer le mot de passe" value={d.confirmPwd} onChange={set.confirmPwd} error={errors.confirmPwd} />
      <Field label="Téléphone" error={errors.phone}>
        <TextInput value={d.phone} onChange={set.phone} placeholder="+33 6 12 34 56 78" icon={I.Phone} error={errors.phone} />
      </Field>
    </div>
  )
}

function Step3_Address({ d, set, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Adresse professionnelle</h2>
        <p className="text-slate-500 text-sm">L'adresse du siège social de votre agence.</p>
      </div>
      <Field label="Adresse" error={errors.address}>
        <TextInput value={d.address} onChange={set.address} placeholder="12 rue de la Paix" icon={I.MapPin} error={errors.address} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Code postal" error={errors.postalCode}>
          <TextInput value={d.postalCode} onChange={set.postalCode} placeholder="75001" maxLength={5} error={errors.postalCode} />
        </Field>
        <Field label="Ville" error={errors.city}>
          <TextInput value={d.city} onChange={set.city} placeholder="Paris" icon={I.MapPin} error={errors.city} />
        </Field>
      </div>
      <Field label="Pays">
        <SelectInput value={d.country} onChange={set.country}
          options={['France', 'Belgique', 'Suisse', 'Luxembourg', 'Monaco', 'Canada']}
          placeholder="Sélectionnez un pays" icon={I.Globe} />
      </Field>
    </div>
  )
}

function Step4_Profile({ d, set, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Profil de l'agence</h2>
        <p className="text-slate-500 text-sm">Personnalisez votre vitrine professionnelle.</p>
      </div>
      <DropZone
        label="Logo de l'agence"
        optional
        accept="image/*"
        acceptDesc="PNG, JPG, SVG · fond transparent recommandé · max 5 Mo"
        file={d.logoFile}
        onFile={set.logoFile}
        previewUrl={d.logoUrl}
        maxSize={MAX_IMG}
      />
      <DropZone
        label="Image de couverture"
        optional
        accept="image/*"
        acceptDesc="PNG, JPG · 1200×400 recommandé · max 5 Mo"
        file={d.coverFile}
        onFile={set.coverFile}
        previewUrl={d.coverUrl}
        maxSize={MAX_IMG}
      />
      <Field label="Description" optional>
        <textarea value={d.description} onChange={e => set.description(e.target.value)} rows={4} maxLength={500}
          placeholder="Notre agence accompagne acheteurs et vendeurs depuis 2010, avec une expertise reconnue..."
          className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all resize-none" />
        <div className="text-right text-[10px] text-slate-400 mt-1">{d.description.length}/500</div>
      </Field>
      <Field label="Site web" optional error={errors.website}>
        <TextInput value={d.website} onChange={set.website} placeholder="https://mon-agence.fr" icon={I.Globe} error={errors.website} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="LinkedIn" optional>
          <TextInput value={d.linkedin} onChange={set.linkedin} placeholder="linkedin.com/company/..." icon={I.Globe} />
        </Field>
        <Field label="Facebook" optional>
          <TextInput value={d.facebook} onChange={set.facebook} placeholder="facebook.com/..." icon={I.Globe} />
        </Field>
      </div>
      <Field label="Instagram" optional>
        <TextInput value={d.instagram} onChange={set.instagram} placeholder="instagram.com/..." icon={I.Globe} />
      </Field>
    </div>
  )
}

function Step5_Visibility({ d, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Paramètres de visibilité</h2>
        <p className="text-slate-500 text-sm">Choisissez comment vos clients peuvent vous contacter.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        <div className="px-5">
          <Toggle
            checked={d.showPhone}
            onChange={set.showPhone}
            label="Afficher mon téléphone publiquement"
            desc="Votre numéro sera visible sur vos annonces et votre profil."
          />
        </div>
        <div className="px-5">
          <Toggle
            checked={d.whatsapp}
            onChange={set.whatsapp}
            label="Activer le contact WhatsApp"
            desc="Un bouton WhatsApp apparaîtra sur vos annonces."
          />
        </div>
        <div className="px-5">
          <Toggle
            checked={d.receiveLeads}
            onChange={set.receiveLeads}
            label="Recevoir les leads par e-mail"
            desc="Notification instantanée à chaque nouvelle mise en relation."
          />
        </div>
      </div>
      <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
        <I.Sparkles size={17} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Vous pourrez modifier ces paramètres à tout moment depuis votre tableau de bord professionnel.
        </p>
      </div>
    </div>
  )
}

function Step6_Verification({ d, set, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Vérification</h2>
        <p className="text-slate-500 text-sm">Importez vos documents pour activer votre badge professionnel.</p>
      </div>
      <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <I.Shield size={17} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Vos documents sont chiffrés et stockés de manière sécurisée. Ils ne seront utilisés que pour la vérification de votre identité.
        </p>
      </div>
      <DropZone
        label="Extrait Kbis"
        accept=".pdf,application/pdf,image/*"
        acceptDesc="PDF ou image · extrait de moins de 3 mois · max 10 Mo"
        file={d.kbisFile}
        onFile={set.kbisFile}
        error={errors.kbis}
        maxSize={MAX_DOC}
      />
      <DropZone
        label="Pièce d'identité"
        accept="image/*,.pdf,application/pdf"
        acceptDesc="CNI, passeport · JPG, PNG ou PDF · recto-verso · max 10 Mo"
        file={d.idDocFile}
        onFile={set.idDocFile}
        previewUrl={d.idDocUrl}
        error={errors.idDoc}
        maxSize={MAX_DOC}
      />

      <div className="mt-6 space-y-3">
        <Checkbox checked={d.cgu} onChange={set.cgu} error={errors.cgu}>
          J'accepte les{' '}
          <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">CGU professionnelles</a>{' '}
          et la{' '}
          <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">politique de confidentialité</a>.
        </Checkbox>
        <Checkbox checked={d.rgpd} onChange={set.rgpd} error={errors.rgpd}>
          Je consens au traitement de mes données professionnelles conformément au{' '}
          <a href="#" onClick={e => e.stopPropagation()} className="text-orange-600 font-semibold hover:underline">RGPD</a>.
        </Checkbox>
      </div>
    </div>
  )
}

/* ── Left panel ───────────────────────────────────────────────────────────── */

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative w-[420px] xl:w-[460px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F1B35] to-[#1A0C02]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rg-pro" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rg-pro)" />
      </svg>
      <div className="absolute top-[28%] -left-24 w-80 h-80 bg-orange-500/[0.14] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[22%] right-0 w-60 h-60 bg-orange-400/[0.08] rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-12">
        <div className="mb-10"><BrandLogo dark /></div>

        <h1 className="text-[26px] font-extrabold text-white leading-snug mb-3">
          Inscrivez votre<br />
          <span className="text-orange-400">agence immobilière</span>
        </h1>
        <p className="text-white/55 text-sm leading-relaxed mb-8">
          Rejoignez la plateforme de confiance pour les professionnels de l'immobilier.
          Vérification KYC, CRM intégré, visibilité premium.
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {[{ v: '1 200+', l: 'Agences' }, { v: '98%', l: 'Satisfaits' }, { v: '24h', l: 'Vérification' }].map(s => (
            <div key={s.l} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-white">{s.v}</div>
              <div className="text-[10px] text-white/45 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-8">
          {[
            { Icon: I.Shield, text: 'Vérification KYC en 24h' },
            { Icon: I.BadgeCheck, text: 'Badge Professionnel vérifié' },
            { Icon: I.Sparkles, text: 'CRM & analytics intégrés' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-orange-400" />
              </div>
              <span className="text-sm text-white/70">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-5 flex-wrap">
          {[
            { Icon: I.Shield, label: 'SSL 256-bit' },
            { Icon: I.Lock, label: 'RGPD conforme' },
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

/* ── Progress bar ─────────────────────────────────────────────────────────── */

function StepProgress({ steps, current }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold text-slate-500">
          Étape {current + 1} sur {steps.length}
        </span>
        <span className="text-[11px] font-bold text-orange-500">
          {Math.round((current / (steps.length - 1)) * 100)}%
        </span>
      </div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
          animate={{ width: `${(current / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              i < current  ? 'bg-emerald-500 text-white' :
              i === current ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' :
                              'bg-slate-100 text-slate-400'
            }`}>
              {i < current ? <I.Check size={10} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block transition-colors ${
              i === current ? 'text-[#0F172A]' : i < current ? 'text-emerald-600' : 'text-slate-400'
            }`}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`w-4 h-px rounded-full transition-colors ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Success screen ───────────────────────────────────────────────────────── */

function SuccessScreen({ email, companyName, onHome }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center px-8 max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl bg-orange-500 shadow-orange-200/70">
          <I.Shield size={36} className="text-white" />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="text-[26px] font-extrabold text-[#0F172A] mb-3">
          Dossier soumis !
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="text-slate-500 text-sm leading-relaxed">
          Votre dossier pour <strong className="text-[#0F172A]">{companyName}</strong> a été transmis à nos équipes.<br />
          Confirmation envoyée à <strong className="text-[#0F172A]">{email}</strong>.<br />
          <span className="text-amber-600 font-semibold">Vérification sous 24 à 48h ouvrées.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
          {[
            { Icon: I.Mail, text: 'E-mail de confirmation envoyé' },
            { Icon: I.FileText, text: "Dossier transmis à l'équipe KYC" },
            { Icon: I.BadgeCheck, text: 'Badge Pro après validation' },
          ].map(({ Icon, text }, i) => (
            <motion.div key={text} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.1 }}>
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-emerald-600" />
              </div>
              <span className="text-sm text-slate-600">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="mt-8 flex flex-col items-center gap-3">
          <Link to="/auth/verify-pending" state={{ email }}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:-translate-y-0.5">
            <I.Mail size={15} />Voir les instructions
          </Link>
          <button type="button" onClick={onHome} className="text-sm text-slate-400 hover:text-[#0F172A] transition font-medium">
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────────── */

export default function ProRegisterPage() {
  const navigate = useNavigate()
  const { loading, error: apiError, run } = useAuthAction()

  const [step, setStep]     = useState(0)
  const [dir, setDir]       = useState(1)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Step 1 — Company
  const [companyName, setCompanyName] = useState('')
  const [legalStatus, setLegalStatus] = useState('')
  const [siret, setSiret]             = useState('')
  const [vatNumber, setVatNumber]     = useState('')

  // Step 2 — Contact
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [phone, setPhone]         = useState('')

  // Step 3 — Address
  const [address, setAddress]       = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity]             = useState('')
  const [country, setCountry]       = useState('France')

  // Step 4 — Profile
  const [logoFile, setLogoFile]     = useState(null)
  const [logoUrl, setLogoUrl]       = useState('')
  const [coverFile, setCoverFile]   = useState(null)
  const [coverUrl, setCoverUrl]     = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite]       = useState('')
  const [linkedin, setLinkedin]     = useState('')
  const [facebook, setFacebook]     = useState('')
  const [instagram, setInstagram]   = useState('')

  // Step 5 — Visibility
  const [showPhone, setShowPhone]       = useState(false)
  const [whatsapp, setWhatsapp]         = useState(false)
  const [receiveLeads, setReceiveLeads] = useState(true)

  // Step 6 — Verification
  const [kbisFile, setKbisFile]   = useState(null)
  const [idDocFile, setIdDocFile] = useState(null)
  const [idDocUrl, setIdDocUrl]   = useState('')
  const [cgu, setCgu]             = useState(false)
  const [rgpd, setRgpd]           = useState(false)

  const [draftRestored, setDraftRestored] = useState(false)

  // File URL management
  const handleLogoFile = (f) => { setLogoFile(f); setLogoUrl(f ? URL.createObjectURL(f) : '') }
  const handleCoverFile = (f) => { setCoverFile(f); setCoverUrl(f ? URL.createObjectURL(f) : '') }
  const handleIdDocFile = (f) => {
    setIdDocFile(f)
    setIdDocUrl(f && f.type?.startsWith('image/') ? URL.createObjectURL(f) : '')
    clearErr('idDoc')
  }
  const handleKbisFile = (f) => { setKbisFile(f); clearErr('kbis') }

  const clearErr = (...keys) => setErrors(e => {
    const n = { ...e }; keys.forEach(k => delete n[k]); return n
  })

  // Autosave — load
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      if (!saved) return
      const hasContent = saved.companyName || saved.siret || saved.email || saved.phone
      if (!hasContent) return
      if (saved.companyName) setCompanyName(saved.companyName)
      if (saved.legalStatus) setLegalStatus(saved.legalStatus)
      if (saved.siret) setSiret(saved.siret)
      if (saved.vatNumber) setVatNumber(saved.vatNumber)
      if (saved.email) setEmail(saved.email)
      if (saved.phone) setPhone(saved.phone)
      if (saved.address) setAddress(saved.address)
      if (saved.postalCode) setPostalCode(saved.postalCode)
      if (saved.city) setCity(saved.city)
      if (saved.country) setCountry(saved.country)
      if (saved.description) setDescription(saved.description)
      if (saved.website) setWebsite(saved.website)
      if (saved.linkedin) setLinkedin(saved.linkedin)
      if (saved.facebook) setFacebook(saved.facebook)
      if (saved.instagram) setInstagram(saved.instagram)
      if (typeof saved.showPhone === 'boolean') setShowPhone(saved.showPhone)
      if (typeof saved.whatsapp === 'boolean') setWhatsapp(saved.whatsapp)
      if (typeof saved.receiveLeads === 'boolean') setReceiveLeads(saved.receiveLeads)
      setDraftRestored(true)
    } catch {}
  }, [])

  // Autosave — persist
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        companyName, legalStatus, siret, vatNumber,
        email, phone,
        address, postalCode, city, country,
        description, website, linkedin, facebook, instagram,
        showPhone, whatsapp, receiveLeads,
      }))
    } catch {}
  }, [companyName, legalStatus, siret, vatNumber, email, phone,
      address, postalCode, city, country, description, website,
      linkedin, facebook, instagram, showPhone, whatsapp, receiveLeads])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setDraftRestored(false)
    setCompanyName(''); setLegalStatus(''); setSiret(''); setVatNumber('')
    setEmail(''); setPassword(''); setConfirmPwd(''); setPhone('')
    setAddress(''); setPostalCode(''); setCity(''); setCountry('France')
    setDescription(''); setWebsite(''); setLinkedin(''); setFacebook(''); setInstagram('')
    setShowPhone(false); setWhatsapp(false); setReceiveLeads(true)
    setKbisFile(null); setIdDocFile(null); setIdDocUrl(''); setCgu(false); setRgpd(false)
  }

  const d = {
    companyName, legalStatus, siret, vatNumber,
    email, password, confirmPwd, phone,
    address, postalCode, city, country,
    logoFile, logoUrl, coverFile, coverUrl, description, website, linkedin, facebook, instagram,
    showPhone, whatsapp, receiveLeads,
    kbisFile, idDocFile, idDocUrl, cgu, rgpd,
  }

  const set = {
    companyName: (v) => { setCompanyName(v); clearErr('companyName') },
    legalStatus: (v) => { setLegalStatus(v); clearErr('legalStatus') },
    siret: (v) => { setSiret(v); clearErr('siret') },
    vatNumber: setVatNumber,
    email: (v) => { setEmail(v); clearErr('email') },
    password: (v) => { setPassword(v); clearErr('password') },
    confirmPwd: (v) => { setConfirmPwd(v); clearErr('confirmPwd') },
    phone: (v) => { setPhone(v); clearErr('phone') },
    address: (v) => { setAddress(v); clearErr('address') },
    postalCode: (v) => { setPostalCode(v); clearErr('postalCode') },
    city: (v) => { setCity(v); clearErr('city') },
    country: setCountry,
    logoFile: handleLogoFile,
    coverFile: handleCoverFile,
    description: setDescription,
    website: (v) => { setWebsite(v); clearErr('website') },
    linkedin: setLinkedin,
    facebook: setFacebook,
    instagram: setInstagram,
    showPhone: setShowPhone,
    whatsapp: setWhatsapp,
    receiveLeads: setReceiveLeads,
    kbisFile: handleKbisFile,
    idDocFile: handleIdDocFile,
    cgu: setCgu,
    rgpd: setRgpd,
  }

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!companyName.trim()) e.companyName = 'Raison sociale requise'
      if (!legalStatus) e.legalStatus = 'Statut juridique requis'
      if (siret.replace(/\s/g, '').length !== 14) e.siret = 'Le SIRET doit comporter 14 chiffres'
    } else if (step === 1) {
      if (!isValidEmail(email)) e.email = 'E-mail invalide'
      if (password.length < 8) e.password = 'Minimum 8 caractères'
      if (confirmPwd !== password) e.confirmPwd = 'Les mots de passe ne correspondent pas'
      if (!phone.trim()) e.phone = 'Téléphone requis'
    } else if (step === 2) {
      if (!address.trim()) e.address = 'Adresse requise'
      if (!/^\d{5}$/.test(postalCode.trim())) e.postalCode = 'Code postal invalide (5 chiffres)'
      if (!city.trim()) e.city = 'Ville requise'
    } else if (step === 3) {
      if (website && !/^https?:\/\/.+\..+/.test(website)) e.website = 'URL invalide (ex: https://mon-agence.fr)'
    } else if (step === 5) {
      if (!kbisFile) e.kbis = 'Extrait Kbis requis'
      if (!idDocFile) e.idDoc = "Pièce d'identité requise"
      if (!cgu) e.cgu = 'Veuillez accepter les CGU'
      if (!rgpd) e.rgpd = 'Consentement RGPD requis'
    }
    return e
  }

  const advance = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})

    if (step === 5) {
      const meta = {
        account_type: 'professional',
        first_name: companyName,
        last_name: '',
        company_name: companyName,
        legal_status: legalStatus,
        business_type: 'agence',
        siret: siret.replace(/\s/g, ''),
        vat_number: vatNumber,
        phone,
        address,
        postal_code: postalCode,
        city,
        country,
        website,
        description,
        linkedin, facebook, instagram,
        show_phone: showPhone,
        whatsapp,
        receive_leads: receiveLeads,
      }
      const files = {
        logo: logoFile || undefined,
        cover: coverFile || undefined,
        kbis: kbisFile || undefined,
        idDoc: idDocFile || undefined,
      }
      const result = await run(() => svc.signUp(email, password, meta, files))
      if (result) {
        localStorage.removeItem(DRAFT_KEY)
        setSuccess(true)
      }
      return
    }

    setDir(1)
    setStep(n => n + 1)
  }

  const back = () => { setErrors({}); setDir(-1); setStep(n => n - 1) }

  if (success) return <SuccessScreen email={email} companyName={companyName} onHome={() => navigate('/')} />

  const isLast = step === 5

  return (
    <div className="min-h-screen flex bg-[#F8F9FC]">
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
          <div className="w-full max-w-[520px]">

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight">Inscription Professionnelle</h2>
              <p className="text-slate-500 text-sm mt-1">Créez votre espace agence en quelques minutes.</p>
            </div>

            {/* Draft restored banner */}
            <AnimatePresence>
              {draftRestored && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5">
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <I.Sparkles size={13} />Brouillon restauré
                    </div>
                    <button type="button" onClick={clearDraft}
                      className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold transition">
                      Effacer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <StepProgress steps={STEPS} current={step} />

            {/* Step content */}
            <div className="min-h-[320px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={step} custom={dir}
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
                  {step === 0 && <Step1_Company d={d} set={set} errors={errors} />}
                  {step === 1 && <Step2_Contact d={d} set={set} errors={errors} />}
                  {step === 2 && <Step3_Address d={d} set={set} errors={errors} />}
                  {step === 3 && <Step4_Profile d={d} set={set} errors={errors} />}
                  {step === 4 && <Step5_Visibility d={d} set={set} />}
                  {step === 5 && <Step6_Verification d={d} set={set} errors={errors} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* API error */}
            <AnimatePresence>
              {apiError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm overflow-hidden">
                  <I.Alert size={15} className="mt-0.5 shrink-0" /><span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className={`mt-6 flex gap-3 ${step > 0 ? '' : 'justify-end'}`}>
              {step > 0 && (
                <button type="button" onClick={back} disabled={loading}
                  className="flex items-center gap-2 px-5 h-12 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-white transition shrink-0 disabled:opacity-40 disabled:pointer-events-none">
                  <I.ArrowLeft size={15} />Retour
                </button>
              )}
              <button type="button" onClick={advance} disabled={loading}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none">
                {loading
                  ? <><I.Loader size={16} />Envoi en cours…</>
                  : isLast
                    ? <><I.CheckCircle size={16} />Soumettre le dossier</>
                    : <>Continuer <I.ArrowRight size={15} /></>}
              </button>
            </div>

            {/* Autosave indicator */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Brouillon sauvegardé automatiquement
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
