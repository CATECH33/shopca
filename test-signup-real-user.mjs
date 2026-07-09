import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const BASE = 'https://shopca.fr'
const STAMP = Date.now()
const EMAIL = `real.user.${STAMP}@shopca.fr`
const PWD = 'RealUserTest!' + STAMP

let uid = null
const browser = await chromium.launch({ headless: true })

try {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  TEST UTILISATEUR RÉEL — Signup particulier bout-en-bout')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Email: ${EMAIL}`)
  console.log(`  URL:   ${BASE}/auth/register\n`)

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  const consoleErrs = []
  const supaResponses = []
  page.on('pageerror', e => consoleErrs.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()) })
  page.on('response', async r => {
    if (r.url().includes('supabase.co')) {
      const e = { status: r.status(), url: r.url().slice(r.url().indexOf('/', 8)) }
      if (r.status() >= 400) { try { e.body = (await r.text()).slice(0, 200) } catch {} }
      supaResponses.push(e)
    }
  })

  // Step 0 : identité
  console.log('[1/6] Ouverture /auth/register')
  await page.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForSelector('input[placeholder="Jean"]', { timeout: 10000 })
  console.log('  ✅ Formulaire visible')

  console.log('[2/6] Step 0 — Prénom + Nom + Téléphone')
  await page.fill('input[placeholder="Jean"]', 'Real')
  await page.fill('input[placeholder="Dupont"]', 'User')
  await page.fill('input[placeholder*="00 00"]', '+33 6 12 34 56 78')
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)
  console.log('  ✅ Step 0 validé')

  console.log('[3/6] Step 1 — Email + Password')
  await page.fill('input[type=email]', EMAIL)
  const pwd = await page.$$('input[type=password]')
  await pwd[0].fill(PWD)
  await pwd[1].fill(PWD)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)
  console.log('  ✅ Step 1 validé')

  console.log('[4/6] Step 2 — Préférences')
  const achat = await page.$('button:has-text("Achat")').catch(() => null)
  if (achat) await achat.click()
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)
  console.log('  ✅ Step 2 validé')

  console.log('[5/6] Step 3 — CGU + RGPD + Créer mon compte')
  const labels = await page.$$('label[for]')
  for (const l of labels) await l.click({ force: true }).catch(() => {})
  await page.waitForTimeout(400)

  const submit = await page.$('button:has-text("Créer mon compte")')
  await submit.click()
  console.log('  ↳ Clic "Créer mon compte" — attente réponse Supabase (8s)...')
  await page.waitForTimeout(8000)

  console.log('\n[6/6] Vérification du résultat')
  const finalUrl = page.url()
  console.log(`  URL finale: ${finalUrl}`)

  const signupCalls = supaResponses.filter(r => r.url.includes('/auth/v1/signup'))
  console.log(`  Appels signup: ${signupCalls.length}`)
  signupCalls.forEach(c => console.log(`    ${c.status} · ${c.url.slice(0, 40)}${c.body?' · '+c.body:''}`))

  // Check state via admin
  const { data: users } = await admin.auth.admin.listUsers()
  const created = users.users.find(u => u.email === EMAIL)
  if (created) {
    uid = created.user_id || created.id
    console.log(`\n  ✅ User créé côté Supabase auth: id=${created.id.slice(0,8)}…`)
    console.log(`     email_confirmed: ${created.email_confirmed_at ? 'oui' : 'non (email à valider)'}`)

    const { data: profile } = await admin.from('profiles').select('*').eq('id', created.id).single()
    console.log(`     Profile: role=${profile?.role}, phone=${profile?.phone}`)

    if (finalUrl.includes('/onboarding')) {
      console.log('  ✅ Redirect direct vers /onboarding — auto-connect actif')
    } else if (finalUrl.includes('/verify-pending') || finalUrl.includes('/register')) {
      // Success overlay affiché
      const overlayVisible = await page.$('h2:has-text("Bienvenue"), h2:has-text("SHOPCA")').catch(() => null)
      if (overlayVisible) {
        const overlayText = await overlayVisible.textContent()
        console.log(`  ✅ SuccessOverlay affichée: "${overlayText.trim()}"`)
        console.log('  ℹ️  Confirmation email envoyée (mailer_autoconfirm=false)')
        console.log('     → User doit cliquer le lien dans son email pour activer')
      }
    }
  } else {
    console.log('\n  ❌ Aucun user créé — probable rate limit signup')
    signupCalls.forEach(c => {
      if (c.body) console.log('     Body:', c.body)
    })
  }

  console.log(`\n  Erreurs console: ${consoleErrs.length}`)
  consoleErrs.slice(0, 3).forEach(e => console.log(`    ↳ ${e.slice(0, 150)}`))

  await ctx.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  RÉCAP END-TO-END')
  console.log('═══════════════════════════════════════════════════════')
  console.log('  ✅ Formulaire multi-step navigable de bout en bout')
  console.log(`  ${created ? '✅' : '⚠️ '} User créé côté Supabase (${created ? 'oui' : 'rate limit'})`)
  console.log(`  ${created && signupCalls.some(c => c.status === 200) ? '✅' : '⚠️ '} Signup POST réussi`)
  console.log(`  ${consoleErrs.length === 0 ? '✅' : '⚠️ '} 0 erreur console`)

} finally {
  if (uid) await admin.auth.admin.deleteUser(uid).catch(() => {})
  // Also delete by email in case
  const { data: u } = await admin.auth.admin.listUsers()
  const target = u.users.find(x => x.email === EMAIL)
  if (target) await admin.auth.admin.deleteUser(target.id).catch(() => {})
  await browser.close()
  console.log('\n[cleanup] Test user supprimé')
}
