import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useManagerAuth } from './ManagerAuthProvider.jsx'

const IcLock  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IcEye   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IcEyeOff= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

export default function ManagerLoginPage() {
  const { isOwner, loading, signIn } = useManagerAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const [shake,    setShake]    = useState(false)

  /* Already authenticated → go to dashboard */
  if (!loading && isOwner) return <Navigate to="/managerIT/dashboard" replace />

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Renseignez votre email et mot de passe.'); triggerShake(); return }
    setBusy(true)
    setError('')
    const { error: err } = await signIn(email.trim(), password)
    if (err) {
      setError(err.message || 'Identifiants incorrects.')
      triggerShake()
    } else {
      navigate('/managerIT/dashboard', { replace: true })
    }
    setBusy(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #070F1F 0%, #0A1628 60%, #0D1F3C 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes mgr-shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .mgr-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.10);
          border-radius: 12px; padding: 13px 16px;
          font-size: 14px; color: #fff; outline: none;
          transition: border-color .15s;
        }
        .mgr-input::placeholder { color: rgba(255,255,255,0.35); }
        .mgr-input:focus { border-color: rgba(255,107,0,0.6); }
        .mgr-input-pwd { padding-right: 48px !important; }
        .mgr-btn-submit {
          width: 100%; background: #FF6B00; color: #fff; border: none;
          border-radius: 12px; padding: 14px 0; font-size: 15px;
          font-weight: 700; cursor: pointer; transition: background .15s, opacity .15s;
        }
        .mgr-btn-submit:hover:not(:disabled) { background: #FF8C33; }
        .mgr-btn-submit:disabled { opacity: .55; cursor: not-allowed; }
      `}</style>

      <form
        onSubmit={handleSubmit}
        style={{
          width: 380, display: 'flex', flexDirection: 'column', gap: 20,
          padding: '44px 36px', borderRadius: 24,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: shake ? 'mgr-shake .4s' : 'none',
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16, background: '#FF6B00',
            marginBottom: 18, boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
          }}>
            <IcLock />
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: '#FF6B00', marginBottom: 8,
          }}>
            SHOPCA · Back Office
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            Accès restreint
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Réservé au propriétaire de la plateforme
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#FCA5A5', lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                          letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Adresse email
          </label>
          <input
            className="mgr-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@shopca.fr"
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                          letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Mot de passe
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="mgr-input mgr-input-pwd"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', display: 'flex', padding: 4,
              }}
              tabIndex={-1}
            >
              {showPwd ? <IcEyeOff /> : <IcEye />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mgr-btn-submit"
          disabled={busy || loading}
          style={{ marginTop: 4 }}
        >
          {busy ? 'Connexion…' : 'Accéder au Back Office'}
        </button>

        {/* Footer hint */}
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: -8 }}>
          Session sécurisée · Expiration 8h · Inactivité 30min
        </div>
      </form>
    </div>
  )
}
