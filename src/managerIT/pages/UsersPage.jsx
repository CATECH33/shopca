import React, { useState, useEffect, useCallback, useRef } from 'react'

/* ── Config Edge Function ───────────────────────────────────────
   Déployer d'abord : supabase functions deploy manager-users
   Puis : supabase secrets set MANAGER_KEY=shopca_it_2026       */
const EDGE_URL    = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manager-users`
const MANAGER_KEY = import.meta.env.VITE_MANAGER_KEY ?? 'shopca_it_2026'

/* ── Inline SVG Icons ───────────────────────────────────────── */
const Ic = {
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  User:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  ChevL:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Alert:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Terminal:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Check:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Stripe: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
}

/* ── Helpers ────────────────────────────────────────────────── */
const timeAgo = (s) => {
  if (!s) return 'Jamais'
  const diff = (Date.now() - new Date(s)) / 1000
  if (diff < 60)    return 'À l\'instant'
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 30) return `Il y a ${Math.floor(diff / 86400)}j`
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(s))
}

const fmtDate = (s) => {
  if (!s) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(s))
}

const initials = (u) => {
  const f = (u.first_name || '')[0] || ''
  const l = (u.last_name  || '')[0] || ''
  return (f + l).toUpperCase() || (u.email || '?')[0].toUpperCase()
}

/* ── Role badge ─────────────────────────────────────────────── */
const ROLE_MAP = {
  super_admin:   { label: 'Super Admin',   bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  agency_admin:  { label: 'Admin Agence',  bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE' },
  agency:        { label: 'Agence',        bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  pro_user:      { label: 'Pro',           bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
  user:          { label: 'Particulier',   bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
}

function RoleBadge({ role }) {
  const s = ROLE_MAP[role] ?? ROLE_MAP.user
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  )
}

/* ── Avatar ─────────────────────────────────────────────────── */
const AVATAR_COLORS = ['#6366F1','#8B5CF6','#EC4899','#EF4444','#F97316','#10B981','#06B6D4','#3B82F6']
function Avatar({ user, size = 36 }) {
  const color = AVATAR_COLORS[(user.email || '').charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', userSelect: 'none',
    }}>
      {initials(user)}
    </div>
  )
}

/* ── Setup banner ───────────────────────────────────────────── */
function SetupBanner() {
  const [copied, setCopied] = useState('')
  const copy = (text, key) => {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const CMD1 = 'supabase functions deploy manager-users'
  const CMD2 = `supabase secrets set MANAGER_KEY=${MANAGER_KEY}`

  return (
    <div style={{
      background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 16,
      padding: '20px 24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic.Terminal />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
            Edge Function à déployer
          </div>
          <div style={{ fontSize: 13, color: '#B45309', marginBottom: 12 }}>
            La section Utilisateurs requiert l'Edge Function <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 4 }}>manager-users</code> pour accéder aux données avec le service role.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: '1', label: 'Déployer la fonction', cmd: CMD1 },
              { key: '2', label: 'Définir le secret',    cmd: CMD2 },
            ].map(({ key, label, cmd }) => (
              <div key={key}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>{key}. {label}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#1E293B', borderRadius: 8, padding: '8px 12px',
                }}>
                  <code style={{ flex: 1, fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{cmd}</code>
                  <button onClick={() => copy(cmd, key)} style={{
                    flexShrink: 0, background: copied === key ? '#10B981' : 'rgba(255,255,255,0.08)',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'background .15s',
                  }}>
                    {copied === key ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ───────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', animation: 'usr-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ width: 120, height: 13, borderRadius: 6, background: '#F1F5F9', animation: 'usr-pulse 1.4s ease-in-out infinite' }} />
            <div style={{ width: 160, height: 11, borderRadius: 6, background: '#F1F5F9', animation: 'usr-pulse 1.4s ease-in-out infinite' }} />
          </div>
        </div>
      </td>
      {[80, 70, 60, 80, 60].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{ width: w, height: 13, borderRadius: 6, background: '#F1F5F9', animation: 'usr-pulse 1.4s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  )
}

const PER_PAGE = 25

/* ── Main ───────────────────────────────────────────────────── */
export default function UsersPage() {
  const [users,       setUsers]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [needSetup,   setNeedSetup]   = useState(false)
  const [page,        setPage]        = useState(1)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [refreshing,  setRefreshing]  = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchUsers = useCallback(async ({ pg = page, q = search, role = roleFilter, silent = false } = {}) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: pg, limit: PER_PAGE })
      if (q)    params.set('search', q)
      if (role) params.set('role', role)

      const res = await fetch(`${EDGE_URL}?${params}`, {
        headers: { 'x-manager-key': MANAGER_KEY },
      })

      if (res.status === 401) { setNeedSetup(true); setLoading(false); setRefreshing(false); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setNeedSetup(false)
      const json = await res.json()
      setUsers(json.users ?? [])
      setTotal(json.total ?? 0)
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setNeedSetup(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { fetchUsers() }, [page])

  /* Debounce search */
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchUsers({ pg: 1, q: val, role: roleFilter })
    }, 350)
  }

  const handleRole = (val) => {
    setRoleFilter(val)
    setPage(1)
    fetchUsers({ pg: 1, q: search, role: val })
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const thS = {
    padding: '10px 16px', textAlign: 'left', whiteSpace: 'nowrap',
    fontSize: 11, fontWeight: 700, color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '1px solid #F1F5F9', background: '#FAFAFA',
  }
  const tdS = {
    padding: '11px 16px', borderBottom: '1px solid #F8FAFC',
    fontSize: 13, color: '#0F172A', verticalAlign: 'middle',
  }

  return (
    <div>
      <style>{`
        @keyframes usr-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .usr-row:hover td { background: #FAFCFF; }
        .usr-btn:hover { background: #F1F5F9 !important; }
        .usr-pg:hover:not(:disabled) { background: #F8FAFC !important; border-color: #CBD5E1 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Utilisateurs
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
            {loading ? 'Chargement…' : `${total.toLocaleString('fr-FR')} compte${total > 1 ? 's' : ''} au total`}
          </p>
        </div>
        <button
          className="usr-btn"
          onClick={() => fetchUsers({ silent: true })}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff',
            fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer',
            opacity: refreshing ? 0.6 : 1, transition: 'background .15s',
          }}
        >
          <span style={{ display: 'flex', animation: refreshing ? 'usr-pulse 1s linear infinite' : 'none' }}>
            <Ic.Refresh />
          </span>
          Actualiser
        </button>
      </div>

      {/* ── Setup banner ── */}
      {needSetup && <SetupBanner />}

      {/* ── Barre de filtres ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 220,
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10,
          padding: '0 12px', height: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}>
          <span style={{ color: '#94A3B8', display: 'flex' }}><Ic.Search /></span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13,
                     color: '#0F172A', background: 'transparent' }}
          />
          {search && (
            <button onClick={() => handleSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', display: 'flex', padding: 2 }}>
              <Ic.X />
            </button>
          )}
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={e => handleRole(e.target.value)}
          style={{
            height: 40, padding: '0 32px 0 12px', borderRadius: 10,
            border: '1px solid #E2E8F0', background: '#fff',
            fontSize: 13, color: '#0F172A', cursor: 'pointer', outline: 'none',
            appearance: 'none', WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="user">Particulier</option>
          <option value="pro_user">Pro</option>
          <option value="agency">Agence</option>
          <option value="agency_admin">Admin Agence</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
                    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Utilisateur', 'Rôle', 'Ville', 'Email confirmé', 'Stripe', 'Dernière connexion', 'Inscrit le'].map(h => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ color: '#EF4444', display: 'flex' }}><Ic.Alert /></div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Erreur de chargement</div>
                      <div style={{ fontSize: 13, color: '#94A3B8' }}>{error}</div>
                      <button onClick={() => fetchUsers()}
                        style={{ marginTop: 8, padding: '7px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
                                 background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
                        Réessayer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : needSetup ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                    Déployez l'Edge Function pour voir les utilisateurs.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                    {search || roleFilter ? 'Aucun utilisateur ne correspond aux filtres.' : 'Aucun utilisateur pour le moment.'}
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="usr-row">
                    {/* Utilisateur */}
                    <td style={tdS}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar user={u} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {u.first_name || u.last_name
                              ? `${u.first_name} ${u.last_name}`.trim()
                              : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sans nom</span>
                            }
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Ic.Mail />{u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td style={tdS}><RoleBadge role={u.role} /></td>

                    {/* Ville */}
                    <td style={{ ...tdS, color: '#64748B' }}>{u.city || '—'}</td>

                    {/* Email confirmé */}
                    <td style={tdS}>
                      {u.email_confirmed
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 12, fontWeight: 600 }}><Ic.Check /> Oui</span>
                        : <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>En attente</span>
                      }
                    </td>

                    {/* Stripe */}
                    <td style={tdS}>
                      {u.has_stripe
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6366F1', fontSize: 12, fontWeight: 600 }}><Ic.Stripe /> Oui</span>
                        : <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>
                      }
                    </td>

                    {/* Dernière connexion */}
                    <td style={{ ...tdS, color: '#64748B', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {timeAgo(u.last_sign_in_at)}
                    </td>

                    {/* Inscrit le */}
                    <td style={{ ...tdS, color: '#94A3B8', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {fmtDate(u.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && !needSetup && total > PER_PAGE && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #F1F5F9',
            fontSize: 13, color: '#64748B', flexWrap: 'wrap', gap: 8,
          }}>
            <span>
              {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} sur {total.toLocaleString('fr-FR')} utilisateurs
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="usr-pg"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 10px',
                  borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1, transition: 'background .12s',
                }}
              >
                <Ic.ChevL />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p
                if (totalPages <= 5)         p = i + 1
                else if (page <= 3)          p = i + 1
                else if (page >= totalPages - 2) p = totalPages - 4 + i
                else                         p = page - 2 + i
                return (
                  <button
                    key={p}
                    className="usr-pg"
                    onClick={() => setPage(p)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
                      background: page === p ? '#0F172A' : '#fff',
                      color: page === p ? '#fff' : '#64748B',
                      fontSize: 13, fontWeight: page === p ? 700 : 400,
                      cursor: 'pointer', transition: 'background .12s',
                    }}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                className="usr-pg"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 10px',
                  borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1, transition: 'background .12s',
                }}
              >
                <Ic.ChevR />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
