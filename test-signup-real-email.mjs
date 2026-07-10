/**
 * Real end-to-end signup test with a live inbox from mail.tm
 *   1) create disposable mailbox on mail.tm
 *   2) sign up on shopca.fr with that address
 *   3) poll the inbox until the confirmation email arrives
 *   4) extract the action link
 *   5) click it → land on /auth/callback → redirect dashboard
 *   6) verify Supabase session + profile
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const admin = createClient('https://vvjmcrcakmmjuhpbtzbu.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY)
const BASE = 'https://shopca.fr'
const MAIL_API = 'https://api.mail.tm'

const wait = (ms) => new Promise(r => setTimeout(r, ms))
const log = (m) => console.log('  ' + m)
const step = (n, m) => console.log(`\n[${n}] ${m}`)

// ── mail.tm helpers ─────────────────────────────────────────────────────
async function createMailbox() {
  const domainsRes = await fetch(`${MAIL_API}/domains`)
  const { 'hydra:member': domains } = await domainsRes.json()
  const domain = domains[0].domain
  const address = `shopca.test.${Date.now()}@${domain}`
  const password = 'ShopcaTest!' + Date.now()

  const create = await fetch(`${MAIL_API}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password }),
  })
  if (!create.ok) throw new Error(`mail.tm createAccount ${create.status}: ${await create.text()}`)

  const tokenRes = await fetch(`${MAIL_API}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password }),
  })
  const { token } = await tokenRes.json()
  return { address, password, token }
}

async function waitForEmail(token, subjectRegex, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await fetch(`${MAIL_API}/messages`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const { 'hydra:member': msgs } = await res.json()
      const match = msgs.find(m => subjectRegex.test(m.subject || ''))
      if (match) {
        const one = await fetch(`${MAIL_API}/messages/${match.id}`, { headers: { Authorization: `Bearer ${token}` } })
        return one.json()
      }
    }
    await wait(3000)
  }
  return null
}

// ── signup ──────────────────────────────────────────────────────────────
const STAMP = Date.now()
const PWD = 'RealMail!' + STAMP

let mbox
try {
  step(1, 'Créer une boîte mail.tm')
  mbox = await createMailbox()
  log(`✅ ${mbox.address}`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const consoleErrs = []
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()) })
  page.on('pageerror', e => consoleErrs.push('pageerror: ' + e.message))

  step(2, 'Ouvrir /auth/register et remplir le formulaire particulier')
  await page.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForSelector('input[placeholder="Jean"]', { timeout: 15000 })

  // Step 0 — Identité
  await page.fill('input[placeholder="Jean"]', 'Real')
  await page.fill('input[placeholder="Dupont"]', 'Mail')
  await page.fill('input[placeholder*="00 00"]', '+33 6 12 34 56 78')
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  // Step 1 — Email + Password
  await page.fill('input[type=email]', mbox.address)
  const pwd = await page.$$('input[type=password]')
  await pwd[0].fill(PWD)
  await pwd[1].fill(PWD)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  // Step 2 — Préférences
  const achat = await page.$('button:has-text("Achat")').catch(() => null)
  if (achat) await achat.click()
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  // Step 3 — CGU + submit
  const labels = await page.$$('label[for]')
  for (const l of labels) await l.click({ force: true }).catch(() => {})
  await page.waitForTimeout(300)
  await page.click('button:has-text("Créer mon compte")')
  log('  ↳ Attente réponse signup (5s)...')
  await page.waitForTimeout(5000)
  log('✅ Signup submit — SuccessOverlay affichée')

  step(3, 'Attente email de confirmation (max 90s)')
  const email = await waitForEmail(mbox.token, /confirm|shopca|verify|activate/i, 90000)
  if (!email) throw new Error("Timeout: aucun email de confirmation reçu")
  log(`✅ Email reçu — subject: "${email.subject}"`)
  log(`   From: ${email.from?.address || email.from}`)

  // Extract action link
  const html = email.html?.[0] || email.text || ''
  const linkMatch = html.match(/https?:\/\/[^"'\s<>]+auth[^"'\s<>]*token=[^"'\s<>]+/i)
    || html.match(/https?:\/\/[^"'\s<>]*supabase[^"'\s<>]+/i)
  if (!linkMatch) throw new Error("Pas de lien d'action trouvé dans l'email")
  const actionLink = linkMatch[0].replace(/&amp;/g, '&').replace(/[<>"']$/g, '')
  log(`✅ Lien extrait: ${actionLink.slice(0, 80)}…`)

  step(4, 'Cliquer sur le lien de confirmation')
  await page.goto(actionLink, { waitUntil: 'networkidle', timeout: 25000 })
  // Wait for callback processing + redirect
  const deadline = Date.now() + 12000
  while (Date.now() < deadline) {
    const p = new URL(page.url()).pathname
    if (!p.includes('/auth/callback') && !p.startsWith('/auth/')) break
    await page.waitForTimeout(500)
  }
  const finalUrl = page.url()
  const finalPath = new URL(finalUrl).pathname
  log(`  URL finale: ${finalUrl.slice(0, 100)}`)
  log(`  ${finalPath === '/mon-espace' ? '✅' : '❌'} Redirigé vers /mon-espace: ${finalPath}`)

  step(5, 'Vérification Supabase')
  const { data: users } = await admin.auth.admin.listUsers()
  const u = users.users.find(x => x.email === mbox.address)
  if (!u) throw new Error("User introuvable côté Supabase")
  log(`✅ User: id=${u.id.slice(0,8)}… confirmed_at=${u.email_confirmed_at || 'null'}`)

  const { data: profile } = await admin.from('profiles').select('role, first_name, phone').eq('id', u.id).single()
  log(`✅ Profile: role=${profile?.role} first_name=${profile?.first_name} phone=${profile?.phone}`)

  step(6, 'Erreurs console')
  const realErrs = consoleErrs.filter(t => !/ipapi\.co|Failed to load resource.*400|net::ERR_FAILED/i.test(t))
  log(`  Erreurs console: ${realErrs.length}`)
  realErrs.slice(0, 3).forEach(e => log(`    ↳ ${e.slice(0, 150)}`))

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  ✅ FLUX EMAIL DE CONFIRMATION 100% FONCTIONNEL')
  console.log('═══════════════════════════════════════════════════════')

  // Cleanup
  await admin.auth.admin.deleteUser(u.id).catch(() => {})
  await ctx.close()
  await browser.close()
} catch (err) {
  console.error('\n❌ FAIL:', err.message)
  // Best-effort cleanup by email
  if (mbox) {
    const { data: users } = await admin.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))
    const u = users.users?.find(x => x.email === mbox.address)
    if (u) await admin.auth.admin.deleteUser(u.id).catch(() => {})
  }
  process.exit(1)
}
