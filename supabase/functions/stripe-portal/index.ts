import Stripe from 'https://esm.sh/stripe@13?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // ── Auth ─────────────────────────────────────────────────────
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

    const { returnUrl } = await req.json().catch(() => ({}))

    // ── Get Stripe customer_id from profile ─────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'Aucun compte de facturation trouvé.' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // ── Create Billing Portal session ───────────────────────────
    const session = await stripe.billingPortal.sessions.create({
      customer:   profile.stripe_customer_id,
      return_url: returnUrl || Deno.env.get('APP_URL') || 'https://shopca.fr/mon-espace',
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[stripe-portal]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
