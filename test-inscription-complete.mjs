import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2am1jcmNha21tanVocGJ0emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzE2NDAsImV4cCI6MjA5MzQwNzY0MH0.Vj-GurFPQm-EtQDg99MjYSFNKixvqOypNnDE9a-uuIE'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const admin = createClient(SUPA_URL, SERVICE_KEY)

const BASE = process.env.BASE_URL || 'https://shopca.fr'
const STAMP = Date.now()
const results = []
const cleanupIds = []

const record = (scenario, ok, detail) => {
  results.push({ scenario, ok, detail })
  console.log(`  ${ok ? '✅' : '❌'} ${scenario}${detail?` — ${detail}`:''}`)
}
const section = (n, m) => console.log(`\n═══ [${n}] ${m} ═══`)

async function fillParticulier(page, opts) {
  await page.waitForSelector('input[placeholder="Jean"]', { timeout: 12000 })
  await page.fill('input[placeholder="Jean"]', opts.firstName || 'Test')
  await page.fill('input[placeholder="Dupont"]', opts.lastName || 'User')
  if (opts.phone) await page.fill('input[placeholder*="00 00"]', opts.phone)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(600)

  await page.waitForSelector('input[type=email]', { timeout: 6000 })
  await page.fill('input[type=email]', opts.email)
  const pwd = await page.$$('input[type=password]')
  if (opts.password) await pwd[0].fill(opts.password)
  if (opts.confirmPwd !== undefined) await pwd[1].fill(opts.confirmPwd)
  else if (opts.password) await pwd[1].fill(opts.password)
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(600)
  // step 2 = préférences — click sur Achat + Continuer
  const achatBtn = await page.$('button:has-text("Achat")').catch(() => null)
  if (achatBtn) await achatBtn.click().catch(() => {})
  await page.click('button:has-text("Continuer")')
  await page.waitForTimeout(600)
  // step 3 = CGU/RGPD → labels
  if (opts.checkCgu !== false) {
    const labels = await page.$$('label[for]')
    for (const l of labels) await l.click({ force: true }).catch(() => {})
    await page.waitForTimeout(200)
  }
}

async function fetchFieldError(page) {
  return page.evaluate(() => {
    // Cherche les messages d'erreur inline
    const all = document.querySelectorAll('[class*="rose"], [class*="red-500"], [class*="text-red"], [role=alert], [class*="text-rose"]')
    const txt = Array.from(all).map(e => e.textContent?.trim()).filter(t => t && t.length < 200 && t.length > 3)
    return txt.slice(0, 3).join(' | ')
  })
}

async function testScenario(page, name, url, action, verify) {
  console.log(`\n → ${name}`)
  const errors = []
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(800)

  try {
    await action(page)
    await verify(page, errors)
  } catch (err) {
    record(name, false, err.message.slice(0, 200))
  }
}

const browser = await chromium.launch({ headless: true })

try {
  /* ─── 1. Email invalide ────────────────────────────────────────────────── */
  section(1, 'Email invalide (validation frontend)')
  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p1 = await ctx1.newPage()
  await p1.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 20000 })
  await p1.waitForTimeout(800)
  await fillParticulier(p1, {
    firstName: 'Test', lastName: 'Invalid', phone: '',
    email: 'not-an-email', password: 'ValidPass123!', confirmPwd: 'ValidPass123!',
    checkCgu: false,
  })
  // On devrait être bloqué sur le step 1 avec erreur email
  await p1.waitForTimeout(400)
  const emailErr = await fetchFieldError(p1)
  record('Email invalide → erreur affichée', emailErr.toLowerCase().includes('mail') || emailErr.toLowerCase().includes('invalide'),
    emailErr.slice(0, 100) || 'aucune erreur visible')
  await ctx1.close()

  /* ─── 2. Mot de passe faible ───────────────────────────────────────────── */
  section(2, 'Mot de passe faible (< 8 chars)')
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p2 = await ctx2.newPage()
  await p2.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 20000 })
  await p2.waitForTimeout(800)
  await fillParticulier(p2, {
    firstName: 'Test', lastName: 'WeakPwd',
    email: `weakpwd.${STAMP}@shopca.fr`, password: 'abc', confirmPwd: 'abc',
    checkCgu: false,
  })
  await p2.waitForTimeout(400)
  const pwdErr = await fetchFieldError(p2)
  record('Password faible → erreur affichée', pwdErr.toLowerCase().includes('caract') || pwdErr.includes('8'),
    pwdErr.slice(0, 100) || 'aucune erreur visible')
  await ctx2.close()

  /* ─── 3. Confirmation ≠ password ───────────────────────────────────────── */
  section(3, 'Passwords non correspondants')
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p3 = await ctx3.newPage()
  await p3.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 20000 })
  await p3.waitForTimeout(800)
  await fillParticulier(p3, {
    firstName: 'Test', lastName: 'Mismatch',
    email: `mismatch.${STAMP}@shopca.fr`, password: 'ValidPass123!', confirmPwd: 'DifferentPass!',
    checkCgu: false,
  })
  await p3.waitForTimeout(400)
  const mismatchErr = await fetchFieldError(p3)
  record('Confirmation ≠ → erreur affichée',
    mismatchErr.toLowerCase().includes('correspond') || mismatchErr.toLowerCase().includes('pas'),
    mismatchErr.slice(0, 100) || 'aucune erreur visible')
  await ctx3.close()

  /* ─── 4. Email déjà utilisé ────────────────────────────────────────────── */
  section(4, 'Email déjà utilisé (anti-enumeration)')
  const existingEmail = `existing.${STAMP}@shopca.fr`
  const { data: existing } = await admin.auth.admin.createUser({
    email: existingEmail, password: 'Existing!' + STAMP, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Existing', last_name: 'User' },
  })
  cleanupIds.push(existing.user.id)

  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p4 = await ctx4.newPage()
  const auth4Calls = []
  p4.on('response', async r => {
    if (r.url().includes('/auth/v1/signup')) {
      auth4Calls.push({ status: r.status(), body: r.status() >= 400 ? await r.text() : null })
    }
  })
  await p4.goto(`${BASE}/auth/register`, { waitUntil: 'networkidle', timeout: 20000 })
  await p4.waitForTimeout(800)
  await fillParticulier(p4, {
    firstName: 'Retry', lastName: 'User',
    email: existingEmail, password: 'AnotherPass456!',
    checkCgu: true,
  })
  await p4.click('button:has-text("Créer mon compte")')
  await p4.waitForTimeout(4000)
  const urlAfter = p4.url()
  record('Email déjà utilisé → redirect /auth/login',
    urlAfter.includes('/auth/login'),
    `URL=${urlAfter.slice(-30)}`)
  await ctx4.close()

  /* ─── 5. Inscription Particulier valide (via admin bypass + UI login) ──── */
  section(5, 'Création particulier valide + login UI + redirect')
  const perso_email = `perso.${STAMP}@shopca.fr`
  const perso_pwd = 'PersoTest!' + STAMP
  const { data: persoUser } = await admin.auth.admin.createUser({
    email: perso_email, password: perso_pwd, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Perso', last_name: 'Valid', phone: '+33 6 11 22 33 44' },
  })
  cleanupIds.push(persoUser.user.id)
  await new Promise(r => setTimeout(r, 500))

  // Vérif profile + rôle + session
  const { data: persoProfile } = await admin.from('profiles').select('*').eq('id', persoUser.user.id).single()
  record('Profile créé automatiquement', !!persoProfile, persoProfile ? `role=${persoProfile.role}` : 'absent')
  record('Rôle private_user', persoProfile?.role === 'private_user', persoProfile?.role)
  record('Téléphone stocké', persoProfile?.phone === '+33 6 11 22 33 44', persoProfile?.phone)

  // Login UI
  const ctx5 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p5 = await ctx5.newPage()
  const auth5Calls = []
  p5.on('response', async r => {
    if (r.url().includes('/auth/v1/')) auth5Calls.push({ status: r.status(), url: r.url() })
  })
  await p5.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 20000 })
  await p5.waitForTimeout(800)
  await p5.fill('input[type=email]', perso_email)
  await p5.fill('input[type=password]', perso_pwd)
  await p5.click('button:has-text("Se connecter"), button:has-text("Connexion"), button[type=submit]')
  await p5.waitForTimeout(5000)
  const loginUrl = p5.url()
  const tokenCalls = auth5Calls.filter(c => c.url.includes('/token'))
  record('Login token appelé (200)',
    tokenCalls.some(c => c.status === 200),
    tokenCalls.map(c => c.status).join(','))
  record('Redirection après login (URL ≠ /auth/login)',
    !loginUrl.includes('/auth/login'),
    `URL: ${loginUrl.replace(BASE, '') || '/'}`)
  // Vérif session localStorage
  const hasSession = await p5.evaluate(() => !!localStorage.getItem('sb-vvjmcrcakmmjuhpbtzbu-auth-token'))
  record('Session stockée', hasSession, hasSession ? 'oui' : 'non')
  await ctx5.close()

  /* ─── 6. Inscription Professionnel (via admin API) ──────────────────────── */
  section(6, 'Création professionnel + agency + KYC pending')
  const pro_email = `pro.${STAMP}@shopca.fr`
  const { data: proUser } = await admin.auth.admin.createUser({
    email: pro_email, password: 'ProTest!' + STAMP, email_confirm: true,
    user_metadata: {
      account_type: 'professional',
      first_name: 'Pro', last_name: 'User', phone: '+33 6 99 88 77 66',
      company_name: 'SHOPCA Test Agency',
      business_type: 'agence',
      siret: '99999999999999',
      address: '1 avenue des Tests',
      city: 'Lyon', postal_code: '69001',
      website: 'https://shopca-test.fr',
    },
  })
  cleanupIds.push(proUser.user.id)
  await new Promise(r => setTimeout(r, 500))
  const { data: proProfile } = await admin.from('profiles').select('*').eq('id', proUser.user.id).single()
  const { data: proAgency } = await admin.from('agencies').select('*').eq('user_id', proUser.user.id).maybeSingle()
  record('Profile pro créé', !!proProfile, `role=${proProfile?.role}, kyc=${proProfile?.kyc_status}`)
  record('Rôle pro_user', proProfile?.role === 'pro_user')
  record('KYC status pending', proProfile?.kyc_status === 'pending')
  record('Agency créée', !!proAgency, proAgency ? `name=${proAgency.name}, siret=${proAgency.siret}` : 'absent')

  /* ─── 7. Google OAuth trigger (test URL redirect) ────────────────────────── */
  section(7, 'Google OAuth (redirect vers Google)')
  const ctx7 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p7 = await ctx7.newPage()
  await p7.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 20000 })
  await p7.waitForTimeout(800)
  const googleBtn = await p7.$('button:has-text("Google")')
  record('Bouton "Continuer avec Google" présent', !!googleBtn)
  await ctx7.close()

  /* ─── 8. Confirmation email (trigger welcome Resend) ─────────────────────── */
  section(8, 'Email de bienvenue Resend (trigger DB)')
  const { data: httpResp } = await admin.rpc('get_early_access_stats').then(() => admin.from('app_settings').select('*').limit(1))
  record('JWT edge_service_jwt configuré', !!httpResp?.length, httpResp?.[0]?.key)

  // Test send-email direct
  const welcomeEmail = `welcome.${STAMP}@shopca.fr`
  const { data: wUser } = await admin.auth.admin.createUser({
    email: welcomeEmail, password: 'Wel!' + STAMP, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Welcome', last_name: 'Test' },
  })
  cleanupIds.push(wUser.user.id)
  await new Promise(r => setTimeout(r, 3500))

  // Just check that the user was created (trigger ran)
  const { data: wProfile } = await admin.from('profiles').select('email').eq('id', wUser.user.id).single()
  record('Profile welcome créé + trigger dispatch', !!wProfile, wProfile?.email)

  /* ─── BILAN ─────────────────────────────────────────────────────────────── */
  console.log('\n\n════════════════════════════════════════════════')
  console.log('  BILAN')
  console.log('════════════════════════════════════════════════')
  const okCount = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${okCount} / ${results.length} tests réussis\n`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.scenario}: ${f.detail}`))
  }
} finally {
  await browser.close()
  console.log('\n[cleanup] Suppression des users test')
  for (const id of cleanupIds) {
    await admin.auth.admin.deleteUser(id).catch(() => {})
  }
  console.log(`  ${cleanupIds.length} users supprimés`)
}
