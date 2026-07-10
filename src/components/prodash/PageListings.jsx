import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../lib/ui.jsx'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

const ListingWizard = lazy(() => import('../../dashboard/ListingWizard.jsx'))

const STATUS_LABEL = {
  active:   'Actif',
  pending:  'En attente',
  sold:     'Vendu',
  rented:   'Loué',
  inactive: 'Inactif',
}

const STATUS_STYLE = {
  'Actif':      'bg-emerald-100 text-emerald-700',
  'Loué':       'bg-sky-100 text-sky-700',
  'Vendu':      'bg-slate-100 text-slate-500',
  'En attente': 'bg-amber-100 text-amber-700',
  'Inactif':    'bg-slate-100 text-slate-400',
}

const TYPE_LABEL = {
  vente:      'Vente',
  location:   'Location',
  colocation: 'Colocation',
}

const FILTER_TO_STATUS = {
  'Actif':      'active',
  'Loué':       'rented',
  'Vendu':      'sold',
  'En attente': 'pending',
}

function fmtPrice(price, transactionType) {
  const base = Number(price).toLocaleString('fr-FR') + ' €'
  return transactionType === 'location' || transactionType === 'colocation'
    ? base + '/mois'
    : base
}

export default function PageListings({ dark, openNewListing = false, setOpenNewListing }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('Tous')
  const [deleting, setDeleting] = useState(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  // Sync with the URL-driven flag from ProfessionalDashboard
  useEffect(() => { if (openNewListing) setWizardOpen(true) }, [openNewListing])
  const closeWizard = () => { setWizardOpen(false); setOpenNewListing?.(false) }

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, city, district, price, transaction_type, status, views_count, images, is_premium')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setListings(data ?? [])
    } catch (err) {
      console.error('[listings] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce définitivement ?')) return
    setDeleting(id)
    try {
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (!error) setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error('[listings] delete error:', err)
    } finally {
      setDeleting(null)
    }
  }

  const filters = ['Tous', 'Actif', 'Loué', 'Vendu', 'En attente']
  const shown   = filter === 'Tous'
    ? listings
    : listings.filter(l => l.status === FILTER_TO_STATUS[filter])

  const bd = dark ? 'bg-[#1f2937] border-white/10' : 'bg-white border-slate-200'
  const tx = dark ? 'text-white' : 'text-navy-900'
  const sx = dark ? 'text-white/50' : 'text-slate-400'

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : dark ? 'bg-white/10 text-white/60 hover:bg-white/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>{f}</button>
          ))}
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shrink-0">
          <I.Plus size={13} /> Nouvelle annonce
        </button>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${bd}`}>
        {loading ? (
          <div className="py-14 flex justify-center">
            <I.Loader size={24} className={`animate-spin ${sx}`} />
          </div>
        ) : shown.length === 0 ? (
          <div className="py-14 text-center">
            <I.Building size={30} className={`mx-auto mb-3 ${sx}`} />
            <p className={`text-sm font-semibold ${tx}`}>
              {filter === 'Tous' ? 'Aucune annonce publiée' : `Aucune annonce "${filter}"`}
            </p>
            <p className={`text-xs mt-1 ${sx}`}>Cliquez sur "Nouvelle annonce" pour commencer</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${dark ? 'border-white/10 text-white/40' : 'border-slate-100 text-slate-400'}`}>
                <th className="text-left px-5 py-3">Annonce</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3">Prix</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Vues</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {shown.map((l, i) => {
                  const statusLabel = STATUS_LABEL[l.status] ?? l.status
                  const thumb = l.images?.[0] ?? null
                  return (
                    <motion.tr key={l.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b last:border-0 transition ${dark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {thumb
                            ? <img src={thumb} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                            : <div className={`w-12 h-9 rounded-lg shrink-0 flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                                <I.Building size={14} className={sx} />
                              </div>}
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${tx} truncate`}>{l.title}</p>
                            <p className={`text-xs ${sx}`}>
                              {l.district ? `${l.city} · ${l.district}` : l.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3.5 text-xs ${sx} hidden md:table-cell`}>
                        {TYPE_LABEL[l.transaction_type] ?? l.transaction_type}
                      </td>
                      <td className={`px-4 py-3.5 text-sm font-bold ${tx}`}>
                        {fmtPrice(l.price, l.transaction_type)}
                      </td>
                      <td className={`px-4 py-3.5 text-sm ${sx} hidden sm:table-cell`}>
                        {l.views_count ?? 0}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[statusLabel] ?? 'bg-slate-100 text-slate-500'}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${dark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-400'}`}>
                            <I.Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40 ${dark ? 'hover:bg-rose-500/20 text-white/40' : 'hover:bg-rose-50 text-slate-400'}`}>
                            {deleting === l.id
                              ? <I.Loader size={13} className="animate-spin" />
                              : <I.Trash size={13} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Listing creation wizard modal */}
      <AnimatePresence>
        {wizardOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl mt-8 mb-8">
              <button
                onClick={closeWizard}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center shadow-sm">
                <I.X size={16} className="text-slate-500" />
              </button>
              <Suspense fallback={<div className="p-16 text-center text-slate-400">Chargement du formulaire…</div>}>
                <ListingWizard onClose={closeWizard} onCreated={() => { closeWizard(); load() }} />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
