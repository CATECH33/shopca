import React from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

const NAV_PRO = [
  { id: 'overview',      label: 'Vue d\'ensemble', Icon: I.Home       },
  { id: 'listings',      label: 'Mes annonces',    Icon: I.Building   },
  { id: 'leads',         label: 'Leads',           Icon: I.Users,  badge: 3 },
  { id: 'analytics',     label: 'Analytiques',     Icon: I.TrendingUp },
  { id: 'billing',       label: 'Facturation',     Icon: I.CreditCard },
  { id: 'verification',  label: 'Vérification',    Icon: I.Shield     },
  { id: 'profile',       label: 'Profil agence',   Icon: I.Globe      },
  { id: 'settings',      label: 'Paramètres',      Icon: I.Settings   },
  { id: 'security',      label: 'Sécurité',        Icon: I.Key        },
]

const NAV_ADMIN = [
  { id: 'admin-overview',       label: 'Vue d\'ensemble',       Icon: I.LayoutDashboard },
  { id: 'admin-searches',       label: 'Recherches sauvegardées', Icon: I.Bookmark      },
  { id: 'admin-notifications',  label: 'Notifications',          Icon: I.Bell           },
  { id: 'admin-insights',       label: 'Insights IA',            Icon: I.Sparkles       },
  { id: 'admin-subscriptions',  label: 'Abonnements',            Icon: I.CreditCard     },
  { id: 'admin-favorites',      label: 'Favoris',                Icon: I.Heart          },
  { id: 'admin-profile',        label: 'Mon profil',             Icon: I.User           },
  { id: 'admin-seo',           label: 'SEO & Indexation',       Icon: I.TrendingUp     },
]

export default function DashSidebar({ page, setPage, dark, setDark, onExit, isAdmin }) {
  const NAV = isAdmin ? NAV_ADMIN : NAV_PRO

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-[#0B1F3A] h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
          <I.Building size={14} className="text-white" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-none">SHOPCA</p>
          <p className="text-white/40 text-[10px] mt-0.5">{isAdmin ? 'Super Admin' : 'Espace Pro'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ id, label, Icon, badge }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                active ? 'bg-orange-500 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}>
              {active && (
                <motion.div layoutId="sidebar-pill" className="absolute inset-0 rounded-xl bg-orange-500 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon size={15} className="shrink-0" />
              <span className="text-[13px] font-semibold">{label}</span>
              {badge && !active && (
                <span className="ml-auto text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-[13px] font-semibold">
          {dark ? <I.Sun size={15} /> : <I.Moon size={15} />}
          {dark ? 'Mode clair' : 'Mode sombre'}
        </button>
        <button onClick={onExit}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-rose-500/20 hover:text-rose-400 transition text-[13px] font-semibold">
          <I.ArrowLeft size={15} /> Quitter
        </button>
      </div>
    </aside>
  )
}
