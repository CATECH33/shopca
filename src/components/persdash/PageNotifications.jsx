import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

const TYPE_ICON = {
  match:  I.Bell,
  price:  I.TrendingDown,
  update: I.Edit,
  system: I.Check,
}

const TYPE_DOT = {
  match:  'bg-orange-500',
  price:  'bg-sky-500',
  update: 'bg-emerald-500',
  system: 'bg-slate-400',
}

const FALLBACK = [
  { id:'1', type:'match',  title:'3 nouvelles annonces correspondent à votre alerte "Paris 3e"', created_at: new Date(Date.now() - 600000).toISOString(), is_read:false },
  { id:'2', type:'price',  title:'Baisse de prix : Loft Bastille 2P → 2 400 €/mois (−15 000 €)', created_at: new Date(Date.now() - 10800000).toISOString(), is_read:false },
  { id:'3', type:'update', title:'Votre favori "Villa Neuilly" a été mis à jour par l\'agence',   created_at: new Date(Date.now() - 86400000).toISOString(), is_read:false },
  { id:'4', type:'match',  title:'9 nouvelles annonces : Location Paris 11e ≤ 2 500 €/mois',     created_at: new Date(Date.now() - 86400000*2).toISOString(), is_read:true },
  { id:'5', type:'system', title:'Bienvenue sur SHOPCA ! Complétez votre profil pour de meilleures suggestions.', created_at: new Date(Date.now() - 86400000*3).toISOString(), is_read:true },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days} j`
}

export default function PageNotifications({ dark }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setItems(FALLBACK); setLoading(false); return }
    supabase
      .from('alert_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (error || !data?.length) {
          setItems(FALLBACK)
        } else {
          setItems(data)
        }
        setLoading(false)
      })
  }, [user])

  const markAll = async () => {
    setItems(p => p.map(n => ({ ...n, is_read: true })))
    if (user) {
      await supabase
        .from('alert_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }

  const markRead = async (id) => {
    setItems(p => p.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (user) {
      await supabase.from('alert_notifications').update({ is_read: true }).eq('id', id)
    }
  }

  const unread = items.filter(n => !n.is_read).length
  const tx = dark ? 'text-white'    : 'text-[#0F172A]'
  const sx = dark ? 'text-white/50' : 'text-slate-400'
  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'

  if (loading) {
    return <div className="flex items-center justify-center py-20"><I.Loader size={24} className="text-orange-500" /></div>
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <p className={`text-sm ${sx}`}>{unread} non lue(s)</p>
        {unread > 0 && (
          <button onClick={markAll} className="text-xs font-bold text-orange-500 hover:text-orange-600 transition">
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${bd}`}>
        <AnimatePresence>
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? I.Bell
            const dot = TYPE_DOT[n.type] ?? 'bg-slate-400'
            return (
              <motion.div key={n.id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex gap-4 px-5 py-4 border-b last:border-0 cursor-pointer transition ${
                  !n.is_read
                    ? dark ? 'bg-orange-500/5 border-white/5' : 'bg-orange-50/60 border-orange-100'
                    : dark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.is_read ? 'bg-orange-100' : dark ? 'bg-white/10' : 'bg-slate-100'
                }`}>
                  <Icon size={15} className={!n.is_read ? 'text-orange-500' : dark ? 'text-white/40' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.is_read ? (dark ? 'text-white font-semibold' : 'text-[#0F172A] font-semibold') : sx}`}>
                    {n.title || n.body || 'Notification'}
                  </p>
                  <p className={`text-[11px] mt-1 ${sx}`}>{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dot}`} />}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16">
          <I.Bell size={32} className="text-slate-300" />
          <p className={`text-sm font-semibold ${sx}`}>Aucune notification</p>
        </div>
      )}
    </div>
  )
}
