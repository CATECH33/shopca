import React from 'react'
import { motion } from 'framer-motion'

export default function ToggleSwitch({ checked, onChange, label, sub }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-3 px-4 rounded-2xl border-2 transition-all
        hover:border-slate-300 bg-white group"
      style={{ borderColor: checked ? '#fb923c' : '#e2e8f0' }}>
      <div className="text-left">
        <p className="text-sm font-bold text-navy-900">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${checked ? 'bg-orange-500' : 'bg-slate-200'}`}>
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </div>
    </button>
  )
}
