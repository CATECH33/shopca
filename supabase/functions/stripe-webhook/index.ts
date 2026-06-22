import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

function planFromType(type: string): string {
  if (type.includes('enterprise')) return 'enterprise'
  if (type.includes('pro'))        return 'premium'
  if (type.includes('starter'))    return 'basic'
  return 'premium' // premium_alerts and unknown → premium
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    switch (event.type) {
      // ── Subscription created or updated ──────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status
        const type   = sub.metadata?.type || 'premium_alerts'
        const plan   = planFromType(type)

        const item           = sub.items?.data?.[0]
        const price_amount   = item?.price?.unit_amount ?? null
        const price_currency = item?.price?.currency    ?? 'eur'
        const price_interval = item?.price?.recurring?.interval ?? 'month'

        const periodStart = new Date(sub.current_period_start * 1000).toISOString()
        const periodEnd   = new Date(sub.current_period_end   * 1000).toISOString()

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          type,
          plan,
          status,
          start_date: periodStart,
          end_date:   periodEnd,
          current_period_start: periodStart,
          current_period_end:   periodEnd,
          cancel_at_period_end: sub.cancel_at_period_end,
          price:         price_amount,
          price_amount,
          price_currency,
          price_interval,
        }, { onConflict: 'stripe_subscription_id' })

        await supabase
          .from('profiles')
          .update({ premium_alerts: status === 'active' })
          .eq('id', userId)

        if (type.startsWith('agency_')) {
          await supabase.from('agencies').update({ plan }).eq('user_id', userId)
        }

        break
      }

      // ── Subscription deleted (cancelled) ─────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)

        // Check if user has other active subscriptions of this type
        const { data: remaining } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'premium_alerts')
          .eq('status', 'active')

        if (!remaining?.length) {
          await supabase
            .from('profiles')
            .update({ premium_alerts: false })
            .eq('id', userId)
        }

        break
      }

      // ── Invoice payment failed ───────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string
        if (!subId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId)

        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
