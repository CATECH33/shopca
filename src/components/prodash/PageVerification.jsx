import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { svc } from '../../features/auth/hooks/useAuth.js'

const DOC_DEFS = [
  { key: 'kbis',        label: 'Extrait Kbis'            },
  { key: 'id_document', label: "Pièce d'identité"        },
  { key: 'selfie',      label: 'Selfie de vérification',  staticHint: 'Disponible prochainement',       noUpload: true },
  { key: 'rcp',         label: 'RCP professionnelle',     staticHint: 'Recommandé pour badge Premium',  noUpload: true },
]

const STATUS_CFG = {
  validated: { label: 'Validé',     Icon: I.Check,  ring: 'border-emerald-400', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'bg-emerald-500' },
  pending:   { label: 'En attente', Icon: I.Loader, ring: 'border-amber-400',   bg: 'bg-amber-100',   text: 'text-amber-700',   icon: 'bg-amber-400'   },
  rejected:  { label: 'Refusé',     Icon: I.Alert,  ring: 'border-rose-400',    bg: 'bg-rose-100',    text: 'text-rose-700',    icon: 'bg-rose-500'    },
  missing:   { label: 'Manquant',   Icon: I.Upload, ring: 'border-slate-300',   bg: 'bg-slate-100',   text: 'text-slate-500',   icon: 'bg-slate-300'   },
}

const BANNER_CFG = {
  approved: { label: 'Agence vérifiée',       sub: 'Badge actif sur toutes vos annonces',            icon: 'bg-emerald-500' },
  pending:  { label: 'Vérification en cours', sub: 'Notre équipe examine vos documents sous 24 h',   icon: 'bg-amber-400'   },
  none:     { label: 'Non vérifiée',           sub: 'Soumettez vos documents pour obtenir le badge', icon: 'bg-slate-400'   },
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PageVerification({ dark }) {
  const { user, profile } = useAuth()
  const [docs,      setDocs]      = useState([])
  const [uploading, setUploading] = useState({})

  const kbisRef  = useRef()
  const idDocRef = useRef()
  const inputRefs = { kbis: kbisRef, id_document: idDocRef }

  const loadDocs = useCallback(async () => {
    if (!user) return
    try { setDocs(await svc.getVerificationDocs(user.id)) } catch {}
  }, [user])

  useEffect(() => { loadDocs() }, [loadDocs])

  const getDocStatus = (key) => {
    const row = docs.find(d => d.doc_type === key)
    if (!row) return { status: 'missing', hint: '' }
    const date = fmtDate(row.uploaded_at)
    if (row.status === 'approved') return { status: 'validated', hint: `Validé le ${date}` }
    if (row.status === 'pending')  return { status: 'pending',   hint: `Envoyé le ${date}` }
    if (row.status === 'rejected') return { status: 'rejected',  hint: `Refusé le ${date}` }
    return { status: 'missing', hint: '' }
  }

  const handleUpload = async (key, file) => {
    if (!file || !user) return
    setUploading(u => ({ ...u, [key]: true }))
    try {
      await svc.uploadVerificationDoc(user.id, key, file)
      await loadDocs()
    } catch (err) {
      console.error('[verification] upload failed:', err)
    } finally {
      setUploading(u => ({ ...u, [key]: false }))
    }
  }

  const resolvedDocs = DOC_DEFS.map(def => {
    if (def.noUpload) return { ...def, status: 'missing', hint: def.staticHint }
    return { ...def, ...getDocStatus(def.key) }
  })

  const validated = resolvedDocs.filter(d => d.status === 'validated').length
  const pct = Math.round((validated / resolvedDocs.length) * 100)

  const kycStatus = profile?.kyc_status ?? 'none'
  const banner = BANNER_CFG[kycStatus] ?? BANNER_CFG.none

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,#0B1F3A,#1a3a6b)' }}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${banner.icon}`}>
          <I.BadgeCheck size={26} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-extrabold text-lg">{banner.label}</p>
          <p className="text-white/60 text-sm mt-0.5">{banner.sub}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white/50 text-xs">Score de confiance</p>
          <p className="text-white font-extrabold text-2xl">{pct}%</p>
        </div>
      </div>

      {/* Progress */}
      <div className={`rounded-2xl border p-5 shadow-sm ${bd}`}>
        <div className="flex justify-between text-xs mb-2">
          <span className={`font-bold ${tx}`}>Progression de la vérification</span>
          <span className={sx}>{validated}/{resolvedDocs.length} documents</span>
        </div>
        <div className={`h-2.5 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
          <motion.div className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, type: 'spring' }} />
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        {resolvedDocs.map(({ key, label, status, hint, noUpload }) => {
          const c = STATUS_CFG[status]
          const isUploading = uploading[key]
          const canUpload = !noUpload && (status === 'missing' || status === 'rejected')
          return (
            <div key={key} className={`rounded-2xl border-2 p-4 flex items-center gap-4 ${c.ring} ${dark ? 'bg-[#1f2937]' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                {isUploading
                  ? <I.Loader size={17} className="text-white animate-spin" />
                  : <c.Icon size={17} className="text-white" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${tx}`}>{label}</p>
                {hint && <p className={`text-xs mt-0.5 ${sx}`}>{hint}</p>}
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>{c.label}</span>
              {canUpload && (
                <>
                  <input ref={inputRefs[key]} type="file" accept="application/pdf,image/*" className="hidden"
                    onChange={e => { handleUpload(key, e.target.files[0]); e.target.value = '' }} />
                  <button onClick={() => inputRefs[key]?.current?.click()} disabled={isUploading}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 transition shrink-0 disabled:opacity-40">
                    Uploader
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className={`rounded-2xl border p-4 flex gap-3 ${dark ? 'bg-[#1f2937] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <I.Shield size={16} className="text-navy-700 shrink-0 mt-0.5" />
        <p className={`text-xs leading-relaxed ${sx}`}>
          Tous les documents sont vérifiés manuellement par notre équipe sous 24 h ouvrées. Pour toute question : <span className="text-orange-500 font-semibold">verification@pasmal.fr</span>
        </p>
      </div>
    </div>
  )
}
