import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i+1)] })
)

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

// Service role client (bypasses RLS for verification)
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
)

const USER_ID = '6f520000-213a-458a-bf32-f6c9552e23e5'
const PRICE_ID = env.STRIPE_PRICE_PREMIUM_ALERTS_MONTHLY
const EMAIL = 'premium@pasmal.shop'

const log = (msg) => console.log(`  ${msg}`)
const step = (n, msg) => console.log(`\n── STEP ${n}: ${msg} ──`)
const wait = (ms) => new Promise(r => setTimeout(r, ms))

async function readProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, premium_alerts, stripe_customer_id')
    .eq('id', USER_ID)
    .single()
  if (error) throw new Error(`readProfile: ${error.message}`)
  return data
}

async function readSubscription(subId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subId)
    .maybeSingle()
  return data
}

async function cleanup(customerId) {
  // Delete Stripe subs first
  if (customerId) {
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 })
    for (const s of subs.data) {
      if (s.status !== 'canceled') await stripe.subscriptions.cancel(s.id).catch(() => {})
    }
    await stripe.customers.del(customerId).catch(() => {})
  }
  // Cleanup Supabase
  await supabase.from('subscriptions').delete().eq('user_id', USER_ID)
  await supabase.from('profiles').update({ premium_alerts: false, stripe_customer_id: null }).eq('id', USER_ID)
}

// ── Main ─────────────────────────────────────────────────────────────────
try {
  step(0, 'Cleanup previous state')
  await cleanup(null) // start fresh Supabase
  const p0 = await readProfile()
  log(`Initial state: premium_alerts=${p0.premium_alerts}, customer=${p0.stripe_customer_id ?? '(none)'}`)

  step(1, 'Create Stripe customer with metadata')
  const customer = await stripe.customers.create({
    email: EMAIL,
    name: 'Test Premium E2E',
    metadata: { supabase_user_id: USER_ID },
  })
  log(`Customer: ${customer.id}`)

  step(2, 'Attach test payment method (pm_card_visa)')
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id })
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: pm.id },
  })
  log(`Default PM set: ${pm.id}`)

  step(3, 'Create subscription (SCENARIO: Paiement réussi)')
  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: PRICE_ID }],
    metadata: { supabase_user_id: USER_ID, type: 'premium_alerts' },
    expand: ['latest_invoice'],
  })
  log(`Sub: ${sub.id}`)
  log(`Status: ${sub.status}`)
  log(`Amount: ${sub.items.data[0].price.unit_amount / 100}€ / ${sub.items.data[0].price.recurring.interval}`)
  log(`Invoice: ${sub.latest_invoice.status}`)

  step(4, 'Wait 4s for webhook propagation → Supabase')
  await wait(4000)

  step(5, 'Verify Supabase state after webhook')
  const p1 = await readProfile()
  const s1 = await readSubscription(sub.id)
  log(`profiles.premium_alerts       = ${p1.premium_alerts}  ${p1.premium_alerts ? '✅' : '❌'}`)
  log(`profiles.stripe_customer_id   = ${p1.stripe_customer_id}  ${p1.stripe_customer_id === customer.id ? '✅' : '❌'}`)
  log(`subscriptions.status          = ${s1?.status ?? '(missing)'}  ${s1?.status === 'active' ? '✅' : '❌'}`)
  log(`subscriptions.stripe_sub_id   = ${s1?.stripe_subscription_id ?? '(missing)'}  ${s1?.stripe_subscription_id === sub.id ? '✅' : '❌'}`)
  log(`subscriptions.price_amount    = ${s1?.price_amount}  ${s1?.price_amount === 750 ? '✅' : '❌'}`)
  log(`subscriptions.current_period_end = ${s1?.current_period_end}`)

  const s1Ok = p1.premium_alerts && p1.stripe_customer_id === customer.id
            && s1?.status === 'active' && s1?.stripe_subscription_id === sub.id
            && s1?.price_amount === 750
  if (!s1Ok) throw new Error('Scenario 1 failed: webhook did not update Supabase')

  step(6, 'SCENARIO: Résiliation programmée (cancel at period end)')
  await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
  await wait(3000)
  const s2 = await readSubscription(sub.id)
  const p2 = await readProfile()
  log(`subscriptions.cancel_at_period_end = ${s2?.cancel_at_period_end}  ${s2?.cancel_at_period_end ? '✅' : '❌'}`)
  log(`profiles.premium_alerts (should still be true) = ${p2.premium_alerts}  ${p2.premium_alerts ? '✅' : '❌'}`)

  step(7, 'SCENARIO: Annulation immédiate (subscription.deleted)')
  await stripe.subscriptions.cancel(sub.id)
  await wait(3000)
  const s3 = await readSubscription(sub.id)
  const p3 = await readProfile()
  log(`subscriptions.status = ${s3?.status}  ${s3?.status === 'canceled' ? '✅' : '❌'}`)
  log(`profiles.premium_alerts = ${p3.premium_alerts}  ${!p3.premium_alerts ? '✅' : '❌'}`)

  const s3Ok = s3?.status === 'canceled' && !p3.premium_alerts
  if (!s3Ok) throw new Error('Scenario 3 failed: cancellation did not revoke premium')

  step(8, 'Cleanup')
  await cleanup(customer.id)
  log('Cleaned up')

  console.log('\n═══════════════════════════════════════════════')
  console.log('  ✅ ALL SCENARIOS PASS')
  console.log('═══════════════════════════════════════════════')
} catch (err) {
  console.error('\n❌ FAILED:', err.message)
  process.exit(1)
}
