import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { I } from '../lib/ui.jsx'

/* ─── SVG gauge constants ─────────────────────────────────────── */

const CX   = 100
const CY   = 100
const R    = 72
const CIRC = 2 * Math.PI * R          // ≈ 452.4
const ARC  = CIRC * (270 / 360)       // 270° track ≈ 339.3
const ROT  = 'rotate(135 100 100)'    // start gap at bottom (7:30 → 4:30)

/* ─── Helpers ─────────────────────────────────────────────────── */

const scoreColor = s =>
  s >= 85 ? '#10B981' :
  s >= 70 ? '#3B82F6' :
  s >= 55 ? '#F97316' :
            '#EF4444'

const scoreLabel = s =>
  s >= 85 ? 'Excellent' :
  s >= 70 ? 'Bon' :
  s >= 55 ? 'Moyen' :
            'Faible'

const scoreTone = s =>
  s >= 85 ? { bg: '#ECFDF5', text: '#059669' } :
  s >= 70 ? { bg: '#EFF6FF', text: '#2563EB' } :
  s >= 55 ? { bg: '#FFF7ED', text: '#EA580C' } :
            { bg: '#FFF1F2', text: '#E11D48' }

/* ─── Default factors ─────────────────────────────────────────── */

const DEFAULT_FACTORS = [
  { label: 'Identité légale',    Icon: I.FileText,  score: 30, max: 30, color: '#10B981' },
  { label: 'Présence en ligne',  Icon: I.Globe,     score: 18, max: 25, color: '#3B82F6' },
  { label: 'Avis clients',       Icon: I.Star,      score: 20, max: 25, color: '#F59E0B' },
  { label: 'Réactivité',         Icon: I.Zap,       score: 12, max: 15, color: '#8B5CF6' },
  { label: 'Annonces actives',   Icon: I.Building,  score: 3,  max: 5,  color: '#F97316' },
]

/* ─── AgencyTrustScore ────────────────────────────────────────── */
/* Props:
   score    — 0-100 (computed from factors if not provided)
   factors  — array of { label, Icon, score, max, color }
   industry — industry average (default 67)
   dark     — dark card variant
*/
export default function AgencyTrustScore({
  score:    scoreProp,
  factors = DEFAULT_FACTORS,
  industry = 67,
  dark     = false,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const totalMax = factors.reduce((a, f) => a + f.max, 0)
  const totalRaw = factors.reduce((a, f) => a + f.score, 0)
  const score    = scoreProp ?? Math.round((totalRaw / totalMax) * 100)

  const col     = scoreColor(score)
  const label   = scoreLabel(score)
  const tone    = scoreTone(score)
  const progLen = (score / 100) * ARC

  const bg    = dark ? '#0F172A' : '#FFFFFF'
  const card  = dark ? '#1E293B' : '#F8FAFC'
  const bdr   = dark ? '#334155' : '#E2E8F0'
  const txt   = dark ? '#F1F5F9' : '#0F172A'
  const sub   = dark ? '#94A3B8' : '#64748B'

  return (
    <div ref={ref}
      className="rounded-3xl overflow-hidden"
      style={{
        background: bg,
        border: `1px solid ${bdr}`,
        boxShadow: dark
          ? '0 8px 32px rgba(0,0,0,0.30)'
          : '0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)',
      }}
    >
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: sub }}>
            Score de confiance
          </p>
          <h3 className="text-[17px] font-extrabold" style={{ color: txt }}>Agency Trust Score</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: tone.bg, color: tone.text }}>
          <I.Sparkles size={12} />
          <span className="text-[11px] font-extrabold">{label}</span>
        </div>
      </div>

      {/* ── SVG Gauge ── */}
      <div className="flex flex-col items-center py-4">
        <div className="relative" style={{ width: 200, height: 160 }}>
          <svg width={200} height={200} viewBox="0 0 200 200"
            style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`tg-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={col} stopOpacity="0.8" />
                <stop offset="100%" stopColor={col} />
              </linearGradient>
            </defs>

            {/* Track ring (270°) */}
            <circle cx={CX} cy={CY} r={R}
              fill="none"
              stroke={dark ? '#334155' : '#E2E8F0'}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${ARC} ${CIRC - ARC}`}
              transform={ROT}
            />

            {/* Progress ring */}
            <motion.circle cx={CX} cy={CY} r={R}
              fill="none"
              stroke={`url(#tg-${score})`}
              strokeWidth={10}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${CIRC}` }}
              animate={inView ? { strokeDasharray: `${progLen} ${CIRC - progLen}` } : {}}
              transition={{ duration: 1.4, ease: [0.34, 1.04, 0.64, 1], delay: 0.2 }}
              transform={ROT}
            />

            {/* Industry average tick */}
            {(() => {
              const angle = 135 + (industry / 100) * 270      // deg from right
              const rad   = ((angle - 90) * Math.PI) / 180
              const inner = R - 8
              const outer = R + 5
              const x1 = CX + inner * Math.cos(rad)
              const y1 = CY + inner * Math.sin(rad)
              const x2 = CX + outer * Math.cos(rad)
              const y2 = CY + outer * Math.sin(rad)
              return (
                <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={dark ? '#94A3B8' : '#CBD5E1'}
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.6 }}
                />
              )
            })()}
          </svg>

          {/* Center score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: -12 }}>
            <motion.p
              className="text-4xl font-extrabold tabular-nums leading-none"
              style={{ color: col }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {score}
            </motion.p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: sub }}>/100</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ background: col }} />
            <span className="text-[10px] font-semibold" style={{ color: sub }}>Votre score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: dark ? '#94A3B8' : '#CBD5E1' }} />
            <span className="text-[10px] font-semibold" style={{ color: sub }}>Moy. industrie ({industry})</span>
          </div>
        </div>
      </div>

      {/* ── Factor breakdown ── */}
      <div className="px-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: sub }}>
          Détail du score
        </p>
        <ul className="space-y-3">
          {factors.map((f, i) => {
            const pct = Math.round((f.score / f.max) * 100)
            return (
              <li key={f.label}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: f.color + '22', color: f.color }}>
                    <f.Icon size={12} />
                  </div>
                  <span className="text-[12px] font-semibold flex-1" style={{ color: txt }}>{f.label}</span>
                  <span className="text-[11px] font-extrabold tabular-nums" style={{ color: f.color }}>
                    {f.score}<span className="opacity-50 font-medium">/{f.max}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dark ? '#334155' : '#F1F5F9' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: f.color }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${pct}%` } : {}}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Industry comparison ── */}
      <div className="mx-6 my-4 px-4 py-3 rounded-2xl" style={{ background: card, border: `1px solid ${bdr}` }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold" style={{ color: sub }}>Comparaison industrie</p>
          <span className="text-[11px] font-extrabold" style={{ color: score > industry ? '#10B981' : '#EF4444' }}>
            {score > industry ? `+${score - industry}` : score - industry} pts
          </span>
        </div>
        <div className="flex items-end gap-3">
          {/* You */}
          <div className="flex-1">
            <div className="flex items-end gap-2 mb-1">
              <div className="flex-1 rounded-t-lg overflow-hidden" style={{ height: 40, background: dark ? '#1E293B' : '#F1F5F9' }}>
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ background: col, marginTop: 'auto' }}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(score / 100) * 40}px` } : {}}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                />
              </div>
              <div className="flex-1 rounded-t-lg overflow-hidden" style={{ height: 40, background: dark ? '#1E293B' : '#F1F5F9' }}>
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ background: dark ? '#475569' : '#CBD5E1', marginTop: 'auto' }}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(industry / 100) * 40}px` } : {}}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <p className="flex-1 text-[9px] font-bold text-center uppercase tracking-wide" style={{ color: col }}>Vous</p>
              <p className="flex-1 text-[9px] font-bold text-center uppercase tracking-wide" style={{ color: sub }}>Industrie</p>
            </div>
          </div>

          {/* Verdict text */}
          <div className="flex-[2]">
            <p className="text-[12px] font-bold leading-snug" style={{ color: txt }}>
              {score > industry + 10 ? 'Au-dessus de la moyenne' :
               score > industry      ? 'Dans la moyenne haute' :
               score === industry    ? 'Dans la moyenne' :
                                       'En dessous de la moyenne'}
            </p>
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: sub }}>
              {score > industry
                ? 'Votre agence est bien positionnée pour attirer des leads qualifiés.'
                : 'Complétez votre profil pour améliorer votre score.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Improvement tips (only for non-excellent scores) ── */}
      {score < 85 && (
        <div className="border-t px-6 py-4" style={{ borderColor: bdr }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: sub }}>
            Recommandations
          </p>
          <ul className="space-y-2">
            {[
              score < 85 && { Icon: I.Star,     text: 'Invitez vos clients à laisser un avis vérifié'    },
              score < 85 && { Icon: I.Globe,     text: 'Complétez votre profil web et réseaux sociaux'    },
              score < 70 && { Icon: I.FileText,  text: 'Téléversez les documents manquants'               },
            ].filter(Boolean).map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F97316' + '22', color: '#F97316' }}>
                  <Icon size={11} />
                </div>
                <p className="text-[11px] leading-snug" style={{ color: sub }}>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
