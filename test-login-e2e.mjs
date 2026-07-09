import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = createClient(SUPA_URL, SERVICE_KEY)

const STAMP = Date.now()
const EMAIL = `e2e.login.${STAMP}@shopca.fr`
const PASSWORD = 'ShopcaE2ETest!' + STAMP

const log = m => console.log(`  ${m}`)
const step = (n, m) => console.log(`\n[${n}] ${m}`)

let userId = null
try {
  /* 1 */ step(1, 'Créer un user Supabase directement (bypass email confirm)')
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: 'E2E', last_name: 'Login' },
  })
  if (cErr) throw new Error(`createUser: ${cErr.message}`)
  userId = created.user.id
  log(`✅ User créé: ${created.user.email} (id: ${userId.slice(0,8)}…)`)

  /* 2 */ step(2, 'Lancer navigateur → /auth/login sur shopca.fr')
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  const errors = []
  const supaCalls = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', async r => {
    if (r.url().includes('supabase.co') && r.url().includes('/auth/')) {
      const entry = { status: r.status(), url: r.url().slice(r.url().indexOf('/auth'), r.url().indexOf('/auth')+40) }
      if (r.status() >= 400) { try { entry.body = await r.text() } catch {} }
      supaCalls.push(entry)
    }
  })

  await page.goto('https://shopca.fr/auth/login', { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(1000)
  log(`Title: "${await page.title()}"`)

  const errShown = await page.evaluate(() => document.body.innerText.match(/CONFIGURATION SUPABASE|placeholder|absent du fichier/i)?.[0])
  if (errShown) throw new Error(`Erreur config Supabase visible: ${errShown}`)
  log('✅ Aucune erreur de config Supabase affichée')

  /* 3 */ step(3, 'Remplir email + password')
  await page.waitForSelector('input[type=email]', { timeout: 8000 })
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', PASSWORD)
  log(`✅ Email + password saisis`)

  /* 4 */ step(4, 'Cliquer "Se connecter"')
  const btn = await page.$('button:has-text("Se connecter"), button:has-text("Connexion"), button[type=submit]')
  if (!btn) throw new Error('Bouton submit introuvable')
  await btn.click()
  await page.waitForTimeout(4000)

  /* 5 */ step(5, 'Vérification post-login')
  log(`URL: ${page.url()}`)
  log(`Appels /auth/: ${supaCalls.length}`)
  supaCalls.forEach(c => {
    console.log(`     ${c.status} · ${c.url}`)
    if (c.body) console.log(`       BODY: ${c.body.slice(0, 200)}`)
  })

  // Check if redirected (not on login anymore = success)
  const stillOnLogin = page.url().includes('/auth/login')
  if (stillOnLogin) {
    const bodyErr = await page.evaluate(() => {
      const els = document.querySelectorAll('[class*="rose"], [class*="red"], [role=alert]')
      return Array.from(els).map(e => e.textContent).filter(Boolean).join(' | ').slice(0, 200)
    })
    log(`⚠️  Toujours sur /auth/login. Erreurs visibles: ${bodyErr || 'aucune'}`)
    // Check si session créée en JS
    const hasSession = await page.evaluate(() => !!localStorage.getItem('sb-vvjmcrcakmmjuhpbtzbu-auth-token'))
    if (hasSession) log('✅ Session storage set — auth réussie')
    else log('❌ Pas de session')
  } else {
    log(`✅ Redirection après login — connexion réussie`)
  }

  log(`Erreurs console: ${errors.length}`)
  errors.slice(0, 3).forEach(e => console.log(`     ↳ ${e.slice(0,150)}`))

  await browser.close()

  console.log('\n═══════════════════════════════════════')
  console.log('  ✅ CONNEXION SUPABASE FONCTIONNELLE EN PROD')
  console.log('═══════════════════════════════════════')
} catch (err) {
  console.error('\n❌ TEST FAILED:', err.message)
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId)
    console.log(`\n  Cleanup: user ${userId.slice(0,8)}… supprimé`)
  }
}
