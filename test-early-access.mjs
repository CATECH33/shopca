import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'

const BASE = 'http://localhost:5173'
const URL  = `${BASE}/early-access`
const OUT  = 'C:/Users/JK/pasmal/test-early-access-screenshots'
await mkdir(OUT, { recursive: true })

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 390,  height: 844 },
]

const browser = await chromium.launch({ headless: true })

const globalFindings = []

for (const vp of VIEWPORTS) {
  console.log(`\n================================================`)
  console.log(`  ${vp.name.toUpperCase()} — ${vp.width}×${vp.height}`)
  console.log(`================================================\n`)

  const ctx     = await browser.newContext({ viewport: vp })
  const page    = await ctx.newPage()
  const errors  = []
  const warnings = []
  const findings = []

  page.on('console',   m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('console',   m => { if (m.type() === 'warning') warnings.push(m.text()) })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))

  const ok   = (msg) => console.log(`  ✅ ${msg}`)
  const warn = (msg) => { console.log(`  ⚠️  ${msg}`); findings.push(`[${vp.name}] ${msg}`) }
  const info = (msg) => console.log(`  ℹ️  ${msg}`)
  let stepN = 0
  const step = (label) => { stepN++; console.log(`\n[${stepN}] ${label}`) }

  step('Chargement /early-access')
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(1500) // laisse le temps à Supabase de répondre
  await page.screenshot({ path: `${OUT}/${vp.name}-01-initial.png`, fullPage: false })
  info(`Titre: "${await page.title()}"`)
  const h1 = await page.$('h1'); const h1txt = h1 ? await h1.textContent() : null
  info(`H1: "${h1txt?.trim()}"`)
  if (h1txt?.includes('annonces en premier')) ok('H1 correct')
  else warn(`H1 inattendu: ${h1txt}`)

  step('Débordement horizontal')
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    html: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  if (overflow.body <= 2 && overflow.html <= 2) ok('Pas de débordement horizontal')
  else warn(`Débordement: body +${overflow.body}px html +${overflow.html}px`)

  step('Compteurs stats (vraies données)')
  await page.waitForSelector('[data-testid=hero-stats]', { timeout: 5000 })
  const statsTxt = await page.$eval('[data-testid=hero-stats]', el => el.textContent)
  info(`Stats: ${statsTxt.trim().replace(/\s+/g, ' ')}`)
  const listingsCount = parseInt(statsTxt.match(/(\d+)\s*Annonces disponibles/)?.[1] || '0', 10)
  if (listingsCount > 0) ok(`Compteur "Annonces disponibles" = ${listingsCount} (chargé depuis Supabase)`)
  else warn(`Compteur "Annonces disponibles" = 0 — la RPC a peut-être échoué`)

  step('Grille annonces chargée (data réelle)')
  await page.waitForSelector('[data-testid=listings-grid], [data-testid=early-card]', { timeout: 10000 }).catch(() => {})
  const cards = await page.$$('[data-testid=early-card]')
  info(`Cartes rendues: ${cards.length}`)
  if (cards.length >= 6) ok(`${cards.length} cartes early access chargées`)
  else warn(`Seulement ${cards.length} cartes chargées (attendu ≥ 6)`)

  step('Filtres — Maisons')
  const houseBtn = await page.$('[data-testid=filter-house]')
  if (!houseBtn) { warn('Bouton filter-house introuvable') }
  else {
    await houseBtn.click()
    await page.waitForTimeout(600)
    const afterFilter = await page.$$('[data-testid=early-card]')
    info(`Après filtre "Maisons": ${afterFilter.length} cartes`)
    if (afterFilter.length >= 1 && afterFilter.length < cards.length) ok('Filtre Maisons applique bien un sous-ensemble')
    else if (afterFilter.length === 0) warn('Filtre Maisons vide (aucune house dans le seed)')
    else warn(`Filtre Maisons ne restreint pas (${afterFilter.length} vs ${cards.length})`)
    await page.screenshot({ path: `${OUT}/${vp.name}-02-filter-house.png`, fullPage: false })
  }

  step('Filtres — Retour Toutes')
  const allBtn = await page.$('[data-testid=filter-all]')
  if (allBtn) {
    await allBtn.click()
    await page.waitForTimeout(400)
    const reset = await page.$$('[data-testid=early-card]')
    if (reset.length === cards.length) ok(`Retour "Toutes" restaure ${reset.length} cartes`)
    else warn(`Retour "Toutes" donne ${reset.length} vs initial ${cards.length}`)
  }

  step('Overlay Premium (non-connecté) présent sur les cartes')
  const locks = await page.$$('[data-testid=premium-lock-btn]')
  info(`Overlays premium: ${locks.length}`)
  if (locks.length >= 6) ok('Cartes verrouillées par PremiumLock')
  else warn(`Overlays trouvés: ${locks.length}`)

  step('Toggle démo (topbar) — bascule Premium visuel')
  const demoToggle = vp.width >= 640 ? await page.$('[data-testid=demo-toggle]') : null
  if (demoToggle) {
    await demoToggle.click()
    await page.waitForTimeout(500)
    const locksAfter = await page.$$('[data-testid=premium-lock-btn]')
    if (locksAfter.length === 0) ok('Toggle démo débloque toutes les cartes')
    else warn(`${locksAfter.length} overlays restent après démo Premium`)
    await page.screenshot({ path: `${OUT}/${vp.name}-03-demo-premium.png`, fullPage: false })

    step('Cartes cliquables (mode Premium)')
    const link = await page.$('[data-testid=card-link]')
    if (link) {
      const href = await link.getAttribute('href')
      if (href?.startsWith('/annonces/')) ok(`Cartes routent vers ${href.slice(0, 30)}…`)
      else warn(`Href suspect: ${href}`)
    } else warn('Aucun overlay Link trouvé sur les cartes premium')

    step('Toggle SMS/WhatsApp visible (Premium)')
    const smsBtn = await page.$('[data-testid=toggle-sms]')
    const waBtn  = await page.$('[data-testid=toggle-wa]')
    if (smsBtn && waBtn) ok('Toggles SMS + WhatsApp présents')
    else warn(`Toggles SMS=${!!smsBtn} WA=${!!waBtn}`)

    // Reset démo
    await demoToggle.click()
    await page.waitForTimeout(300)
  } else {
    info('Toggle démo masqué (viewport mobile) — testé sur desktop/tablet')
  }

  step('Boutons principaux — présence & href')
  const checks = [
    { id: 'topbar-back',       type: 'link',   attr: '/'          },
    { id: 'topbar-upgrade',    type: 'button' },
    { id: 'status-bar-upgrade', type: 'button' },
    { id: 'unlock-cta',        type: 'button' },
    { id: 'see-offers',        type: 'link',   attr: '/tarifs'    },
    { id: 'bottom-cta',        type: 'button' },
    { id: 'bottom-back',       type: 'link',   attr: '/annonces'  },
  ]
  for (const c of checks) {
    const el = await page.$(`[data-testid=${c.id}]`)
    if (!el) { warn(`Bouton "${c.id}" introuvable`); continue }
    if (c.type === 'link') {
      const href = await el.getAttribute('href')
      if (href === c.attr) ok(`${c.id} → ${href}`)
      else warn(`${c.id} href=${href} (attendu ${c.attr})`)
    } else {
      ok(`${c.id} présent (button)`)
    }
  }

  step('Filtre Investissement')
  const investBtn = await page.$('[data-testid=filter-invest]')
  if (investBtn) {
    await investBtn.click()
    await page.waitForTimeout(400)
    const invCards = await page.$$('[data-testid=early-card]')
    info(`Cartes "Investissement": ${invCards.length}`)
    ok('Filtre invest exécuté sans erreur')
  }

  step('Filtre Appartements')
  const aptBtn = await page.$('[data-testid=filter-apt]')
  if (aptBtn) {
    await aptBtn.click()
    await page.waitForTimeout(400)
    const aptCards = await page.$$('[data-testid=early-card]')
    info(`Cartes "Appartements": ${aptCards.length}`)
    if (aptCards.length >= 1) ok('Filtre appartements affiche des résultats')
    else warn('Filtre appartements vide')
  }

  step('Scroll fullpage screenshot')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${vp.name}-04-fullpage.png`, fullPage: true })

  step('Erreurs console')
  if (errors.length === 0) ok('Aucune erreur console')
  else {
    warn(`${errors.length} erreurs console`)
    errors.forEach(e => console.log(`     ↳ ${e.slice(0, 120)}`))
  }
  if (warnings.length) {
    info(`Warnings: ${warnings.length}`)
    warnings.slice(0, 3).forEach(w => console.log(`     ↳ ${w.slice(0, 120)}`))
  }

  console.log(`\n──── ${vp.name} : ${findings.length} problèmes ────`)
  globalFindings.push(...findings)
  await ctx.close()
}

await browser.close()

console.log(`\n================================================`)
console.log(`  BILAN`)
console.log(`================================================`)
if (globalFindings.length === 0) {
  console.log('  ✅ Aucun problème détecté sur les 3 viewports')
} else {
  console.log(`  ⚠️  ${globalFindings.length} findings :`)
  globalFindings.forEach(f => console.log(`   - ${f}`))
}
console.log(`\nScreenshots : ${OUT}`)
