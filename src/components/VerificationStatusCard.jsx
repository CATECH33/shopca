import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'
import VerificationBadge from './VerificationBadge.jsx'

/* ─── Constants ───────────────────────────────────────────────── */

const TIMELINE = [
  { id: 1, label: 'Dossier soumis',       sub: 'Documents reçus par PASMAL'          },
  { id: 2, label: 'Réception confirmée',  sub: 'Prise en charge par l\'équipe Trust'  },
  { id: 3, label: 'Vérification légale',  sub: 'Contrôle Kbis, identité, registre'   },
  { id: 4, label: 'Validation finale',    sub: 'Comité de conformité'                 },
  { id: 5, label: 'Badge activé',         sub: 'Profil public mis à jour'             },
]

// How many steps are complete/active for each status
const STATUS_PROGRESS = {
  pending:  { done: 2, active: 3 },
  verified: { done: 4, active: 5 },
  premium:  { done: 5, active: 5 },
  trusted:  { done: 5, active: 5 },
}

const ESTIMATED = {
  pending:  'Délai estimé : 24–48h ouvrées',
  verified: 'Compte activé le 29 mai 2026',
  premium:  'Statut Premium depuis le 15 avr. 2026',
  trusted:  'Partenariat actif depuis le 10 jan. 2026',
}

const SECURITY_ITEMS = [
  { Icon: I.Lock,      text: 'Documents chiffrés AES-256 en transit et au repos'   },
  { Icon: I.Shield,    text: 'Conformité RGPD · Données jamais revendues'           },
  { Icon: I.FileText,  text: 'Traitement sécurisé par l\'équipe Trust PASMAL'      },
]

/* ─── VerificationStatusCard ──────────────────────────────────── */
/* Props:
   status       — 'pending' | 'verified' | 'premium' | 'trusted'
   agencyName   — string
   submittedAt  — string (ISO date)
   documents    — array of { id, label, status: 'ok' | 'missing' | 'pending' }
   score        — number 0-100 (optional, shows trust score strip)
*/
export default function VerificationStatusCard({
  status       = 'pending',
  agencyName   = 'Votre agence',
  submittedAt  = '2026-05-27',
  score,
  documents    = [
    { id: 'kbis',        label: 'Extrait Kbis (< 3 mois)',     status: 'ok'      },
    { id: 'id',          label: "Pièce d'identité",            status: 'ok'      },
    { id: 'attestation', label: "Attestation d'assurance RC",  status: 'missing' },
    { id: 'mandat',      label: 'Mandat de gestion locative',  status: 'pending' },
  ],
}) {
  const [expanded, setExpanded] = useState(false)
  const prog = STATUS_PROGRESS[status] ?? STATUS_PROGRESS.pending
  const missingDocs = documents.filter(d => d.status === 'missing')
  const isDone = status === 'verified' || status === 'premium' || status === 'trusted'

  /* Accent color shortcut */
  const accent =
    status === 'verified' ? '#059669' :
    status === 'premium'  ? '#F97316' :
    status === 'trusted'  ? '#0F172A' :
                            '#D97706'

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)' }}>

      {/* ── Accent top bar ── */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }} />

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 flex items-start gap-4">
        {/* Agency avatar */}
        <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">
          {agencyName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Vérification</p>
          <h3 className="text-[17px] font-extrabold text-navy-900 truncate">{agencyName}</h3>
          <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <I.Calendar size={11} />
            Dossier soumis le {new Date(submittedAt + 'T00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* Status badge */}
        <VerificationBadge status={status} size="sm" />
      </div>

      {/* ── Estimated time / message ── */}
      <div className="mx-6 mb-4 px-4 py-3 rounded-2xl flex items-center gap-3"
        style={{ background: accent + '12', border: `1px solid ${accent}33` }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '22', color: accent }}>
          {status === 'pending' ? <I.Loader size={13} /> : <I.CheckCircle size={13} />}
        </div>
        <p className="text-[12px] font-semibold flex-1" style={{ color: accent }}>
          {ESTIMATED[status]}
        </p>
      </div>

      {/* ── Milestone timeline ── */}
      <div className="px-6 mb-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Progression</p>
        <ol className="relative space-y-0">
          {TIMELINE.map((step, i) => {
            const done   = i + 1 < prog.done
            const active = i + 1 === prog.active && !isDone
            const last   = i === TIMELINE.length - 1

            return (
              <li key={step.id} className="flex gap-3 relative">
                {/* Connector line */}
                {!last && (
                  <div className="absolute left-[13px] top-7 bottom-0 w-0.5 rounded-full"
                    style={{ background: done || (isDone) ? accent : '#E2E8F0' }} />
                )}

                {/* Circle */}
                <div className="flex-shrink-0 mt-0.5">
                  <motion.div
                    initial={false}
                    animate={{
                      background:   done || isDone ? accent : active ? accent : '#E2E8F0',
                      scale:        active ? 1.1 : 1,
                      boxShadow:    active ? `0 0 0 4px ${accent}22` : '0 0 0 0px transparent',
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                  >
                    {done || isDone
                      ? <I.Check size={13} className="text-white" />
                      : active
                      ? <I.Loader size={13} className="text-white" />
                      : <span className="text-[11px] font-extrabold text-slate-400">{step.id}</span>
                    }
                  </motion.div>
                </div>

                {/* Labels */}
                <div className="flex-1 pb-4">
                  <p className={`text-[13px] font-bold leading-tight ${done || isDone ? 'text-navy-900' : active ? 'text-navy-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.sub}</p>
                </div>

                {/* Done timestamp placeholder */}
                {(done || isDone) && (
                  <p className="text-[10px] text-slate-300 mt-1 flex-shrink-0">✓</p>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {/* ── Documents section ── */}
      <div className="border-t border-slate-100 mx-0">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
        >
          <I.FileText size={14} className="text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-[13px] font-semibold text-navy-900">Documents</span>
            {missingDocs.length > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
                {missingDocs.length} manquant{missingDocs.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <I.ChevronDown size={14} className="text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }} className="overflow-hidden">
              <ul className="px-6 pb-4 space-y-2">
                {documents.map(doc => {
                  const isOk      = doc.status === 'ok'
                  const isMissing = doc.status === 'missing'
                  return (
                    <li key={doc.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[12px] font-medium ${
                        isOk      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        isMissing ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                    'bg-slate-50 border-slate-100 text-slate-500'
                      }`}>
                      {isOk
                        ? <I.CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        : isMissing
                        ? <I.Alert size={14} className="text-rose-400 flex-shrink-0" />
                        : <I.Loader size={14} className="text-slate-400 flex-shrink-0" />
                      }
                      <span className="flex-1">{doc.label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                        {isOk ? 'OK' : isMissing ? 'Requis' : 'En attente'}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {missingDocs.length > 0 && (
                <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <I.Alert size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>{missingDocs.length} document{missingDocs.length > 1 ? 's' : ''} requis</strong> pour finaliser votre vérification.
                    Téléversez-les depuis la section Documents de votre tableau de bord.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Trust score strip (optional) ── */}
      {score !== undefined && (
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trust Score</p>
            <p className="text-sm font-extrabold text-navy-900">{score}<span className="text-slate-400 font-medium">/100</span></p>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: score >= 80 ? '#10B981' : score >= 60 ? '#F97316' : '#EF4444' }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {score >= 85 ? '🏆 Score excellent — Confiance maximale' :
             score >= 70 ? '✅ Bon score — Agence fiable' :
             score >= 55 ? '⚠️ Score moyen — Des documents sont attendus' :
                           '❌ Score faible — Action requise'}
          </p>
        </div>
      )}

      {/* ── Security footer ── */}
      <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sécurité & conformité</p>
        <ul className="space-y-2">
          {SECURITY_ITEMS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Icon size={11} className="text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
