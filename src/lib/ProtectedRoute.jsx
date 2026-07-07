import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserRole, hasAccess, hasRole } from './roles.jsx'

/* ============================================================
   <ProtectedRoute> — React Router guard
   - Redirects unauthenticated users to /auth/login
   - Redirects users without the required role to /
   - Pluggable fallbacks (loading, forbidden) for fine control

   Examples:

     // Hierarchical (platform_owner only)
     <Route path="/managerIT" element={
       <ProtectedRoute role="platform_owner">
         <ManagerLayout />
       </ProtectedRoute>
     }/>

     // Exact role list — agency or moderator only
     <Route path="/agency" element={
       <ProtectedRoute anyOf={['agency','moderator']}>
         <AgencyDashboard />
       </ProtectedRoute>
     }/>

     // Authenticated only (any role)
     <Route path="/account" element={
       <ProtectedRoute>
         <Account />
       </ProtectedRoute>
     }/>

     // Custom redirects
     <ProtectedRoute role="platform_owner"
       redirectTo="/forbidden"
       redirectUnauthenticatedTo="/auth/login">
       <ManagerPage />
     </ProtectedRoute>
   ============================================================ */
export default function ProtectedRoute({
  role,
  anyOf,
  hierarchical = true,
  redirectTo = '/',
  redirectUnauthenticatedTo = '/auth/login',
  loading: loadingFallback,
  forbidden: forbiddenFallback,
  children,
}) {
  const { user, role: userRole, loading } = useUserRole()
  const location = useLocation()

  if (loading) {
    return loadingFallback ?? <DefaultLoader />
  }

  // 1. Not authenticated → redirect to login, keep `from` so the auth page can redirect back
  if (!user) {
    return <Navigate to={redirectUnauthenticatedTo} state={{ from: location.pathname }} replace />
  }

  // 2. Compute role-based access
  let allowed = true
  if (anyOf) {
    allowed = hasRole(userRole, anyOf)
  } else if (role) {
    allowed = hierarchical ? hasAccess(userRole, role) : userRole === role
  }

  // 3. Forbidden → redirect (or render custom fallback)
  if (!allowed) {
    if (forbiddenFallback) return forbiddenFallback
    return <Navigate to={redirectTo} replace />
  }

  return children
}

function DefaultLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
        <svg className="animate-spin text-orange-500" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        Vérification des droits…
      </div>
    </div>
  )
}
