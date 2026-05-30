import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { getProfile } from '../services/profileService.js'

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        dispatch({ type: 'SET_USER', user: session.user })
        loadProfile(session.user.id)
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
