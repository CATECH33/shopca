import { supabase } from '../../lib/supabase.js'

// ── Stripe Checkout for Premium Alerts ───────────────────────────────────────
// Creates a Stripe Checkout session via Supabase Edge Function, then redirects.
// Stripe.js is lazy-loaded (238 KB) to avoid blocking initial page render.
export async function startPremiumAlertsCheckout() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Vous devez être connecté.')

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      priceType: 'premium_alerts',
      successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${window.location.origin}/auth/register`,
    },
  })

  if (error) throw new Error(error.message || 'Erreur lors de la création de la session de paiement.')
  if (!data?.sessionId) throw new Error('Session de paiement invalide.')

  const { getStripe } = await import('../../lib/stripe.js')
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe non disponible.')

  const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
  if (stripeError) throw new Error(stripeError.message)
}

// ── Verify checkout session after redirect ───────────────────────────────────
export async function verifyCheckoutSession(sessionId) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Vous devez être connecté.')

  const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
    body: { sessionId },
  })

  if (error) throw new Error(error.message || 'Erreur lors de la vérification du paiement.')
  return data
}

// ── Activate premium alerts on profile ───────────────────────────────────────
export async function activatePremiumAlerts(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ premium_alerts: true })
    .eq('id', userId)

  if (error) throw error
}

// ── Get subscription status ──────────────────────────────────────────────────
export async function getSubscriptionStatus(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('type', 'premium_alerts')
    .maybeSingle()

  if (error) throw error
  return data
}

// ── Real-time entitlement check (RPC — bypasses stale profile.premium_alerts) ─
export async function isPremiumActive(userId) {
  if (!userId) return false
  const { data, error } = await supabase.rpc('is_premium_active', { p_user_id: userId })
  if (error) { console.warn('[premium] check failed:', error.message); return false }
  return !!data
}

// ── Open Stripe Billing Portal (manage subscription, invoices, cancel) ───────
export async function openBillingPortal(returnUrl) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Vous devez être connecté.')

  const { data, error } = await supabase.functions.invoke('stripe-portal', {
    body: { returnUrl: returnUrl || window.location.href },
  })

  if (error) throw new Error(error.message || 'Erreur lors de l\'ouverture du portail.')
  if (!data?.url) throw new Error('URL du portail Stripe invalide.')

  window.location.href = data.url
}
