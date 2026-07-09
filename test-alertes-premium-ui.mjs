/**
 * Test UI: user connecté clique "S'abonner" sur /tarifs → doit
 * appeler create-checkout-session et rediriger vers checkout.stripe.com
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BASE = 'https://shopca.fr'
const STAMP = Date.now()
const EMAIL = `alertes.test.${STAMP}@shopca.fr`
const PWD = 'Alertes!' + STAMP

let uid = null
const browser = await chromium.launch({ headless: true })
try {
  console.log('══ Test S\'abonner Alertes Premium ══\n')

  // 1) Créer user confirmé
  const { data: u } = await admin.auth.admin.createUser({
    email: EMAIL, password: PWD, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Alerte', last_name: 'Test' },
  })
  uid = u.user.id
  console.log(`  ✅ User créé: ${EMAIL}`)

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  const supaCalls = []
  const stripeRedirects = []
  page.on('pageerror', e => errors.push('pageerror: '+e.message))
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()) })
  page.on('response', r => {
    const url = r.url()
    if (url.includes('supabase.co/functions/v1/create-checkout')) supaCalls.push({ status: r.status(), url })
    if (url.includes('checkout.stripe.com') || url.includes('js.stripe.com')) stripeRedirects.push(url.slice(0, 80))
  })
  page.on('framenavigated', f => {
    if (f.url().includes('checkout.stripe.com')) stripeRedirects.push('NAV: '+f.url().slice(0, 80))
  })

  // 2) Login
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', PWD)
  await page.click('button[type=submit], button:has-text("Se connecter")')
  await page.waitForTimeout(4000)
  console.log(`  ✅ Login → ${new URL(page.url()).pathname}`)

  // 3) Aller sur /tarifs
  await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(1500)
  console.log(`  ✅ Page /tarifs chargée`)

  // 4) Cliquer "S'abonner" (dans le bloc Alertes Premium)
  const btn = await page.locator('button:has-text("S\'abonner")').first()
  if (!(await btn.count())) {
    console.log('  ❌ Bouton "S\'abonner" INTROUVABLE')
    throw new Error('button not found')
  }
  console.log(`  ✅ Bouton "S'abonner" présent`)

  await btn.click()
  console.log(`  ↳ Clic — attente redirection Stripe (10s)…`)
  await page.waitForTimeout(10000)

  // 5) Vérifs
  const finalUrl = page.url()
  console.log(`\n  URL finale: ${finalUrl.slice(0, 100)}`)
  console.log(`  Appels create-checkout-session: ${supaCalls.length}`)
  supaCalls.forEach(c => console.log(`    ${c.status} · ${c.url.slice(c.url.indexOf('/functions'))}`))
  console.log(`  Ressources Stripe chargées: ${stripeRedirects.length}`)
  stripeRedirects.slice(0, 3).forEach(u => console.log(`    ${u}`))

  const onStripe = finalUrl.includes('checkout.stripe.com')
  console.log(`\n  ${onStripe ? '✅' : '❌'} Redirection vers Stripe Checkout: ${onStripe ? 'OUI' : 'NON'}`)

  console.log(`  Erreurs console: ${errors.length}`)
  errors.slice(0, 3).forEach(e => console.log(`    ↳ ${e.slice(0, 150)}`))

  await ctx.close()
} finally {
  if (uid) {
    // Cancel any Stripe sub that might have been created
    try {
      const { data: subs } = await admin.from('subscriptions').select('stripe_subscription_id').eq('user_id', uid)
      const stripeKey = process.env.STRIPE_SECRET_KEY
      if (stripeKey) {
        for (const s of subs || []) {
          if (s.stripe_subscription_id) {
            await fetch(`https://api.stripe.com/v1/subscriptions/${s.stripe_subscription_id}`, {
              method: 'DELETE',
              headers: { Authorization: `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` },
            })
          }
        }
      }
    } catch {}
    await admin.auth.admin.deleteUser(uid).catch(() => {})
    console.log(`\n[cleanup] User supprimé`)
  }
  await browser.close()
}
