import { chromium } from 'playwright'

const BASE = 'https://shopca.fr'

async function testLogin(page, email, password, label) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').first().fill(email)
  await page.locator('input[type="password"]').first().fill(password)
  await page.locator('button[type="submit"]').first().click()
  // Attendre la redirection (max 15s)
  await page.waitForURL(url => !url.href.includes('/auth/login'), { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)
  const url = page.url()
  const ok = !url.includes('/auth/login')
  console.log(`${ok ? '✅' : '❌'} ${label} → ${url}`)
  const errEl = await page.locator('[class*="rose"], [class*="red"], [class*="error"]').first().textContent().catch(() => '')
  if (!ok && errEl) console.log('   Erreur:', errEl.trim())
  return ok
}

async function run() {
  const browser = await chromium.launch({ headless: true })

  // ══ COMPTE 1 — super_admin ═══════════════════════════════════════════
  console.log('\n══ COMPTE 1 : admin@shopca.fr (super_admin) ══')
  const page1 = await browser.newPage()
  const adminOk = await testLogin(page1, 'admin@shopca.fr', 'ShopCAAdmin2026!*', 'admin@shopca.fr')
  await page1.screenshot({ path: 'r1-admin-loggedin.png' })

  if (adminOk) {
    // Chercher le bouton admin dans la navbar (UserChip → onGoAdmin)
    await page1.waitForTimeout(2000)
    const adminBtn = page1.locator('button:has-text("Admin"), a:has-text("Admin"), [data-view="admin"], button[title*="admin" i]').first()
    const btnExists = await adminBtn.count() > 0
    console.log(btnExists ? '✅ Bouton Admin trouvé dans navbar' : '⚠️  Bouton Admin non trouvé (cherche dans menu)')

    // Essayer de cliquer sur le menu utilisateur d'abord
    const userMenu = page1.locator('button:has-text("Profil"), button:has-text("Mon compte"), [aria-label*="user" i], [aria-label*="compte" i]').first()
    if (await userMenu.count() > 0) {
      await userMenu.click()
      await page1.waitForTimeout(500)
    }
    await page1.screenshot({ path: 'r1-admin-menu.png' })

    // Cliquer sur accès admin si disponible
    const adminLink = page1.locator('text=Admin, text=Backoffice, text=Administration, button:has-text("admin")').first()
    if (await adminLink.count() > 0) {
      await adminLink.click()
      await page1.waitForTimeout(2000)
      console.log('✅ Admin view activée')
    }
    await page1.screenshot({ path: 'r1-admin-dashboard.png' })
    const bodyText = await page1.locator('body').innerText().catch(() => '')
    const hasAdmin = /utilisateur|agence|annonce|paiement|revenus|tableau de bord|admin/i.test(bodyText)
    console.log(hasAdmin ? '✅ Contenu admin détecté' : '⚠️  Contenu admin non visible')
  }
  await page1.close()

  // ══ COMPTE 2 — pro_user ══════════════════════════════════════════════
  console.log('\n══ COMPTE 2 : admin-t2@shopca.fr (pro_user) ══')
  const page2 = await browser.newPage()
  const proOk = await testLogin(page2, 'admin-t2@shopca.fr', 'ShopCAAdmin2026!!', 'admin-t2@shopca.fr')
  await page2.screenshot({ path: 'r2-pro-loggedin.png' })
  if (proOk) {
    await page2.goto(`${BASE}/pro`, { waitUntil: 'networkidle' })
    await page2.waitForTimeout(2000)
    const proUrl = page2.url()
    console.log(proUrl.includes('/pro') ? '✅ Dashboard /pro accessible' : `⚠️  URL: ${proUrl}`)
    await page2.screenshot({ path: 'r2-pro-dashboard.png' })
  }
  await page2.close()

  // ══ COMPTE 3 — private_user ══════════════════════════════════════════
  console.log('\n══ COMPTE 3 : admin-t1@shopca.fr (private_user) ══')
  const page3 = await browser.newPage()
  const t1Ok = await testLogin(page3, 'admin-t1@shopca.fr', 'ShopCAAdmin2026**', 'admin-t1@shopca.fr')
  await page3.screenshot({ path: 'r3-t1-loggedin.png' })
  if (t1Ok) {
    await page3.goto(`${BASE}/mon-espace`, { waitUntil: 'networkidle' })
    await page3.waitForTimeout(2000)
    const t1Url = page3.url()
    console.log(t1Url.includes('/mon-espace') ? '✅ Dashboard /mon-espace accessible' : `⚠️  URL: ${t1Url}`)
    await page3.screenshot({ path: 'r3-t1-dashboard.png' })
  }
  await page3.close()

  // ══ RÉSUMÉ ════════════════════════════════════════════════════════════
  console.log('\n══ RÉSUMÉ FINAL ══════════════════════════════════')
  console.log(adminOk ? '✅ Compte 1 (super_admin) — Connexion OK' : '❌ Compte 1 (super_admin) — Connexion FAIL')
  console.log(proOk   ? '✅ Compte 2 (pro_user)    — Connexion OK' : '❌ Compte 2 (pro_user)    — Connexion FAIL')
  console.log(t1Ok    ? '✅ Compte 3 (private_user)— Connexion OK' : '❌ Compte 3 (private_user)— Connexion FAIL')

  await browser.close()
}

run().catch(e => { console.error('ERREUR:', e.message); process.exit(1) })
