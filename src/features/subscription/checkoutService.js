import { supabase } from '../../lib/supabase.js'

/**
 * Start a Stripe Checkout for any SHOPCA price type.
 *
 * priceType must match a key in the Edge Function CATALOG:
 *   'pack_visibilite' | 'listing_premium' | 'boost_top'
 *   'premium_alerts'
 *   'agency_starter_monthly' | 'agency_starter_yearly'
 *   'agency_pro_monthly'     | 'agency_pro_yearly'
 *   'agency_enterprise_monthly' | 'agency_enterprise_yearly'
 */
export async function startCheckout(priceType, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Vous devez être connecté pour acheter.')

  const successUrl = options.successUrl
    || `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&type=${priceType}`
  const cancelUrl  = options.cancelUrl
    || window.location.href

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { priceType, successUrl, cancelUrl },
  })

  if (error) throw new Error(error.message || 'Erreur lors de la création du paiement.')
  if (!data?.sessionId) throw new Error('Session Stripe invalide.')

  // Redirect to Stripe Checkout — lazy-load stripe.js (238 KB)
  const { getStripe } = await import('../../lib/stripe.js')
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe.js non disponible.')

  const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
  if (stripeError) throw new Error(stripeError.message)
}

/** Convenience wrappers */
export const checkout = {
  packVisibilite:          () => startCheckout('pack_visibilite'),
  listingPremium:          () => startCheckout('listing_premium'),
  boostTop:                () => startCheckout('boost_top'),
  premiumAlerts:           () => startCheckout('premium_alerts'),
  agencyStarter:  (yearly) => startCheckout(yearly ? 'agency_starter_yearly'     : 'agency_starter_monthly'),
  agencyPro:      (yearly) => startCheckout(yearly ? 'agency_pro_yearly'         : 'agency_pro_monthly'),
  agencyEnterprise:(yearly) => startCheckout(yearly ? 'agency_enterprise_yearly'  : 'agency_enterprise_monthly'),
}
