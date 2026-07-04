import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../lib/ui.jsx'
import { supabase } from '../lib/supabase.js'
import { ShopCAInput } from '../components/ui/ShopCAInput'

/* ============================================================
   SHOPCA — Smart Alerts System
   - Saved searches with real-time matching
   - Free plan (1 alert, daily) / Smart Alerts (∞, instant)
   - Full Supabase CRUD with RLS
   ============================================================ */

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement', Icon: I.Building },
  { value: 'house',     label: 'Maison',       Icon: I.Home },
  { value: 'villa',     label: 'Villa',         Icon: I.Star },
  { value: 'land',      label: 'Terrain',       Icon: I.MapPin },
  { value: 'commercial',label: 'Local pro',     Icon: I.Briefcase },
]

const ROOMS = [null, 1, 2, 3, 4, 5]

const DEMO_ALERTS = [
  { id: 'd1', name: 'Appartement Paris 8e', city: 'Paris', price_min: 300000, price_max: 600000, property_type: 'apartment', rooms_min: 3, transaction_type: 'buy',  keywords: 'haussmannien terrasse', is_active: true,  frequency: 'instant', match_count: 4,  created_at: '2026-05-10' },
  { id: 'd2', name: 'Maison Lyon avec jardin',  city: 'Lyon',  price_min: null,   price_max: 400000, property_type: 'house',     rooms_min: 4, transaction_type: 'buy',  keywords: 'jardin garage',         is_active: false, frequency: 'daily',   match_count: 12, created_at: '2026-04-28' },
  { id: 'd3', name: 'Studio à louer Bordeaux',  city: 'Bordeaux', price_min: null, price_max: 800,  property_type: 'apartment', rooms_min: 1, transaction_type: 'rent', keywords: '',                      is_active: true,  frequency: 'daily',   match_count: 7,  created_at: '2026-04-15' },
]

const DEMO_NOTIFS = [
  { id: 'n1', listing_title: 'Appartement 4p Batignolles — terrasse',  listing_price: 498000, listing_city: 'Paris',    listing_type: 'apartment', is_read: false, created_at: '2026-05-21T08:14:00Z' },
  { id: 'n2', listing_title: 'Maison 5p Saint-Priest — jardin 400m²', listing_price: 375000, listing_city: 'Lyon',     listing_type: 'house',     is_read: false, created_at: '2026-05-20T17:30:00Z' },
  { id: 'n3', listing_title: 'Studio meublé proche tram',              listing_price: 720,    listing_city: 'Bordeaux', listing_type: 'apartment', is_read: false, created_at: '2026-05-20T09:05:00Z' },
]

const DEMO_HISTORY = [
  { id: 'h1', alert_name: 'Appartement Paris 8e',     listing_title: 'T4 haussmannien terrasse Batignolles',   listing_price: 498000, listing_city: 'Paris',    listing_surface: 89, listing_rooms: 4, listing_type: 'apartment', img_id: 'photo-1502672260266-1c1ef2d93688', created_at: '2026-05-21T08:14:00Z' },
  { id: 'h2', alert_name: 'Appartement Paris 8e',     listing_title: 'Appartement 3p rénové Madeleine',        listing_price: 520000, listing_city: 'Paris',    listing_surface: 72, listing_rooms: 3, listing_type: 'apartment', img_id: 'photo-1560185893-a55cbc8c57e8', created_at: '2026-05-19T14:22:00Z' },
  { id: 'h3', alert_name: 'Maison Lyon avec jardin',  listing_title: 'Maison 5p Saint-Priest — jardin 400m²',  listing_price: 375000, listing_city: 'Lyon',     listing_surface:135, listing_rooms: 5, listing_type: 'house',     img_id: 'photo-1564013799919-ab600027ffc6', created_at: '2026-05-20T17:30:00Z' },
  { id: 'h4', alert_name: 'Studio à louer Bordeaux',  listing_title: 'Studio meublé proche tram',              listing_price: 720,    listing_city: 'Bordeaux', listing_surface: 25, listing_rooms: 1, listing_type: 'apartment', img_id: 'photo-1522708323590-d24dbb6b0267', created_at: '2026-05-20T09:05:00Z' },
  { id: 'h5', alert_name: 'Appartement Paris 8e',     listing_title: 'Grand 3p vue dégagée République',        listing_price: 435000, listing_city: 'Paris',    listing_surface: 80, listing_rooms: 3, listing_type: 'apartment', img_id: 'photo-1502672023488-70e25813eb80', created_at: '2026-05-17T11:45:00Z' },
  { id: 'h6', alert_name: 'Studio à louer Bordeaux',  listing_title: 'T1bis lumineux Chartrons',               listing_price: 680,    listing_city: 'Bordeaux', listing_surface: 30, listing_rooms: 1, listing_type: 'apartment', img_id: 'photo-1484154218962-a197022b5858', created_at: '2026-05-15T16:10:00Z' },
  { id: 'h7', alert_name: 'Maison Lyon avec jardin',  listing_title: 'Belle villa Caluire — terrasse sud',     listing_price: 392000, listing_city: 'Lyon',     listing_surface:150, listing_rooms: 6, listing_type: 'villa',     img_id: 'photo-1568605114967-8130f3a36994', created_at: '2026-05-14T09:20:00Z' },
]

const FRANCE_CITIES_QUICK = [
  'Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Strasbourg',
  'Montpellier','Bordeaux','Lille','Rennes','Reims','Le Havre',
  'Saint-Étienne','Toulon','Grenoble','Dijon','Angers','Nîmes',
  'Villeurbanne','Aix-en-Provence','Brest','Le Mans','Tours','Amiens',
  'Limoges','Clermont-Ferrand','Metz','Besançon','Perpignan',
]

const BILLING_HISTORY = [
  { id: 'inv1', date: '2026-05-01', amount: '4,90 €', status: 'Payé',    period: 'mai 2026' },
  { id: 'inv2', date: '2026-04-01', amount: '4,90 €', status: 'Payé',    period: 'avr. 2026' },
  { id: 'inv3', date: '2026-03-01', amount: '4,90 €', status: 'Payé',    period: 'mars 2026' },
]

/* ── Helpers ─────────────────────────────────────────────── */
function fmtPrice(n) {
  if (!n) return null
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k€` : `${n}€/mois`
}

function criteriaLabel(a) {
  const parts = []
  if (a.city) parts.push(a.city)
  if (a.property_type) parts.push(PROPERTY_TYPES.find(t => t.value === a.property_type)?.label || a.property_type)
  if (a.rooms_min) parts.push(`${a.rooms_min}+ pièces`)
  if (a.surface_min) parts.push(`≥${a.surface_min}m²`)
  const lo = fmtPrice(a.price_min), hi = fmtPrice(a.price_max)
  if (lo && hi) parts.push(`${lo} – ${hi}`)
  else if (hi)  parts.push(`≤ ${hi}`)
  else if (lo)  parts.push(`≥ ${lo}`)
  if (a.keywords) parts.push(`"${a.keywords}"`)
  return parts.length ? parts.join(' · ') : 'Tous types · Toute France'
}

/* ============================================================
   Main export
   ============================================================ */
export default function AlertsView({ user }) {
  const [alerts,        setAlerts]        = useState([])
  const [notifications, setNotifications] = useState([])
  const [history,       setHistory]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [plan,          setPlan]          = useState('free')
  const [creatorOpen,   setCreatorOpen]   = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)
  const [billingOpen,   setBillingOpen]   = useState(false)
  const [notifsOpen,    setNotifsOpen]    = useState(false)
  const [tab,           setTab]           = useState('alertes')
  const [notifPrefs,    setNotifPrefs]    = useState({ notif_email_freq: 'instant', notif_in_app: true, notif_digest_hour: 8 })
  const [prefsSaved,    setPrefsSaved]    = useState(false)

  const isPremium  = plan === 'smart'
  const canAdd     = isPremium || alerts.length < 1

  /* ── Data loading ─────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    if (!user) { setAlerts(DEMO_ALERTS); setNotifications(DEMO_NOTIFS); setHistory(DEMO_HISTORY); setLoading(false); return }
    try {
      const [{ data: pf }, { data: al }, { data: no }, { data: hi }] = await Promise.all([
        supabase.from('profiles').select('smart_alerts_plan,notif_email_freq,notif_in_app,notif_digest_hour').eq('id', user.id).single(),
        supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('alert_notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(20),
        supabase.from('alert_notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ])
      setPlan(pf?.smart_alerts_plan || 'free')
      if (pf) setNotifPrefs({ notif_email_freq: pf.notif_email_freq || 'instant', notif_in_app: pf.notif_in_app ?? true, notif_digest_hour: pf.notif_digest_hour ?? 8 })
      setAlerts(al || [])
      setNotifications(no || [])
      setHistory(hi || [])
    } catch {
      setAlerts(DEMO_ALERTS); setNotifications(DEMO_NOTIFS); setHistory(DEMO_HISTORY)
    } finally { setLoading(false) }
  }, [user])

  useEffect(() => { loadAll() }, [loadAll])

  /* ── CRUD ─────────────────────────────────────────────── */
  const saveAlert = async (data) => {
    const row = { ...data, frequency: isPremium ? data.frequency : 'daily' }
    if (!user) {
      if (editTarget) setAlerts(p => p.map(a => a.id === editTarget.id ? { ...a, ...row } : a))
      else            setAlerts(p => [{ ...row, id: `loc-${Date.now()}`, match_count: 0, created_at: new Date().toISOString() }, ...p])
    } else if (editTarget) {
      const { data: updated } = await supabase.from('alerts').update({ ...row, updated_at: new Date().toISOString() }).eq('id', editTarget.id).eq('user_id', user.id).select().single()
      if (updated) setAlerts(p => p.map(a => a.id === editTarget.id ? updated : a))
    } else {
      const { data: created } = await supabase.from('alerts').insert({ ...row, user_id: user.id }).select().single()
      if (created) setAlerts(p => [created, ...p])
    }
    setCreatorOpen(false); setEditTarget(null)
  }

  const toggleAlert = async (id, val) => {
    setAlerts(p => p.map(a => a.id === id ? { ...a, is_active: val } : a))
    if (user) await supabase.from('alerts').update({ is_active: val }).eq('id', id)
  }

  const deleteAlert = async (id) => {
    setAlerts(p => p.filter(a => a.id !== id))
    if (user) await supabase.from('alerts').delete().eq('id', id)
  }

  const dismissNotifs = async () => {
    setNotifications([])
    if (user) await supabase.from('alert_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  }

  const handleUpgrade = async () => {
    setPlan('smart')
    if (user) {
      await supabase.from('profiles').update({ smart_alerts_plan: 'smart', smart_alerts_since: new Date().toISOString() }).eq('id', user.id)
    }
    setBillingOpen(false)
  }

  const handleCancel = async () => {
    setPlan('free')
    if (user) await supabase.from('profiles').update({ smart_alerts_plan: 'free' }).eq('id', user.id)
    setBillingOpen(false)
  }

  const savePrefs = async (prefs) => {
    setNotifPrefs(prefs)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2200)
    if (user) await supabase.from('profiles').update(prefs).eq('id', user.id)
  }

  /* ── Stats ───────────────────────────────────────────── */
  const activeCount   = alerts.filter(a => a.is_active).length
  const unreadCount   = notifications.length
  const totalMatches  = alerts.reduce((s, a) => s + (a.match_count || 0), 0)

  return (
    <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-7">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <I.Bell size={10} />
            Smart Alerts
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Mes alertes</h1>
          <p className="text-slate-500 text-sm mt-1">Recevez les nouvelles annonces dès leur publication.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button onClick={() => setNotifsOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 transition-colors">
              <I.Bell size={14} className="text-orange-500" />
              Nouvelles annonces
              <span className="ml-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            </button>
          )}
          {!isPremium && (
            <button onClick={() => setBillingOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-bold hover:bg-orange-100 transition-colors">
              <I.Zap size={13} />
              Smart Alerts — 4,90€/mois
            </button>
          )}
          <button onClick={() => { setEditTarget(null); setCreatorOpen(true) }} disabled={!canAdd}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <I.Plus size={14} />
            Nouvelle alerte
          </button>
        </div>
      </div>

      {/* ── Plan banner ──────────────────────────────────── */}
      <PlanBanner plan={plan} alertCount={alerts.length} onUpgrade={() => setBillingOpen(true)} onManage={() => setBillingOpen(true)} />

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Alertes actives',    val: activeCount,                           Icon: I.Bell,       cls: 'text-orange-600 bg-orange-50' },
          { label: 'Total alertes',      val: alerts.length,                         Icon: I.Filter,     cls: 'text-indigo-600 bg-indigo-50' },
          { label: 'Annonces reçues',    val: totalMatches || '—',                   Icon: I.Home,       cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'Plan',               val: isPremium ? 'Smart Alerts' : 'Gratuit',Icon: I.Zap,        cls: isPremium ? 'text-orange-600 bg-orange-50' : 'text-slate-500 bg-slate-100' },
        ].map(({ label, val, Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-current/10 bg-current/[0.02] p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={14} /></div>
            <div className="text-xl font-extrabold tracking-tight">{val}</div>
            <div className="text-[11px] opacity-55 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-current/[0.05] w-fit">
        {[
          { id: 'alertes',      label: 'Alertes' },
          { id: 'historique',   label: 'Historique' },
          { id: 'preferences',  label: 'Préférences' },
          { id: 'statistiques', label: 'Statistiques' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Alerts list ──────────────────────────────────── */}
      {tab === 'alertes' && (
        loading ? (
          <div className="space-y-3">
            {[0,1,2].map(i => <div key={i} className="h-24 rounded-2xl border border-current/10 bg-current/[0.03] animate-pulse" />)}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState onCreate={() => setCreatorOpen(true)} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {alerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} isPremium={isPremium}
                  onToggle={toggleAlert} onEdit={(a) => { setEditTarget(a); setCreatorOpen(true) }} onDelete={deleteAlert} />
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* ── Free plan nudge ──────────────────────────────── */}
      {tab === 'alertes' && !isPremium && alerts.length >= 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-dashed border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50/50 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <I.Zap size={18} className="text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-[#0F172A]">Limite du plan gratuit atteinte</div>
            <div className="text-xs text-slate-500 mt-0.5">Smart Alerts vous donne des alertes illimitées et des e-mails instantanés dès qu'une annonce correspond.</div>
          </div>
          <button onClick={() => setBillingOpen(true)}
            className="shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm">
            Upgrader — 4,90€/mois
          </button>
        </motion.div>
      )}

      {/* ── Historique tab ───────────────────────────────── */}
      {tab === 'historique' && (
        <HistoriqueTab history={history} />
      )}

      {/* ── Preferences tab ─────────────────────────────── */}
      {tab === 'preferences' && (
        <PreferencesTab prefs={notifPrefs} isPremium={isPremium} saved={prefsSaved} onSave={savePrefs} />
      )}

      {/* ── Stats tab ────────────────────────────────────── */}
      {tab === 'statistiques' && (
        <StatsTab alerts={alerts} notifications={notifications} totalMatches={totalMatches} />
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      <AnimatePresence>
        {creatorOpen && (
          <AlertCreatorModal key="creator" alert={editTarget} isPremium={isPremium}
            onSave={saveAlert} onClose={() => { setCreatorOpen(false); setEditTarget(null) }} />
        )}
        {billingOpen && (
          <BillingModal key="billing" plan={plan}
            onUpgrade={handleUpgrade} onCancel={handleCancel} onClose={() => setBillingOpen(false)} />
        )}
        {notifsOpen && (
          <NotificationsPanel key="notifs" notifications={notifications}
            onDismiss={() => { dismissNotifs(); setNotifsOpen(false) }}
            onClose={() => setNotifsOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ============================================================
   PlanBanner
   ============================================================ */
function PlanBanner({ plan, alertCount, onUpgrade, onManage }) {
  const isPremium = plan === 'smart'
  if (isPremium) return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#0B1F3A] to-[#1a3a5e] text-white">
      <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
        <I.Zap size={15} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm">Smart Alerts actif</span>
        <span className="text-white/60 text-xs ml-2">Alertes illimitées · E-mails instantanés</span>
      </div>
      <button onClick={onManage} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
        Gérer l'abonnement
      </button>
    </div>
  )
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50">
      <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
        <I.Shield size={15} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-sm text-[#0F172A]">Plan Gratuit</span>
        <span className="text-slate-500 text-xs ml-2">{alertCount}/1 alerte utilisée · Récap quotidien</span>
      </div>
      <button onClick={onUpgrade} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors">
        Passer à Smart Alerts
      </button>
    </div>
  )
}

/* ============================================================
   AlertCard
   ============================================================ */
function AlertCard({ alert, index, isPremium, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const pt = PROPERTY_TYPES.find(t => t.value === alert.property_type)
  const TypeIcon = pt?.Icon || I.Home

  const handleDelete = () => {
    setDeleting(true)
    setTimeout(() => onDelete(alert.id), 300)
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.96 : 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`group relative rounded-2xl border bg-white transition-shadow hover:shadow-md ${alert.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${alert.is_active ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
          <TypeIcon size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-bold text-sm text-[#0F172A] truncate">{alert.name}</span>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${alert.transaction_type === 'buy' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {alert.transaction_type === 'buy' ? 'Achat' : 'Location'}
            </span>
            {alert.frequency === 'instant'
              ? <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md"><I.Zap size={9} />Instantané</span>
              : <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md"><I.Calendar size={9} />Quotidien</span>
            }
          </div>
          <p className="text-[11px] text-slate-500 truncate">{criteriaLabel(alert)}</p>
        </div>

        {/* Match count */}
        {(alert.match_count > 0) && (
          <div className="hidden sm:flex flex-col items-center shrink-0">
            <span className="text-lg font-extrabold text-[#0F172A] leading-none">{alert.match_count}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">annonces</span>
          </div>
        )}

        {/* Toggle */}
        <button onClick={() => onToggle(alert.id, !alert.is_active)}
          className={`relative w-10 h-5.5 rounded-full shrink-0 transition-colors focus:outline-none ${alert.is_active ? 'bg-orange-500' : 'bg-slate-200'}`}
          style={{ minWidth: '2.5rem', height: '1.375rem' }}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${alert.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>

        {/* Actions */}
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all">
            <I.MoreH size={15} className="text-slate-500" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-20">
                  <button onClick={() => { setMenuOpen(false); onEdit(alert) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 text-left">
                    <I.Edit size={13} className="text-slate-500" /> Modifier
                  </button>
                  <button onClick={() => { setMenuOpen(false); onToggle(alert.id, !alert.is_active) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 text-left">
                    {alert.is_active ? <><I.EyeOff size={13} className="text-slate-500" /> Mettre en pause</> : <><I.Eye size={13} className="text-slate-500" /> Réactiver</>}
                  </button>
                  <button onClick={() => { setMenuOpen(false); handleDelete() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-rose-50 text-rose-600 text-left">
                    <I.Trash size={13} /> Supprimer
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   EmptyState
   ============================================================ */
function EmptyState({ onCreate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
        <I.Bell size={24} className="text-orange-500" />
      </div>
      <h3 className="font-extrabold text-lg text-[#0F172A] mb-2">Aucune alerte configurée</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
        Créez votre première alerte et soyez notifié dès qu'une annonce correspond à vos critères.
      </p>
      <button onClick={onCreate}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors shadow-sm">
        <I.Plus size={15} /> Créer une alerte
      </button>
    </motion.div>
  )
}

/* ============================================================
   AlertCreatorModal
   ============================================================ */
function AlertCreatorModal({ alert: initial, isPremium, onSave, onClose }) {
  const isEdit = !!initial

  const [name,           setName]           = useState(initial?.name            || '')
  const [txType,         setTxType]         = useState(initial?.transaction_type || 'buy')
  const [city,           setCity]           = useState(initial?.city             || '')
  const [citySuggestions,setCitySuggestions]= useState([])
  const [propType,       setPropType]       = useState(initial?.property_type    || null)
  const [priceMin,       setPriceMin]       = useState(initial?.price_min        || '')
  const [priceMax,       setPriceMax]       = useState(initial?.price_max        || '')
  const [roomsMin,       setRoomsMin]       = useState(initial?.rooms_min        || null)
  const [surfaceMin,     setSurfaceMin]     = useState(initial?.surface_min      || '')
  const [keywords,       setKeywords]       = useState(initial?.keywords         || '')
  const [frequency,      setFrequency]      = useState(initial?.frequency        || 'daily')
  const [error,          setError]          = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('Donnez un nom à cette alerte.'); return }
    if (!city.trim())  { setError('Indiquez au moins une ville.'); return }
    onSave({
      name: name.trim(),
      transaction_type: txType,
      city: city.trim(),
      property_type: propType,
      price_min: priceMin ? Number(priceMin) : null,
      price_max: priceMax ? Number(priceMax) : null,
      rooms_min: roomsMin,
      surface_min: surfaceMin ? Number(surfaceMin) : null,
      keywords: keywords.trim(),
      frequency: isPremium ? frequency : 'daily',
      is_active: initial?.is_active ?? true,
    })
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-lg text-[#0F172A]">{isEdit ? 'Modifier l\'alerte' : 'Nouvelle alerte'}</h2>
            <p className="text-slate-500 text-xs mt-0.5">Définissez vos critères de recherche.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <I.X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Alert name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nom de l'alerte *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Appartement Paris 8e"
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300 transition" />
          </div>

          {/* Transaction type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Type de transaction</label>
            <div className="flex gap-2">
              {[{ val: 'buy', label: 'Acheter' }, { val: 'rent', label: 'Louer' }].map(({ val, label }) => (
                <button key={val} onClick={() => setTxType(val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${txType === val ? 'bg-[#0B1F3A] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ville *</label>
            <div className="flex items-center gap-2 px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-300 transition">
              <I.MapPin size={14} className="text-slate-400 shrink-0" />
              <input value={city}
                onChange={e => {
                  const v = e.target.value; setCity(v)
                  setCitySuggestions(v.length >= 2 ? FRANCE_CITIES_QUICK.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 5) : [])
                }}
                onBlur={() => setTimeout(() => setCitySuggestions([]), 150)}
                placeholder="Paris, Lyon, Bordeaux…"
                className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none" />
              {city && <button type="button" onClick={() => { setCity(''); setCitySuggestions([]) }} className="shrink-0"><I.X size={12} className="text-slate-300 hover:text-slate-500" /></button>}
            </div>
            <AnimatePresence>
              {citySuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {citySuggestions.map(c => (
                    <button key={c} type="button" onMouseDown={() => { setCity(c); setCitySuggestions([]) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-orange-50 text-left transition-colors">
                      <I.MapPin size={12} className="text-orange-400 shrink-0" />
                      <span>{c}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Property type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Type de bien</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPropType(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propType === null ? 'bg-[#0B1F3A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Tous
              </button>
              {PROPERTY_TYPES.map(({ value, label, Icon }) => (
                <button key={value} onClick={() => setPropType(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propType === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Budget {txType === 'rent' ? '(€/mois)' : '(€)'}
            </label>
            <div className="flex gap-2 items-center">
              <ShopCAInput type="number" size="sm" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min" />
              <span className="text-slate-400 text-sm font-medium">–</span>
              <ShopCAInput type="number" size="sm" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max" />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pièces minimum</label>
            <div className="flex gap-2 flex-wrap">
              {ROOMS.map(r => (
                <button key={r ?? 'all'} onClick={() => setRoomsMin(r)}
                  className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${roomsMin === r ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {r === null ? 'Tous' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Surface */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Surface minimum (m²)</label>
            <ShopCAInput type="number" size="sm" min="1" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)} placeholder="Ex: 40"
              iconRight={surfaceMin ? <span className="text-xs text-slate-400">m²</span> : undefined} />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mots-clés</label>
            <ShopCAInput size="sm" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="terrasse, parking, jardin…" />
            <p className="text-[10px] text-slate-400 mt-1">Séparés par des virgules. La recherche est insensible à la casse.</p>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fréquence des e-mails</label>
            <div className="space-y-2">
              {[
                { val: 'daily',   label: 'Récap quotidien', sub: 'Un e-mail chaque matin à 8h',        Icon: I.Calendar, premium: false },
                { val: 'instant', label: 'Instantané',       sub: 'Dès qu\'une annonce correspond',    Icon: I.Zap,      premium: true  },
              ].map(({ val, label, sub, Icon, premium }) => {
                const locked = premium && !isPremium
                return (
                  <button key={val} onClick={() => !locked && setFrequency(val)} disabled={locked}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${frequency === val && !locked ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'} ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${frequency === val && !locked ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                        {label}
                        {locked && <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Smart Alerts</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                    </div>
                    {frequency === val && !locked && <I.CheckCircle size={16} className="text-orange-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
                <I.Alert size={14} className="shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors shadow-sm">
              {isEdit ? 'Sauvegarder' : 'Créer l\'alerte'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

/* ============================================================
   BillingModal — Subscription management
   ============================================================ */
function BillingModal({ plan, onUpgrade, onCancel, onClose }) {
  const isPremium = plan === 'smart'
  const [tab, setTab] = useState(isPremium ? 'manage' : 'plans')
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleCheckout = () => {
    setCheckoutLoading(true)
    setTimeout(() => { setCheckoutLoading(false); onUpgrade() }, 1800)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <div>
              <h2 className="font-extrabold text-xl">Abonnement Smart Alerts</h2>
              <p className="text-slate-500 text-sm mt-0.5">Gérez votre plan et votre facturation.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <I.X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-6 mt-5 p-1 rounded-xl bg-slate-100">
            {(isPremium
              ? [{ id: 'manage', label: 'Mon abonnement' }, { id: 'billing', label: 'Facturation' }]
              : [{ id: 'plans',  label: 'Choisir un plan' }]
            ).map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Plans tab */}
            {tab === 'plans' && (
              <div className="space-y-3">
                {/* Free card */}
                <div className={`rounded-2xl border-2 p-5 ${!isPremium ? 'border-slate-300 bg-slate-50' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-extrabold">Gratuit</div>
                      <div className="text-slate-500 text-sm">0€ / mois</div>
                    </div>
                    {!isPremium && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-600">Plan actuel</span>}
                  </div>
                  <ul className="space-y-1.5">
                    {['1 alerte sauvegardée', 'Récap e-mail quotidien', 'Notifications basiques'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <I.Check size={13} className="text-slate-400 shrink-0" strokeWidth={3} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Smart Alerts card */}
                <div className="relative rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50/30 p-5 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-orange-400 opacity-10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-extrabold text-[#0F172A]">Smart Alerts</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">RECOMMANDÉ</span>
                        </div>
                        <div className="text-2xl font-extrabold text-[#0F172A]">4,90€ <span className="text-sm font-semibold text-slate-500">/ mois</span></div>
                        <div className="text-xs text-slate-500 mt-0.5">Annulable à tout moment</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <I.Zap size={18} className="text-white" />
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {['Alertes illimitées', 'E-mails instantanés', 'Notifications prioritaires', 'Filtres avancés (mots-clés)', 'Accès API alertes'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <I.CheckCircle size={13} className="text-orange-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={handleCheckout} disabled={checkoutLoading}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                      {checkoutLoading
                        ? <><I.Loader size={15} /> Redirection Stripe…</>
                        : <><I.CreditCard size={14} /> S'abonner — 4,90€/mois</>
                      }
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                      <I.Shield size={10} /> Paiement sécurisé · Stripe · Sans engagement
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manage tab */}
            {tab === 'manage' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                      <I.Zap size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-extrabold">Smart Alerts</div>
                      <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Actif · 4,90€/mois
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold">∞</div>
                      <div className="text-[10px] text-slate-500">Alertes</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold">Instantané</div>
                      <div className="text-[10px] text-slate-500">Fréquence</div>
                    </div>
                  </div>
                </div>

                {!cancelConfirm ? (
                  <button onClick={() => setCancelConfirm(true)}
                    className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors">
                    Annuler l'abonnement
                  </button>
                ) : (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                    <p className="text-sm text-rose-800 font-medium">Êtes-vous sûr ? Vous perdrez l'accès aux alertes illimitées et aux e-mails instantanés.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setCancelConfirm(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white hover:bg-slate-50 transition-colors">
                        Conserver
                      </button>
                      <button onClick={onCancel}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors">
                        Confirmer l'annulation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing history tab */}
            {tab === 'billing' && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="font-bold text-sm">Historique de facturation</span>
                  <span className="text-xs text-slate-500">3 factures</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {BILLING_HISTORY.map(inv => (
                    <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">Smart Alerts — {inv.period}</div>
                        <div className="text-xs text-slate-500">{inv.date}</div>
                      </div>
                      <span className="text-sm font-bold text-[#0F172A]">{inv.amount}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{inv.status}</span>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <I.Download size={13} className="text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

/* ============================================================
   PreferencesTab
   ============================================================ */
function PreferencesTab({ prefs, isPremium, saved, onSave }) {
  const [local, setLocal] = useState({ ...prefs })

  const freqOptions = [
    { val: 'instant', label: 'Instantané',    sub: "Dès qu'une annonce est publiée", Icon: I.Zap,      premium: true  },
    { val: 'daily',   label: 'Quotidien',     sub: 'Un résumé chaque matin à 8h',   Icon: I.Calendar, premium: false },
    { val: 'weekly',  label: 'Hebdomadaire',  sub: 'Un récap chaque lundi matin',   Icon: I.Calendar, premium: false },
  ]

  return (
    <div className="space-y-5">
      {/* Email frequency */}
      <div className="rounded-2xl border border-current/10 p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm">Fréquence des e-mails</h3>
          <p className="text-xs text-slate-500 mt-0.5">Choisissez comment vous souhaitez recevoir les alertes par e-mail.</p>
        </div>
        <div className="space-y-2">
          {freqOptions.map(({ val, label, sub, Icon, premium }) => {
            const locked = premium && !isPremium
            const active = local.notif_email_freq === val
            return (
              <button key={val} onClick={() => !locked && setLocal(p => ({ ...p, notif_email_freq: val }))} disabled={locked}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${active && !locked ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'} ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active && !locked ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    {label}
                    {locked && <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 ring-1 ring-orange-200">Smart Alerts</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                </div>
                {active && !locked && <I.CheckCircle size={16} className="text-orange-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* In-app toggle */}
      <div className="rounded-2xl border border-current/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm">Notifications in-app</div>
            <div className="text-xs text-slate-500 mt-0.5">Badge sur la cloche et panneau de notifications en temps réel.</div>
          </div>
          <button onClick={() => setLocal(p => ({ ...p, notif_in_app: !p.notif_in_app }))}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${local.notif_in_app ? 'bg-orange-500' : 'bg-slate-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local.notif_in_app ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Save */}
      <button onClick={() => onSave(local)}
        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm">
        {saved
          ? <><I.Check size={14} />Sauvegardé !</>
          : <><I.Download size={14} />Enregistrer les préférences</>}
      </button>
    </div>
  )
}

/* ============================================================
   StatsTab
   ============================================================ */
function StatsTab({ alerts, notifications, totalMatches }) {
  const activeCount = alerts.filter(a => a.is_active).length
  const pausedCount = alerts.length - activeCount

  const cards = [
    { label: 'Total correspondances', val: totalMatches || 0, sub: 'depuis la création',    Icon: I.Bell,        cls: 'text-orange-600 bg-orange-50'   },
    { label: 'Alertes actives',       val: activeCount,       sub: `sur ${alerts.length} créées`, Icon: I.CheckCircle, cls: 'text-emerald-600 bg-emerald-50' },
    { label: 'En pause',              val: pausedCount,       sub: 'alertes désactivées',   Icon: I.EyeOff,      cls: 'text-amber-600 bg-amber-50'     },
    { label: 'Non lues',              val: notifications.length, sub: 'dans votre centre',  Icon: I.Zap,         cls: 'text-indigo-600 bg-indigo-50'   },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, val, sub, Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-current/10 p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={14} /></div>
            <div className="text-2xl font-extrabold tracking-tight">{val}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{label}</div>
            <div className="text-[10px] text-slate-400">{sub}</div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-current/10 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-current/10 bg-slate-50/60 flex items-center justify-between">
            <span className="font-bold text-sm">Performance par alerte</span>
            <span className="text-xs text-slate-500">{alerts.length} alertes</span>
          </div>
          <div className="px-5 py-4 space-y-5">
            {(() => {
              const maxM = Math.max(...alerts.map(a => a.match_count || 0), 1)
              return alerts.map((a, idx) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${a.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-xs font-semibold text-slate-700 truncate">{a.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#0F172A] ml-2 shrink-0">{a.match_count || 0} annonces</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.round(((a.match_count || 0) / maxM) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: idx * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: a.is_active ? 'linear-gradient(90deg,#F97316,#fb923c)' : '#CBD5E1' }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">{criteriaLabel(a)}</div>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <I.Bell size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Créez des alertes pour voir les statistiques ici.</p>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   HistoriqueTab — timeline of triggered matches
   ============================================================ */
function HistoriqueTab({ history }) {
  const unsplash = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

  if (history.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
        <I.Bell size={24} className="text-orange-300" />
      </div>
      <h3 className="font-extrabold text-base text-[#0F172A] mb-2">Aucune correspondance pour l'instant</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto">Les annonces qui déclencheront vos alertes apparaîtront ici.</p>
    </motion.div>
  )

  const groups = history.reduce((acc, n) => {
    const d = new Date(n.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!acc[d]) acc[d] = []
    acc[d].push(n)
    return acc
  }, {})

  return (
    <div className="space-y-7">
      {Object.entries(groups).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 capitalize">{date}</span>
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length} annonce{items.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2.5">
            {items.map((n, i) => {
              const isRent = (n.listing_price || 0) < 5000
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow cursor-pointer group">

                  {/* Thumbnail */}
                  {n.img_id ? (
                    <img src={unsplash(n.img_id, 120)} alt=""
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <I.Home size={20} className="text-orange-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">{n.alert_name}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A] truncate leading-snug">{n.listing_title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-slate-500">{n.listing_city}</span>
                      {n.listing_surface && <span className="text-[11px] text-slate-400">· {n.listing_surface} m²</span>}
                      {n.listing_rooms && <span className="text-[11px] text-slate-400">· {n.listing_rooms} p.</span>}
                    </div>
                  </div>

                  {/* Price + time */}
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-sm font-extrabold text-[#0F172A]">
                      {(n.listing_price || 0).toLocaleString('fr-FR')}€{isRent ? '/mois' : ''}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">Voir →</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   NotificationsPanel — slide-in feed
   ============================================================ */
function NotificationsPanel({ notifications, onDismiss, onClose }) {
  const typeLabel = { apartment: 'Appartement', house: 'Maison', villa: 'Villa', land: 'Terrain', commercial: 'Local pro' }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold">Nouvelles annonces</h3>
            <p className="text-xs text-slate-500">{notifications.length} correspondance{notifications.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDismiss} className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Tout marquer lu
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <I.X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.map(n => (
            <div key={n.id} className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                  <I.Home size={14} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-snug">{n.listing_title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {typeLabel[n.listing_type] || 'Bien'} · {n.listing_city}
                  </div>
                  <div className="text-sm font-extrabold text-orange-600 mt-1">
                    {n.listing_price?.toLocaleString()}€
                    {n.listing_type === 'apartment' && n.listing_price < 5000 ? '/mois' : ''}
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
