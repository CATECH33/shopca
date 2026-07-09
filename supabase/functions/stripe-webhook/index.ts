import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

function planFromType(t: string) {
  return t.includes('enterprise') ? 'enterprise'
       : t.includes('pro')        ? 'premium'
       : t.includes('starter')    ? 'basic'
       : 'premium'
}
function isEntitled(s: string) {
  return s === 'active' || s === 'trialing' || s === 'past_due'
}

// Handle both old and new Stripe API shapes.
// Old (<=2024): current_period_* live on the subscription root.
// New (2025+): moved to subscription.items.data[0].
function getPeriodStart(sub: any): number | null {
  return sub?.current_period_start ?? sub?.items?.data?.[0]?.current_period_start ?? null
}
function getPeriodEnd(sub: any): number | null {
  return sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end ?? null
}
// Invoice.subscription: old = string ID; new = invoice.parent.subscription_details.subscription
function getSubscriptionIdFromInvoice(inv: any): string | null {
  return (inv?.subscription as string) ?? inv?.parent?.subscription_details?.subscription ?? null
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const log = async (msg: string, data: any = {}, ok = true) => {
    await supabase.from('webhook_debug').insert({
      event_type: event.type, event_id: event.id, message: msg, data, ok,
    })
  }

  try {
    await log('received', { livemode: event.livemode })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        await log('checkout.completed', {
          userId: session.metadata?.supabase_user_id,
          mode: session.mode,
          payment_status: session.payment_status,
        })
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const userId = sub.metadata?.supabase_user_id
        await log('sub.event.start', { userId, status: sub.status, id: sub.id })
        if (!userId) { await log('no userId in metadata', {}, false); break }

        const type   = sub.metadata?.type || 'premium_alerts'
        const plan   = planFromType(type)
        const item   = sub.items?.data?.[0]
        const price_amount   = item?.price?.unit_amount ?? null
        const price_currency = item?.price?.currency ?? 'eur'
        const price_interval = item?.price?.recurring?.interval ?? 'month'
        const pStart = getPeriodStart(sub)
        const pEnd   = getPeriodEnd(sub)
        const periodStart = pStart ? new Date(pStart * 1000).toISOString() : null
        const periodEnd   = pEnd   ? new Date(pEnd   * 1000).toISOString() : null

        const { error: upsertErr } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          type, plan, status: sub.status,
          start_date: periodStart, end_date: periodEnd,
          current_period_start: periodStart, current_period_end: periodEnd,
          cancel_at_period_end: sub.cancel_at_period_end,
          price: price_amount, price_amount, price_currency, price_interval,
        }, { onConflict: 'stripe_subscription_id' })
        if (upsertErr) { await log('subscriptions upsert FAILED', upsertErr, false); throw upsertErr }
        await log('subscriptions upsert OK', { periodEnd })

        if (type === 'premium_alerts') {
          const { error: profErr } = await supabase.from('profiles').update({
            premium_alerts: isEntitled(sub.status),
            stripe_customer_id: sub.customer as string,
          }).eq('id', userId)
          if (profErr) { await log('profile update FAILED', profErr, false); throw profErr }
          await log('profile update OK', { premium_alerts: isEntitled(sub.status) })
        }
        if (type.startsWith('agency_')) {
          await supabase.from('agencies').update({ plan }).eq('user_id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break
        await supabase.from('subscriptions')
          .update({ status: 'canceled', cancel_at_period_end: false })
          .eq('stripe_subscription_id', sub.id)
        const { data: rem } = await supabase.from('subscriptions')
          .select('id').eq('user_id', userId).eq('type', 'premium_alerts')
          .in('status', ['active', 'trialing', 'past_due'])
        if (!rem?.length) {
          await supabase.from('profiles').update({ premium_alerts: false }).eq('id', userId)
        }
        await log('sub.deleted processed', { userId })
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subId = getSubscriptionIdFromInvoice(invoice)
        await log('invoice.paid start', { subId })
        if (!subId) { await log('no subId on invoice', {}); break }
        const sub = await stripe.subscriptions.retrieve(subId) as any
        const userId = sub.metadata?.supabase_user_id
        if (!userId) { await log('no userId on retrieved sub', {}, false); break }
        const pEnd = getPeriodEnd(sub)
        const periodEnd = pEnd ? new Date(pEnd * 1000).toISOString() : null
        await supabase.from('subscriptions').update({
          status: sub.status,
          ...(periodEnd ? { current_period_end: periodEnd, end_date: periodEnd } : {}),
        }).eq('stripe_subscription_id', subId)
        if ((sub.metadata?.type || 'premium_alerts') === 'premium_alerts') {
          await supabase.from('profiles').update({
            premium_alerts: isEntitled(sub.status),
          }).eq('id', userId)
        }
        await log('invoice.paid OK', { userId, periodEnd })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subId = getSubscriptionIdFromInvoice(invoice)
        if (subId) {
          await supabase.from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId)
        }
        break
      }
    }
  } catch (err) {
    await log('HANDLER EXCEPTION', { msg: err?.message, stack: err?.stack, code: err?.code }, false)
    return new Response(JSON.stringify({ error: err?.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
