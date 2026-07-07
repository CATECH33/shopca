import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, SUPABASE_URL, SUPABASE_KEY_SET, SUPABASE_IS_PLACEHOLDER } from '../../lib/supabase.js'

const DEMO_ACCOUNTS = [
  { label: 'Propriétaire', email: 'admin@shopca.fr',   password: 'ShopCAAdmin2026!*',  role: 'platform_owner' },
  { label: 'Pro (T2)',     email: 'admin-t2@shopca.fr', password: 'ShopCAAdmin2026!!',  role: 'agency'         },
  { label: 'Particulier',  email: 'admin-t1@shopca.fr', password: 'ShopCAAdmin2026**',  role: 'private_user'   },
]

function Badge({ ok, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#166534' : '#991b1b',
      border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
    }}>
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}

function Code({ children }) {
  return (
    <pre style={{
      background: '#0f172a', color: '#e2e8f0', padding: '12px 16px',
      borderRadius: 8, fontSize: 12, overflowX: 'auto',
      margin: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    }}>
      {typeof children === 'string' ? children : JSON.stringify(children, null, 2)}
    </pre>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function DebugAuthPage() {
  const [session,        setSession]        = useState(undefined)
  const [sessionError,   setSessionError]   = useState(null)
  const [connTest,       setConnTest]       = useState({ status: 'idle', result: null, error: null })
  const [loginTests,     setLoginTests]     = useState({})
  const [profile,        setProfile]        = useState(null)

  // 1. Charger la session au mount
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data, error }) => {
        setSession(data?.session ?? null)
        setSessionError(error?.message ?? null)
      })
      .catch(err => {
        setSession(null)
        setSessionError(err?.message ?? String(err))
      })
  }, [])

  // 2. Charger le profil si session
  useEffect(() => {
    if (!session?.user?.id) return
    supabase.from('profiles').select('id, role, first_name, last_name').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
  }, [session])

  // Test de connexion brut
  const runConnTest = async () => {
    setConnTest({ status: 'loading', result: null, error: null })
    const t0 = Date.now()
    try {
      const res = await fetch(SUPABASE_URL + '/auth/v1/health', {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '' }
      })
      const body = await res.text()
      setConnTest({ status: 'done', result: { httpStatus: res.status, body: body.slice(0, 200), ms: Date.now() - t0 }, error: null })
    } catch (err) {
      setConnTest({ status: 'done', result: null, error: err?.message ?? String(err) })
    }
  }

  // Test de login pour un compte demo
  const testLogin = async (account) => {
    setLoginTests(prev => ({ ...prev, [account.email]: { status: 'loading', result: null } }))
    const t0 = Date.now()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      })
      if (error) throw error
      setLoginTests(prev => ({
        ...prev,
        [account.email]: {
          status: 'success',
          result: { userId: data.user?.id, email: data.user?.email, ms: Date.now() - t0 }
        }
      }))
      // Se déconnecter immédiatement après test pour ne pas rester connecté
      await supabase.auth.signOut()
    } catch (err) {
      setLoginTests(prev => ({
        ...prev,
        [account.email]: { status: 'error', result: null, error: err?.message ?? String(err) }
      }))
    }
  }

  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
      ? import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 20) + '...[tronqué]'
      : '(absent)',
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.slice(0, 12) + '...'
      : '(absent)',
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    MODE: import.meta.env.MODE,
    DEV: String(import.meta.env.DEV),
    PROD: String(import.meta.env.PROD),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🔍 Debug Auth — SHOPCA</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Page de diagnostic — à supprimer avant mise en production
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/auth/login"
              style={{ padding: '8px 16px', borderRadius: 8, background: '#f1820f', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Retour Login
            </Link>
            <Link to="/"
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              Accueil
            </Link>
          </div>
        </div>

        {/* Statut global */}
        <div style={{ background: SUPABASE_IS_PLACEHOLDER ? '#fef2f2' : '#f0fdf4', border: `1px solid ${SUPABASE_IS_PLACEHOLDER ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{SUPABASE_IS_PLACEHOLDER ? '🚨' : '✅'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: SUPABASE_IS_PLACEHOLDER ? '#991b1b' : '#166534' }}>
              {SUPABASE_IS_PLACEHOLDER
                ? 'CLIENT PLACEHOLDER — Supabase NON configuré. Toutes les requêtes échoueront avec "Failed to fetch".'
                : 'Client Supabase correctement initialisé.'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              URL active : <strong>{SUPABASE_IS_PLACEHOLDER ? 'https://placeholder.supabase.co (FAUX)' : SUPABASE_URL}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Variables d'environnement */}
        <Section title="1. Variables d'environnement (import.meta.env)">
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(env).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge ok={!!v && v !== '(absent)'} label={k} />
                <span style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>{v ?? '(undefined)'}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 2: Client Supabase */}
        <Section title="2. Client Supabase">
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge ok={!SUPABASE_IS_PLACEHOLDER} label="URL définie" />
              <code style={{ fontSize: 12 }}>{SUPABASE_URL || '(vide)'}</code>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge ok={SUPABASE_KEY_SET} label="ANON_KEY définie" />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge ok={!SUPABASE_IS_PLACEHOLDER} label="Client réel" />
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {SUPABASE_IS_PLACEHOLDER ? '⚠️ Client placeholder actif → tous les appels échouent' : 'Client Supabase réel actif'}
              </span>
            </div>
          </div>
          <button onClick={runConnTest} disabled={connTest.status === 'loading'}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#1e40af', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            {connTest.status === 'loading' ? 'Test en cours…' : 'Tester la connexion /auth/v1/health'}
          </button>
          {connTest.status === 'done' && (
            <Code>{connTest.error
              ? `ERREUR RÉSEAU:\n${connTest.error}\n\n→ Causes possibles:\n  1. VITE_SUPABASE_URL incorrect ou client placeholder\n  2. Bloqueur de publicités bloquant supabase.co\n  3. Connexion internet coupée\n  4. Projet Supabase pausé`
              : `HTTP ${connTest.result.httpStatus} — ${connTest.result.ms}ms\n${connTest.result.body}`
            }</Code>
          )}
        </Section>

        {/* Section 3: Session courante */}
        <Section title="3. Session courante (supabase.auth.getSession)">
          {session === undefined ? (
            <div style={{ color: '#6b7280', fontSize: 13 }}>Chargement…</div>
          ) : sessionError ? (
            <>
              <Badge ok={false} label="Erreur getSession" />
              <Code>Erreur : {sessionError}</Code>
            </>
          ) : session ? (
            <>
              <Badge ok={true} label="Session active" />
              <Code>{JSON.stringify({
                user_id:    session.user?.id,
                email:      session.user?.email,
                role_meta:  session.user?.user_metadata?.account_type,
                expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
              }, null, 2)}</Code>
              {profile && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8, marginBottom: 4 }}>Profil DB (table profiles) :</div>
                  <Code>{JSON.stringify(profile, null, 2)}</Code>
                </>
              )}
            </>
          ) : (
            <Badge ok={false} label="Aucune session (non connecté)" />
          )}
        </Section>

        {/* Section 4: Tests de connexion comptes demo */}
        <Section title="4. Tests de connexion — Comptes démo">
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
            Cliquez pour tester chaque compte. Le test se déconnecte automatiquement après.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {DEMO_ACCOUNTS.map(account => {
              const t = loginTests[account.email]
              return (
                <div key={account.email} style={{
                  border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px',
                  background: t?.status === 'success' ? '#f0fdf4' : t?.status === 'error' ? '#fef2f2' : '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{account.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{account.email}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>pwd: {account.password}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {t?.status === 'success' && <Badge ok={true} label={`OK (${t.result?.ms}ms)`} />}
                      {t?.status === 'error' && <Badge ok={false} label="Échec" />}
                      <button
                        onClick={() => testLogin(account)}
                        disabled={t?.status === 'loading'}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: '#f1820f', color: '#fff', fontWeight: 700, fontSize: 12
                        }}>
                        {t?.status === 'loading' ? '…' : 'Tester'}
                      </button>
                    </div>
                  </div>
                  {t?.status === 'error' && (
                    <Code>ERREUR: {t.error}</Code>
                  )}
                  {t?.status === 'success' && (
                    <Code>user_id: {t.result?.userId}</Code>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Section 5: Infos navigateur */}
        <Section title="5. Environnement navigateur">
          <Code>{JSON.stringify({
            userAgent:  navigator.userAgent,
            online:     navigator.onLine,
            location:   window.location.origin,
            mode:       import.meta.env.MODE,
          }, null, 2)}</Code>
        </Section>

        {/* Section 6: Checklist diagnostic */}
        <Section title="6. Checklist — Causes communes de 'Erreur réseau'">
          <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
            {[
              { check: !SUPABASE_IS_PLACEHOLDER, label: 'VITE_SUPABASE_URL défini dans .env' },
              { check: SUPABASE_KEY_SET,         label: 'VITE_SUPABASE_ANON_KEY défini dans .env' },
              { check: !SUPABASE_IS_PLACEHOLDER, label: 'Client Supabase réel (pas placeholder)' },
              { check: null,                      label: 'Aucun bloqueur de pub (uBlock, AdBlock…) — à vérifier manuellement' },
              { check: null,                      label: 'Aucun VPN bloquant supabase.co — à vérifier manuellement' },
              { check: null,                      label: 'Projet Supabase actif (pas en pause) — vérifier le dashboard' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>
                  {item.check === null ? '❓' : item.check ? '✅' : '❌'}
                </span>
                <span style={{ color: item.check === false ? '#dc2626' : '#374151' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 }}>
          ⚠️ Cette page expose des informations sensibles. Retirez la route <code>/debug-auth</code> de <code>main.jsx</code> avant le déploiement en production.
        </div>
      </div>
    </div>
  )
}
