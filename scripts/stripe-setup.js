#!/usr/bin/env node
/**
 * SHOPCA — Stripe Products & Prices Setup (complet)
 * ──────────────────────────────────────────────────
 * Run once (idempotent) to create all products/prices.
 * Outputs Price IDs → updates .env automatically.
 *
 *   npm run stripe:setup
 */

import Stripe from 'stripe'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/* ── Load .env ─────────────────────────────────────────────────── */
const envPath = resolve(process.cwd(), '.env')
let envContent = readFileSync(envPath, 'utf8')

const secretKey = envContent.match(/STRIPE_SECRET_KEY=(.+)/)?.[1]?.trim()
if (!secretKey || secretKey.length < 20) {
  console.error('❌  STRIPE_SECRET_KEY manquante dans .env'); process.exit(1)
}

const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })
const isLive  = secretKey.startsWith('sk_live_')
console.log(`\n🔑  Mode : ${isLive ? '🚀  LIVE' : '⚠️  TEST'}\n`)

/* ── Catalogue complet SHOPCA ──────────────────────────────────── */
const CATALOG = [

  // ── PARTICULIERS — Annonces (one-time) ─────────────────────────
  {
    key: 'pack_visibilite',
    name: 'Pack Visibilité',
    description: '8 photos · Boost +200% · Badge "Nouveau" · 30 jours en ligne',
    mode: 'payment',
    prices: [{ key: 'once', unit_amount: 990, currency: 'eur', nickname: 'Pack Visibilité — 9,90 €' }],
  },
  {
    key: 'listing_premium',
    name: 'Annonce Premium',
    description: '12 photos · Top placement · Badge "Urgent" · Analytics avancés · 30 jours en ligne',
    mode: 'payment',
    prices: [{ key: 'once', unit_amount: 1490, currency: 'eur', nickname: 'Annonce Premium — 14,90 €' }],
  },

  // ── À LA CARTE (one-time) ───────────────────────────────────────
  {
    key: 'boost_top',
    name: 'Remonter en tête',
    description: 'Première position des résultats pendant 72h. Effet immédiat.',
    mode: 'payment',
    prices: [{ key: 'once', unit_amount: 490, currency: 'eur', nickname: 'Boost Top — 4,90 €' }],
  },

  // ── ALERTES (subscription) ──────────────────────────────────────
  {
    key: 'premium_alerts',
    name: 'Alertes Premium',
    description: 'Alertes email en temps réel · Recherches sauvegardées · Notifications instantanées',
    mode: 'subscription',
    prices: [
      { key: 'monthly', unit_amount: 750, currency: 'eur', nickname: 'Alertes Premium — Mensuel', interval: 'month' },
    ],
  },

  // ── AGENCES Starter (subscription) ─────────────────────────────
  {
    key: 'agency_starter',
    name: 'SHOPCA Agence Starter',
    description: "Jusqu'à 20 annonces actives · CRM basique · Profil agence personnalisable",
    mode: 'subscription',
    prices: [
      { key: 'monthly', unit_amount: 4900,  currency: 'eur', nickname: 'Starter Mensuel — 49 €/mois',   interval: 'month' },
      { key: 'yearly',  unit_amount: 47040, currency: 'eur', nickname: 'Starter Annuel — 470 €/an (-20%)', interval: 'year' },
    ],
  },

  // ── AGENCES Pro (subscription) ─────────────────────────────────
  {
    key: 'agency_pro',
    name: 'SHOPCA Agence Pro',
    description: 'Annonces illimitées · CRM avancé Kanban · 5 agents · Analytics temps réel · Boost +200%',
    mode: 'subscription',
    prices: [
      { key: 'monthly', unit_amount: 12900,  currency: 'eur', nickname: 'Pro Mensuel — 129 €/mois',     interval: 'month' },
      { key: 'yearly',  unit_amount: 123840, currency: 'eur', nickname: 'Pro Annuel — 1 238 €/an (-20%)', interval: 'year' },
    ],
  },

  // ── AGENCES Enterprise (subscription) ──────────────────────────
  {
    key: 'agency_enterprise',
    name: 'SHOPCA Agence Enterprise',
    description: 'API REST + webhooks · Agents illimités · Account manager · SLA 99,9% · Onboarding personnalisé',
    mode: 'subscription',
    prices: [
      { key: 'monthly', unit_amount: 39900,  currency: 'eur', nickname: 'Enterprise Mensuel — 399 €/mois',  interval: 'month' },
      { key: 'yearly',  unit_amount: 383040, currency: 'eur', nickname: 'Enterprise Annuel — 3 830 €/an (-20%)', interval: 'year' },
    ],
  },
]

/* ── Helpers ─────────────────────────────────────────────────────  */
async function findOrCreateProduct(item) {
  const existing = await stripe.products.search({
    query: `metadata['shopca_key']:'${item.key}'`, limit: 1,
  }).catch(() => ({ data: [] }))

  if (existing.data.length) {
    console.log(`  ↩️  Produit existant : ${existing.data[0].name} (${existing.data[0].id})`)
    return existing.data[0]
  }

  const product = await stripe.products.create({
    name: item.name, description: item.description,
    metadata: { shopca_key: item.key, mode: item.mode },
  })
  console.log(`  ✅  Produit créé : ${product.name} (${product.id})`)
  return product
}

async function findOrCreatePrice(product, spec) {
  const list = await stripe.prices.list({ product: product.id, currency: spec.currency, active: true, limit: 20 })

  const match = list.data.find(p => {
    if (p.unit_amount !== spec.unit_amount) return false
    if (spec.interval) return p.recurring?.interval === spec.interval
    return p.type === 'one_time'
  })

  if (match) {
    console.log(`    ↩️  Prix existant : ${spec.nickname} (${match.id})`)
    return match
  }

  const priceData = {
    product: product.id,
    unit_amount: spec.unit_amount,
    currency: spec.currency,
    nickname: spec.nickname,
    metadata: { shopca_price_key: spec.key },
  }
  if (spec.interval) priceData.recurring = { interval: spec.interval }

  const price = await stripe.prices.create(priceData)
  console.log(`    ✅  Prix créé : ${spec.nickname} (${price.id})`)
  return price
}

/* ── Main ─────────────────────────────────────────────────────── */
async function main() {
  console.log('🚀  Configuration Stripe SHOPCA — catalogue complet\n')

  const results = {}

  for (const item of CATALOG) {
    console.log(`\n📦  ${item.name}`)
    const product = await findOrCreateProduct(item)

    for (const priceSpec of item.prices) {
      const price = await findOrCreatePrice(product, priceSpec)
      const envKey = `STRIPE_PRICE_${item.key.toUpperCase()}_${priceSpec.key.toUpperCase()}`
      results[envKey] = {
        product_id: product.id,
        price_id: price.id,
        amount: priceSpec.unit_amount,
        currency: priceSpec.currency,
        mode: item.mode,
        interval: priceSpec.interval || 'once',
      }
    }
  }

  /* ── Summary ──────────────────────────────────────────────── */
  console.log('\n\n═══════════════════════════════════════════════════════')
  console.log('  📋  RÉSUMÉ — Price IDs générés\n')

  let newEnv = envContent
  // Remove old stripe price lines first
  newEnv = newEnv.replace(/\nSTRIPE_PRICE_[A-Z0-9_]+=.*/g, '')

  for (const [envKey, val] of Object.entries(results)) {
    const line = `${envKey}=${val.price_id}`
    console.log(`  ${line}  (${val.amount/100} ${val.currency.toUpperCase()} ${val.interval})`)
    newEnv += `\n${line}`
  }

  writeFileSync(envPath, newEnv)
  console.log('\n  ✅  .env mis à jour automatiquement!\n')

  /* ── Supabase secrets command ─────────────────────────────── */
  const secretsArgs = Object.entries(results).map(([k,v]) => `  ${k}=${v.price_id}`).join(' \\\n')
  console.log('  🔐  Commande Supabase secrets :')
  console.log(`\n  npx supabase secrets set \\\n${secretsArgs} \\\n  --project-ref vvjmcrcakmmjuhpbtzbu\n`)
  console.log('═══════════════════════════════════════════════════════\n')
}

main().catch(err => { console.error('❌  Erreur:', err.message); process.exit(1) })
