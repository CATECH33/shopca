import { createClient } from '@supabase/supabase-js'
const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = createClient(SUPA_URL, SERVICE_KEY)

const STAMP = Date.now()
const results = []
const log = (name, ok, detail) => { console.log(`  ${ok ? '✅' : '❌'} ${name}${detail?` (${detail})`:''}`); results.push({ name, ok, detail }) }
const step = (n, m) => console.log(`\n[${n}] ${m}`)

const tests = [
  {
    label: 'Particulier — signup complet',
    email: `test.perso.${STAMP}@shopca.fr`,
    metadata: {
      account_type: 'personal',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '+33 6 12 34 56 78',
      preferences: ['achat', 'location'],
      email_opt_in: true,
    },
    expected: { role: 'private_user', kyc_status: 'none' },
  },
  {
    label: 'Professionnel — signup complet',
    email: `test.pro.${STAMP}@shopca.fr`,
    metadata: {
      account_type: 'professional',
      first_name: 'Marie',
      last_name: 'Martin',
      phone: '+33 6 98 76 54 32',
      company_name: 'Immobilier Martin & Co',
      business_type: 'agence',
      siret: '12345678901234',
      address: '10 rue de la République',
      city: 'Paris',
      postal_code: '75001',
      website: 'https://immobilier-martin.fr',
      show_phone: true,
      receive_leads: true,
      whatsapp: false,
    },
    expected: { role: 'pro_user', kyc_status: 'pending', has_agency: true },
  },
]

const createdIds = []

try {
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    step(i + 1, t.label)

    // 1. Create user via admin (bypass rate limit + email confirm)
    const { data: created, error } = await admin.auth.admin.createUser({
      email: t.email,
      password: 'ShopcaTest!' + STAMP,
      email_confirm: true,
      user_metadata: t.metadata,
    })
    if (error) { log('createUser', false, error.message); continue }
    createdIds.push(created.user.id)
    log('User auth créé', true, `id=${created.user.id.slice(0,8)}…`)

    // Wait for trigger to run
    await new Promise(r => setTimeout(r, 800))

    // 2. Verify profile created by trigger
    const { data: profile } = await admin.from('profiles').select('*').eq('id', created.user.id).single()
    if (!profile) { log('Profile créé par trigger', false, 'profile absent'); continue }
    log('Profile créé par trigger', true, `role=${profile.role}, account_type=${profile.account_type}`)

    // 3. Verify role
    log('Rôle attribué', profile.role === t.expected.role, `attendu=${t.expected.role}, réel=${profile.role}`)

    // 4. Verify KYC status
    log('KYC status', profile.kyc_status === t.expected.kyc_status, `attendu=${t.expected.kyc_status}, réel=${profile.kyc_status}`)

    // 5. Verify metadata fields transferred
    log('first_name', profile.first_name === t.metadata.first_name, profile.first_name)
    log('last_name', profile.last_name === t.metadata.last_name, profile.last_name)
    log('phone', profile.phone === t.metadata.phone, profile.phone)
    log('email', profile.email === t.email, profile.email)

    if (t.expected.has_agency) {
      // 6. Verify agency created
      const { data: agency } = await admin.from('agencies').select('*').eq('user_id', created.user.id).maybeSingle()
      if (!agency) { log('Agency créée', false, 'agency absent'); continue }
      log('Agency créée', true, `name=${agency.name}`)
      log('agency.siret', agency.siret === t.metadata.siret, agency.siret)
      log('agency.business_type', agency.business_type === t.metadata.business_type, agency.business_type)
      log('agency.city', agency.city === t.metadata.city, agency.city)
      log('agency.postal_code', agency.postal_code === t.metadata.postal_code, agency.postal_code)
      log('agency.website', agency.website === t.metadata.website, agency.website)
      log('agency.show_phone', agency.show_phone === t.metadata.show_phone, String(agency.show_phone))
      log('agency.receive_leads', agency.receive_leads === t.metadata.receive_leads, String(agency.receive_leads))
    }

    // 7. Test signIn with the new password
    const anonClient = createClient(SUPA_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE')
    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: t.email,
      password: 'ShopcaTest!' + STAMP,
    })
    log('Sign-in avec password', !signInErr && !!signInData.session, signInErr?.message || 'session ok')
  }

  step('BILAN', 'Résumé')
  const okCount = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${okCount} / ${results.length} tests passés`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('\n  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.name}: ${f.detail}`))
  }
} finally {
  // Cleanup
  console.log('\n[cleanup] Suppression des users test')
  for (const id of createdIds) {
    await admin.auth.admin.deleteUser(id).catch(() => {})
    console.log(`  supprimé: ${id.slice(0,8)}…`)
  }
}
