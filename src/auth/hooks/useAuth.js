import { useState } from 'react'
import * as svc from '../services/authService.js'
import { friendlyAuthError } from '../validators/authValidators.js'

export function useAuthAction() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const run = async (fn) => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    } catch (err) {
      setError(friendlyAuthError(err?.message))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, setError, run }
}

export { svc }
