import Stripe from 'https://esm.sh/stripe@13?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

// ── Product catalog ──────────────────────────────────────────────
// Price IDs are injected via Supabase secrets after running:
//   node scripts/stripe-setup.js
// Falls back to inline price_data if no Price ID is set.
const CATALOG: Record<string, {
  name: string
  description: string
  unit_amount: number
  currency: string
  interval?: 'month' | 'year'
  mode: 'subscription' | 'payment'
  price_id_env: string
}> = {
  premium_alerts: {
    name:         'Alertes Premium',
    description:  'Alertes email en temps réel, recherches sauvegardées, notifications instantanées',
    unit_amount:  750,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_PREMIUM_ALERTS_MONTHLY',
  },
  pack_visibilite: {
    name:         'Pack Visibilité',
    description:  'Annonce 30 jours, 8 photos, boost +200%, badge "Nouveau"',
    unit_amount:  990,
    currency:     'eur',
    mode:         'payment',
    price_id_env: 'STRIPE_PRICE_PACK_VISIBILITE',
  },
  listing_premium: {
    name:         'Annonce Premium',
    description:  'Annonce 30 jours, 12 photos, top placement, analytics avancés, badge "Urgent"',
    unit_amount:  1490,
    currency:     'eur',
    mode:         'payment',
    price_id_env: 'STRIPE_PRICE_LISTING_PREMIUM',
  },
  boost_top: {
    name:         'Boost — Remonter en tête',
    description:  'Première position des résultats pendant 72h',
    unit_amount:  490,
    currency:     'eur',
    mode:         'payment',
    price_id_env: 'STRIPE_PRICE_BOOST_TOP',
  },
  agency_starter_monthly: {
    name:         'Agence Starter — Mensuel',
    description:  "Jusqu'à 20 annonces, CRM basique, profil agence",
    unit_amount:  4900,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_STARTER_MONTHLY',
  },
  agency_starter_yearly: {
    name:         'Agence Starter — Annuel',
    description:  "Jusqu'à 20 annonces, CRM basique, profil agence (-20%)",
    unit_amount:  3920,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_STARTER_YEARLY',
  },
  agency_pro_monthly: {
    name:         'Agence Pro — Mensuel',
    description:  'Annonces illimitées, CRM avancé, 5 agents, analytics',
    unit_amount:  12900,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_PRO_MONTHLY',
  },
  agency_pro_yearly: {
    name:         'Agence Pro — Annuel',
    description:  'Annonces illimitées, CRM avancé, 5 agents, analytics (-20%)',
    unit_amount:  10320,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_PRO_YEARLY',
  },
  agency_enterprise_monthly: {
    name:         'Agence Enterprise — Mensuel',
    description:  'API, agents illimités, SLA 99,9%, account manager dédié',
    unit_amount:  39900,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_ENTERPRISE_MONTHLY',
  },
  agency_enterprise_yearly: {
    name:         'Agence Enterprise — Annuel',
    description:  'API, agents illimités, SLA 99,9%, account manager dédié (-20%)',
    unit_amount:  31920,
    currency:     'eur',
    interval:     'month',
    mode:         'subscription',
    price_id_env: 'STRIPE_PRICE_AGENCY_ENTERPRISE_YEARLY',
  },
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // ── Auth ────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { priceType, successUrl, cancelUrl } = await req.json()
    const product = CATALOG[priceType]
    if (!product) {
      return new Response(JSON.stringify({ error: 'Type de produit invalide' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // ── Get or create Stripe customer ───────────────────────────
    let customerId: string | undefined
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email:    user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // ── Build line item ─────────────────────────────────────────
    // Prefer pre-created Price ID (set via stripe-setup.js script)
    // Falls back to inline price_data (works without setup)
    const priceId = Deno.env.get(product.price_id_env)

    const isSubscription = product.mode === 'subscription'

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency:     product.currency,
            product_data: {
              name:        product.name,
              description: product.description,
            },
            unit_amount:  product.unit_amount,
            ...(isSubscription && product.interval ? { recurring: { interval: product.interval } } : {}),
          },
          quantity: 1,
        }

    // ── Create Checkout Session ─────────────────────────────────
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer:             customerId,
      mode:                 isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items:           [lineItem],
      success_url:          successUrl,
      cancel_url:           cancelUrl,
      metadata: { supabase_user_id: user.id, type: priceType },
    }

    if (isSubscription) {
      sessionParams.subscription_data = {
        metadata: { supabase_user_id: user.id, type: priceType },
        description: `SHOPCA — ${product.name}`,
      }
    } else {
      sessionParams.payment_intent_data = {
        statement_descriptor: 'SHOPCA',
        metadata: { supabase_user_id: user.id, type: priceType },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Return both sessionId (legacy) and url (recommended by Stripe)
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[create-checkout-session]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
