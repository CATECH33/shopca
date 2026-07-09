import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const results = []
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`  ${ok?'✅':'❌'} ${name}${detail?' — '+detail:''}`) }
const step = (n, m) => console.log(`\n═══ [${n}] ${m} ═══`)

const STAMP = Date.now()
const cleanup = []

try {
  /* ─── 1. RLS profiles sécurisé (anon lit rien) ────────────────────────── */
  step(1, 'RLS profiles — anon bloqué')
  const anon = createClient(SUPA_URL, ANON_KEY)
  const { data: anonProfiles, error: anonErr } = await anon.from('profiles').select('id, email').limit(5)
  rec('anon ne peut PAS lire profiles', (anonProfiles?.length ?? 0) === 0, `${anonProfiles?.length || 0} rows`)
  const { data: anonPub } = await anon.from('public_profiles').select('id, first_name').limit(5)
  rec('anon PEUT lire public_profiles', (anonPub?.length ?? 0) > 0, `${anonPub?.length || 0} rows`)

  /* ─── 2. Signup particulier → auth + profile + role ───────────────────── */
  step(2, 'Signup particulier + trigger handle_new_user')
  const persoEmail = `audit.perso.${STAMP}@shopca.fr`
  const persoPwd = 'AuditTest!' + STAMP
  const { data: persoU } = await admin.auth.admin.createUser({
    email: persoEmail, password: persoPwd, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Audit', last_name: 'Perso', phone: '+33 6 11 22 33 44' },
  })
  cleanup.push(persoU.user.id)
  await new Promise(r => setTimeout(r, 800))
  const { data: persoP } = await admin.from('profiles').select('*').eq('id', persoU.user.id).single()
  rec('Profile créé', !!persoP)
  rec('Rôle private_user', persoP?.role === 'private_user', persoP?.role)
  rec('email/first_name/phone transférés',
    persoP?.email === persoEmail && persoP?.first_name === 'Audit' && persoP?.phone === '+33 6 11 22 33 44')

  /* ─── 3. Sign-in particulier — session créée ──────────────────────────── */
  step(3, 'Sign-in email + password')
  const persoClient = createClient(SUPA_URL, ANON_KEY)
  const { data: signInData, error: signInErr } = await persoClient.auth.signInWithPassword({
    email: persoEmail, password: persoPwd,
  })
  rec('signIn 200 + session', !signInErr && !!signInData?.session, signInErr?.message || 'OK')
  const accessToken = signInData?.session?.access_token
  rec('access_token JWT présent', !!accessToken && accessToken.length > 50)

  /* ─── 4. User connecté peut lire son profile ──────────────────────────── */
  step(4, 'RLS profiles — user connecté')
  const { data: ownProfile } = await persoClient.from('profiles').select('*').eq('id', persoU.user.id).single()
  rec('User connecté lit son propre profile', !!ownProfile, ownProfile?.email)
  // Il ne doit PAS pouvoir lire un autre profile
  const otherIdx = cleanup.length > 1 ? cleanup[0] : 'e9df3a09-dbf9-479a-ba69-5d5de7b9355f'
  const { data: otherProfile } = await persoClient.from('profiles').select('email').eq('id', otherIdx).maybeSingle()
  rec('User NE peut PAS lire un autre profile', !otherProfile, otherProfile ? 'FUITE' : 'bloqué')

  /* ─── 5. Password reset flow ──────────────────────────────────────────── */
  step(5, 'Reset password (resetPasswordForEmail)')
  const { error: rstErr } = await persoClient.auth.resetPasswordForEmail(persoEmail, {
    redirectTo: 'https://shopca.fr/auth/reset',
  })
  rec('resetPasswordForEmail sans erreur',
    !rstErr || /rate|only|too many/i.test(rstErr?.message || ''),
    rstErr?.message || 'OK')

  /* ─── 6. Update password (user connecté) ──────────────────────────────── */
  step(6, 'Update password via updateUser')
  const newPwd = 'AuditNewPwd!' + STAMP
  const { error: updErr } = await persoClient.auth.updateUser({ password: newPwd })
  rec('updateUser password OK', !updErr, updErr?.message || 'OK')

  // Re-sign in avec nouveau password
  const reClient = createClient(SUPA_URL, ANON_KEY)
  const { data: reSignIn, error: reSignErr } = await reClient.auth.signInWithPassword({
    email: persoEmail, password: newPwd,
  })
  rec('Sign-in avec nouveau password', !reSignErr && !!reSignIn?.session, reSignErr?.message || 'OK')

  /* ─── 7. Signout (local + global) ─────────────────────────────────────── */
  step(7, 'Sign-out local')
  const { error: soErr } = await reClient.auth.signOut()
  rec('signOut sans erreur', !soErr)
  // Vérifier que le token est invalidé
  const { data: sess } = await reClient.auth.getSession()
  rec('Session locale supprimée', !sess?.session, sess?.session ? 'present' : 'null')

  /* ─── 8. Signup professionnel → agency + role ─────────────────────────── */
  step(8, 'Signup professionnel + agency')
  const proEmail = `audit.pro.${STAMP}@shopca.fr`
  const { data: proU } = await admin.auth.admin.createUser({
    email: proEmail, password: 'ProTest!' + STAMP, email_confirm: true,
    user_metadata: {
      account_type: 'professional', first_name: 'AuditPro', last_name: 'User',
      phone: '+33 6 55 44 33 22', company_name: 'Audit Corp',
      business_type: 'agence', siret: '11122233344455',
      address: '1 rue Audit', city: 'Lyon', postal_code: '69001',
    },
  })
  cleanup.push(proU.user.id)
  await new Promise(r => setTimeout(r, 800))
  const { data: proP } = await admin.from('profiles').select('role, kyc_status').eq('id', proU.user.id).single()
  const { data: proA } = await admin.from('agencies').select('name, siret').eq('user_id', proU.user.id).maybeSingle()
  rec('Rôle pro_user', proP?.role === 'pro_user')
  rec('KYC pending', proP?.kyc_status === 'pending')
  rec('Agency créée avec siret', proA?.siret === '11122233344455')

  /* ─── 9. Elévation de privilèges bloquée ──────────────────────────────── */
  step(9, 'Empêcher elévation de rôle (trigger prevent_role_escalation)')
  const persoClient2 = createClient(SUPA_URL, ANON_KEY)
  await persoClient2.auth.signInWithPassword({ email: persoEmail, password: newPwd })
  const { error: escErr } = await persoClient2.from('profiles').update({ role: 'platform_owner' }).eq('id', persoU.user.id)
  rec('User ne peut PAS s\'auto-promouvoir', !!escErr, escErr?.message?.slice(0, 80) || 'FAIL (aucune erreur)')

  /* ─── 10. Google OAuth actif ──────────────────────────────────────────── */
  step(10, 'Google OAuth (redirect vers Google)')
  const res = await fetch(`${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fshopca.fr%2Fauth%2Fcallback`, {
    redirect: 'manual',
  })
  const loc = res.headers.get('location') || ''
  rec('OAuth Google redirect vers accounts.google.com', loc.includes('accounts.google.com'), loc.slice(0, 60))
  rec('OAuth Google client_id configuré', /client_id=[^&]+/.test(loc))

  /* ─── 11. Frontend production sans erreur config ──────────────────────── */
  step(11, 'Frontend production sans erreur config Supabase')
  const browser = await chromium.launch({ headless: true })
  const p = await browser.newPage()
  const errors = []
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  for (const path of ['/auth/register', '/auth/login', '/auth/forgot', '/auth/logout']) {
    await p.goto(`https://shopca.fr${path}`, { waitUntil: 'networkidle', timeout: 20000 })
    await p.waitForTimeout(600)
    const err = await p.evaluate(() => document.body.innerText.match(/CONFIGURATION SUPABASE|placeholder|absent du fichier/i)?.[0])
    rec(`${path} sans erreur config`, !err, err || 'OK')
  }
  await browser.close()

  /* ─── 12. Edge functions actives ──────────────────────────────────────── */
  step(12, 'Edge functions actives')
  const fns = ['create-checkout-session','verify-checkout-session','stripe-webhook','stripe-portal','send-email']
  for (const f of fns) {
    const r = await fetch(`${SUPA_URL}/functions/v1/${f}`, { method: 'OPTIONS' })
    rec(`${f} répond`, r.status < 500, `${r.status}`)
  }

  /* ─── BILAN ───────────────────────────────────────────────────────────── */
  console.log('\n\n════════════════════════════════════════════════')
  console.log('  BILAN AUDIT AUTHENTIFICATION')
  console.log('════════════════════════════════════════════════')
  const ok = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${ok} / ${results.length} vérifications OK`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('\n  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.name}: ${f.detail}`))
  }
} finally {
  console.log('\n[cleanup] Suppression users test')
  for (const id of cleanup) await admin.auth.admin.deleteUser(id).catch(() => {})
}
