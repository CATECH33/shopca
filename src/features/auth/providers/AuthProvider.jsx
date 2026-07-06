import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { getProfile } from '../services/profileService.js'

/* ── Session tracking — called once after a fresh sign-in ─────────────────── */
async function recordSession(userId) {
  try {
    const ua = navigator.userAgent
    const browser = parseBrowser(ua)
    const os      = parseOS(ua)
    const device  = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop'

    let ip = null, city = null, country = null
    try {
      const geo = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      if (geo.ok) {
        const g = await geo.json()
        ip      = g.ip
        city    = g.city
        country = g.country_name
      }
    } catch { /* geo optionnel */ }

    await supabase.from('user_sessions').insert({
      user_id: userId, ip_address: ip, user_agent: ua,
      browser, os, device, city, country,
    })
  } catch { /* ne pas bloquer l'auth */ }
}

function parseBrowser(ua) {
  if (/Edg\//.test(ua))     return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua))  return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1]?.split('.')[0] || ''}`
  if (/Firefox\//.test(ua)) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1]?.split('.')[0] || ''}`
  if (/Safari\//.test(ua))  return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1]?.split('.')[0] || ''}`
  return 'Navigateur inconnu'
}

function parseOS(ua) {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
  if (/Windows/.test(ua))       return 'Windows'
  if (/Mac OS X/.test(ua))      return 'macOS'
  if (/Android/.test(ua))       return `Android ${(ua.match(/Android ([\d.]+)/) || [])[1] || ''}`
  if (/iPhone|iPad/.test(ua))   return 'iOS'
  if (/Linux/.test(ua))         return 'Linux'
  return 'OS inconnu'
}

const AuthContext = createContext(null)

const init = { user: null, profile: null, loading: true, error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':    return { ...state, user: action.user, loading: false, error: null }
    case 'SET_PROFILE': return { ...state, profile: action.profile }
    case 'SET_ERROR':   return { ...state, error: action.error, loading: false }
    case 'SIGN_OUT':    return { ...init, loading: false }
    default:            return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)
  const lastRecordedRef = useRef(null)

  const loadProfile = useCallback(async (userId) => {
    try {
      const profile = await getProfile(userId)
      dispatch({ type: 'SET_PROFILE', profile })
    } catch (err) {
      console.warn('[auth] profile load failed:', err?.message)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        dispatch({ type: 'SET_USER', user: session.user })
        loadProfile(session.user.id)
      } else {
        dispatch({ type: 'SIGN_OUT' })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (session?.user) {
        dispatch({ type: 'SET_USER', user: session.user })
        loadProfile(session.user.id)
        // Enregistrer la session uniquement sur un vrai sign-in
        if (event === 'SIGNED_IN' && lastRecordedRef.current !== session.user.id + session.access_token?.slice(-8)) {
          lastRecordedRef.current = session.user.id + session.access_token?.slice(-8)
          recordSession(session.user.id)
        }
      } else {
        dispatch({ type: 'SIGN_OUT' })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const isRole = (...roles) => roles.includes(state.profile?.role)

  return (
    <AuthContext.Provider value={{ ...state, isRole, loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
