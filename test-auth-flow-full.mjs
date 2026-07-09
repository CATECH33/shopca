/**
 * End-to-end auth flow test.
 * Simulates: signup → email confirm (generateLink) → click link → session established → redirect.
 * Requires SUPABASE_SERVICE_ROLE_KEY (admin API).
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BASE = process.env.BASE_URL || 'https://shopca.fr'

const results = []
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`  ${ok?'✅':'❌'} ${name}${detail?' — '+detail:''}`) }
const section = (n, m) => console.log(`\n══ [${n}] ${m} ══`)

const cleanup = []
const browser = await chromium.launch({ headless: true })

async function testConfirmFlow(email, password, meta, expectedRedirect) {
  // Create user WITHOUT auto-confirm to simulate "confirmation required"
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: false, user_metadata: meta,
  })
  if (cErr) throw new Error(`createUser: ${cErr.message}`)
  cleanup.push(created.user.id)

  // Generate a magic link (simulates clicking the email confirmation)
  const { data: link, error: lErr } = await admin.auth.admin.generateLink({
    type: 'signup', email,
    options: { redirectTo: `${BASE}/auth/callback` },
  })
  if (lErr) throw new Error(`generateLink: ${lErr.message}`)
  const actionLink = link.properties.action_link

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()) })

  await page.goto(actionLink, { waitUntil: 'networkidle', timeout: 30000 })

  // The callback page shows a 2s countdown before redirecting.
  // Wait up to 8s for the final navigation.
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    const url = page.url()
    if (!url.includes('/auth/callback') && !url.includes('token=')) break
    await page.waitForTimeout(500)
  }
  const finalUrl = page.url()
  const path = new URL(finalUrl).pathname

  rec(`Callback dispatched vers ${expectedRedirect}`,
    path === expectedRedirect,
    `réel: ${path}`)

  // Verify session in browser localStorage
  const hasSession = await page.evaluate(() =>
    Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
  )
  rec('Session persistée en localStorage', hasSession, hasSession ? 'oui' : 'non')

  // No console errors
  rec('Aucune erreur console', errs.length === 0, errs[0]?.slice(0,100) || 'ok')

  await ctx.close()
  return { finalPath: path, hasSession }
}

try {
  const STAMP = Date.now()

  section(1, 'Cas 1 — Nouvel utilisateur PARTICULIER')
  await testConfirmFlow(
    `flow.perso.${STAMP}@shopca.fr`,
    'FlowTest!' + STAMP,
    { account_type: 'personal', first_name: 'Flow', last_name: 'Perso' },
    '/mon-espace'
  )

  section(2, 'Cas 2 — Nouvel utilisateur PROFESSIONNEL')
  await testConfirmFlow(
    `flow.pro.${STAMP}@shopca.fr`,
    'FlowTest!' + STAMP,
    {
      account_type: 'professional',
      first_name: 'Flow', last_name: 'Pro',
      company_name: 'Flow Corp', business_type: 'agence',
      siret: '99999999999998', address: '1 rue Test',
      city: 'Paris', postal_code: '75001',
    },
    '/pro'
  )

  section(3, 'Cas 3 — MANAGER (platform_owner)')
  // Create user then promote to platform_owner (bypass anti-escalation)
  const mgrEmail = `flow.mgr.${STAMP}@shopca.fr`
  const { data: mgrCreated } = await admin.auth.admin.createUser({
    email: mgrEmail, password: 'FlowTest!' + STAMP, email_confirm: false,
    user_metadata: { account_type: 'personal', first_name: 'Mgr', last_name: 'Test' },
  })
  cleanup.push(mgrCreated.user.id)
  await new Promise(r => setTimeout(r, 800))
  await admin.from('profiles').update({ role: 'platform_owner' }).eq('id', mgrCreated.user.id)

  const { data: link } = await admin.auth.admin.generateLink({
    type: 'signup', email: mgrEmail,
    options: { redirectTo: `${BASE}/auth/callback` },
  })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(link.properties.action_link, { waitUntil: 'networkidle', timeout: 30000 })
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    const url = page.url()
    if (!url.includes('/auth/callback') && !url.includes('token=')) break
    await page.waitForTimeout(500)
  }
  const mgrPath = new URL(page.url()).pathname
  rec(`Callback dispatched vers /managerIT (platform_owner)`, mgrPath === '/managerIT', `réel: ${mgrPath}`)
  await ctx.close()

  section(4, 'Vérif rendus: page /mon-espace + /pro accessibles logged-in')
  // Sign in as perso then hit /mon-espace directly
  const persoEmail = `check.perso.${STAMP}@shopca.fr`
  const persoPwd = 'Check!' + STAMP
  const { data: p } = await admin.auth.admin.createUser({
    email: persoEmail, password: persoPwd, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Check' },
  })
  cleanup.push(p.user.id)

  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page4 = await ctx4.newPage()
  const errs4 = []
  page4.on('pageerror', e => errs4.push(e.message))
  page4.on('console', m => { if (m.type()==='error') errs4.push(m.text()) })
  await page4.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 25000 })
  await page4.fill('input[type=email]', persoEmail)
  await page4.fill('input[type=password]', persoPwd)
  await page4.click('button:has-text("Se connecter"), button[type=submit]')
  await page4.waitForTimeout(5000)
  const loginPath = new URL(page4.url()).pathname
  rec('Login perso redirige vers /mon-espace', loginPath === '/mon-espace', `réel: ${loginPath}`)
  rec('/mon-espace charge sans erreur console', errs4.length === 0, errs4[0]?.slice(0,100) || 'ok')
  await ctx4.close()

  section('BILAN', 'Résumé')
  const ok = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${ok} / ${results.length} vérifications OK`)
  const fails = results.filter(r => !r.ok)
  fails.forEach(f => console.log(`    ❌ ${f.name}: ${f.detail}`))
} catch (err) {
  console.error('\n❌ FAILED:', err.message)
} finally {
  await browser.close()
  console.log('\n[cleanup] Suppression users test')
  for (const id of cleanup) await admin.auth.admin.deleteUser(id).catch(() => {})
}
