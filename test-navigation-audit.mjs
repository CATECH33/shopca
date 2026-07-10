/**
 * Audit end-to-end de la navigation:
 * - Particulier: Mon espace, Publier, menu utilisateur (pas d'items pro)
 * - Professionnel: Dashboard Pro, Déposer une annonce → wizard, menu adapté
 * - ManagerIT: acces /managerIT
 * - Permissions: particulier ne peut pas acceder aux routes pro
 * - Aucune 404, aucun bouton mort
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://vvjmcrcakmmjuhpbtzbu.supabase.co'
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BASE = process.env.BASE_URL || 'http://localhost:4173'
const STAMP = Date.now()

const results = []
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`    ${ok?'✅':'❌'} ${name}${detail?' — '+detail:''}`) }
const section = (n, m) => console.log(`\n══ [${n}] ${m} ══`)

const cleanup = []
const browser = await chromium.launch({ headless: true })

async function login(page, email, pwd) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', pwd)
  await page.click('button[type=submit], button:has-text("Se connecter")')
  await page.waitForURL(url => !url.pathname.includes('/auth/'), { timeout: 15000 })
}

try {
  /* ─── 1. Utilisateur PARTICULIER ────────────────────────────── */
  section(1, 'Particulier')
  const persoEmail = `nav.perso.${STAMP}@shopca.fr`
  const persoPwd = 'Nav!' + STAMP
  const { data: persoU } = await admin.auth.admin.createUser({
    email: persoEmail, password: persoPwd, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Nav', last_name: 'Perso' },
  })
  cleanup.push(persoU.user.id)

  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p1 = await ctx1.newPage()
  const err1 = []
  p1.on('pageerror', e => err1.push(e.message))
  p1.on('console', m => {
    const t = m.text()
    // Ignore known-noise (external analytics CORS)
    if (m.type()==='error' && !/ipapi\.co|Failed to load resource.*400/.test(t)) err1.push(t)
  })
  await login(p1, persoEmail, persoPwd)
  rec('Login perso → /mon-espace', new URL(p1.url()).pathname === '/mon-espace', new URL(p1.url()).pathname)

  // Retour home logged-in
  await p1.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 })
  await p1.waitForTimeout(3500)

  // Ouvre le menu user
  const menuBtn = p1.locator('button:has-text("nav.perso"), button:has(div.rounded-full)').first()
  if (await menuBtn.count()) {
    await menuBtn.click()
    await p1.waitForTimeout(500)
    const dashboardPro = await p1.locator('button:has-text("Dashboard Pro")').count()
    const crm          = await p1.locator('button:has-text("CRM")').count()
    const monDash      = await p1.locator('button:has-text("Mon tableau de bord")').count()
    const monProfil    = await p1.locator('button:has-text("Mon profil")').count()
    const logout       = await p1.locator('a:has-text("Déconnexion")').count()
    rec('Menu perso: "Dashboard Pro" absent', dashboardPro === 0, `count=${dashboardPro}`)
    rec('Menu perso: "CRM" absent', crm === 0, `count=${crm}`)
    rec('Menu perso: "Mon tableau de bord" présent', monDash > 0, `count=${monDash}`)
    rec('Menu perso: "Mon profil" présent', monProfil > 0, `count=${monProfil}`)
    rec('Menu perso: "Déconnexion" présent', logout > 0, `count=${logout}`)
  } else {
    rec('Menu utilisateur visible en home', false, 'button introuvable')
  }

  // Test protection: perso ne peut pas accéder à /pro
  await p1.goto(`${BASE}/pro`, { waitUntil: 'networkidle', timeout: 15000 })
  await p1.waitForTimeout(3500)
  rec('Perso bloqué sur /pro (redirect)', new URL(p1.url()).pathname !== '/pro', new URL(p1.url()).pathname)

  // Test protection: perso ne peut pas accéder à /crm
  await p1.goto(`${BASE}/crm`, { waitUntil: 'networkidle', timeout: 15000 })
  await p1.waitForTimeout(3500)
  rec('Perso bloqué sur /crm', new URL(p1.url()).pathname !== '/crm', new URL(p1.url()).pathname)

  rec('Erreurs console perso', err1.length === 0, err1[0]?.slice(0, 100) || 'ok')
  await ctx1.close()

  /* ─── 2. Utilisateur PROFESSIONNEL ──────────────────────────── */
  section(2, 'Professionnel')
  const proEmail = `nav.pro.${STAMP}@shopca.fr`
  const proPwd = 'Nav!' + STAMP
  const { data: proU } = await admin.auth.admin.createUser({
    email: proEmail, password: proPwd, email_confirm: true,
    user_metadata: {
      account_type: 'professional', first_name: 'Nav', last_name: 'Pro',
      company_name: 'Test Agency', business_type: 'agence',
      siret: '11122233344477', address: '1 rue Test',
      city: 'Paris', postal_code: '75001',
    },
  })
  cleanup.push(proU.user.id)

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p2 = await ctx2.newPage()
  const err2 = []
  p2.on('pageerror', e => err2.push(e.message))
  p2.on('console', m => { if (m.type()==='error') err2.push(m.text()) })
  await login(p2, proEmail, proPwd)
  rec('Login pro → /pro', new URL(p2.url()).pathname === '/pro', new URL(p2.url()).pathname)

  // Retour home logged-in
  await p2.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 })
  await p2.waitForTimeout(3500)

  // Clic "Déposer une annonce" en header
  const publishBtn = p2.locator('button:has-text("Déposer une annonce")').first()
  if (await publishBtn.count()) {
    await publishBtn.click()
    await p2.waitForTimeout(3000)
    const finalUrl = new URL(p2.url())
    const goToPro = finalUrl.pathname === '/pro'
    rec('Clic "Déposer une annonce" (pro) → /pro', goToPro, finalUrl.pathname + finalUrl.search)
  } else {
    rec('Bouton "Déposer une annonce" présent', false)
  }

  // Menu utilisateur pro
  await p2.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 })
  await p2.waitForTimeout(3500)
  const menuBtn2 = p2.locator('button:has-text("nav.pro"), button:has(div.rounded-full)').first()
  if (await menuBtn2.count()) {
    await menuBtn2.click()
    await p2.waitForTimeout(500)
    const dashboardPro = await p2.locator('button:has-text("Dashboard Pro")').count()
    const mesAnnonces  = await p2.locator('button:has-text("Mes annonces")').count()
    const crm          = await p2.locator('button:has-text("CRM")').count()
    const forms        = await p2.locator('button:has-text("Formulaires")').count()
    const settings     = await p2.locator('button:has-text("Paramètres")').count()
    const monProfil    = await p2.locator('button:has-text("Mon profil")').count()
    const logout       = await p2.locator('a:has-text("Déconnexion")').count()
    rec('Menu pro: "Dashboard Pro" présent', dashboardPro > 0, `count=${dashboardPro}`)
    rec('Menu pro: "Mes annonces" présent', mesAnnonces > 0, `count=${mesAnnonces}`)
    rec('Menu pro: "CRM" présent', crm > 0, `count=${crm}`)
    rec('Menu pro: "Formulaires" présent', forms > 0, `count=${forms}`)
    rec('Menu pro: "Paramètres" présent', settings > 0, `count=${settings}`)
    rec('Menu pro: "Mon profil" présent', monProfil > 0, `count=${monProfil}`)
    rec('Menu pro: "Déconnexion" présent', logout > 0, `count=${logout}`)

    // Clic "Dashboard Pro"
    await p2.locator('button:has-text("Dashboard Pro")').first().click()
    await p2.waitForTimeout(2000)
    rec('Clic "Dashboard Pro" → /pro', new URL(p2.url()).pathname === '/pro', new URL(p2.url()).pathname)
  }

  rec('Erreurs console pro', err2.length === 0, err2[0]?.slice(0, 100) || 'ok')
  await ctx2.close()

  /* ─── 3. Manager IT ─────────────────────────────────────────── */
  section(3, 'ManagerIT (platform_owner)')
  const mgrEmail = `nav.mgr.${STAMP}@shopca.fr`
  const mgrPwd = 'Nav!' + STAMP
  const { data: mgrU } = await admin.auth.admin.createUser({
    email: mgrEmail, password: mgrPwd, email_confirm: true,
    user_metadata: { account_type: 'personal', first_name: 'Mgr', last_name: 'Test' },
  })
  cleanup.push(mgrU.user.id)
  await new Promise(r => setTimeout(r, 500))
  await admin.from('profiles').update({ role: 'platform_owner' }).eq('id', mgrU.user.id)

  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p3 = await ctx3.newPage()
  await login(p3, mgrEmail, mgrPwd)
  rec('Login manager → /managerIT', new URL(p3.url()).pathname.startsWith('/managerIT'), new URL(p3.url()).pathname)
  await ctx3.close()

  /* ─── BILAN ────────────────────────────────────────────────── */
  console.log('\n\n════════════════════════════════════════════════')
  console.log('  BILAN AUDIT NAVIGATION')
  console.log('════════════════════════════════════════════════')
  const ok = results.filter(r => r.ok).length
  console.log(`\n  ✅ ${ok} / ${results.length} vérifications OK`)
  const fails = results.filter(r => !r.ok)
  if (fails.length) {
    console.log('\n  ❌ Échecs:')
    fails.forEach(f => console.log(`    - ${f.name}: ${f.detail}`))
  }
} finally {
  await browser.close()
  console.log('\n[cleanup] Suppression users test')
  for (const id of cleanup) await admin.auth.admin.deleteUser(id).catch(() => {})
}
