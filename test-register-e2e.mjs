import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const admin = createClient(SUPA_URL, SERVICE_KEY)

const STAMP = Date.now()
const EMAIL = `e2e.test.${STAMP}@shopca.fr`
const PASSWORD = 'ShopcaE2ETest!' + STAMP
const FIRST = 'E2E'
const LAST = 'Test'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const errors = []
const supaCalls = []
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('response', async r => {
  if (r.url().includes('supabase.co')) {
    const entry = { status: r.status(), url: r.url() }
    if (r.url().includes('/auth/') && r.status() >= 400) {
      try { entry.body = await r.text() } catch {}
    }
    supaCalls.push(entry)
  }
})

let step = 0
const info = (m) => console.log(`  ℹ️  ${m}`)
const ok = (m) => console.log(`  ✅ ${m}`)
const bad = (m) => { console.log(`  ❌ ${m}`); throw new Error(m) }
const label = (m) => { step++; console.log(`\n[${step}] ${m}`) }

try {
  /* 1 */ label('Charge /auth/register')
  await page.goto('https://shopca.fr/auth/register', { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(1200)
  info(`Title: ${await page.title()}`)
  const errShown = await page.evaluate(() => document.body.innerText.match(/CONFIGURATION SUPABASE|placeholder|absent du fichier/i)?.[0])
  if (errShown) bad(`Erreur config affichée: ${errShown}`)
  ok('Aucune erreur config Supabase')

  /* 2 */ label('Step 0 — Identité (prénom / nom)')
  await page.waitForSelector('input[placeholder="Jean"]', { timeout: 10000 })
  await page.fill('input[placeholder="Jean"]', FIRST)
  await page.fill('input[placeholder="Dupont"]', LAST)
  ok(`Prénom "${FIRST}" · Nom "${LAST}"`)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  /* 3 */ label('Step 1 — Email / Password')
  await page.waitForSelector('input[type=email]', { timeout: 5000 })
  await page.fill('input[type=email]', EMAIL)
  const pwdInputs = await page.$$('input[type=password]')
  info(`Password inputs trouvés: ${pwdInputs.length}`)
  await pwdInputs[0].fill(PASSWORD)
  await pwdInputs[1].fill(PASSWORD)
  ok(`Email "${EMAIL}"`)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  /* 4 */ label('Step 2 — Préférences (skip)')
  // Click "Achat" pour avancer
  const achatBtn = await page.$('button:has-text("Achat")').catch(() => null)
  if (achatBtn) { await achatBtn.click(); ok('Préférence Achat sélectionnée') }
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(700)

  /* 5 */ label('Step 3 — Confirmation + CGU + submit')
  // Custom ShopCACheckbox: click the label, not the hidden input
  const labels = await page.$$('label[for]')
  info(`Labels checkbox: ${labels.length}`)
  for (const l of labels) await l.click({ force: true }).catch(() => {})
  await page.waitForTimeout(300)
  ok('CGU + RGPD cochés (via labels)')

  // Submit final
  const submitBtn = await page.$('button:has-text("Créer mon compte")')
  if (!submitBtn) bad('Bouton submit introuvable')
  await submitBtn.click()
  info('Submit cliqué — attente réponse Supabase auth...')
  await page.waitForTimeout(5000)

  /* 6 */ label('Vérification Supabase auth')
  const authCalls = supaCalls.filter(c => c.url.includes('/auth/'))
  info(`Appels /auth/: ${authCalls.length}`)
  authCalls.forEach(c => {
    console.log(`     ${c.status} · ${c.url.slice(c.url.indexOf('/auth'), c.url.indexOf('/auth')+40)}`)
    if (c.body) console.log(`       BODY: ${c.body.slice(0, 300)}`)
  })

  const { data: userData } = await admin.auth.admin.listUsers()
  const created = userData.users.find(u => u.email === EMAIL)
  if (created) {
    ok(`User créé côté Supabase: id=${created.id.slice(0,8)}… email=${created.email}`)
    // Cleanup
    await admin.auth.admin.deleteUser(created.id)
    info('User de test supprimé')
  } else {
    // Fetch page state
    const urlNow = page.url()
    const bodyText = (await page.evaluate(() => document.body.innerText)).slice(0, 500)
    console.log('  ⚠️  User non trouvé côté Supabase.')
    console.log('  URL actuelle:', urlNow)
    console.log('  Body preview:', bodyText.replace(/\n+/g, ' | ').slice(0, 400))
    bad('Création du compte n\'a pas abouti')
  }

  /* 7 */ label('Résumé erreurs console')
  if (errors.length === 0) ok('Aucune erreur console')
  else errors.forEach(e => console.log(`     ↳ ${e.slice(0, 200)}`))

  console.log('\n═══════════════════════════════════')
  console.log('  ✅ CRÉATION DE COMPTE FONCTIONNELLE')
  console.log('═══════════════════════════════════')
} catch (err) {
  console.error('\n❌ TEST FAILED:', err.message)
  await page.screenshot({ path: './test-register-fail.png', fullPage: true })
  console.log('Screenshot: test-register-fail.png')
} finally {
  await browser.close()
}
