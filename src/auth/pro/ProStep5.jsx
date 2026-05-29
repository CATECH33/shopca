import React from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0',
    badge: null,
    color: 'slate',
    Icon: I.User,
    features: ['3 annonces actives', 'Visibilité standard', 'Profil agence basique', 'Support e-mail'],
  },
  {
    id: 'visibility',
    name: 'Visibilité',
    price: '29',
    badge: 'Populaire',
    color: 'orange',
    Icon: I.Star,
    features: ['20 annonces actives', 'Position boostée', 'Badge Agence vérifiée', 'Statistiques de base', 'Support prioritaire'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '79',
    badge: 'Meilleur ROI',
    color: 'navy',
    Icon: I.Zap,
    features: ['Annonces illimitées', 'CRM leads intégré', 'Analytics avancées', 'Mise en avant homepage', 'Account manager dédié'],
  },
]

const colorMap = {
  slate:  { ring: 'border-slate-300',  bg: 'bg-slate-50',          icon: 'bg-slate-200 text-slate-600',       badge: 'bg-slate-100 text-slate-500' },
  orange: { ring: 'border-orange-400', bg: 'bg-orange-50',          icon: 'bg-orange-500 text-white',          badge: 'bg-orange-500 text-white' },
  navy:   { ring: 'border-[#0B1F3A]',  bg: 'bg-[#0B1F3A]',         icon: 'bg-white/20 text-white',            badge: 'bg-white/20 text-white' },
}

export default function ProStep5({ data, set }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 text-center">Aucun paiement requis maintenant — modifiable depuis votre tableau de bord.</p>
      <div className="grid grid-cols-1 gap-3">
        {PLANS.map(({ id, name, price, badge, color, Icon, features }) => {
          const c = colorMap[color]
          const selected = data.plan === id
          const isNavy = color === 'navy'
          return (
            <motion.button
              key={id} type="button"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => set('plan', id)}
              className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${c.ring} ${selected ? c.bg : 'bg-white border-slate-200 hover:border-slate-300'}`}
              style={selected && isNavy ? { background: '#0B1F3A' } : {}}
            >
              {badge && (
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${selected ? c.badge : 'bg-slate-100 text-slate-500'}`}>
                  {badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selected ? c.icon : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={17} />
                </div>
                <div>
                  <p className={`font-extrabold text-sm ${selected && isNavy ? 'text-white' : 'text-navy-900'}`}>{name}</p>
                  <p className={`text-xs ${selected && isNavy ? 'text-white/60' : 'text-slate-400'}`}>
                    {price === '0' ? 'Gratuit pour toujours' : `${price} € / mois`}
                  </p>
                </div>
                {selected && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <I.Check size={11} className="text-white" />
                  </div>
                )}
              </div>
              <ul className="space-y-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <I.Check size={11} className={selected && isNavy ? 'text-orange-400' : 'text-emerald-500'} />
                    <span className={`text-xs ${selected && isNavy ? 'text-white/80' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
