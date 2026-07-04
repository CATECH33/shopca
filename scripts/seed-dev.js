#!/usr/bin/env node
/**
 * Dev seed — creates three test accounts with profiles, agency, subscriptions and listings.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (never commit this key).
 *
 * Usage:
 *   npm run seed
 */

'use strict'

const { createClient } = require('@supabase/supabase-js')
const fs   = require('fs')
const path = require('path')

// ── Load .env manually (no dotenv dep needed) ────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] ??= rest.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
}
loadEnv()

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Fixed UUIDs (deterministic re-seeding) ───────────────────────────────────
const IDS = {
  superAdmin: 'b8000001-0000-4000-8000-000000000001',
  pro:        'b8000002-0000-4000-8000-000000000002',
  private:    'b8000003-0000-4000-8000-000000000003',
}

const ACCOUNTS = [
  {
    id: IDS.superAdmin,
    email:    'admin@shopca.fr',
    password: 'ShopCAAdmin2026!*',
    role:     'super_admin',
    meta: { account_type: 'personal', first_name: 'Alexandre', last_name: 'Moreau', phone: '+33612000001', onboarded: true },
  },
  {
    id: IDS.pro,
    email:    'admin-t2@shopca.fr',
    password: 'ShopCAAdmin2026!!',
    role:     'pro_user',
    meta: {
      account_type: 'professional', first_name: 'Isabelle', last_name: 'Fontaine',
      phone: '+33698000002', company_name: 'Groupe Immobilier Vauban',
      business_type: 'agence', siret: '82341267800012',
      address: '14 Place Bellecour', city: 'Lyon', postal_code: '69002',
      website: 'https://vauban-immo.fr', onboarded: true,
    },
  },
  {
    id: IDS.private,
    email:    'admin-t1@shopca.fr',
    password: 'ShopCAAdmin2026**',
    role:     'private_user',
    meta: { account_type: 'personal', first_name: 'Sophie', last_name: 'Legrand', phone: '+33655000003', preferences: ['achat','location'], onboarded: true },
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
async function deleteExisting() {
  const emails = ACCOUNTS.map(a => a.email)
  // Delete auth users — cascades to profiles; agencies deleted separately
  for (const a of ACCOUNTS) {
    const { data } = await admin.auth.admin.listUsers()
    const existing = data?.users?.find(u => u.email === a.email)
    if (existing) {
      await admin.auth.admin.deleteUser(existing.id)
      console.log(`  deleted auth user ${a.email}`)
    }
  }
  await admin.from('users').delete().in('email', emails)
}

async function createAuthUser(account) {
  const { data, error } = await admin.auth.admin.createUser({
    user_id:        account.id,
    email:          account.email,
    password:       account.password,
    email_confirm:  true,
    user_metadata:  account.meta,
  })
  if (error) throw new Error(`createUser ${account.email}: ${error.message}`)
  return data.user
}

async function seedProfiles() {
  await admin.from('profiles').update({ role: 'super_admin', kyc_status: 'approved' }).eq('id', IDS.superAdmin)
  await admin.from('profiles').update({ role: 'pro_user',    kyc_status: 'approved' }).eq('id', IDS.pro)
  await admin.from('profiles').update({ role: 'private_user', preferences: ['achat','location'] }).eq('id', IDS.private)
}

async function seedAgency() {
  await admin.from('agencies').update({
    name: 'Groupe Immobilier Vauban', business_type: 'agence',
    siret: '82341267800012', address: '14 Place Bellecour',
    city: 'Lyon', postal_code: '69002',
    phone: '+33478901234', email: 'contact@vauban-immo.fr',
    website: 'https://vauban-immo.fr',
    plan: 'premium', status: 'approved', agent_count: 8,
    show_phone: true, receive_leads: true,
    approved_at: new Date().toISOString(),
  }).eq('user_id', IDS.pro)
}

async function seedPublicUsers() {
  await admin.from('users').upsert([
    { id: IDS.superAdmin, email: 'admin@shopca.fr',    phone: '+33612000001', type: 'professionnel', is_verified: true },
    { id: IDS.pro,        email: 'admin-t2@shopca.fr', phone: '+33698000002', type: 'professionnel', is_verified: true },
    { id: IDS.private,    email: 'admin-t1@shopca.fr', phone: '+33655000003', type: 'particulier',   is_verified: true },
  ], { onConflict: 'id' })
}

async function seedSubscriptions() {
  await admin.from('subscriptions').delete().in('user_id', [IDS.pro, IDS.private])
  const now = new Date()
  const months = (n) => new Date(now.getFullYear(), now.getMonth() + n, now.getDate()).toISOString()
  await admin.from('subscriptions').insert([
    { user_id: IDS.pro,     plan: 'premium', price: 4900, start_date: months(-3), end_date: months(9),  status: 'active' },
    { user_id: IDS.private, plan: 'basic',   price:  990, start_date: months(-1), end_date: months(11), status: 'active' },
  ])
}

async function seedListings() {
  await admin.from('listings').delete().in('user_id', [IDS.pro, IDS.private])
  const ago = (days) => new Date(Date.now() - days * 86400000).toISOString()
  const future = (days) => new Date(Date.now() + days * 86400000).toISOString()
  await admin.from('listings').insert([
    // Pro — for sale
    { title: 'Appartement T3 lumineux – Lyon 6ème',         description: 'Superbe appartement de 75m² en plein cœur du 6ème. Séjour traversant, cuisine équipée, 2 chambres, parquet chêne. Cave et parking inclus.',        price: 385000, city: 'Lyon',        district: '6ème arrondissement', property_type: 'appartement', transaction_type: 'vente',    type: 'acheter',    surface: 75,  rooms: 3, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: true,  status: 'active', trust_score: 98, trust_tier: 'trusted', views_count: 247, contacts_count: 18, lat: 45.7676, lng: 4.8343, market_price_m2: 5130, premium_until: future(30), created_at: ago(12) },
    { title: 'Maison de ville avec jardin – Lyon 5ème',      description: 'Belle maison de ville de 145m² sur 3 niveaux. Cuisine ouverte, salon cathédrale, 4 chambres, terrasse et jardin privatif 180m². Quartier Saint-Jean.', price: 695000, city: 'Lyon',        district: '5ème arrondissement', property_type: 'maison',       transaction_type: 'vente',    type: 'acheter',    surface: 145, rooms: 5, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: true,  status: 'active', trust_score: 97, trust_tier: 'trusted', views_count: 312, contacts_count: 24, lat: 45.7598, lng: 4.8224, market_price_m2: 4790, premium_until: future(30), created_at: ago(20) },
    { title: 'Grand T4 Brotteaux – Immeuble haussmannien',   description: 'Appartement T4 de 98m² avec hauts plafonds, moulures, parquet point de Hongrie. Double séjour, 3 chambres. Quartier Brotteaux, commerces à pied.',  price: 525000, city: 'Lyon',        district: 'Brotteaux',           property_type: 'appartement', transaction_type: 'vente',    type: 'acheter',    surface: 98,  rooms: 4, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: true,  status: 'active', trust_score: 99, trust_tier: 'trusted', views_count: 198, contacts_count: 15, lat: 45.7686, lng: 4.8460, market_price_m2: 5360, premium_until: future(30), created_at: ago(15) },
    { title: 'Loft architecture contemporaine – Confluence',  description: 'Loft atypique de 115m² quartier Confluence. Double hauteur, baies vitrées, mezzanine, cuisine îlot central. Immeuble BBC, parking double.',          price: 620000, city: 'Lyon',        district: 'Confluence',          property_type: 'appartement', transaction_type: 'vente',    type: 'acheter',    surface: 115, rooms: 3, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: true,  status: 'active', trust_score: 98, trust_tier: 'trusted', views_count: 421, contacts_count: 31, lat: 45.7440, lng: 4.8182, market_price_m2: 5390, premium_until: future(30), created_at: ago(25) },
    // Pro — for rent
    { title: 'Studio meublé – Lyon 2ème Bellecour',           description: 'Studio entièrement meublé de 28m² à deux pas de la Place Bellecour. Idéal étudiant ou jeune actif. Charges comprises, disponible immédiatement.',     price: 750,    city: 'Lyon',        district: '2ème arrondissement', property_type: 'studio',       transaction_type: 'location', type: 'louer',      surface: 28,  rooms: 1, furnished: true,  user_id: IDS.pro,     is_verified: true,  is_premium: false, status: 'active', trust_score: 95, trust_tier: 'trusted', views_count: 189, contacts_count: 12, lat: 45.7558, lng: 4.8320, market_price_m2: 26800, created_at: ago(8)  },
    { title: 'T2 refait à neuf – Lyon 3ème Part-Dieu',        description: 'Appartement T2 de 42m² entièrement rénové. Cuisine équipée ouverte, salle de bain moderne, parquet. À 5 min de la gare Part-Dieu.',                   price: 920,    city: 'Lyon',        district: '3ème arrondissement', property_type: 'appartement', transaction_type: 'location', type: 'louer',      surface: 42,  rooms: 2, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: false, status: 'active', trust_score: 96, trust_tier: 'trusted', views_count: 143, contacts_count: 9,  lat: 45.7607, lng: 4.8598, market_price_m2: 21900, created_at: ago(5)  },
    { title: 'Studio meublé proche métro Jean Macé',           description: 'Studio meublé de 25m² à 3 min du métro Jean Macé. Tout équipé, internet inclus. Parfait étudiant.',                                                     price: 680,    city: 'Lyon',        district: '7ème arrondissement', property_type: 'studio',       transaction_type: 'location', type: 'louer',      surface: 25,  rooms: 1, furnished: true,  user_id: IDS.pro,     is_verified: true,  is_premium: false, status: 'active', trust_score: 94, trust_tier: 'trusted', views_count: 267, contacts_count: 21, lat: 45.7403, lng: 4.8362, market_price_m2: 27200, created_at: ago(3)  },
    { title: 'T2 avec balcon sud – Villeurbanne Gratte-Ciel',  description: 'Appartement T2 de 48m² avec balcon plein sud. Cuisine aménagée, chambre avec dressing, salle de bain rénovée. Proche tramway T1.',                    price: 870,    city: 'Villeurbanne', district: 'Gratte-Ciel',          property_type: 'appartement', transaction_type: 'location', type: 'louer',      surface: 48,  rooms: 2, furnished: false, user_id: IDS.pro,     is_verified: true,  is_premium: false, status: 'active', trust_score: 93, trust_tier: 'trusted', views_count: 156, contacts_count: 11, lat: 45.7676, lng: 4.8805, market_price_m2: 20400, created_at: ago(7)  },
    // Private — colocation & rental
    { title: 'Chambre meublée en colocation – Lyon 8ème',     description: 'Chambre meublée de 14m² dans T4 en colocation. Salon commun, cuisine équipée. Ambiance sympa, quartier Monplaisir, proche tramway T2.',               price: 550,    city: 'Lyon',        district: '8ème arrondissement', property_type: 'appartement', transaction_type: 'colocation','type': 'colocation', surface: 14, rooms: 1, furnished: true, user_id: IDS.private, is_verified: false, is_premium: false, status: 'active', trust_score: 88, trust_tier: 'trusted', views_count: 73, contacts_count: 5, lat: 45.7368, lng: 4.8651, created_at: ago(2) },
    { title: 'T2 calme et lumineux – Lyon 9ème Vaise',         description: 'Appartement T2 de 38m² au 3ème étage. Séjour avec cuisine ouverte, chambre, cave. Quartier Vaise en plein essor, proche métro D.',                     price: 780,    city: 'Lyon',        district: '9ème arrondissement', property_type: 'appartement', transaction_type: 'location', type: 'louer',      surface: 38,  rooms: 2, furnished: false, user_id: IDS.private, is_verified: false, is_premium: false, status: 'active', trust_score: 90, trust_tier: 'trusted', views_count: 94, contacts_count: 7, lat: 45.7794, lng: 4.8046, created_at: ago(4)  },
  ])
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding development accounts…\n')

  console.log('  Cleaning up existing seed accounts…')
  await deleteExisting()

  console.log('  Creating auth users…')
  for (const account of ACCOUNTS) {
    await createAuthUser(account)
    console.log(`  ✓ ${account.email} (${account.role})`)
  }

  console.log('  Updating profiles & agency…')
  await seedProfiles()
  await seedAgency()

  console.log('  Inserting public.users…')
  await seedPublicUsers()

  console.log('  Inserting subscriptions…')
  await seedSubscriptions()

  console.log('  Inserting listings…')
  await seedListings()

  console.log('\n✅ Seed complete.\n')
  console.log('  admin@shopca.fr      → super_admin   / ShopCAAdmin2026!*')
  console.log('  admin-t2@shopca.fr   → pro_user      / ShopCAAdmin2026!!')
  console.log('  admin-t1@shopca.fr   → private_user  / ShopCAAdmin2026**')
}

main().catch(err => { console.error(err); process.exit(1) })
