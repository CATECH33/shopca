import React, { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

/* ============================================================
   SHOPCA — Role-Based Access Control
   - Pure logic + React hook + UI gate component
   - Source of truth: public.profiles.role
   - Hierarchy: user < agency < moderator < platform_owner
   ============================================================ */

export const ROLES = ['user', 'private_user', 'premium_seller', 'agency', 'agency_admin', 'pro_user', 'moderator', 'platform_owner']

export const ROLE_META = {
  user:             { label: 'Utilisateur',      rank: 0, color: 'slate'   },
  private_user:     { label: 'Particulier',      rank: 0, color: 'slate'   },
  premium_seller:   { label: 'Premium',          rank: 1, color: 'indigo'  },
  agency:           { label: 'Agence',           rank: 1, color: 'indigo'  },
  pro_user:         { label: 'Professionnel',    rank: 1, color: 'indigo'  },
  agency_admin:     { label: 'Admin Agence',     rank: 2, color: 'indigo'  },
  moderator:        { label: 'Modérateur',       rank: 3, color: 'amber'   },
  platform_owner:   { label: 'Propriétaire',     rank: 4, color: 'rose'    },
}

/* Redirect target by role — aligned with actual routes in main.jsx */
export function roleRedirect(role) {
  if (['platform_owner', 'moderator'].includes(role)) return '/managerIT'
  if (['pro_user', 'agency_admin', 'agency'].includes(role)) return '/pro'
  return '/mon-espace'
}

/* Hierarchical check: userRole's rank >= requiredRole's rank */
export function hasAccess(userRole, requiredRole) {
  const a = ROLE_META[userRole]?.rank ?? -1
  const b = ROLE_META[requiredRole]?.rank ?? -1
  return a >= b
}

/* Exact match (one of) */
export function hasRole(userRole, allowed) {
  const list = Array.isArray(allowed) ? allowed : [allowed]
  return list.includes(userRole)
}

/* ============================================================
   useUserRole — Single source of truth across the app
   Auto-syncs with Supabase auth state + profiles table
   ============================================================ */
export function useUserRole() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchRole = async (u) => {
      if (!u) {
        if (!cancelled) { setRole(null); setLoading(false) }
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single()
        if (cancelled) return
        if (error) throw error
        // Defensive: unknown role falls back to lowest privilege
        const r = ROLE_META[data?.role] ? data.role : 'user'
        setRole(r)
      } catch {
        if (!cancelled) setRole('user') // safe default — never leak privilege on failure
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      const u = session?.user ?? null
      setUser(u)
      fetchRole(u)
    }).catch(() => { if (!cancelled) setLoading(false) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      const u = session?.user ?? null
      setUser(u)
      setLoading(true)
      fetchRole(u)
    })

    return () => { cancelled = true; subscription?.unsubscribe?.() }
  }, [])

  return {
    user,
    role,
    loading,
    isAuthenticated:   !!user,
    isAgency:          hasAccess(role, 'agency'),
    isModerator:       hasAccess(role, 'moderator'),
    isPlatformOwner:   hasAccess(role, 'platform_owner'),
    can: (required) => hasAccess(role, required),
    is:  (allowed)  => hasRole(role, allowed),
    meta: role ? ROLE_META[role] : null,
  }
}

/* ============================================================
   <RoleGate> — UI-agnostic gate (no router required)
   Use it to hide/show buttons, sections, links, etc.

     <RoleGate role="moderator">
       <DeleteListingButton />
     </RoleGate>

     <RoleGate anyOf={['platform_owner']} fallback={<Locked/>}>
       <FraudCenter />
     </RoleGate>
   ============================================================ */
export function RoleGate({
  role,
  anyOf,
  hierarchical = true,
  fallback = null,
  loading: loadingFallback = null,
  children,
}) {
  const { role: userRole, loading } = useUserRole()

  if (loading) return loadingFallback

  let allowed = false
  if (anyOf) {
    allowed = hasRole(userRole, anyOf)
  } else if (role) {
    allowed = hierarchical ? hasAccess(userRole, role) : userRole === role
  }
  return allowed ? <>{children}</> : fallback
}

/* ============================================================
   <RoleBadge> — small UI helper to display a role pill
   ============================================================ */
export function RoleBadge({ role, className = '' }) {
  const m = ROLE_META[role]
  if (!m) return null
  const tones = {
    slate:  'bg-slate-100 text-slate-700 ring-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    amber:  'bg-amber-50 text-amber-700 ring-amber-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
    rose:   'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ${tones[m.color]} ${className}`}>
      {m.label}
    </span>
  )
}
