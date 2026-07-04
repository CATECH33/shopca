import React, { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Button, Badge } from '../lib/ui.jsx'
import { ShopCASelect } from '../components/ui/ShopCASelect'

/* ============================================================
   Agency Verification — Premium PropTech workflow
   - Upload Kbis + Carte d'identité (simulé)
   - Statuts : En attente / Vérifié / Refusé
   - Timeline de validation
   ============================================================ */

const fmtSize = (b) => {
  if (b < 1024) return `${b} o`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`
  return `${(b / 1024 / 1024).toFixed(1)} Mo`
}

const initialEvent = () => ({ ts: new Date(), label: 'Dossier créé', text: 'Votre dossier de vérification a été initialisé.', icon: 'create', tone: 'slate' })

export default function AgencyVerification() {
  /* ---------- Agency state ---------- */
  const [agency, setAgency] = useState({
    name: 'ShopCA Estate SAS',
    siret: '892 410 388 00012',
    legalForm: 'SAS',
    capital: '50 000 €',
    address: '12 rue de Rivoli, 75001 Paris',
    contactName: 'Jean Kevin PEMOU',
    email: 'jean@shopca.fr',
    phone: '+33 6 12 34 56 78',
  })
  const setField = (k) => (e) => setAgency((a) => ({ ...a, [k]: e.target.value }))

  /* ---------- Documents state ---------- */
  const [docs, setDocs] = useState({
    kbis: null,    // { name, size, type, preview, uploadedAt, status }
    idCard: null,
  })

  /* ---------- Verification status ----------
     incomplete → pending → verified | rejected
  */
  const [status, setStatus] = useState('incomplete')
  const [reason, setReason] = useState('')
  const [events, setEvents] = useState([initialEvent()])

  const pushEvent = (label, text, icon, tone) =>
    setEvents((e) => [...e, { ts: new Date(), label, text, icon, tone }])

  const allUploaded = docs.kbis && docs.idCard
  const canSubmit = allUploaded && status === 'incomplete'

  /* ---------- Upload simulation ---------- */
  const handleFile = useCallback((kind, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const isImage = file.type.startsWith('image/')
      setDocs((d) => ({
        ...d,
        [kind]: {
          name: file.name,
          size: file.size,
          type: file.type,
          preview: isImage ? ev.target.result : null,
          uploadedAt: new Date(),
          status: 'uploaded',
        },
      }))
      pushEvent(
        kind === 'kbis' ? 'Kbis téléversé' : 'Pièce d\'identité téléversée',
        `${file.name} · ${fmtSize(file.size)}`,
        'upload', 'orange'
      )
    }
    reader.readAsDataURL(file)
  }, [])

  const removeDoc = (kind) => {
    setDocs((d) => ({ ...d, [kind]: null }))
    pushEvent(
      kind === 'kbis' ? 'Kbis retiré' : 'Pièce d\'identité retirée',
      'Le document a été supprimé du dossier.',
      'remove', 'rose'
    )
  }

  /* ---------- Submit for verification ---------- */
  const submitForReview = () => {
    if (!canSubmit) return
    setStatus('pending')
    setReason('')
    pushEvent('Dossier soumis', 'Notre équipe va examiner vos documents sous 24 à 48h.', 'send', 'indigo')
  }

  /* ---------- Demo actions ---------- */
  const simulateApprove = () => {
    setStatus('verified')
    setReason('')
    setDocs((d) => ({
      kbis: d.kbis ? { ...d.kbis, status: 'approved' } : d.kbis,
      idCard: d.idCard ? { ...d.idCard, status: 'approved' } : d.idCard,
    }))
    pushEvent('Vérifié ✓', 'Agence vérifiée. Le badge "Agence vérifiée" est désormais affiché publiquement.', 'verified', 'emerald')
  }
  const simulateReject = () => {
    const r = 'Le Kbis fourni est expiré (plus de 3 mois). Veuillez en télécharger un nouveau via Infogreffe.'
    setStatus('rejected')
    setReason(r)
    pushEvent('Dossier refusé', r, 'rejected', 'rose')
  }
  const reset = () => {
    setStatus('incomplete'); setReason(''); setDocs({ kbis: null, idCard: null })
    setEvents([initialEvent()])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Conformité</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Vérification d'agence</h1>
          <p className="text-slate-600 mt-1 text-sm">Téléchargez les pièces justificatives pour obtenir le badge officiel <strong className="text-navy-900">Agence vérifiée</strong>.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reset}><I.Trash size={14}/> Réinitialiser</Button>
        </div>
      </div>

      {/* Demo controls (simulation panel) */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center gap-3 flex-wrap text-xs">
        <span className="font-bold uppercase tracking-wider text-orange-700 text-[10px]">Simulation</span>
        <span className="text-orange-700/80">Démo locale — déclenchez manuellement les états :</span>
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          <button onClick={() => { setStatus('pending'); pushEvent('Mise en attente', 'Dossier en cours d\'examen par SHOPCA Trust.', 'send', 'indigo') }} className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition">Mettre en attente</button>
          <button onClick={simulateApprove} className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition">Approuver</button>
          <button onClick={simulateReject} className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold transition">Refuser</button>
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner status={status} reason={reason} progress={computeProgress({ docs, status })} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Uploads + Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-navy-900">Documents requis</h2>
              <Badge tone={allUploaded ? 'emerald' : 'amber'}>{allUploaded ? '2 / 2' : `${[docs.kbis, docs.idCard].filter(Boolean).length} / 2`}</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-5">Format accepté : PDF, JPG, PNG · 10 Mo maximum par fichier.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UploadCard
                kind="kbis"
                title="Extrait Kbis"
                hint="Datant de moins de 3 mois"
                icon={I.Building}
                doc={docs.kbis}
                onFile={(f) => handleFile('kbis', f)}
                onRemove={() => removeDoc('kbis')}
                locked={status === 'pending' || status === 'verified'}
              />
              <UploadCard
                kind="idCard"
                title="Pièce d'identité"
                hint="CNI ou passeport du représentant"
                icon={I.User}
                doc={docs.idCard}
                onFile={(f) => handleFile('idCard', f)}
                onRemove={() => removeDoc('idCard')}
                locked={status === 'pending' || status === 'verified'}
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 flex-wrap pt-5 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <I.Shield size={14} className="text-emerald-600"/> Vos documents sont chiffrés en transit et au repos (AES-256).
              </div>
              <Button onClick={submitForReview} disabled={!canSubmit}>
                {status === 'pending' ? <><I.Loader size={14}/> Examen en cours…</> : <>Soumettre pour vérification <I.ArrowRight size={14}/></>}
              </Button>
            </div>
          </section>

          {/* Agency info form */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
            <h2 className="font-bold text-navy-900 mb-1">Informations de l'agence</h2>
            <p className="text-xs text-slate-500 mb-5">Ces données doivent correspondre exactement à celles de votre Kbis.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Raison sociale">
                <input value={agency.name} onChange={setField('name')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
              </Field>
              <Field label="SIRET">
                <input value={agency.siret} onChange={setField('siret')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none font-mono"/>
              </Field>
              <Field label="Forme juridique">
                <ShopCASelect
                  value={agency.legalForm}
                  onChange={v => setAgency(a => ({ ...a, legalForm: v }))}
                  options={['SAS', 'SARL', 'EURL', 'SCI', 'SA', 'Auto-entrepreneur']}
                  placeholder="Choisir…"
                  ghost
                  className="flex-1"
                />
              </Field>
              <Field label="Capital social">
                <input value={agency.capital} onChange={setField('capital')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
              </Field>
              <div className="md:col-span-2">
                <Field label="Adresse du siège">
                  <input value={agency.address} onChange={setField('address')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
                </Field>
              </div>
              <Field label="Nom du représentant légal">
                <input value={agency.contactName} onChange={setField('contactName')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
              </Field>
              <Field label="Téléphone">
                <input value={agency.phone} onChange={setField('phone')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
              </Field>
              <div className="md:col-span-2">
                <Field label="E-mail professionnel">
                  <input value={agency.email} onChange={setField('email')} className="w-full bg-transparent text-navy-900 text-sm focus:outline-none"/>
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* Right column: Timeline + Trust card */}
        <div className="space-y-6">
          <TrustCard status={status} agency={agency} />
          <Timeline events={events} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Status banner (color + progress)
   ============================================================ */
function StatusBanner({ status, reason, progress }) {
  const config = {
    incomplete: {
      title: 'Dossier incomplet',
      text: 'Téléchargez votre Kbis et votre pièce d\'identité pour soumettre votre dossier.',
      tone: 'amber', accent: '#F59E0B', icon: I.Alert,
    },
    pending: {
      title: 'En attente de validation',
      text: 'Notre équipe Trust étudie votre dossier. Délai moyen : 24 à 48h ouvrées.',
      tone: 'indigo', accent: '#6366F1', icon: I.Loader,
    },
    verified: {
      title: 'Agence vérifiée',
      text: 'Félicitations — votre badge officiel est désormais affiché sur toutes vos annonces.',
      tone: 'emerald', accent: '#10B981', icon: I.BadgeCheck,
    },
    rejected: {
      title: 'Dossier refusé',
      text: reason || 'Votre dossier nécessite des corrections avant resoumission.',
      tone: 'rose', accent: '#E11D48', icon: I.X,
    },
  }[status]

  const Icon = config.icon
  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5 lg:p-6 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${config.accent} ${progress}%, #F1F5F9 ${progress}%)` }}
      />
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: config.accent + '22', color: config.accent }}>
          <Icon size={22}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-navy-900 text-lg">{config.title}</h2>
            <Badge tone={config.tone}>{status === 'incomplete' ? 'À compléter' : status === 'pending' ? 'En attente' : status === 'verified' ? 'Vérifié' : 'Refusé'}</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{config.text}</p>

          <div className="mt-4 flex items-center gap-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avancement</div>
            <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }}
                className="h-full rounded-full" style={{ background: config.accent }}
              />
            </div>
            <div className="text-xs font-bold text-navy-900">{progress}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Upload card with drag & drop (simulé)
   ============================================================ */
function UploadCard({ kind, title, hint, icon: Icon, doc, onFile, onRemove, locked }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const docStatus = doc?.status

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    if (locked) return
    const file = e.dataTransfer?.files?.[0]
    if (file) onFile(file)
  }

  const click = () => { if (!locked) inputRef.current?.click() }

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all ${
      doc
        ? (docStatus === 'approved' ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50/60 border-slate-200')
        : drag ? 'bg-orange-50 border-orange-300' : 'bg-white border-dashed border-slate-200 hover:border-slate-300'
    } ${locked && !doc ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-navy-900 flex items-center justify-center shrink-0">
          <Icon size={16}/>
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-navy-900 text-sm">{title}</div>
          <div className="text-[11px] text-slate-500">{hint}</div>
        </div>
        {doc && (
          <div className="ml-auto">
            {docStatus === 'approved'
              ? <Badge tone="emerald"><I.Check size={11}/> Approuvé</Badge>
              : <Badge tone="amber">En attente</Badge>}
          </div>
        )}
      </div>

      {!doc ? (
        <div
          onClick={click}
          onDragOver={(e) => { e.preventDefault(); !locked && setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`rounded-xl px-4 py-6 text-center cursor-pointer transition ${locked ? 'cursor-not-allowed' : 'hover:bg-white'}`}
        >
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center mb-2">
            <I.Upload size={16}/>
          </div>
          <div className="text-sm font-semibold text-navy-900">Déposer ici ou cliquer</div>
          <div className="text-[11px] text-slate-500 mt-0.5">PDF · JPG · PNG · 10 Mo max.</div>
          <input
            ref={inputRef} type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3">
          {doc.preview ? (
            <img src={doc.preview} alt={doc.name} className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-100"/>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <I.FileText size={18}/>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-navy-900 truncate">{doc.name}</div>
            <div className="text-[11px] text-slate-500">{fmtSize(doc.size)} · {doc.type.split('/').pop().toUpperCase()}</div>
          </div>
          {!locked && (
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
              title="Retirer"
            >
              <I.Trash size={14}/>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Field
   ============================================================ */
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="px-4 h-11 flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-slate-300 transition">
        {children}
      </div>
    </label>
  )
}

/* ============================================================
   Trust preview card
   ============================================================ */
function TrustCard({ status, agency }) {
  const verified = status === 'verified'
  return (
    <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-3xl p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-600/30 blur-3xl"/>
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-3">Aperçu profil public</div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white text-navy-900 font-extrabold flex items-center justify-center shrink-0">
          {agency.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="font-bold text-sm truncate">{agency.name}</div>
            {verified && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                title="Agence vérifiée par SHOPCA"
              >
                <I.BadgeCheck size={14} className="text-orange-400"/>
              </motion.span>
            )}
          </div>
          <div className="text-[11px] text-white/60 truncate">SIRET {agency.siret}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <Row icon={I.MapPin} label={agency.address}/>
        <Row icon={I.Mail} label={agency.email}/>
        <Row icon={I.Phone} label={agency.phone}/>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">Trust Score</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: verified ? '94%' : '62%' }} transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            />
          </div>
          <div className="text-sm font-extrabold">{verified ? '94' : '62'}<span className="text-white/40">/100</span></div>
        </div>
      </div>
    </div>
  )
}
function Row({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-white/80">
      <Icon size={12} className="text-white/50 shrink-0"/>
      <span className="truncate">{label}</span>
    </div>
  )
}

/* ============================================================
   Validation timeline
   ============================================================ */
function Timeline({ events }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5">
      <h3 className="font-bold text-navy-900 mb-1">Journal de validation</h3>
      <p className="text-xs text-slate-500 mb-4">Historique complet des événements liés à votre dossier.</p>

      <ol className="relative border-l-2 border-slate-100 pl-5 space-y-4">
        <AnimatePresence initial={false}>
          {events.slice().reverse().map((e, i) => {
            const ICONS = { upload: I.Upload, remove: I.Trash, send: I.Send, verified: I.Check, rejected: I.X, create: I.Sparkles }
            const TONES = {
              slate: 'bg-slate-100 text-slate-600 ring-slate-100',
              orange: 'bg-orange-100 text-orange-700 ring-orange-50',
              indigo: 'bg-indigo-100 text-indigo-700 ring-indigo-50',
              emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-50',
              rose: 'bg-rose-100 text-rose-700 ring-rose-50',
            }
            const Icon = ICONS[e.icon] || I.Sparkles
            return (
              <motion.li
                key={`${e.label}-${e.ts.toISOString()}-${i}`}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              >
                <span className={`absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center ring-4 ${TONES[e.tone] || TONES.slate}`}>
                  <Icon size={11}/>
                </span>
                <div className="text-sm font-semibold text-navy-900">{e.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{e.text}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {e.ts.toLocaleDateString('fr-FR')} · {e.ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ol>
    </div>
  )
}

/* ============================================================
   Progress helper
   ============================================================ */
function computeProgress({ docs, status }) {
  if (status === 'verified') return 100
  if (status === 'rejected') return 75
  if (status === 'pending') return 75
  // incomplete: based on uploads + form (assume form is filled)
  let p = 25 // form started
  if (docs.kbis) p += 25
  if (docs.idCard) p += 25
  return p
}
