import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrandLogo, I } from '../../../lib/ui.jsx'

const ART = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop'

const TRUST = [
  { Icon: I.Shield,     label: 'Transactions sécurisées'  },
  { Icon: I.BadgeCheck, label: 'Annonces vérifiées KYC'   },
  { Icon: I.Sparkles,   label: 'Modération IA temps réel' },
]

const STATS = [
  { value: '86 400+', label: 'Utilisateurs vérifiés' },
  { value: '4,9 ★',   label: 'Note moyenne'          },
  { value: '15 000+', label: 'Biens premium'          },
]

export function LeftPanel() {
  return (
    <div className="relative hidden md:flex flex-col overflow-hidden bg-[#0B1F3A] flex-shrink-0 w-[42%]">
      <img src={ART} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A]/95 via-[#0B1F3A]/82 to-[#0B1F3A]/90" />
      <motion.div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-orange-500/25 blur-3xl pointer-events-none"
        animate={{ x: [0, 20, 0], y: [0, 16, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"
        animate={{ x: [0, -18, 0], y: [0, -14, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
        <div className="mb-auto">
          <div className="mb-8"><BrandLogo dark /></div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" /> Premium Estate
          </span>
          <h2 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight mb-3">
            Le marché immobilier<br /><span className="text-orange-400">pour les exigeants.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
            Achetez, vendez et investissez en toute confiance grâce à notre plateforme vérifiée et sécurisée.
          </p>
          <div className="space-y-3">
            {TRUST.map(({ Icon, label }, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3 text-white/75">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-orange-400" />
                </div>
                <span className="text-sm">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-8 mb-5">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
              className="rounded-xl p-3 text-center border border-white/10 bg-white/[0.07] backdrop-blur-sm">
              <div className="text-white font-bold text-sm leading-none mb-0.5">{s.value}</div>
              <div className="text-white/45 text-[10px]">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {['JD', 'SB', 'ML', 'PK'].map(init => (
              <div key={init} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 border-2 border-[#0B1F3A] flex items-center justify-center text-[9px] font-bold text-white">{init}</div>
            ))}
          </div>
          <p className="text-slate-400 text-xs"><span className="text-white font-bold">86 400+</span> utilisateurs nous font confiance</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LeftPanel />
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden px-6 pt-8 pb-2">
          <Link to="/"><BrandLogo /></Link>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <motion.div className="w-full max-w-md mx-auto" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {title && <h1 className="text-2xl xl:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1">{title}</h1>}
            {subtitle && <p className="text-slate-500 text-sm mb-6 leading-relaxed">{subtitle}</p>}
            <div className={subtitle ? '' : 'mt-6'}>{children}</div>
            {footer && <p className="mt-8 text-sm text-slate-500 text-center">{footer}</p>}
          </motion.div>
        </div>
        <div className="px-10 pb-6 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} PASMAL</span>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-slate-600">Aide</Link>
            <Link to="#" className="hover:text-slate-600">Confidentialité</Link>
            <Link to="#" className="hover:text-slate-600">CGU</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
