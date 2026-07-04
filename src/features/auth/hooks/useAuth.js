import { useState } from 'react'
import * as svc from '../services/authService.js'
import { friendlyAuthError } from '../validators/authValidators.js'
import { SUPABASE_URL, SUPABASE_IS_PLACEHOLDER } from '../../../lib/supabase.js'

export function useAuthAction() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const run = async (fn) => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    } catch (err) {
      // Log complet en console pour debugging
      console.error('[SHOPCA Auth Error]', {
        message: err?.message,
        status:  err?.status,
        code:    err?.code,
        supabaseUrl: SUPABASE_URL || '(vide)',
        isPlaceholder: SUPABASE_IS_PLACEHOLDER,
        raw: err,
      })
      setError(friendlyAuthError(err?.message))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, setError, run }
}

export { svc }
