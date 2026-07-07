import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/providers/AuthProvider.jsx'
import PersonalDashboard from '../../components/PersonalDashboard.jsx'

const PRO_ROLES = ['pro_user', 'agency', 'agency_admin', 'platform_owner']

export default function PersonalDashboardPage() {
  const navigate = useNavigate()
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && profile?.role && PRO_ROLES.includes(profile.role)) {
      navigate('/pro', { replace: true })
    }
  }, [profile, loading, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <svg className="animate-spin text-orange-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
      </svg>
    </div>
  )

  if (profile?.role && PRO_ROLES.includes(profile.role)) return null

  return <PersonalDashboard onExit={() => navigate('/')} />
}
