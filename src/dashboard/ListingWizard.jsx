import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I, Button, Badge } from '../lib/ui.jsx'
import { ShopCACheckbox } from '../components/ui/ShopCACheckbox'
import { ShopCARadio } from '../components/ui/ShopCARadio'

/* ============================================================
   Listing Creation Wizard
   - 8 steps, autosaved to localStorage, drag-and-drop upload
   - Reuses design system from lib/ui.jsx
   ============================================================ */

const DRAFT_KEY = 'shopca:listing-draft'

const STEPS = [
  { id: 'type', label: 'Type de bien', icon: I.Building },
  { id: 'location', label: 'Localisation', icon: I.MapPin },
  { id: 'photos', label: 'Photos', icon: I.Image },
  { id: 'description', label: 'Description', icon: I.FileText },
  { id: 'pricing', label: 'Prix', icon: I.Tag },
  { id: 'amenities', label: 'Équipements', icon: I.Sparkles },
  { id: 'preview', label: 'Aperçu', icon: I.Eye },
  { id: 'publish', label: 'Publication', icon: I.Send },
]

const PROPERTY_TYPES = [
  { value: 'Studio', icon: I.Home, hint: 'Pièce unique' },
  { value: 'T2', icon: I.Building, hint: '2 pièces' },
  { value: 'T3', icon: I.Building, hint: '3 pièces' },
  { value: 'Maison', icon: I.Home, hint: 'Maison individuelle' },
  { value: 'Villa', icon: I.Sparkles, hint: 'Bien d\'exception' },
  { value: 'Colocation', icon: I.Users, hint: 'Chambre en coloc.' },
]

const AMENITIES = [
  'Ascenseur', 'Balcon', 'Terrasse', 'Jardin', 'Parking', 'Cave',
  'Piscine', 'Climatisation', 'Cheminée', 'Meublé', 'Fibre', 'Concierge',
]

const initialDraft = {
  type: '',
  transaction: 'acheter', // acheter | louer
  address: '',
  city: '',
  postal: '',
  photos: [], // { id, dataUrl, name }
  title: '',
  description: '',
  rooms: '',
  surface: '',
  price: '',
  charges: '',
  amenities: [],
  agreedTerms: false,
}

export default function ListingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialDraft)
  const [savedAt, setSavedAt] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.data) setData((d) => ({ ...d, ...parsed.data }))
        if (typeof parsed?.step === 'number') setStep(parsed.step)
      }
    } catch {}
  }, [])

  // Autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, ts: Date.now() }))
        setSavedAt(new Date())
      } catch {}
    }, 600)
    return () => clearTimeout(t)
  }, [data, step])

  const set = (patch) => setData((d) => ({ ...d, ...patch }))

  const canNext = (() => {
    switch (STEPS[step].id) {
      case 'type': return !!data.type
      case 'location': return data.address.trim().length > 3 && data.city.trim().length > 1
      case 'photos': return data.photos.length >= 1
      case 'description': return data.title.trim().length > 3 && data.description.trim().length > 20
      case 'pricing': return Number(data.price) > 0
      case 'amenities': return true
      case 'preview': return true
      case 'publish': return data.agreedTerms
      default: return true
    }
  })()

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const discard = () => {
    if (!confirm('Supprimer définitivement ce brouillon ?')) return
    localStorage.removeItem(DRAFT_KEY)
    setData(initialDraft); setStep(0); setSavedAt(null)
  }

  const generateAI = () => {
    if (!data.type || !data.city) return
    setAiLoading(true)
    setTimeout(() => {
      const title = `${data.type} ${data.surface || ''}${data.surface ? ' m²' : ''} ${data.city} — ${data.amenities.includes('Balcon') ? 'avec balcon' : 'lumineux et rénové'}`.trim()
      const description = `Magnifique ${data.type.toLowerCase()} situé ${data.address ? `au ${data.address}, ` : ''}à ${data.city}. ${data.surface ? `D'une surface de ${data.surface} m² ` : ''}${data.rooms ? `comprenant ${data.rooms} pièces, ` : ''}ce bien offre une qualité de prestation premium dans un quartier recherché. ${data.amenities.length ? `Atouts : ${data.amenities.slice(0, 4).join(', ')}.` : ''} À visiter sans tarder.`
      set({ title: data.title || title, description: data.description || description })
      setAiLoading(false)
    }, 900)
  }

  const onPublish = () => {
    // In real app: insert into supabase.from('listings')
    localStorage.removeItem(DRAFT_KEY)
    navigate('/app/listings')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Création</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Nouvelle annonce</h1>
          <p className="text-slate-600 mt-1 text-sm flex items-center gap-2">
            Étape {step + 1} sur {STEPS.length} · {STEPS[step].label}
            {savedAt && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                <I.CheckCircle size={12}/> Brouillon enregistré
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button as={Link} to="/app/listings" variant="ghost" size="sm"><I.X size={14}/> Annuler</Button>
          <Button onClick={discard} variant="outline" size="sm"><I.Trash size={14}/> Supprimer brouillon</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Progress sidebar */}
        <aside className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 lg:p-5 h-fit lg:sticky lg:top-20">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 hidden lg:block">Progression</div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4 lg:hidden">
            <div className="bg-orange-600 h-full rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <ol className="space-y-1 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1 lg:gap-0 no-scrollbar">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const current = i === step
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    onClick={() => (done || i <= step) && setStep(i)}
                    disabled={i > step}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      current ? 'bg-navy-900 text-white shadow-soft'
                      : done ? 'text-navy-900 hover:bg-slate-50'
                      : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      current ? 'bg-orange-600 text-white'
                      : done ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <I.Check size={12}/> : i + 1}
                    </span>
                    <span className="hidden lg:inline">{s.label}</span>
                    <Icon size={14} className="lg:hidden"/>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Step content */}
        <div className="min-w-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 lg:p-10 min-h-[480px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={STEPS[step].id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <StepContent stepId={STEPS[step].id} data={data} set={set} aiLoading={aiLoading} onGenerateAI={generateAI} />
              </motion.div>
            </AnimatePresence>

            {/* Footer nav */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={prev} disabled={step === 0}>
                <I.ArrowLeft size={14}/> Précédent
              </Button>
              <div className="text-xs text-slate-500 hidden md:block">
                Vous pouvez quitter à tout moment, votre progression est sauvegardée.
              </div>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={!canNext}>
                  Continuer <I.ArrowRight size={14}/>
                </Button>
              ) : (
                <Button onClick={onPublish} disabled={!canNext}>
                  Publier l'annonce <I.Send size={14}/>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Step content router
   ============================================================ */
function StepContent({ stepId, data, set, aiLoading, onGenerateAI }) {
  switch (stepId) {
    case 'type': return <StepType data={data} set={set}/>
    case 'location': return <StepLocation data={data} set={set}/>
    case 'photos': return <StepPhotos data={data} set={set}/>
    case 'description': return <StepDescription data={data} set={set} aiLoading={aiLoading} onGenerateAI={onGenerateAI}/>
    case 'pricing': return <StepPricing data={data} set={set}/>
    case 'amenities': return <StepAmenities data={data} set={set}/>
    case 'preview': return <StepPreview data={data}/>
    case 'publish': return <StepPublish data={data} set={set}/>
    default: return null
  }
}

function StepHeader({ kicker, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1.5">{kicker}</div>
      <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-600 mt-2 text-sm leading-relaxed">{subtitle}</p>}
    </div>
  )
}

/* ---------- Step 1: property type + transaction ---------- */
function StepType({ data, set }) {
  return (
    <div>
      <StepHeader kicker="Étape 1" title="Quel type de bien proposez-vous ?" subtitle="Cela nous aide à proposer le bon parcours et les bons critères aux acquéreurs." />

      <div className="bg-slate-50 rounded-2xl p-1 inline-flex mb-6">
        {[['acheter', 'À vendre'], ['louer', 'À louer']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => set({ transaction: k })}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${data.transaction === k ? 'bg-white text-navy-900 shadow-soft' : 'text-slate-600'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PROPERTY_TYPES.map((t) => {
          const Icon = t.icon
          const active = data.type === t.value
          return (
            <button
              key={t.value}
              onClick={() => set({ type: t.value })}
              className={`rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 ${
                active ? 'bg-slate-100 border-slate-900 shadow-soft' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${active ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-900'}`}>
                <Icon size={18}/>
              </div>
              <div className="font-bold text-navy-900">{t.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.hint}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Step 2: location ---------- */
function StepLocation({ data, set }) {
  return (
    <div>
      <StepHeader kicker="Étape 2" title="Où se situe le bien ?" subtitle="Une adresse précise permet d'attirer les bons profils et de mieux référencer votre annonce." />

      <div className="space-y-4 max-w-xl">
        <Field label="Adresse">
          <input value={data.address} onChange={(e) => set({ address: e.target.value })} placeholder="12 rue de Rivoli" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Ville">
              <input value={data.city} onChange={(e) => set({ city: e.target.value })} placeholder="Paris" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
            </Field>
          </div>
          <Field label="Code postal">
            <input value={data.postal} onChange={(e) => set({ postal: e.target.value })} placeholder="75001" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl px-4 py-3 text-sm flex items-start gap-2.5">
          <I.MapPin size={16} className="mt-0.5 shrink-0"/>
          <div><span className="font-semibold">Confidentialité</span> — L'adresse exacte n'est jamais affichée publiquement, seulement le quartier.</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 3: photos with drag & drop ---------- */
function StepPhotos({ data, set }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const addFiles = useCallback((files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    list.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const id = `${file.name}-${file.size}-${Date.now()}`
        set({ photos: [...(data.photos || []), { id, dataUrl: ev.target.result, name: file.name }] })
      }
      reader.readAsDataURL(file)
    })
  }, [data.photos, set])

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const remove = (id) => set({ photos: data.photos.filter((p) => p.id !== id) })
  const setCover = (id) => {
    const cover = data.photos.find((p) => p.id === id)
    if (!cover) return
    set({ photos: [cover, ...data.photos.filter((p) => p.id !== id)] })
  }

  return (
    <div>
      <StepHeader
        kicker="Étape 3"
        title="Ajoutez vos plus belles photos"
        subtitle="Les annonces avec 5+ photos reçoivent en moyenne 4× plus de contacts. Glissez vos fichiers ou cliquez pour parcourir."
      />

      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white shadow-soft text-orange-600 flex items-center justify-center mx-auto mb-4">
          <I.Upload size={22}/>
        </div>
        <div className="font-semibold text-navy-900">Déposez vos photos ici</div>
        <div className="text-xs text-slate-500 mt-1">JPG, PNG ou WebP — jusqu'à 10 Mo par image</div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {data.photos?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-navy-900">{data.photos.length} photo{data.photos.length > 1 ? 's' : ''}</div>
            <div className="text-xs text-slate-500">La première sera utilisée comme miniature</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.photos.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100"
              >
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover"/>
                {i === 0 && (
                  <div className="absolute top-2 left-2"><Badge tone="orange">Couverture</Badge></div>
                )}
                <div className="absolute inset-0 bg-navy-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {i !== 0 && (
                    <button onClick={() => setCover(p.id)} className="bg-white text-navy-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Définir couverture
                    </button>
                  )}
                  <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center">
                    <I.Trash size={14}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Step 4: description with AI generator ---------- */
function StepDescription({ data, set, aiLoading, onGenerateAI }) {
  return (
    <div>
      <StepHeader kicker="Étape 4" title="Rédigez une description engageante" subtitle="Inspirez-vous de l'IA SHOPCA ou écrivez votre propre texte." />

      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-navy-900">Description du bien</div>
          <button
            type="button"
            onClick={onGenerateAI}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition"
          >
            {aiLoading ? <I.Loader size={12}/> : <I.Sparkles size={12}/>}
            {aiLoading ? 'Génération…' : 'Générer avec l\'IA'}
          </button>
        </div>

        <Field label="Titre de l'annonce">
          <input value={data.title} onChange={(e) => set({ title: e.target.value })} placeholder="Magnifique T3 lumineux à Bastille" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
        </Field>

        <Field label="Description complète" textarea>
          <textarea
            value={data.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={8}
            placeholder="Décrivez les points forts, l'environnement, les rénovations récentes…"
            className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none resize-none"
          />
          <div className="text-[11px] text-slate-400 mt-1 text-right">{data.description?.length || 0} caractères · 200 recommandés</div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Pièces">
            <input type="number" value={data.rooms} onChange={(e) => set({ rooms: e.target.value })} placeholder="3" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
          <Field label="Surface (m²)">
            <input type="number" value={data.surface} onChange={(e) => set({ surface: e.target.value })} placeholder="65" className="w-full bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
          </Field>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 5: pricing ---------- */
function StepPricing({ data, set }) {
  const monthly = data.transaction === 'louer'
  return (
    <div>
      <StepHeader kicker="Étape 5" title="Fixez votre prix" subtitle={monthly ? 'Loyer mensuel hors charges, et charges associées si applicable.' : 'Prix de vente affiché.'} />

      <div className="space-y-4 max-w-md">
        <Field label={monthly ? 'Loyer mensuel hors charges' : 'Prix de vente'}>
          <div className="flex items-baseline gap-2">
            <input type="number" value={data.price} onChange={(e) => set({ price: e.target.value })} placeholder={monthly ? '1 200' : '350 000'} className="flex-1 bg-transparent text-navy-900 placeholder-slate-400 text-lg font-bold focus:outline-none" />
            <span className="text-slate-500 text-sm">€{monthly ? '/mois' : ''}</span>
          </div>
        </Field>

        {monthly && (
          <Field label="Charges mensuelles (optionnel)">
            <div className="flex items-baseline gap-2">
              <input type="number" value={data.charges} onChange={(e) => set({ charges: e.target.value })} placeholder="80" className="flex-1 bg-transparent text-navy-900 placeholder-slate-400 text-sm focus:outline-none" />
              <span className="text-slate-500 text-sm">€/mois</span>
            </div>
          </Field>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm">
          <div className="flex items-center gap-2 text-navy-900 font-semibold mb-1.5">
            <I.TrendingUp size={14} className="text-emerald-600"/> Estimation marché SHOPCA
          </div>
          <div className="text-slate-600 text-xs">
            Pour un {data.type || 'bien'} {data.surface ? `de ${data.surface} m² ` : ''}à {data.city || 'votre ville'}, le prix moyen observé est de <span className="font-bold text-navy-900">{monthly ? '1 350 €/mois' : '485 000 €'}</span>. Votre prix est <span className="font-bold text-emerald-600">cohérent</span>.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 6: amenities ---------- */
function StepAmenities({ data, set }) {
  const toggle = (a) => {
    const has = data.amenities.includes(a)
    set({ amenities: has ? data.amenities.filter((x) => x !== a) : [...data.amenities, a] })
  }
  return (
    <div>
      <StepHeader kicker="Étape 6" title="Sélectionnez les équipements" subtitle="Cochez tous les éléments présents dans le bien." />

      <div className="flex flex-wrap gap-2">
        {AMENITIES.map((a) => {
          const active = data.amenities.includes(a)
          return (
            <button
              key={a}
              onClick={() => toggle(a)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                active ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-navy-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {active && <I.Check size={12} className="inline mr-1.5"/>}
              {a}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Step 7: preview ---------- */
function StepPreview({ data }) {
  const fmt = data.price ? `${Number(data.price).toLocaleString('fr-FR')} €${data.transaction === 'louer' ? '/mois' : ''}` : '—'
  return (
    <div>
      <StepHeader kicker="Étape 7" title="Aperçu avant publication" subtitle="Voici à quoi votre annonce ressemblera dans le catalogue SHOPCA." />

      <div className="max-w-md bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100">
        <div className="relative aspect-[4/3] bg-slate-100">
          {data.photos?.[0] ? (
            <img src={data.photos[0].dataUrl} alt={data.title} className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300"><I.Image size={40}/></div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge tone="orange"><I.Star size={11} fill="white"/> Premium</Badge>
          </div>
          <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
            <I.Heart size={14} className="text-navy-900"/>
          </button>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-navy-900 leading-tight line-clamp-1 mb-1">{data.title || 'Titre de l\'annonce'}</h3>
          <div className="flex items-center gap-1.5 text-slate-600 text-sm mb-3">
            <I.MapPin size={12}/> {data.city || 'Ville'}{data.postal ? ` · ${data.postal}` : ''}
          </div>
          <div className="flex items-center gap-3 text-xs text-navy-700 mb-3">
            {data.rooms && <span className="flex items-center gap-1"><I.Bed size={13} className="text-orange-600"/> {data.rooms} p.</span>}
            {data.surface && <span className="flex items-center gap-1"><I.Maximize size={13} className="text-orange-600"/> {data.surface} m²</span>}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-lg font-extrabold text-navy-900">{fmt}</div>
            <span className="text-orange-600 text-xs font-semibold flex items-center gap-1">Voir <I.ArrowRight size={12}/></span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-600 max-w-md">
        <div className="text-navy-900 font-semibold mb-2">Récapitulatif</div>
        <ul className="space-y-1 text-xs">
          <li>Type : <span className="font-semibold text-navy-900">{data.type}</span></li>
          <li>Transaction : <span className="font-semibold text-navy-900">{data.transaction === 'acheter' ? 'À vendre' : 'À louer'}</span></li>
          <li>Photos : <span className="font-semibold text-navy-900">{data.photos?.length || 0}</span></li>
          <li>Équipements : <span className="font-semibold text-navy-900">{data.amenities?.length || 0}</span></li>
        </ul>
      </div>
    </div>
  )
}

/* ---------- Step 8: publish ---------- */
function StepPublish({ data, set }) {
  return (
    <div>
      <StepHeader kicker="Étape 8" title="Plus qu'une étape" subtitle="Choisissez le niveau de visibilité et validez les conditions." />

      <div className="space-y-3 max-w-2xl">
        {[
          { id: 'free',  name: 'Standard',       price: 'Gratuit', perks: ['Annonce publiée 30 jours', 'Diffusion standard'] },
          { id: 'boost', name: 'Pack Visibilité', price: '+49 €',   perks: ['Mise en avant Premium', 'Badge "À la Une"', '4× plus de contacts'], highlight: true },
        ].map((p) => {
          const selected = (data.plan ?? 'boost') === p.id
          return (
            <div
              key={p.id}
              onClick={() => set({ plan: p.id })}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selected ? 'border-orange-400 bg-orange-50/50 shadow-sm shadow-orange-100'
                : p.highlight ? 'border-orange-200 bg-orange-50/20 hover:border-orange-300'
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <ShopCARadio value={p.id} checked={selected} onChange={() => set({ plan: p.id })} />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-navy-900 flex items-center gap-2">{p.name} {p.highlight && <Badge tone="orange">Recommandé</Badge>}</div>
                  <div className="font-extrabold text-navy-900">{p.price}</div>
                </div>
                <ul className="text-xs text-slate-600 mt-2 space-y-1">
                  {p.perks.map((perk) => <li key={perk} className="flex items-center gap-1.5"><I.Check size={11} className="text-emerald-600"/>{perk}</li>)}
                </ul>
              </div>
            </div>
          )
        })}

        <ShopCACheckbox
          checked={data.agreedTerms}
          onChange={v => set({ agreedTerms: v })}
          className="mt-4"
          label={
            <span className="text-xs text-slate-600">
              J'accepte les <a href="#" className="text-orange-600 underline">conditions de publication</a> et confirme que je suis autorisé à publier ce bien sur SHOPCA.
            </span>
          }
        />
      </div>
    </div>
  )
}

/* ---------- Reusable input field ---------- */
function Field({ label, children, textarea = false }) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-600 mb-1.5">{label}</div>
      <div className={`px-4 ${textarea ? 'py-3' : 'h-14 flex items-center'} bg-slate-50 border-2 border-slate-200 rounded-[14px] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200`}>
        {children}
      </div>
    </div>
  )
}
