import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'

/* ─── Status config ───────────────────────────────────────────── */

const CFG = {
  pending: {
    label:    'En cours de vérification',
    sub:      'Examen sous 24–48h',
    Icon:     I.Loader,
    color:    '#D97706',
    bg:       '#FFFBEB',
    border:   '#FDE68A',
    glow:     'rgba(217,119,6,0.14)',
    grad:     null,
  },
  verified: {
    label:    'Agence vérifiée',
    sub:      'Identité confirmée · SHOPCA Trust',
    Icon:     I.BadgeCheck,
    color:    '#059669',
    bg:       '#ECFDF5',
    border:   '#6EE7B7',
    glow:     'rgba(5,150,105,0.14)',
    grad:     null,
  },
  premium: {
    label:    'Agence Premium',
    sub:      'Badge Pro · Prioritaire',
    Icon:     I.Zap,
    color:    '#F97316',
    bg:       '#FFF7ED',
    border:   '#FED7AA',
    glow:     'rgba(249,115,22,0.18)',
    grad:     'linear-gradient(135deg,#FFF7ED 0%,#FEF3C7 100%)',
  },
  trusted: {
    label:    'Partenaire de confiance',
    sub:      'Niveau Expert · Certifié',
    Icon:     I.Shield,
    color:    '#FB923C',
    bg:       '#0F172A',
    border:   '#1E3A5F',
    glow:     'rgba(251,146,60,0.22)',
    grad:     null,
    dark:     true,
  },
}

/* ─── VerificationBadge ───────────────────────────────────────── */
/* Props:
   status  — 'pending' | 'verified' | 'premium' | 'trusted'
   size    — 'sm' | 'md' | 'lg'
   showSub — show subtitle (ignored for sm, default true)
*/
export default function VerificationBadge({ status = 'pending', size = 'md', showSub = true }) {
  const c = CFG[status] ?? CFG.pending
  const { Icon } = c

  /* ── sm: compact pill ── */
  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: c.grad || c.bg, color: c.dark ? '#FB923C' : c.color, border: `1px solid ${c.border}` }}
      >
        <Icon size={12} />
        {c.label}
      </span>
    )
  }

  /* ── md: horizontal badge card ── */
  if (size === 'md') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: c.grad || c.bg,
          border: `1.5px solid ${c.border}`,
          boxShadow: `0 0 0 4px ${c.glow}`,
        }}
      >
        {/* Icon circle */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.color + '22', color: c.color }}>
          <Icon size={17} />
        </div>
        {/* Text */}
        <div>
          <p className="text-[13px] font-extrabold leading-tight"
            style={{ color: c.dark ? '#F1F5F9' : '#0F172A' }}>{c.label}</p>
          {showSub && (
            <p className="text-[11px] mt-0.5"
              style={{ color: c.dark ? '#94A3B8' : '#64748B' }}>{c.sub}</p>
          )}
        </div>
        {/* Pending shimmer dot */}
        {status === 'pending' && (
          <div className="w-2 h-2 rounded-full ml-auto flex-shrink-0 relative">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: c.color, opacity: 0.5 }} />
            <span className="relative w-2 h-2 rounded-full block" style={{ background: c.color }} />
          </div>
        )}
      </motion.div>
    )
  }

  /* ── lg: feature card ── */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="relative overflow-hidden rounded-3xl p-6"
      style={{
        background: c.grad || c.bg,
        border: `2px solid ${c.border}`,
        boxShadow: `0 0 0 6px ${c.glow}, 0 8px 32px rgba(0,0,0,0.07)`,
      }}
    >
      {/* Background decoration */}
      {c.dark && (
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)' }} />
      )}
      {status === 'premium' && (
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)' }} />
      )}

      {/* Main content */}
      <div className="relative flex items-start gap-4">
        <motion.div
          animate={status === 'premium' ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.color + '22', color: c.color, boxShadow: `0 0 0 4px ${c.glow}` }}
        >
          <Icon size={26} />
        </motion.div>
        <div className="flex-1">
          <p className="text-base font-extrabold leading-tight"
            style={{ color: c.dark ? '#F8FAFC' : '#0F172A' }}>{c.label}</p>
          {showSub && (
            <p className="text-[12px] mt-1 leading-relaxed"
              style={{ color: c.dark ? '#94A3B8' : '#64748B' }}>{c.sub}</p>
          )}
        </div>
      </div>

      {/* Pending indeterminate progress bar */}
      {status === 'pending' && (
        <div className="relative mt-5 h-1.5 rounded-full overflow-hidden"
          style={{ background: '#FDE68A' }}>
          <motion.div className="absolute left-0 top-0 bottom-0 w-1/2 rounded-full"
            style={{ background: c.color }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }} />
        </div>
      )}

      {/* Verified: checkmark row */}
      {(status === 'verified' || status === 'trusted') && (
        <div className="mt-4 flex items-center gap-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, delay: 0.2 }}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: c.color }}>
            <I.Check size={12} className="text-white" />
          </motion.div>
          <p className="text-[11px] font-semibold" style={{ color: c.dark ? '#94A3B8' : '#64748B' }}>
            {status === 'trusted' ? 'Partenaire certifié SHOPCA depuis 2024' : 'Vérifié par l\'équipe SHOPCA Trust'}
          </p>
        </div>
      )}

      {/* Premium: features row */}
      {status === 'premium' && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {['Badge visible', 'Leads prioritaires', 'API CRM', 'Stats avancées'].map(tag => (
            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#F97316', color: '#fff' }}>{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
