import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

const WEEKS = [
  { w:'S1', views:210, clicks:18 }, { w:'S2', views:340, clicks:29 },
  { w:'S3', views:290, clicks:22 }, { w:'S4', views:480, clicks:41 },
  { w:'S5', views:390, clicks:33 }, { w:'S6', views:510, clicks:44 },
  { w:'S7', views:620, clicks:55 }, { w:'S8', views:480, clicks:38 },
]
const MAX_WEEKS = Math.max(...WEEKS.map(w => w.views))

function BarGroup({ item, maxV, dark, i }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true })
  const h  = Math.round((item.views  / maxV) * 80)
  const hc = Math.round((item.clicks / maxV) * 80)
  return (
    <div ref={ref} className="flex-1 flex flex-col items-center gap-1">
      <div className="flex items-end gap-0.5" style={{ height: 80 }}>
        <motion.div className="w-3 rounded-t-sm bg-orange-500"
          initial={{ height: 0 }} animate={{ height: inView ? h : 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 }} />
        <motion.div className="w-3 rounded-t-sm bg-sky-400"
          initial={{ height: 0 }} animate={{ height: inView ? hc : 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 + 0.1 }} />
      </div>
      <span className={`text-[9px] font-bold ${dark ? 'text-white/40' : 'text-slate-400'}`}>{item.w}</span>
    </div>
  )
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n)
}

export default function PageAnalytics({ dark }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('listings')
        .select('id, title, views_count, contacts_count, status')
        .eq('user_id', user.id)
        .order('views_count', { ascending: false })
      setListings(data ?? [])
    } catch (err) {
      console.error('[analytics] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const totalViews    = listings.reduce((s, l) => s + (l.views_count    || 0), 0)
  const totalContacts = listings.reduce((s, l) => s + (l.contacts_count || 0), 0)
  const conversion    = totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) + '%' : '0.0%'

  const topListings = listings.slice(0, 5)
  const maxViews    = topListings[0]?.views_count || 1

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  const summaryCards = [
    { label: 'Vues totales',       value: fmt(totalViews),    sub: 'Toutes annonces confondues', c: 'orange'  },
    { label: 'Contacts reçus',     value: fmt(totalContacts), sub: 'Formulaires de contact',     c: 'sky'     },
    { label: 'Taux de conversion', value: conversion,          sub: 'Contacts / vues',            c: 'emerald' },
  ]

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, sub, c }) => (
          <div key={label} className={`rounded-2xl border p-4 shadow-sm ${bd}`}>
            {loading
              ? <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse mb-1" />
              : <p className={`text-2xl font-extrabold ${tx}`}>{value}</p>}
            <p className={`text-xs font-semibold mt-0.5 ${sx}`}>{label}</p>
            <p className={`text-[11px] mt-1 ${
              c === 'orange' ? 'text-orange-500' : c === 'sky' ? 'text-sky-500' : 'text-emerald-500'
            }`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart — illustrative weekly trend */}
      <div className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-extrabold ${tx}`}>Vues & Contacts — tendance hebdo</p>
            <p className={`text-[10px] mt-0.5 ${sx}`}>Données illustratives · historique non disponible</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />Vues</span>
            <span className={`flex items-center gap-1.5 ${sx}`}><span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />Contacts</span>
          </div>
        </div>
        <div className="flex items-end gap-3">
          {WEEKS.map((w, i) => <BarGroup key={w.w} item={w} maxV={MAX_WEEKS} dark={dark} i={i} />)}
        </div>
      </div>

      {/* Top listings */}
      <div className={`rounded-2xl border shadow-sm ${bd}`}>
        <div className={`px-5 py-4 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <p className={`text-sm font-extrabold ${tx}`}>Meilleures annonces</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <I.Loader size={20} className={`animate-spin ${sx}`} />
          </div>
        ) : topListings.length === 0 ? (
          <div className="py-10 text-center">
            <p className={`text-sm ${sx}`}>Aucune annonce</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
            {topListings.map((l, i) => {
              const ctr = l.views_count > 0
                ? ((l.contacts_count / l.views_count) * 100).toFixed(1) + '%'
                : '0.0%'
              const barPct = Math.round((l.views_count / maxViews) * 100)
              return (
                <div key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`text-xs font-bold w-5 ${sx}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${tx} truncate`}>{l.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <motion.div className="h-full rounded-full bg-orange-500"
                          initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx}`}>{l.views_count ?? 0}</p>
                    <p className={`text-[11px] ${sx}`}>CTR {ctr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
