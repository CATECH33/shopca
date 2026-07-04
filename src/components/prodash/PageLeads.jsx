import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { ShopCASelect } from '../ui/ShopCASelect'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

const STATUSES = ['Nouveau', 'Contacté', 'En cours', 'Converti']

const STATUS_STYLE = {
  'Nouveau':  'bg-orange-100 text-orange-700',
  'Contacté': 'bg-sky-100 text-sky-700',
  'En cours': 'bg-amber-100 text-amber-700',
  'Converti': 'bg-emerald-100 text-emerald-700',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins  <  1) return "À l'instant"
  if (mins  < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs   < 24) return `${hrs} h`
  if (hrs   < 48) return 'Hier'
  return `${Math.floor(hrs / 24)} j`
}

function fmtPrice(price, type) {
  if (!price) return '—'
  const base = Number(price).toLocaleString('fr-FR') + ' €'
  return type === 'location' || type === 'colocation' ? base + '/mois' : base
}

function shortEmail(email) {
  if (!email) return 'Contact'
  return email.length > 22 ? email.slice(0, 22) + '…' : email
}

export default function PageLeads({ dark }) {
  const { user } = useAuth()
  const [leads,    setLeads]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, price, transaction_type')
        .eq('user_id', user.id)

      const ids = (listings ?? []).map(l => l.id)
      if (!ids.length) { setLeads([]); return }

      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:users(email, phone)')
        .in('listing_id', ids)
        .order('created_at', { ascending: false })

      const infoMap = Object.fromEntries(
        (listings ?? []).map(l => [l.id, l])
      )

      setLeads((msgs ?? []).map(m => ({
        id:              m.id,
        email:           m.sender?.email ?? null,
        phone:           m.sender?.phone ?? null,
        listingTitle:    infoMap[m.listing_id]?.title ?? '—',
        price:           infoMap[m.listing_id]?.price,
        transactionType: infoMap[m.listing_id]?.transaction_type,
        status:          m.status ?? 'Nouveau',
        message:         m.message,
        createdAt:       m.created_at,
      })))
    } catch (err) {
      console.error('[leads] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, newStatus) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', id)
      if (!error) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
        setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
      }
    } finally {
      setUpdating(false)
    }
  }

  const lead = leads.find(l => l.id === selected)

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {loading ? (
        <div className="flex justify-center py-20">
          <I.Loader size={24} className={`animate-spin ${sx}`} />
        </div>
      ) : leads.length === 0 ? (
        <div className={`rounded-2xl border p-14 text-center ${bd}`}>
          <I.Mail size={32} className={`mx-auto mb-3 ${sx}`} />
          <p className={`text-sm font-semibold ${tx}`}>Aucun lead reçu</p>
          <p className={`text-xs mt-1 ${sx}`}>Les messages de vos annonces apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Lead list */}
          <div className="flex-1 space-y-3">
            {leads.map(l => (
              <motion.button key={l.id}
                onClick={() => setSelected(l.id === selected ? null : l.id)}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className={`w-full rounded-2xl border p-4 text-left transition-all shadow-sm ${
                  selected === l.id
                    ? 'border-orange-400 ' + (dark ? 'bg-orange-500/10' : 'bg-orange-50')
                    : bd
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(l.email?.[0] ?? 'C').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${tx} truncate`}>{shortEmail(l.email)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[l.status]}`}>
                        {l.status}
                      </span>
                    </div>
                    <p className={`text-xs ${sx} truncate`}>
                      {l.listingTitle} · {fmtPrice(l.price, l.transactionType)}
                    </p>
                  </div>
                  <p className={`text-[11px] ${sx} shrink-0`}>{timeAgo(l.createdAt)}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {lead && (
              <motion.div key={lead.id}
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 288 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                className={`rounded-2xl border shadow-sm overflow-hidden shrink-0 ${bd}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                  <p className={`text-sm font-extrabold ${tx}`}>Détail</p>
                  <button onClick={() => setSelected(null)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${dark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <I.X size={12} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Avatar + email */}
                  <div className={`flex flex-col items-center gap-2 pb-4 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-extrabold">
                      {(lead.email?.[0] ?? 'C').toUpperCase()}
                    </div>
                    <p className={`text-xs font-semibold ${tx} text-center break-all`}>{lead.email ?? 'Contact'}</p>
                    {/* Status selector */}
                    <ShopCASelect
                      value={lead.status}
                      onChange={v => updateStatus(lead.id, v)}
                      options={STATUSES}
                      disabled={updating}
                      ghost
                      size="xs"
                      triggerClassName={`text-[11px] font-bold px-2.5 py-1 rounded-full disabled:opacity-50 ${STATUS_STYLE[lead.status]}`}
                    />
                  </div>

                  {/* Fields */}
                  {[
                    { label: 'Annonce',  val: lead.listingTitle },
                    { label: 'Budget',   val: fmtPrice(lead.price, lead.transactionType) },
                    { label: 'Téléphone',val: lead.phone ?? '—' },
                    { label: 'Reçu',     val: `Il y a ${timeAgo(lead.createdAt)}` },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${sx}`}>{label}</p>
                      <p className={`text-sm font-semibold mt-0.5 ${tx}`}>{val}</p>
                    </div>
                  ))}

                  {/* Message */}
                  {lead.message && (
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${sx}`}>Message</p>
                      <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-slate-600'}`}>{lead.message}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`}
                      className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center gap-2">
                      <I.Phone size={13} /> Appeler
                    </a>
                  ) : (
                    <button disabled
                      className="w-full h-9 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <I.Phone size={13} /> Pas de téléphone
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
