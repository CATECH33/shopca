import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-manager-key, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  /* ── Auth gate ── */
  const key      = req.headers.get('x-manager-key')
  const validKey = Deno.env.get('MANAGER_KEY') ?? 'shopca_it_2026'
  if (key !== validKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  /* ── Service role client (bypass RLS) ── */
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const url    = new URL(req.url)
  const page   = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'))
  const limit  = Math.min(100, parseInt(url.searchParams.get('limit') ?? '25'))
  const search = url.searchParams.get('search') ?? ''
  const role   = url.searchParams.get('role')   ?? ''

  /* ── Fetch auth.users (email + dernière connexion) ── */
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({
    page, perPage: limit,
  })
  if (authErr) {
    return new Response(JSON.stringify({ error: authErr.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const userIds = authData.users.map((u) => u.id)

  /* ── Fetch profiles pour les mêmes IDs ── */
  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, first_name, last_name, account_type, role, phone, city, premium_alerts, stripe_customer_id, created_at')
        .in('id', userIds)
    : { data: [] }

  const pMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  /* ── Merge ── */
  let users = authData.users.map((u) => {
    const p = pMap[u.id] ?? {}
    return {
      id:              u.id,
      email:           u.email ?? '',
      phone:           u.phone ?? p.phone ?? '',
      created_at:      u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      email_confirmed: !!u.email_confirmed_at,
      banned:          !!(u as any).banned_until,
      first_name:      u.user_metadata?.first_name ?? p.first_name ?? '',
      last_name:       u.user_metadata?.last_name  ?? p.last_name  ?? '',
      account_type:    u.user_metadata?.account_type ?? p.account_type ?? 'personal',
      role:            p.role ?? 'user',
      city:            p.city ?? '',
      premium_alerts:  p.premium_alerts ?? false,
      has_stripe:      !!p.stripe_customer_id,
    }
  })

  /* ── Filtres côté Edge (auth.admin ne supporte pas la recherche serveur) ── */
  if (search) {
    const s = search.toLowerCase()
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        u.first_name.toLowerCase().includes(s) ||
        u.last_name.toLowerCase().includes(s),
    )
  }
  if (role) {
    users = users.filter((u) => u.role === role || u.account_type === role)
  }

  return new Response(JSON.stringify({ users, total: authData.total ?? users.length }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
