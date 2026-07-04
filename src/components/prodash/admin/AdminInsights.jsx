import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { I } from '../../../lib/ui.jsx'
import { supabase } from '../../../lib/supabase.js'

function BarH({ label, value, max, color, dark }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true })
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={`font-semibold ${tx}`}>{label}</span>
        <span className={sx}>{value}</span>
      </div>
      <div className={`h-2 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }} animate={{ width: inView ? `${pct}%` : 0 }}
          transition={{ duration: 0.6 }} />
      </div>
    </div>
  )
}

export default function AdminInsights({ dark }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [profilesRes, listingsRes, paymentsRes, subsRes, alertsRes] = await Promise.all([
        supabase.from('profiles').select('role, account_type, created_at, kyc_status'),
        supabase.from('listings').select('city, transaction_type, status, price, views_count, contacts_count, created_at'),
        supabase.from('payments').select('amount, status, created_at'),
        supabase.from('subscriptions').select('plan, status, created_at, price_amount'),
        supabase.from('alerts').select('city, property_type, max_price, created_at'),
      ])

      const profiles = profilesRes.data ?? []
      const listings = listingsRes.data ?? []
      const payments = paymentsRes.data ?? []
      const subs     = subsRes.data ?? []
      const alerts   = alertsRes.data ?? []

      // Top cities from listings
      const cityCount = {}
      listings.forEach(l => { if (l.city) cityCount[l.city] = (cityCount[l.city] ?? 0) + 1 })
      const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6)

      // Top searched cities from alerts
      const alertCityCount = {}
      alerts.forEach(a => { if (a.city) alertCityCount[a.city] = (alertCityCount[a.city] ?? 0) + 1 })
      const topSearchedCities = Object.entries(alertCityCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

      // Transaction types
      const txTypes = { vente: 0, location: 0, colocation: 0 }
      listings.forEach(l => { if (l.transaction_type in txTypes) txTypes[l.transaction_type]++ })

      // Conversion
      const totalViews    = listings.reduce((s, l) => s + (l.views_count    || 0), 0)
      const totalContacts = listings.reduce((s, l) => s + (l.contacts_count || 0), 0)
      const convRate      = totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) : '0.0'

      // Avg price by transaction
      const ventePrices = listings.filter(l => l.transaction_type === 'vente' && l.price > 0).map(l => l.price)
      const locPrices   = listings.filter(l => l.transaction_type === 'location' && l.price > 0).map(l => l.price)
      const avgVente    = ventePrices.length ? Math.round(ventePrices.reduce((s, v) => s + v, 0) / ventePrices.length) : 0
      const avgLoc      = locPrices.length   ? Math.round(locPrices.reduce((s, v) => s + v, 0)   / locPrices.length)   : 0

      // Plan distribution
      const planCount = {}
      subs.forEach(s => { planCount[s.plan ?? 'free'] = (planCount[s.plan ?? 'free'] ?? 0) + 1 })

      // Monthly revenue
      const monthlyRev = {}
      payments.filter(p => p.status === 'completed').forEach(p => {
        const m = p.created_at?.slice(0, 7)
        if (m) monthlyRev[m] = (monthlyRev[m] ?? 0) + (p.amount || 0)
      })
      const revenueMonths = Object.entries(monthlyRev).sort().slice(-4).map(([m, v]) => ({
        label: m, value: v / 100,
      }))

      setData({ topCities, topSearchedCities, txTypes, convRate, avgVente, avgLoc, planCount, revenueMonths, profiles, listings })
    } catch (err) {
      console.error('[admin-insights]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  if (loading) return (
    <div className="flex justify-center py-24">
      <I.Loader size={26} className={`animate-spin ${sx}`} />
    </div>
  )

  const maxCity    = Math.max(...(data?.topCities?.map(c => c[1]) ?? [1]), 1)
  const maxSearch  = Math.max(...(data?.topSearchedCities?.map(c => c[1]) ?? [1]), 1)
  const maxRevenue = Math.max(...(data?.revenueMonths?.map(r => r.value) ?? [1]), 1)

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* IA badge */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 ${dark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-100'}`}>
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
          <I.Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className={`text-sm font-extrabold ${tx}`}>Insights IA SHOPCA</p>
          <p className={`text-xs ${sx}`}>Analyse statistique en temps réel de la plateforme · Mise à jour à chaque visite</p>
        </div>
      </div>

      {/* KPIs row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Taux conversion',  value: data?.convRate + '%', icon: I.TrendingUp, color: 'text-emerald-500' },
          { label: 'Prix moyen vente', value: data?.avgVente ? data.avgVente.toLocaleString('fr-FR') + ' €' : '—', icon: I.Building, color: 'text-orange-500' },
          { label: 'Loyer moyen',      value: data?.avgLoc   ? data.avgLoc.toLocaleString('fr-FR') + ' €/m' : '—', icon: I.Home, color: 'text-sky-500' },
          { label: 'Vues / contact',   value: data?.listings.reduce((s,l) => s + (l.views_count||0), 0) > 0
              ? (data.listings.reduce((s,l) => s + (l.views_count||0), 0) / Math.max(data.listings.reduce((s,l) => s + (l.contacts_count||0), 0), 1)).toFixed(0)
              : '—', icon: I.Eye, color: 'text-indigo-500' },
        ].map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`rounded-2xl border p-4 shadow-sm ${bd}`}>
              <Icon size={18} className={`mb-2 ${k.color}`} />
              <p className={`text-xl font-extrabold ${tx}`}>{k.value}</p>
              <p className={`text-xs mt-0.5 ${sx}`}>{k.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top villes (annonces) */}
        <div className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
          <p className={`text-sm font-extrabold mb-4 ${tx}`}>Top villes — annonces publiées</p>
          {data?.topCities.length === 0 ? (
            <p className={`text-xs ${sx}`}>Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.topCities.map(([city, count]) => (
                <BarH key={city} label={city} value={count} max={maxCity} color="bg-orange-500" dark={dark} />
              ))}
            </div>
          )}
        </div>

        {/* Top villes (recherches) */}
        <div className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
          <p className={`text-sm font-extrabold mb-4 ${tx}`}>Top villes — recherches sauvegardées</p>
          {data?.topSearchedCities.length === 0 ? (
            <p className={`text-xs ${sx}`}>Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.topSearchedCities.map(([city, count]) => (
                <BarH key={city} label={city} value={count} max={maxSearch} color="bg-sky-500" dark={dark} />
              ))}
            </div>
          )}
        </div>

        {/* Revenus mensuels */}
        {data?.revenueMonths.length > 0 && (
          <div className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
            <p className={`text-sm font-extrabold mb-4 ${tx}`}>Revenus mensuels (€)</p>
            <div className="space-y-3">
              {data.revenueMonths.map(({ label, value }) => (
                <BarH key={label} label={label} value={Math.round(value) + ' €'} max={maxRevenue} color="bg-emerald-500" dark={dark} />
              ))}
            </div>
          </div>
        )}

        {/* Types de transaction */}
        <div className={`rounded-2xl border shadow-sm p-5 ${bd}`}>
          <p className={`text-sm font-extrabold mb-4 ${tx}`}>Répartition des annonces</p>
          <div className="space-y-3">
            {Object.entries(data?.txTypes ?? {}).map(([type, count]) => {
              const colors = { vente: 'bg-orange-500', location: 'bg-sky-500', colocation: 'bg-emerald-500' }
              const labels = { vente: 'Vente', location: 'Location', colocation: 'Colocation' }
              const max = Math.max(...Object.values(data?.txTypes ?? {}), 1)
              return <BarH key={type} label={labels[type] ?? type} value={count} max={max} color={colors[type] ?? 'bg-slate-400'} dark={dark} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
