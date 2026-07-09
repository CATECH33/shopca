import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

function planFromType(type: string): string {
  if (type.includes('enterprise')) return 'enterprise'
  if (type.includes('pro'))        return 'premium'
  if (type.includes('starter'))    return 'basic'
  return 'premium'
}

// Handle both old and new Stripe API shapes (period fields moved to items in 2025+)
function getPeriodStart(sub: any): number | null {
  return sub?.current_period_start ?? sub?.items?.data?.[0]?.current_period_start ?? null
}
function getPeriodEnd(sub: any): number | null {
  return sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end ?? null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sessionId } = await req.json()
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    // Verify this session belongs to the authenticated user
    if (session.metadata?.supabase_user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Session non autorisée' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Paiement non complété', status: session.payment_status }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subscription = session.subscription as Stripe.Subscription
    const type   = session.metadata?.type || 'premium_alerts'
    const plan   = planFromType(type)

    const item           = subscription.items?.data?.[0]
    const price_amount   = item?.price?.unit_amount ?? null
    const price_currency = item?.price?.currency    ?? 'eur'
    const price_interval = item?.price?.recurring?.interval ?? 'month'

    const pStart = getPeriodStart(subscription)
    const pEnd   = getPeriodEnd(subscription)
    const periodStart = pStart ? new Date(pStart * 1000).toISOString() : null
    const periodEnd   = pEnd   ? new Date(pEnd   * 1000).toISOString() : null

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      type,
      plan,
      status: 'active',
      start_date: periodStart,
      end_date:   periodEnd,
      current_period_start: periodStart,
      current_period_end:   periodEnd,
      price:         price_amount,
      price_amount,
      price_currency,
      price_interval,
    }, { onConflict: 'stripe_subscription_id' })

    await supabaseAdmin
      .from('profiles')
      .update({ premium_alerts: true })
      .eq('id', user.id)

    if (type.startsWith('agency_')) {
      await supabaseAdmin.from('agencies').update({ plan }).eq('user_id', user.id)
    }

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: subscription.id,
        status: 'active',
        type,
        plan,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Verify session error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
