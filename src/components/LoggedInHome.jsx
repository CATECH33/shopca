import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { I } from '../lib/ui.jsx'
import { svc } from '../features/auth/hooks/useAuth.js'

/* ─── Mock favoris ───────────────────────────────────────────── */
const FAVORI_LISTINGS = [
  { id: 'f1', title: 'Maison contemporaine',     location: 'Bordeaux · Caudéran', price: '780 000 €',    img: 'photo-1564013799919-ab600027ffc6', badge: null,       rooms: 5, surface: 142 },
  { id: 'f2', title: 'Loft industriel rénové',   location: 'Marseille · Joliette',price: '1 450 €/mois', img: 'photo-1493809842364-78817add7ffb', badge: 'Premium',  rooms: 2, surface: 72  },
  { id: 'f3', title: 'Appartement haussmannien', location: 'Paris 8ᵉ · Monceau', price: '1 250 000 €',  img: 'photo-1600585154340-be6161a56a0c', badge: 'Prestige', rooms: 4, surface: 98  },
]

/* ─── Mock alert-match listings ──────────────────────────────── */
const ALERT_LISTINGS = [
  { id: 'a1', title: 'T3 lumineux Oberkampf',    location: 'Paris 11ᵉ',     price: '420 000 €',    img: 'photo-1560448204-e02f11c3d0e2', badge: 'Nouveau', rooms: 3, surface: 68 },
  { id: 'a2', title: 'Studio Bastille rénové',    location: 'Paris 11ᵉ',     price: '295 000 €',    img: 'photo-1502672260266-1c1ef2d93688', badge: 'Exclusif', rooms: 1, surface: 31 },
  { id: 'a3', title: 'Appartement Nation',        location: 'Paris 12ᵉ',     price: '485 000 €',    img: 'photo-1493809842364-78817add7ffb', badge: null,       rooms: 3, surface: 74 },
]

/* ─── Mini property card ─────────────────────────────────────── */
function PropCard({ p, onOpen, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen?.(p)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group"
      style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=600&q=75`}
          alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {p.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${p.badge === 'Nouveau' ? 'bg-orange-500' : 'bg-[#0F172A]'}`}>
            {p.badge}
          </span>
        )}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition"
        >
          <I.Heart size={12} className="text-slate-400" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-[13px] font-bold text-[#0F172A] truncate">{p.title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <I.MapPin size={10} className="text-orange-400" />{p.location}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[14px] font-extrabold text-[#0F172A]">{p.price}</p>
          <p className="text-[10px] text-slate-400">{p.rooms}p · {p.surface}m²</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHead({ Icon, iconColor, title, badge, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconColor + '18', color: iconColor }}>
          <Icon size={15} />
        </div>
        <h2 className="text-[16px] font-extrabold text-[#0F172A]">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{badge}</span>
        )}
      </div>
      {action}
    </div>
  )
}

/* ─── LoggedInHome ───────────────────────────────────────────── */
export default function LoggedInHome({
  user,
  role,
  listings = [],
  loading = false,
  setCurrentView,
  onSearch,
  setFilters,
  onOpenListing,
  onPublish,
}) {
  const navigate = useNavigate()
  const rawName  = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const firstName = rawName.split(/[\s@]+/)[0] || 'vous'
  const initials  = rawName.split(/[\s@]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U'
  const isPro     = ['pro_user', 'agency', 'agency_admin', 'platform_owner'].includes(role)

  const QUICK = [
    { label: 'Mon espace',    Icon: I.LayoutDashboard, action: () => navigate('/mon-espace'), color: '#F97316' },
    { label: 'Acheter',       Icon: I.Home,        view: 'acheter',      color: '#3B82F6' },
    { label: 'Louer',         Icon: I.Building,    view: 'louer',        color: '#10B981' },
    { label: 'Mes favoris',   Icon: I.Heart,       view: 'favoris',      color: '#EF4444' },
    { label: 'Mes alertes',   Icon: I.Bell,        view: 'alerts',       color: '#F97316' },
    { label: 'Publier',       Icon: I.Upload,      action: onPublish,    color: '#8B5CF6' },
    ...(isPro ? [{ label: 'Dashboard Pro', Icon: I.BarChart, action: () => navigate('/pro'), color: '#0EA5E9' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero greeting ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Greeting row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white text-[15px] font-extrabold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="text-[24px] font-extrabold text-[#0F172A] leading-tight"
              >
                Bonjour, <span className="text-orange-500 capitalize">{firstName}</span> 👋
              </motion.h1>
              <p className="text-[13px] text-slate-400 mt-0.5">Reprenez là où vous étiez.</p>
            </div>
            <a href="/auth/logout"
              title="Se déconnecter"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition flex-shrink-0"
            >
              <I.LogOut size={14} />
              <span className="hidden sm:inline">Déconnexion</span>
            </a>
          </div>

          {/* Search bar */}
          <div
            onClick={() => onSearch?.()}
            className="flex items-center gap-3 w-full max-w-xl h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-orange-300 transition cursor-pointer mb-6"
          >
            <I.Search size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] text-slate-400">Rechercher une ville, un quartier…</span>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {QUICK.map(({ label, Icon, view, action, color }) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => action ? action() : setCurrentView(view)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#0F172A] hover:border-orange-300 hover:shadow-sm transition"
              >
                <Icon size={14} style={{ color }} />
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main feed ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Section alertes */}
        <section>
          <SectionHead
            Icon={I.Bell} iconColor="#F97316"
            title="Nouvelles annonces pour vos alertes"
            badge="3 nouveaux"
            action={
              <button onClick={() => setCurrentView('alerts')}
                className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                Voir mes alertes <I.ArrowRight size={13} />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALERT_LISTINGS.map((p, i) => (
              <PropCard key={p.id} p={p} onOpen={onOpenListing} delay={i * 0.07} />
            ))}
          </div>
        </section>

        {/* Section favoris */}
        <section>
          <SectionHead
            Icon={I.Heart} iconColor="#EF4444"
            title="Vos favoris récents"
            badge={`${FAVORI_LISTINGS.length} biens`}
            action={
              <button onClick={() => setCurrentView('favoris')}
                className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                Voir tous mes favoris <I.ArrowRight size={13} />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FAVORI_LISTINGS.map((p, i) => (
              <PropCard key={p.id} p={p} onOpen={onOpenListing} delay={i * 0.07} />
            ))}
          </div>
        </section>

        {/* Section suggestions (listings réels) */}
        {!loading && listings.length > 0 && (
          <section>
            <SectionHead
              Icon={I.Sparkles} iconColor="#8B5CF6"
              title="Suggestions pour vous"
              action={
                <button onClick={() => setCurrentView('results')}
                  className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  Voir toutes les annonces <I.ArrowRight size={13} />
                </button>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.slice(0, 6).map((l, i) => {
                const p = {
                  id:       l.id,
                  title:    l.title,
                  location: l.location,
                  price:    typeof l.price === 'number'
                    ? l.price.toLocaleString('fr-FR') + ' €' + (l.type === 'louer' ? '/mois' : '')
                    : (l.price_label ?? String(l.price ?? '')),
                  img:      l.image_url
                    ? null
                    : 'photo-1560448204-e02f11c3d0e2',
                  imgFull:  l.image_url ?? null,
                  badge:    l.is_premium ? 'Premium' : l.is_exclusive ? 'Exclusif' : null,
                  rooms:    l.rooms,
                  surface:  l.surface,
                }
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4 }}
                    onClick={() => onOpenListing?.(l, i)}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group"
                    style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={p.imgFull ?? `https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=600&q=75`}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=75' }}
                      />
                      {p.badge && (
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-orange-500">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[13px] font-bold text-[#0F172A] truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <I.MapPin size={10} className="text-orange-400" />{p.location}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[14px] font-extrabold text-[#0F172A]">{p.price}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.rooms ? `${p.rooms}p` : ''}{p.rooms && p.surface ? ' · ' : ''}{p.surface ? `${p.surface}m²` : ''}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

      </div>

    </div>
  )
}
