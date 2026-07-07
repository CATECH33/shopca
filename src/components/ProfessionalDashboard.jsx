import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../features/auth/providers/AuthProvider.jsx'
import DashSidebar from './prodash/DashSidebar.jsx'
import DashTopbar from './prodash/DashTopbar.jsx'
import PageOverview from './prodash/PageOverview.jsx'
import PageListings from './prodash/PageListings.jsx'
import PageLeads from './prodash/PageLeads.jsx'
import PageAnalytics from './prodash/PageAnalytics.jsx'
import PageBilling from './prodash/PageBilling.jsx'
import PageVerification from './prodash/PageVerification.jsx'
import PageProfile from './prodash/PageProfile.jsx'
import PageSettings from './prodash/PageSettings.jsx'
import PageSecurity from './prodash/PageSecurity.jsx'
const PRO_PAGES = {
  overview:     PageOverview,
  listings:     PageListings,
  leads:        PageLeads,
  analytics:    PageAnalytics,
  billing:      PageBilling,
  verification: PageVerification,
  profile:      PageProfile,
  settings:     PageSettings,
  security:     PageSecurity,
}

export default function ProfessionalDashboard({ onExit }) {
  const { profile, loading: authLoading } = useAuth()

  const [dark, setDark] = useState(false)
  const [page, setPage] = useState(null)

  useEffect(() => {
    if (!authLoading && page === null) {
      setPage('overview')
    }
  }, [authLoading, page])

  if (authLoading || page === null) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-50">
        <svg className="animate-spin text-orange-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
      </div>
    )
  }

  const Page = PRO_PAGES[page] ?? PageOverview

  const bg = dark ? 'bg-[#111827]' : 'bg-slate-50'

  return (
    <div className="fixed inset-0 z-[120] flex" style={{ fontFamily: 'inherit' }}>
      <DashSidebar page={page} setPage={setPage} dark={dark} setDark={setDark} onExit={onExit} />

      <div className={`flex-1 flex flex-col overflow-hidden ${bg}`}>
        <DashTopbar page={page} dark={dark} setPage={setPage} onExit={onExit} />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}>
              <Page dark={dark} setPage={setPage} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
