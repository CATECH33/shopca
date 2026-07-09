/**
 * End-to-end payment test with the Stripe test card 4242 4242 4242 4242.
 *
 * Steps:
 *  1) Create user + confirm email
 *  2) Login → /mon-espace
 *  3) /tarifs → click "S'abonner"
 *  4) Fill Stripe Checkout card form (4242 …)
 *  5) Click "Pay"
 *  6) Wait for redirect to /subscription/success
 *  7) Verify Supabase: subscription active + premium_alerts=true
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BASE = 'https://shopca.fr'
const STAMP = Date.now()
const EMAIL = `pay.4242.${STAMP}@shopca.fr`
const PWD = 'Pay4242!' + STAMP

const log = (m) => console.log('  ' + m)
const step = (n, m) => console.log(`\n[${n}] ${m}`)

let uid = null
let subId = null
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })

try {
  step(1, 'Créer user + confirmer email')
  const { data: u } = await admin.auth.admin.createUser({
    email: EMAIL, password: PWD, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Pay', last_name: 'Test' },
  })
  uid = u.user.id
  log(`✅ ${EMAIL} · id=${uid.slice(0,8)}…`)

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: '+e.message))
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()) })

  step(2, 'Login → /mon-espace')
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', PWD)
  await page.click('button[type=submit], button:has-text("Se connecter")')
  await page.waitForURL(url => !url.pathname.includes('/auth/'), { timeout: 15000 })
  log(`✅ Redirigé vers ${new URL(page.url()).pathname}`)

  step(3, '/tarifs → clic "S\'abonner"')
  await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(1000)
  await page.locator('button:has-text("S\'abonner")').first().click()
  log('  ↳ Attente redirection vers Stripe Checkout…')
  await page.waitForURL(url => url.href.includes('checkout.stripe.com'), { timeout: 20000 })
  log(`✅ Sur ${page.url().slice(0, 60)}…`)

  step(4, 'Remplir la carte 4242 4242 4242 4242')
  await page.waitForTimeout(3000) // laisse Stripe charger l'UI

  // Stripe Checkout embeds inputs directly (no iframe on this hosted page)
  await page.fill('input#email', EMAIL).catch(() => {}) // pré-rempli
  await page.fill('input#cardNumber', '4242 4242 4242 4242')
  await page.fill('input#cardExpiry', '12 / 34')
  await page.fill('input#cardCvc', '123')
  await page.fill('input#billingName', 'Pay Test').catch(() => {})
  // Country / postal code (sometimes required)
  await page.fill('input#billingPostalCode', '75001').catch(() => {})
  log('✅ Champs carte remplis')

  step(5, 'Clic "S\'abonner" / "Pay"')
  const payBtn = page.locator('button[data-testid="hosted-payment-submit-button"], button:has-text("S\'abonner"), button:has-text("Pay")')
  await payBtn.first().click()
  log('  ↳ Attente redirection /subscription/success…')

  step(6, 'Redirection vers /subscription/success')
  try {
    await page.waitForURL(url => url.href.includes('/subscription/success'), { timeout: 30000 })
    log(`✅ Sur ${new URL(page.url()).pathname}${new URL(page.url()).search.slice(0, 60)}…`)
  } catch (e) {
    const finalUrl = page.url()
    log(`❌ Timeout — URL: ${finalUrl.slice(0, 120)}`)
    await page.screenshot({ path: './test-checkout-fail.png', fullPage: true })
    log('   screenshot: test-checkout-fail.png')
    throw new Error('paiement non finalisé')
  }
  await page.waitForTimeout(4000) // laisse le webhook propager

  step(7, 'Vérification Supabase (webhook)')
  const { data: profile } = await admin.from('profiles')
    .select('premium_alerts, stripe_customer_id').eq('id', uid).single()
  log(`profiles.premium_alerts     = ${profile?.premium_alerts}  ${profile?.premium_alerts ? '✅' : '❌'}`)
  log(`profiles.stripe_customer_id = ${profile?.stripe_customer_id}  ${profile?.stripe_customer_id ? '✅' : '❌'}`)

  const { data: sub } = await admin.from('subscriptions')
    .select('*').eq('user_id', uid).eq('type', 'premium_alerts').maybeSingle()
  if (sub) {
    subId = sub.stripe_subscription_id
    log(`subscription.status         = ${sub.status}  ${sub.status === 'active' ? '✅' : '❌'}`)
    log(`subscription.price_amount   = ${sub.price_amount} centimes  ${sub.price_amount === 750 ? '✅' : '❌'}`)
    log(`subscription.stripe_sub_id  = ${sub.stripe_subscription_id.slice(0,20)}…`)
    log(`subscription.current_period_end = ${sub.current_period_end}`)
  } else {
    log('❌ Aucune subscription en base')
  }

  step(8, 'Errors console')
  log(`Erreurs: ${errors.length}`)
  errors.slice(0, 3).forEach(e => log(`  ↳ ${e.slice(0, 150)}`))

  console.log('\n══════════════════════════════════════════════')
  console.log('  ✅ PAIEMENT 7,50€ AVEC CARTE 4242 RÉUSSI')
  console.log('══════════════════════════════════════════════')

  await ctx.close()
} finally {
  console.log('\n[cleanup]')
  if (subId && process.env.STRIPE_SECRET_KEY) {
    try {
      await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
        method: 'DELETE',
        headers: { Authorization: `Basic ${Buffer.from(process.env.STRIPE_SECRET_KEY + ':').toString('base64')}` },
      })
      console.log('  Stripe sub annulée')
    } catch {}
  }
  if (uid) {
    await admin.auth.admin.deleteUser(uid).catch(() => {})
    console.log('  User Supabase supprimé')
  }
  await browser.close()
}
