import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

export default function DocumentUpload({ label, hint, value, onChange, accept = '.pdf,.jpg,.jpeg,.png' }) {
  const ref = useRef()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) onChange({ file, name: file.name, size: file.size })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onChange({ file, name: file.name, size: file.size })
  }

  return (
    <div>
      {label && <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => ref.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={`w-full rounded-2xl border-2 border-dashed px-4 py-4 flex items-center gap-3 transition-colors text-left ${
          value ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-orange-400 bg-slate-50 hover:bg-orange-50'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          value ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
        }`}>
          {value ? <I.Check size={16} /> : <I.Upload size={15} />}
        </div>
        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <p className="text-sm font-bold text-emerald-700 truncate">{value.name}</p>
              <p className="text-[11px] text-emerald-500">{(value.size / 1024).toFixed(0)} Ko — Cliquer pour remplacer</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-600">{hint || 'Glisser ou cliquer pour uploader'}</p>
              <p className="text-[11px] text-slate-400">PDF, JPG, PNG — max 5 Mo</p>
            </>
          )}
        </div>
      </motion.button>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  )
}
