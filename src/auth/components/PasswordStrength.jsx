import React from 'react'
import { motion } from 'framer-motion'

const levels = [
  { min: 0,  label: '',          color: 'bg-slate-200' },
  { min: 1,  label: 'Faible',    color: 'bg-rose-400'  },
  { min: 2,  label: 'Moyen',     color: 'bg-amber-400' },
  { min: 3,  label: 'Bon',       color: 'bg-lime-400'  },
  { min: 4,  label: 'Fort',      color: 'bg-emerald-500' },
]

export function getStrength(pw = '') {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function PasswordStrength({ value }) {
  const score = getStrength(value)
  const level = levels[score] ?? levels[0]

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${i <= score ? level.color : 'bg-slate-200'}`}
              initial={{ width: 0 }} animate={{ width: i <= score ? '100%' : '0%' }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            />
          </div>
        ))}
      </div>
      {value && (
        <p className={`text-[11px] font-semibold ${
          score <= 1 ? 'text-rose-500' : score === 2 ? 'text-amber-500' : score === 3 ? 'text-lime-600' : 'text-emerald-600'
        }`}>{level.label}</p>
      )}
    </div>
  )
}
