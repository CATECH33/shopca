import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

export default function AvatarUpload({ value, onChange }) {
  const ref = useRef()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange({ file, preview: ev.target.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => ref.current.click()}
        className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 hover:border-orange-400 transition-colors overflow-hidden bg-slate-50 flex items-center justify-center group"
      >
        {value?.preview ? (
          <img src={value.preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-orange-400 transition-colors">
            <I.Camera size={20} />
            <span className="text-[10px] font-semibold">Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <I.Camera size={18} className="text-white" />
        </div>
      </motion.button>
      <p className="text-[11px] text-slate-400 text-center">
        {value?.file ? value.file.name : 'Optionnel — JPG, PNG, max 2 Mo'}
      </p>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={handleFile} />
    </div>
  )
}
