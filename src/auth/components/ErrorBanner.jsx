import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

export default function ErrorBanner({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl px-4 py-2.5"
        >
          <I.Alert size={14} className="shrink-0" />
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
