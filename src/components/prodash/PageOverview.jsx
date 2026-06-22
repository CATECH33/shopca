import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { svc } from '../../features/auth/hooks/useAuth.js'
import { supabase } from '../../lib/supabase.js'

const BARS = [42, 68, 55, 90, 73, 61, 85]
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const PLAN_LABEL = { basic: 'Plan Basic', premium: 'Plan Premium', enterprise: 'Plan Enterprise' }

const colorMap = {
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'bg-orange-500' },
  blue:   { bg: 'bg-sky-100',    text: 'text-sky-600',    icon: 'bg-sky-500'    },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  icon: 'bg-amber-500'  },
  green:  { bg: 'bg-emerald-100',text: 'text-emerald-600',icon: 'bg-emerald-500'},
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins  <  1) return "À l'instant"
  if (mins  < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs   < 24) return `Il y a ${hrs} h`
  if (hrs   < 48) return 'Hier'
  return `Il y a ${Math.floor(hrs / 24)} j`
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n)
}

function KpiCard({ label, value, Icon, color, dark, loading }) {
  const c = colorMap[color]
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border shadow-sm ${dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-navy-900'}`}>
        {loading ? <span className="inline-block w-16 h-7 rounded-lg bg-slate-100 animate-pulse" /> : value}
      </p>
      <p className={`text-xs mt-0.5 ${dark ? 'text-white/50' : 'text-slate-400'}`}>{label}</p>
    </motion.div>
  )
}

function MiniBarChart({ dark }) {
  const ref   = useRef()
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className={`rounded-2xl p-5 border shadow-sm ${dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-navy-900'}`}>Vues cette semaine</p>
          <p className={`text-xs ${dark ? 'text-white/40' : 'text-slate-400'}`}>7 derniers jours</p>
        </div>
      </div>
      <div className="flex items-end gap-2 h-20">
        {BARS.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md overflow-hidden" style={{ height: 64 }}>
              <motion.div className="w-full bg-orange-500 rounded-t-md"
                initial={{ height: 0 }} animate={{ height: inView ? `${h}%` : 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }} />
            </div>
            <span className={`text-[9px] font-bold ${dark ? 'text-white/40' : 'text-slate-400'}`}>{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PageOverview({ dark, setPage }) {
  const { user, profile } = useAuth()
  const [agency,  setAgency]  = useState(null)
  const [stats,   setStats]   = useState({ views: null, contacts: null, active: null })
  const [leads,   setLeads]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true

    async function load() {
      try {
        const [agencyData, listings] = await Promise.all([
          svc.getAgency(user.id).catch(() => null),
          supabase
            .from('listings')
            .select('id, title, views_count, contacts_count, status')
            .eq('user_id', user.id)
            .then(r => r.data ?? []),
        ])

        if (!mounted) return
        if (agencyData) setAgency(agencyData)

        const views    = listings.reduce((s, l) => s + (l.views_count    || 0), 0)
        const contacts = listings.reduce((s, l) => s + (l.contacts_count || 0), 0)
        const active   = listings.filter(l => l.status === 'active').length
        setStats({ views, contacts, active })

        const ids = listings.map(l => l.id)
        if (ids.length) {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*, sender:users(email)')
            .in('listing_id', ids)
            .order('created_at', { ascending: false })
            .limit(5)

          const titleMap = Object.fromEntries(listings.map(l => [l.id, l.title]))
          if (mounted) setLeads((msgs ?? []).map(m => ({
            email:   m.sender?.email ?? null,
            initial: m.sender?.email?.[0]?.toUpperCase() ?? 'C',
            prop:    titleMap[m.listing_id] ?? '—',
            time:    timeAgo(m.created_at),
          })))
        }
      } catch (err) {
        console.error('[overview] load error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [user])

  const conversion = stats.views > 0
    ? `${((stats.contacts / stats.views) * 100).toFixed(1)}%`
    : '0.0%'

  const kpis = [
    { label: 'Vues totales',     value: fmt(stats.views),    Icon: I.Globe,      color: 'orange' },
    { label: 'Contacts reçus',   value: fmt(stats.contacts), Icon: I.TrendingUp, color: 'blue'   },
    { label: 'Taux conversion',  value: conversion,           Icon: I.Star,       color: 'amber'  },
    { label: 'Annonces actives', value: fmt(stats.active),   Icon: I.Building,   color: 'green'  },
  ]

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  const planLabel = PLAN_LABEL[agency?.plan] ?? 'Plan Basic'
  const verified  = profile?.kyc_status === 'approved'

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KpiCard key={i} {...k} dark={dark} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><MiniBarChart dark={dark} /></div>

        {/* Plan widget */}
        <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${bd}`}
          style={dark ? {} : { background: 'linear-gradient(135deg,#0B1F3A 0%,#1a3a6b 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <I.BadgeCheck size={18} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{planLabel}</span>
            </div>
            <p className="text-white font-extrabold text-lg leading-snug">
              {verified ? 'Agence vérifiée' : 'Vérification en cours'}
            </p>
            <p className="text-white/50 text-xs mt-1">
              {verified ? 'Badge actif sur toutes vos annonces' : 'Soumettez vos documents pour obtenir le badge'}
            </p>
          </div>
          {agency?.plan !== 'premium' && agency?.plan !== 'enterprise' && (
            <button onClick={() => setPage?.('billing')}
              className="mt-4 w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition">
              Passer Premium →
            </button>
          )}
        </div>
      </div>

      {/* Recent leads */}
      <div className={`rounded-2xl border shadow-sm ${bd}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <p className={`text-sm font-extrabold ${tx}`}>Derniers leads</p>
          {leads.length > 0 && (
            <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
              {leads.length} message{leads.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center">
            <I.Loader size={20} className={`mx-auto animate-spin ${sx}`} />
          </div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <I.Mail size={28} className={`mx-auto mb-2 ${sx}`} />
            <p className={`text-sm font-semibold ${tx}`}>Aucun message reçu</p>
            <p className={`text-xs mt-1 ${sx}`}>Les contacts de vos annonces apparaîtront ici</p>
          </div>
        ) : leads.map((l, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-3.5 border-b last:border-0 ${dark ? 'border-white/5' : 'border-slate-50'}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {l.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${tx} truncate`}>{l.email ?? 'Contact'}</p>
              <p className={`text-xs ${sx} truncate`}>{l.prop}</p>
            </div>
            <p className={`text-[10px] shrink-0 ${sx}`}>{l.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
