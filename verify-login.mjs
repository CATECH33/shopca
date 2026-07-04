import { chromium } from 'playwright'

const BASE = 'https://shopca.fr'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  console.log('\n── 1. Chargement page de connexion ──')
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
  console.log('URL:', page.url())
  console.log('Titre:', await page.title())

  await page.screenshot({ path: 'verify-01-login-page.png' })
  console.log('Screenshot: verify-01-login-page.png')

  console.log('\n── 2. Remplissage formulaire ──')
  // Chercher le champ email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first()
  await emailInput.fill('admin@shopca.fr')
  console.log('Email rempli: admin@shopca.fr')

  const pwdInput = page.locator('input[type="password"]').first()
  await pwdInput.fill('ShopCAAdmin2026!*')
  console.log('Mot de passe rempli')

  await page.screenshot({ path: 'verify-02-form-filled.png' })

  console.log('\n── 3. Soumission du formulaire ──')
  // Cliquer le bouton submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")').first()
  console.log('Bouton trouvé:', await submitBtn.textContent())
  await submitBtn.click()

  // Attendre navigation ou changement d'URL
  await page.waitForTimeout(3000)
  console.log('URL après submit:', page.url())

  await page.screenshot({ path: 'verify-03-after-submit.png' })

  // Vérifier si on est redirigé
  const finalUrl = page.url()
  if (finalUrl.includes('/admin')) {
    console.log('✅ REDIRECTION ADMIN CONFIRMÉE:', finalUrl)
  } else if (finalUrl.includes('/auth/login')) {
    // Chercher un message d'erreur
    const errText = await page.locator('.text-red, .text-rose, [class*="error"], [class*="Error"]').first().textContent().catch(() => '')
    console.log('⚠️  Toujours sur login. Erreur visible:', errText || '(aucune)')
  } else {
    console.log('ℹ️  URL finale:', finalUrl)
  }

  console.log('\n── 4. État de la page finale ──')
  await page.waitForTimeout(2000)
  const finalTitle = await page.title()
  console.log('Titre final:', finalTitle)
  await page.screenshot({ path: 'verify-04-final.png' })
  console.log('Screenshot: verify-04-final.png')

  // Vérifier les éléments admin visibles
  const adminElements = await page.locator('text=super_admin, text=Admin, text=Dashboard, nav').count()
  console.log('Éléments admin détectés:', adminElements)

  await browser.close()
  console.log('\n✅ Test terminé')
}

run().catch(e => { console.error('ERREUR:', e.message); process.exit(1) })
