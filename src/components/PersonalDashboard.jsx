import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'

/* ─── Mock data ────────────────────────────────────────────────── */

const SAVED = [
  { id: 1, title: 'Studio cosy lumineux',       location: 'Paris 11ᵉ · Bastille', price: '320 000 €',    type: 'Acheter', rooms: 1, surface: 28,  badge: 'Premium',   color: '#F97316', img: 'photo-1502672260266-1c1ef2d93688' },
  { id: 2, title: 'T3 avec balcon',              location: 'Lyon 6ᵉ · Foch',      price: '485 000 €',    type: 'Acheter', rooms: 3, surface: 65,  badge: 'Exclusif',  color: '#8B5CF6', img: 'photo-1560448204-e02f11c3d0e2' },
  { id: 3, title: 'Maison contemporaine',        location: 'Bordeaux · Caudéran',  price: '780 000 €',    type: 'Acheter', rooms: 5, surface: 142, badge: null,        color: null,      img: 'photo-1564013799919-ab600027ffc6' },
  { id: 4, title: 'Loft industriel rénové',      location: 'Marseille · Joliette', price: '1 450 €/mois', type: 'Louer',   rooms: 2, surface: 72,  badge: 'Premium',   color: '#F97316', img: 'photo-1493809842364-78817add7ffb' },
  { id: 5, title: 'Appartement haussmannien',    location: 'Paris 8ᵉ · Monceau',  price: '1 250 000 €',  type: 'Acheter', rooms: 4, surface: 98,  badge: 'Prestige',  color: '#0EA5E9', img: 'photo-1600585154340-be6161a56a0c' },
  { id: 6, title: 'Studio étudiant moderne',     location: 'Toulouse · Capitole',  price: '620 €/mois',   type: 'Louer',   rooms: 1, surface: 24,  badge: null,        color: null,      img: 'photo-1554995207-c18c203602cb' },
]

const ALERTS = [
  { id: 1, label: 'Appartements Paris',   filters: 'Paris · Acheter · 200 000–500 000 €', active: true,  created: '14 mai 2026',  count: 12 },
  { id: 2, label: 'Maisons Bordeaux',     filters: 'Bordeaux · Acheter · +5 pièces',       active: true,  created: '21 avr. 2026', count: 3  },
  { id: 3, label: 'Colocs Paris 18ᵉ',    filters: 'Paris 18ᵉ · Colocation · <800 €/mois', active: false, created: '2 mars 2026',  count: 0  },
]

const SEARCHES = [
  { id: 1, query: 'Appartement Lyon',        filters: 'Lyon · Acheter · T2-T3',        date: 'Il y a 2 h'   },
  { id: 2, query: 'Studio Paris Bastille',   filters: 'Paris 11ᵉ · Louer · <800 €',   date: 'Hier'         },
  { id: 3, query: 'Maison Bordeaux',         filters: 'Bordeaux · Acheter · +120 m²',  date: 'Il y a 3 j'   },
  { id: 4, query: 'Investissement Nantes',   filters: 'Nantes · Acheter · Rendement',  date: 'Il y a 5 j'   },
]

const NOTIFS = [
  { id: 1, Icon: I.Bell,       text: 'Nouvelle annonce correspond à votre alerte "Appartements Paris"', time: 'Il y a 10 min', unread: true,  accent: '#F97316' },
  { id: 2, Icon: I.Heart,      text: 'Le bien "Maison contemporaine" a baissé son prix de 20 000 €',   time: 'Il y a 2 h',   unread: true,  accent: '#EF4444' },
  { id: 3, Icon: I.MessageSquare, text: 'Foncia Premium vous a répondu concernant le T3 Lyon',         time: 'Hier',         unread: false, accent: '#10B981' },
  { id: 4, Icon: I.BadgeCheck, text: 'Votre profil est vérifié — accès aux annonces premium débloqué', time: 'Il y a 3 j',   unread: false, accent: '#8B5CF6' },
  { id: 5, Icon: I.Star,       text: '3 nouvelles annonces correspondent à votre recherche sauvegardée',time: 'Il y a 5 j',   unread: false, accent: '#F59E0B' },
]

const PLAN = {
  name: 'Pack Essentiel',
  price: '9,90 €',
  period: '/mois',
  renewal: '29 juin 2026',
  features: ['Alertes illimitées', 'Favoris illimités', 'Messagerie agences', 'Historique 12 mois'],
}

const BILLING = [
  { date: '29 mai 2026',  desc: 'Pack Essentiel',  amount: '9,90 €',  status: 'Payé' },
  { date: '29 avr. 2026', desc: 'Pack Essentiel',  amount: '9,90 €',  status: 'Payé' },
  { date: '29 mars 2026', desc: 'Pack Essentiel',  amount: '9,90 €',  status: 'Payé' },
]

/* ─── Nav items ────────────────────────────────────────────────── */

const NAV = [
  { id: 'overview',       label: 'Vue d\'ensemble', Icon: I.LayoutDashboard },
  { id: 'favoris',        label: 'Mes favoris',     Icon: I.Heart           },
  { id: 'alertes',        label: 'Alertes',         Icon: I.Bell            },
  { id: 'recherches',     label: 'Recherches',      Icon: I.Search          },
  { id: 'notifications',  label: 'Notifications',   Icon: I.Sparkles        },
  { id: 'abonnement',     label: 'Abonnement',      Icon: I.CreditCard      },
  { id: 'profil',         label: 'Mon profil',      Icon: I.User            },
]

/* ─── Mini KPI card ────────────────────────────────────────────── */

function KpiCard({ label, value, sub, Icon, color, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3"
      style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-navy-900 leading-none">{value}</p>
        <p className="text-[11px] font-semibold text-slate-400 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

/* ─── Property card (saved) ───────────────────────────────────── */

function PropCard({ p, onRemove }) {
  const [liked, setLiked] = useState(true)
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden group"
      style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=600&q=75`}
          alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {p.badge && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: p.color }}>{p.badge}</span>
        )}
        <button onClick={() => { setLiked(false); setTimeout(onRemove, 300) }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition hover:scale-110">
          <I.Heart size={13} style={{ color: liked ? '#EF4444' : '#CBD5E1' }} fill={liked ? '#EF4444' : 'none'} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-[13px] font-bold text-navy-900 leading-snug truncate">{p.title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <I.MapPin size={10} />{p.location}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[14px] font-extrabold text-navy-900">{p.price}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>{p.rooms} pièce{p.rooms > 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{p.surface} m²</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Section header ────────────────────────────────────────────  */

function SectionHead({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[17px] font-extrabold text-navy-900">{title}</h2>
        {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─── Pages ─────────────────────────────────────────────────────── */

function PageOverview({ onNavigate }) {
  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[24px] font-extrabold text-navy-900">Bonjour 👋</h1>
        <p className="text-slate-400 text-[13px] mt-1">Voici un résumé de votre activité sur PASMAL.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Biens sauvegardés" value="6"   Icon={I.Heart}      color="#EF4444" trend={20}  />
        <KpiCard label="Alertes actives"   value="2"   Icon={I.Bell}       color="#F97316" trend={0}   />
        <KpiCard label="Annonces vues"     value="47"  Icon={I.Eye}        color="#3B82F6" trend={12}  />
        <KpiCard label="Messages reçus"    value="3"   Icon={I.MessageSquare} color="#10B981" trend={-5} />
      </div>

      {/* Recent saved */}
      <div className="mb-8">
        <SectionHead title="Favoris récents" sub="Vos 3 derniers biens sauvegardés"
          action={
            <button onClick={() => onNavigate('favoris')} className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Voir tout <I.ArrowRight size={13} />
            </button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAVED.slice(0, 3).map(p => (
            <PropCard key={p.id} p={p} onRemove={() => {}} />
          ))}
        </div>
      </div>

      {/* Recent searches */}
      <div>
        <SectionHead title="Recherches récentes" sub="Reprendre là où vous étiez"
          action={
            <button onClick={() => onNavigate('recherches')} className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Voir tout <I.ArrowRight size={13} />
            </button>
          }
        />
        <div className="space-y-2">
          {SEARCHES.slice(0, 3).map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <I.Search size={13} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-navy-900 truncate">{s.query}</p>
                <p className="text-[11px] text-slate-400 truncate">{s.filters}</p>
              </div>
              <span className="text-[10px] text-slate-300 flex-shrink-0">{s.date}</span>
              <I.ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PageFavoris() {
  const [items, setItems] = useState(SAVED)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? items : items.filter(p => p.type.toLowerCase() === filter)

  return (
    <div>
      <SectionHead title="Mes favoris" sub={`${items.length} bien${items.length > 1 ? 's' : ''} sauvegardé${items.length > 1 ? 's' : ''}`} />

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[{ v: 'all', l: 'Tous' }, { v: 'acheter', l: 'Acheter' }, { v: 'louer', l: 'Louer' }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${filter === f.v ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PropCard key={p.id} p={p} onRemove={() => setItems(prev => prev.filter(x => x.id !== p.id))} />
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <I.Heart size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 text-[13px]">Aucun favori dans cette catégorie.</p>
        </div>
      )}
    </div>
  )
}

function PageAlertes() {
  const [alerts, setAlerts] = useState(ALERTS)

  const toggle = id => setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))

  return (
    <div>
      <SectionHead title="Mes alertes" sub="Soyez notifié dès qu'un bien correspond"
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-[12px] font-semibold hover:bg-orange-600 transition">
            <I.Plus size={13} /> Nouvelle alerte
          </button>
        }
      />

      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className={`p-4 rounded-2xl border transition ${a.active ? 'bg-white border-slate-100' : 'bg-slate-50 border-dashed border-slate-200'}`}
            style={{ boxShadow: a.active ? '0 2px 12px rgba(15,23,42,0.05)' : 'none' }}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.active ? 'bg-orange-50' : 'bg-slate-100'}`}>
                <I.Bell size={15} style={{ color: a.active ? '#F97316' : '#94A3B8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-navy-900">{a.label}</p>
                  {a.count > 0 && (
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                      {a.count} nouveaux
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{a.filters}</p>
                <p className="text-[10px] text-slate-300 mt-1">Créée le {a.created}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button onClick={() => toggle(a.id)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${a.active ? 'bg-orange-500' : 'bg-slate-200'}`}
                  style={{ width: 40, height: 22 }}>
                  <motion.div animate={{ x: a.active ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 flex items-center justify-center transition">
                  <I.Trash size={12} className="text-slate-400 hover:text-rose-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageRecherches() {
  return (
    <div>
      <SectionHead title="Historique des recherches" sub="Reprendre une recherche passée" />
      <div className="space-y-2">
        {SEARCHES.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:border-orange-200 transition">
              <I.Search size={14} className="text-slate-400 group-hover:text-orange-500 transition" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-navy-900">{s.query}</p>
              <p className="text-[11px] text-slate-400">{s.filters}</p>
            </div>
            <span className="text-[11px] text-slate-300">{s.date}</span>
            <I.ArrowRight size={14} className="text-slate-300 group-hover:text-orange-400 transition" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PageNotifications() {
  const [notifs, setNotifs] = useState(NOTIFS)
  const unread = notifs.filter(n => n.unread).length

  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })))

  return (
    <div>
      <SectionHead title="Notifications" sub={unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
        action={unread > 0 && (
          <button onClick={markAll} className="text-[12px] font-semibold text-slate-400 hover:text-navy-900 transition">
            Tout marquer lu
          </button>
        )}
      />
      <div className="space-y-2">
        {notifs.map(n => (
          <motion.div key={n.id} layout
            onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border transition cursor-pointer ${n.unread ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-slate-100'}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: n.accent + '18', color: n.accent }}>
              <n.Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] leading-relaxed text-navy-900">{n.text}</p>
              <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PageAbonnement() {
  return (
    <div>
      <SectionHead title="Mon abonnement" />

      {/* Current plan */}
      <div className="bg-gradient-to-br from-navy-900 to-[#1E3A5F] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Votre forfait</p>
          <h3 className="text-[22px] font-extrabold mb-0.5">{PLAN.name}</h3>
          <p className="text-[28px] font-extrabold"><span className="text-orange-400">{PLAN.price}</span><span className="text-[14px] text-white/60">{PLAN.period}</span></p>
          <p className="text-[11px] text-white/50 mt-1">Renouvellement le {PLAN.renewal}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {PLAN.features.map(f => (
              <span key={f} className="flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
                <I.Check size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="flex items-center gap-4 p-5 bg-orange-50 border border-orange-100 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <I.Zap size={18} className="text-orange-500" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-navy-900">Passez au Pack Premium</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Accès aux annonces exclusives, alertes temps réel, CRM intégré.</p>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white text-[12px] font-bold rounded-xl hover:bg-orange-600 transition flex-shrink-0">
          Voir les offres
        </button>
      </div>

      {/* Billing */}
      <SectionHead title="Historique de facturation" />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
        {BILLING.map((b, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < BILLING.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <I.FileText size={13} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-navy-900">{b.desc}</p>
              <p className="text-[11px] text-slate-400">{b.date}</p>
            </div>
            <p className="text-[13px] font-bold text-navy-900">{b.amount}</p>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{b.status}</span>
            <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition">
              <I.Download size={12} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageProfil() {
  const fields = [
    { label: 'Prénom', value: 'Jean', type: 'text' },
    { label: 'Nom',    value: 'Dupont', type: 'text' },
    { label: 'Email',  value: 'jean.dupont@email.fr', type: 'email' },
    { label: 'Téléphone', value: '+33 6 12 34 56 78', type: 'tel' },
  ]
  return (
    <div>
      <SectionHead title="Mon profil" />
      <div className="max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white text-xl font-extrabold flex items-center justify-center">JD</div>
          <div>
            <p className="text-[14px] font-bold text-navy-900">Jean Dupont</p>
            <p className="text-[12px] text-slate-400">Membre depuis mars 2026</p>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label}>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input type={f.type} defaultValue={f.value}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] text-navy-900 font-semibold focus:outline-none focus:border-orange-400 transition bg-white" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 h-11 rounded-xl bg-navy-900 text-white text-[13px] font-bold hover:bg-navy-800 transition">
            Enregistrer
          </button>
          <button className="h-11 px-5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition">
            Annuler
          </button>
        </div>

        {/* Password */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[13px] font-bold text-navy-900 mb-3">Mot de passe</p>
          <button className="h-10 px-5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition flex items-center gap-2">
            <I.Lock size={13} /> Changer le mot de passe
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Zone de danger</p>
          <button className="text-[12px] font-semibold text-rose-500 hover:text-rose-600 transition flex items-center gap-2">
            <I.Trash size={13} /> Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── PersonalDashboard ─────────────────────────────────────────── */

export default function PersonalDashboard({ onExit }) {
  const [view, setView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pages = {
    overview:      <PageOverview onNavigate={setView} />,
    favoris:       <PageFavoris />,
    alertes:       <PageAlertes />,
    recherches:    <PageRecherches />,
    notifications: <PageNotifications />,
    abonnement:    <PageAbonnement />,
    profil:        <PageProfil />,
  }

  const unreadNotifs = NOTIFS.filter(n => n.unread).length

  return (
    <div className="fixed inset-0 z-[120] bg-[#F8FAFC] flex overflow-hidden">

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={false}
            className="hidden md:flex flex-col w-60 flex-shrink-0 bg-[#0B1F3A] h-full"
            style={{ boxShadow: '4px 0 24px rgba(11,31,58,0.18)' }}>

            {/* Logo + close */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
                  <I.Home size={16} className="text-white" />
                </div>
                <span className="text-white font-extrabold text-[15px]">PAS<span className="text-orange-400">MAL</span></span>
              </div>
              <button onClick={onExit} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <I.X size={13} className="text-white/70" />
              </button>
            </div>

            {/* User chip */}
            <div className="mx-4 mt-2 mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-navy-600 text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">JD</div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">Jean Dupont</p>
                  <p className="text-[10px] text-white/40 truncate">Pack Essentiel</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              {NAV.map(({ id, label, Icon }) => {
                const active = view === id
                return (
                  <button key={id} onClick={() => setView(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-semibold transition relative ${active ? 'bg-orange-500 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}>
                    {active && <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-orange-500" style={{ zIndex: -1 }} />}
                    <Icon size={15} />
                    <span className="flex-1">{label}</span>
                    {id === 'notifications' && unreadNotifs > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-5 pt-2 border-t border-white/10 mt-2">
              <button onClick={onExit}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/8 transition">
                <I.LogOut size={15} /> Retour à l'accueil
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar toggle */}
      <button onClick={() => setSidebarOpen(v => !v)}
        className="md:hidden fixed top-4 left-4 z-[130] w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center shadow-lg">
        <I.Menu size={17} />
      </button>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-8 h-14 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-400 capitalize">
            {NAV.find(n => n.id === view)?.label}
          </p>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 transition">
              <I.Bell size={15} className="text-slate-500" />
              {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#F8FAFC]" />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-navy-900 text-white text-[11px] font-extrabold flex items-center justify-center">JD</div>
          </div>
        </div>

        {/* Page */}
        <div className="px-6 md:px-8 py-7 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              {pages[view]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
