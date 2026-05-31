import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { svc } from '../../features/auth/hooks/useAuth.js'
import { supabase } from '../../lib/supabase.js'

const PLAN_CONFIG = {
  basic:      { name: 'Basic',      Icon: I.User, listings: 10,  monthlyEur: '9,90' },
  premium:    { name: 'Premium',    Icon: I.Zap,  listings: 50,  monthlyEur: '49'   },
  enterprise: { name: 'Enterprise', Icon: I.Star, listings: 999, monthlyEur: '99'   },
}
const PLAN_ORDER = ['basic', 'premium', 'enterprise']

const PAYMENT_STATUS = {
  completed: { label: 'Payée',   cls: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'En cours',cls: 'bg-amber-100 text-amber-700'     },
  failed:    { label: 'Échouée', cls: 'bg-rose-100 text-rose-700'       },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtAmount(cents) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
}

export default function PageBilling({ dark }) {
  const { user } = useAuth()
  const [sub,          setSub]          = useState(null)
  const [agency,       setAgency]       = useState(null)
  const [activeCount,  setActiveCount]  = useState(null)
  const [leadsCount,   setLeadsCount]   = useState(null)
  const [payments,     setPayments]     = useState([])
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [agencyData, subRes, listingsRes] = await Promise.all([
        svc.getAgency(user.id).catch(() => null),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id, status')
          .eq('user_id', user.id),
      ])

      setAgency(agencyData)
      setSub(subRes.data ?? null)

      const listings = listingsRes.data ?? []
      const active = listings.filter(l => l.status === 'active').length
      setActiveCount(active)

      // Leads this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const ids = listings.map(l => l.id)
      if (ids.length) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('listing_id', ids)
          .gte('created_at', startOfMonth)
        setLeadsCount(count ?? 0)
      } else {
        setLeadsCount(0)
      }

      // Payment history
      const { data: pays } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setPayments(pays ?? [])
    } catch (err) {
      console.error('[billing] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const currentPlan = sub?.plan ?? agency?.plan ?? 'basic'
  const planCfg     = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.basic
  const planPrice   = sub?.price ? fmtAmount(sub.price) : `${planCfg.monthlyEur} €`
  const planLimit   = planCfg.listings
  const renewal     = fmtDate(sub?.end_date)

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      {/* Current plan banner */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,#0B1F3A,#1a3a6b)' }}>
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
          <planCfg.Icon size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-extrabold text-lg">Plan {planCfg.name}</p>
            <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">ACTIF</span>
          </div>
          <p className="text-white/60 text-sm mt-0.5">
            {planPrice}/mois{renewal !== '—' ? ` · Renouvellement le ${renewal}` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white/50 text-xs">Annonces utilisées</p>
          {loading
            ? <div className="h-6 w-16 rounded bg-white/10 animate-pulse mt-0.5" />
            : <p className="text-white font-extrabold text-xl mt-0.5">
                {activeCount ?? 0}
                {planLimit < 999
                  ? <span className="text-white/40 font-normal text-sm"> / {planLimit}</span>
                  : <span className="text-white/40 font-normal text-sm"> / ∞</span>}
              </p>}
        </div>
      </div>

      {/* Usage bars */}
      <div className={`rounded-2xl border p-5 shadow-sm ${bd}`}>
        <p className={`text-sm font-extrabold mb-3 ${tx}`}>Utilisation</p>
        <div className="space-y-3">
          {[
            { label: 'Annonces actives', used: activeCount ?? 0, max: planLimit < 999 ? planLimit : null },
            { label: 'Leads ce mois',    used: leadsCount  ?? 0, max: 50 },
          ].map(({ label, used, max }) => {
            const pct = max ? Math.min((used / max) * 100, 100) : Math.min(used * 2, 100)
            return (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={sx}>{label}</span>
                  <span className={`font-bold ${tx}`}>
                    {loading ? '…' : used}{max ? ` / ${max}` : ''}
                  </span>
                </div>
                <div className={`h-2 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <motion.div className="h-full rounded-full bg-orange-500"
                    initial={{ width: 0 }} animate={{ width: loading ? '0%' : `${pct}%` }}
                    transition={{ duration: 0.6 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plan selector */}
      <div className={`rounded-2xl border p-5 shadow-sm ${bd}`}>
        <p className={`text-sm font-extrabold mb-3 ${tx}`}>Changer d'offre</p>
        <div className="grid grid-cols-3 gap-3">
          {PLAN_ORDER.map(planId => {
            const cfg    = PLAN_CONFIG[planId]
            const active = planId === currentPlan
            return (
              <div key={planId} className={`rounded-xl border-2 p-3 text-center transition-all ${
                active
                  ? 'border-orange-400 bg-orange-50'
                  : dark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center ${active ? 'bg-orange-500' : dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <cfg.Icon size={15} className={active ? 'text-white' : dark ? 'text-white/60' : 'text-slate-500'} />
                </div>
                <p className={`text-xs font-extrabold ${tx}`}>{cfg.name}</p>
                <p className={`text-[11px] ${sx}`}>{cfg.monthlyEur} €/mois</p>
                <p className={`text-[10px] mt-1 ${sx}`}>{cfg.listings >= 999 ? '∞' : cfg.listings} annonces</p>
                {active
                  ? <span className="mt-2 inline-block text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Actuel</span>
                  : <button className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${dark ? 'border-white/20 text-white/60 hover:border-orange-400 hover:text-orange-400' : 'border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-500'}`}>Choisir</button>}
              </div>
            )
          })}
        </div>
        <p className={`text-[11px] text-center mt-3 ${sx}`}>Gérez votre abonnement à tout moment.</p>
      </div>

      {/* Payment history */}
      <div className={`rounded-2xl border shadow-sm ${bd}`}>
        <div className={`px-5 py-4 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <p className={`text-sm font-extrabold ${tx}`}>Historique des paiements</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <I.Loader size={20} className={`animate-spin ${sx}`} />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center">
            <I.FileText size={26} className={`mx-auto mb-2 ${sx}`} />
            <p className={`text-sm ${sx}`}>Aucun paiement enregistré</p>
          </div>
        ) : payments.map((pay, i) => {
          const ps = PAYMENT_STATUS[pay.status] ?? PAYMENT_STATUS.pending
          return (
            <div key={pay.id} className={`flex items-center gap-4 px-5 py-3.5 border-b last:border-0 ${dark ? 'border-white/5' : 'border-slate-50'}`}>
              <I.FileText size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${tx}`}>Plan {PLAN_CONFIG[pay.plan ?? currentPlan]?.name ?? 'Abonnement'}</p>
                <p className={`text-xs ${sx}`}>{fmtDate(pay.created_at)}</p>
              </div>
              <p className={`text-sm font-bold ${tx}`}>{fmtAmount(pay.amount)}</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ps.cls}`}>{ps.label}</span>
              <button className={`text-xs font-semibold transition ${dark ? 'text-white/40 hover:text-orange-400' : 'text-slate-400 hover:text-orange-500'}`}>PDF</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
