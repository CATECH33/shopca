import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const MAX_SESSION_MS = 8 * 60 * 60 * 1000  // 8h
const INACTIVITY_MS  = 30 * 60 * 1000       // 30min
const EXPIRES_KEY    = 'mgrit_expires_at'
const ACTIVITY_KEY   = 'mgrit_last_activity'

const Ctx = createContext(null)
export const useManagerAuth = () => useContext(Ctx)

export function ManagerAuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const timerRef              = useRef(null)

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const expire = useCallback(async () => {
    clearTimer()
    localStorage.removeItem(EXPIRES_KEY)
    localStorage.removeItem(ACTIVITY_KEY)
    setUser(null)
    setIsOwner(false)
    await supabase.auth.signOut()
  }, [])

  const resetInactivity = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
    clearTimer()
    timerRef.current = setTimeout(expire, INACTIVITY_MS)
  }, [expire])

  /* Activity listeners to reset inactivity timer */
  useEffect(() => {
    if (!isOwner) return
    const EVENTS = ['mousedown', 'keydown', 'touchstart']
    EVENTS.forEach(e => window.addEventListener(e, resetInactivity, { passive: true }))
    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, resetInactivity))
      clearTimer()
    }
  }, [isOwner, resetInactivity])

  /* Check session on mount */
  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const expiresAt    = parseInt(localStorage.getItem(EXPIRES_KEY) ?? '0')
      const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) ?? '0')

      const maxExpired      = !expiresAt || Date.now() > expiresAt
      const inactiveExpired = lastActivity && (Date.now() - lastActivity > INACTIVITY_MS)

      if (maxExpired || inactiveExpired) {
        localStorage.removeItem(EXPIRES_KEY)
        localStorage.removeItem(ACTIVITY_KEY)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'platform_owner') {
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      setUser(session.user)
      setIsOwner(true)
      resetInactivity()
      setLoading(false)
    })()
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'platform_owner') {
      await supabase.auth.signOut()
      return { error: { message: 'Accès refusé — compte non autorisé.' } }
    }

    localStorage.setItem(EXPIRES_KEY, (Date.now() + MAX_SESSION_MS).toString())
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
    setUser(data.user)
    setIsOwner(true)
    resetInactivity()
    return { error: null }
  }, [resetInactivity])

  const signOut = useCallback(async () => {
    clearTimer()
    localStorage.removeItem(EXPIRES_KEY)
    localStorage.removeItem(ACTIVITY_KEY)
    setUser(null)
    setIsOwner(false)
    await supabase.auth.signOut()
  }, [])

  return (
    <Ctx.Provider value={{ user, isOwner, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  )
}
