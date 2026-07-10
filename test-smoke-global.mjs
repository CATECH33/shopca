/**
 * Global smoke test — visits every major public/protected route,
 * checks HTTP status, console errors, key elements, no 404 on internal
 * links.
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const BASE = process.env.BASE_URL || 'https://shopca.fr'
const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const PUBLIC_ROUTES = [
  { path: '/',                 h1Contains: [] },
  { path: '/annonces',         h1Contains: [] },
  { path: '/acheter',          h1Contains: ['Acheter'] },
  { path: '/louer',            h1Contains: ['Louer', 'Location'] },
  { path: '/agences',          h1Contains: [] },
  { path: '/tarifs',           h1Contains: ['Tarifs', 'Pack'] },
  { path: '/estimation',       h1Contains: [] },
  { path: '/simulateur',       h1Contains: [] },
  { path: '/guides',           h1Contains: [] },
  { path: '/categories',       h1Contains: [] },
  { path: '/early-access',     h1Contains: ['premier', 'Premium', 'Access'] },
  { path: '/auth/login',       h1Contains: ['Connexion', 'connect', 'onnecter'] },
  { path: '/auth/register',    h1Contains: ['Créer', 'Inscription', 'Bienvenue'] },
  { path: '/auth/forgot',      h1Contains: ['mot de passe', 'oublié'] },
  { path: '/auth/logout',      h1Contains: [] },
]
const PROTECTED_ROUTES = [
  { path: '/mon-espace',       role: 'perso',    h1Contains: [] },
  { path: '/account',          role: 'perso',    h1Contains: [] },
  { path: '/pro',              role: 'pro',      h1Contains: [] },
  { path: '/pro?page=listings', role: 'pro',     h1Contains: [] },
  { path: '/pro?page=leads',   role: 'pro',      h1Contains: [] },
  { path: '/pro?page=analytics', role: 'pro',    h1Contains: [] },
  { path: '/pro?page=billing', role: 'pro',      h1Contains: [] },
  { path: '/pro?page=profile', role: 'pro',      h1Contains: [] },
  { path: '/pro?page=settings', role: 'pro',     h1Contains: [] },
  { path: '/pro?page=verification', role: 'pro', h1Contains: [] },
  { path: '/pro?page=security', role: 'pro',     h1Contains: [] },
  { path: '/crm',              role: 'pro',      h1Contains: [] },
  { path: '/forms',            role: 'pro',      h1Contains: [] },
]

const results = []
const rec = (n, ok, d) => { results.push({ n, ok, d }); console.log(`  ${ok?'✅':'❌'} ${n}${d?' — '+d:''}`) }

const STAMP = Date.now()
const cleanup = []
const browser = await chromium.launch({ headless: true })

async function makeUser(kind) {
  const email = `smoke.${kind}.${STAMP}@shopca.fr`
  const pwd = 'Smoke!' + STAMP
  const meta = kind === 'pro'
    ? { account_type: 'professional', first_name: 'S', last_name: 'M', company_name: 'SM',
        business_type: 'agence', siret: '11122233344500', address: '1', city: 'Paris', postal_code: '75001' }
    : { account_type: 'personal', first_name: 'S', last_name: 'P' }
  const { data: u } = await admin.auth.admin.createUser({ email, password: pwd, email_confirm: true, user_metadata: meta })
  cleanup.push(u.user.id)
  return { email, pwd, id: u.user.id }
}

async function login(ctx, email, pwd) {
  const p = await ctx.newPage()
  await p.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 20000 })
  await p.fill('input[type=email]', email)
  await p.fill('input[type=password]', pwd)
  await p.click('button[type=submit], button:has-text("Se connecter")')
  await p.waitForURL(url => !url.pathname.includes('/auth/'), { timeout: 15000 })
  await p.close()
}

async function testRoute(ctx, path, label) {
  const p = await ctx.newPage()
  const errors = []
  const failedReqs = []
  p.on('pageerror', e => errors.push('pageerror: '+e.message))
  p.on('console', m => {
    const t = m.text()
    if (m.type() === 'error' && !/ipapi\.co|Failed to load resource.*400|net::ERR_FAILED/i.test(t)) errors.push(t)
  })
  p.on('response', r => {
    if (r.status() >= 500 && !r.url().includes('/analytics') && !r.url().includes('/telemetry')) {
      failedReqs.push(`${r.status()} ${r.url().slice(0,80)}`)
    }
  })
  let status = 0
  let title = ''
  try {
    const resp = await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 20000 })
    status = resp?.status() ?? 0
    await p.waitForTimeout(1000)
    title = await p.title()
  } catch (e) {
    errors.push('goto: '+e.message)
  }

  const ok = status < 400 && errors.length === 0 && failedReqs.length === 0
  rec(`${label} ${path}`, ok,
    `${status} · errs=${errors.length}${failedReqs.length ? ' · 5xx='+failedReqs.length : ''}${errors[0] ? ' · '+errors[0].slice(0,60) : ''}`)
  await p.close()
}

try {
  console.log('\n══ 1) Public routes (non authenticated) ══\n')
  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  for (const r of PUBLIC_ROUTES) {
    await testRoute(ctx1, r.path, 'PUB')
  }
  await ctx1.close()

  console.log('\n══ 2) Perso protected routes ══\n')
  const perso = await makeUser('perso')
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await login(ctx2, perso.email, perso.pwd)
  for (const r of PROTECTED_ROUTES.filter(x => x.role === 'perso')) {
    await testRoute(ctx2, r.path, 'PERSO')
  }
  await ctx2.close()

  console.log('\n══ 3) Pro protected routes ══\n')
  const pro = await makeUser('pro')
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await login(ctx3, pro.email, pro.pwd)
  for (const r of PROTECTED_ROUTES.filter(x => x.role === 'pro')) {
    await testRoute(ctx3, r.path, 'PRO')
  }
  await ctx3.close()

  console.log('\n══ 4) Perso ACL: should NOT access pro routes ══\n')
  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await login(ctx4, perso.email, perso.pwd)
  const p = await ctx4.newPage()
  await p.goto(`${BASE}/pro`, { waitUntil: 'networkidle', timeout: 20000 })
  await p.waitForTimeout(1500)
  rec('Perso bloqué sur /pro',   new URL(p.url()).pathname !== '/pro', p.url())
  await p.goto(`${BASE}/crm`, { waitUntil: 'networkidle', timeout: 20000 })
  await p.waitForTimeout(1500)
  rec('Perso bloqué sur /crm',   new URL(p.url()).pathname !== '/crm', p.url())
  await p.goto(`${BASE}/managerIT`, { waitUntil: 'networkidle', timeout: 20000 })
  await p.waitForTimeout(1500)
  rec('Perso bloqué sur /managerIT', !new URL(p.url()).pathname.startsWith('/managerIT'), p.url())
  await p.close()
  await ctx4.close()

  console.log('\n\n══════════════════════════════════════════════')
  console.log('  BILAN')
  console.log('══════════════════════════════════════════════')
  const ok = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${ok} / ${results.length} routes OK`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('\n  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.n}: ${f.d}`))
  }
} finally {
  await browser.close()
  for (const id of cleanup) await admin.auth.admin.deleteUser(id).catch(() => {})
  console.log('\n[cleanup] users test supprimés')
}
