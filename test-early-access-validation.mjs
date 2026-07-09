import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const URL  = `${BASE}/early-access`
const OUT  = 'C:/Users/JK/pasmal/test-early-access-validation'
await mkdir(OUT, { recursive: true })

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'tablet',  width: 768,  height: 1024, mobile: false },
  { name: 'mobile',  width: 390,  height: 844,  mobile: true  },
]

const browser = await chromium.launch({ headless: true })
const problems = []
const stats = {}

for (const vp of VIEWPORTS) {
  console.log(`\n═══════════════════════════════════════`)
  console.log(`  ${vp.name.toUpperCase()} ${vp.width}×${vp.height}`)
  console.log(`═══════════════════════════════════════\n`)

  const ctx = await browser.newContext({
    viewport: vp,
    userAgent: vp.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      : undefined,
  })
  const page = await ctx.newPage()

  const errors = []
  const warnings = []
  const requests = { total: 0, failed: 0, byType: {} }
  const s = { start: Date.now() }

  page.on('console', m => {
    if (m.type() === 'error')   errors.push(m.text())
    if (m.type() === 'warning') warnings.push(m.text())
  })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', r => { requests.failed++; problems.push(`[${vp.name}] Request failed: ${r.url()}`) })
  page.on('response', r => {
    requests.total++
    const t = r.request().resourceType()
    requests.byType[t] = (requests.byType[t] || 0) + 1
    if (r.status() >= 400) problems.push(`[${vp.name}] HTTP ${r.status()}: ${r.url()}`)
  })

  const ok = (msg) => console.log(`  ✅ ${msg}`)
  const bad = (msg) => { console.log(`  ❌ ${msg}`); problems.push(`[${vp.name}] ${msg}`) }
  const info = (msg) => console.log(`  ℹ️  ${msg}`)
  const warn = (msg) => console.log(`  ⚠️  ${msg}`)

  /* ── 1. LOAD PERFORMANCE ─────────────────────────────────────── */
  console.log('[1] Chargement + métriques performance')
  const t0 = Date.now()
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  s.load = Date.now() - t0
  s.timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    if (!nav) return null
    return {
      ttfb: Math.round(nav.responseStart - nav.startTime),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
    }
  })
  const paint = await page.evaluate(() => {
    const p = performance.getEntriesByType('paint')
    const fcp = p.find(e => e.name === 'first-contentful-paint')?.startTime
    const fp  = p.find(e => e.name === 'first-paint')?.startTime
    return { fp: fp ? Math.round(fp) : null, fcp: fcp ? Math.round(fcp) : null }
  })
  info(`Wall clock: ${s.load}ms · TTFB: ${s.timing?.ttfb}ms · DCL: ${s.timing?.domContentLoaded}ms`)
  info(`FirstPaint: ${paint.fp}ms · FirstContentfulPaint: ${paint.fcp}ms`)
  if (s.load < 3000) ok(`Load < 3s (${s.load}ms)`)
  else bad(`Load > 3s (${s.load}ms)`)

  await page.screenshot({ path: `${OUT}/${vp.name}-01-loaded.png`, fullPage: false })

  /* ── 2. HORIZONTAL OVERFLOW ──────────────────────────────────── */
  console.log('\n[2] Débordement horizontal')
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    html: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  if (overflow.body <= 2 && overflow.html <= 2) ok('Aucun débordement horizontal')
  else bad(`Débordement: body +${overflow.body}px html +${overflow.html}px`)

  /* ── 3. SEO ──────────────────────────────────────────────────── */
  console.log('\n[3] SEO')
  const title = await page.title()
  const desc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null)
  const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null)
  const og = await page.$$eval('meta[property^="og:"]', els => els.length).catch(() => 0)
  info(`Title: "${title}"`)
  info(`Description: ${desc ? `"${desc.slice(0, 60)}…"` : 'MISSING'}`)
  info(`Canonical: ${canonical || 'MISSING'}`)
  info(`OG tags: ${og}`)
  if (title.includes('SHOPCA')) ok('Title contient SHOPCA')
  else bad('Title ne contient pas SHOPCA')
  if (desc && desc.length > 50) ok('Meta description OK')
  else bad('Meta description manquante/trop courte')
  if (canonical) ok('Canonical défini')
  else bad('Canonical manquant')

  /* ── 4. LISTINGS RÉELS DEPUIS SUPABASE ───────────────────────── */
  console.log('\n[4] Chargement listings + stats depuis Supabase')
  await page.waitForSelector('[data-testid=early-card]', { timeout: 10000 }).catch(() => {})
  const cards = await page.$$('[data-testid=early-card]')
  const heroStats = await page.$eval('[data-testid=hero-stats]', el => el.textContent.replace(/\s+/g, ' ').trim())
  info(`Cartes: ${cards.length} · Stats: ${heroStats.slice(0, 80)}`)
  if (cards.length >= 6) ok(`${cards.length} vraies annonces chargées (Supabase)`)
  else bad(`Seulement ${cards.length} annonces (attendu ≥ 6)`)
  const statsCount = parseInt(heroStats.match(/(\d+)\s*Annonces disponibles/)?.[1] || '0', 10)
  if (statsCount > 0) ok(`Compteur stats = ${statsCount} (RPC OK)`)
  else bad('Compteur stats = 0 (RPC échoue ou pas de data)')

  /* ── 5. FILTRES CATÉGORIES ───────────────────────────────────── */
  console.log('\n[5] Filtres catégories')
  const catCounts = {}
  for (const key of ['apt', 'house', 'invest', 'all']) {
    await page.click(`[data-testid=filter-${key}]`).catch(() => {})
    await page.waitForTimeout(1000) // laisse Framer terminer l'exit animation
    // Ne compte que les cartes visibles (opacity > 0.5)
    catCounts[key] = await page.$$eval('[data-testid=early-card]', els =>
      els.filter(e => parseFloat(getComputedStyle(e.closest('[style*=opacity]') || e).opacity) > 0.5).length
    )
  }
  info(`Appartements: ${catCounts.apt} · Maisons: ${catCounts.house} · Invest: ${catCounts.invest} · Toutes: ${catCounts.all}`)
  const filterOk = catCounts.all > catCounts.house && catCounts.all > catCounts.apt && catCounts.all > catCounts.invest
                && (catCounts.apt + catCounts.house + catCounts.invest) === catCounts.all
  if (filterOk) ok('Filtres restreignent correctement (somme = total)')
  else bad(`Filtres cassés: apt=${catCounts.apt}+house=${catCounts.house}+invest=${catCounts.invest}≠all=${catCounts.all}`)

  /* ── 6. BOUTONS PRINCIPAUX ───────────────────────────────────── */
  console.log('\n[6] Boutons principaux')
  const btns = [
    { id: 'topbar-back',        type: 'link',    href: '/'          },
    { id: 'topbar-upgrade',     type: 'button' },
    { id: 'status-bar-upgrade', type: 'button' },
    { id: 'unlock-cta',         type: 'button' },
    { id: 'see-offers',         type: 'link',    href: '/tarifs'    },
    { id: 'bottom-cta',         type: 'button' },
    { id: 'bottom-back',        type: 'link',    href: '/annonces'  },
  ]
  for (const b of btns) {
    const el = await page.$(`[data-testid=${b.id}]`)
    if (!el) { bad(`Bouton "${b.id}" introuvable`); continue }
    if (b.type === 'link') {
      const href = await el.getAttribute('href')
      if (href === b.href) ok(`${b.id} → ${href}`)
      else bad(`${b.id} href=${href} (attendu ${b.href})`)
    } else {
      const disabled = await el.isDisabled().catch(() => false)
      if (disabled) bad(`${b.id} est disabled`)
      else ok(`${b.id} actif`)
    }
  }

  /* ── 7. MODE PREMIUM (démo) ──────────────────────────────────── */
  console.log('\n[7] Toggle démo Premium + cartes cliquables')
  if (vp.width >= 640) {
    await page.click('[data-testid=demo-toggle]')
    await page.waitForTimeout(500)
    const locksAfter = await page.$$('[data-testid=premium-lock-btn]')
    if (locksAfter.length === 0) ok('Toggle démo débloque toutes les cartes')
    else bad(`${locksAfter.length} overlays restent après démo`)

    // Cartes cliquables → /annonces/:uuid
    const link = await page.$('[data-testid=card-link]')
    if (link) {
      const href = await link.getAttribute('href')
      if (href?.startsWith('/annonces/') && href.length > 15) ok(`Cartes → ${href.slice(0, 40)}…`)
      else bad(`Href suspect: ${href}`)
    } else bad('Aucun overlay Link sur les cartes')

    // Toggles SMS/WA
    const smsBtn = await page.$('[data-testid=toggle-sms]')
    const waBtn  = await page.$('[data-testid=toggle-wa]')
    if (smsBtn && waBtn) ok('Toggles SMS + WhatsApp présents')
    else bad(`Toggles SMS=${!!smsBtn} WA=${!!waBtn}`)

    // Aria roles
    if (smsBtn) {
      const role = await smsBtn.getAttribute('role')
      const checked = await smsBtn.getAttribute('aria-checked')
      if (role === 'switch' && checked !== null) ok(`SMS switch a11y OK (aria-checked=${checked})`)
      else bad(`SMS switch a11y manquant`)
    }

    // Reset
    await page.click('[data-testid=demo-toggle]')
    await page.waitForTimeout(300)
  } else {
    info('Toggle démo masqué en mobile (attendu)')
  }

  /* ── 8. ANIMATIONS ───────────────────────────────────────────── */
  console.log('\n[8] Animations Framer Motion')
  const motionRefs = await page.evaluate(() => document.querySelectorAll('[style*="opacity"]').length)
  info(`Éléments avec animation opacity: ${motionRefs}`)
  if (motionRefs > 5) ok('Animations Framer présentes')
  else warn('Peu d\'animations détectées')

  /* ── 9. IMAGES ────────────────────────────────────────────────── */
  console.log('\n[9] Images')
  const brokenImages = await page.$$eval('img', imgs =>
    imgs.filter(img => img.naturalWidth === 0).map(img => img.src)
  )
  info(`Images totales: ${(await page.$$('img')).length}`)
  if (brokenImages.length === 0) ok('Aucune image cassée')
  else bad(`${brokenImages.length} images cassées: ${brokenImages.slice(0,2).join(', ')}`)

  /* ── 10. ACCESSIBILITÉ CLAVIER ───────────────────────────────── */
  console.log('\n[10] Accessibilité clavier (tab focus)')
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  info(`Premier focus après tab: <${focused}>`)
  if (['A', 'BUTTON', 'INPUT'].includes(focused)) ok('Tab focus fonctionnel')
  else bad(`Tab focus atterit sur <${focused}>`)

  /* ── 11. FULLPAGE SCREENSHOT ─────────────────────────────────── */
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${vp.name}-02-fullpage.png`, fullPage: true })

  /* ── 12. CONSOLE ERRORS ──────────────────────────────────────── */
  console.log('\n[11] Erreurs console / réseau')
  if (errors.length === 0) ok('Aucune erreur console')
  else { bad(`${errors.length} erreurs console`); errors.slice(0, 5).forEach(e => console.log(`     ↳ ${e.slice(0, 120)}`)) }
  info(`Requêtes: ${requests.total} · Échouées: ${requests.failed}`)
  if (requests.failed === 0) ok('Aucune requête échouée')
  else bad(`${requests.failed} requêtes échouées`)

  stats[vp.name] = { ...s, paint, errors: errors.length, warnings: warnings.length, requests, catCounts, cardCount: cards.length }
  await ctx.close()
}

await browser.close()

/* ── SAVE STATS ─────────────────────────────────────────────────── */
await writeFile(`${OUT}/stats.json`, JSON.stringify(stats, null, 2))

/* ── SUMMARY ────────────────────────────────────────────────────── */
console.log(`\n═══════════════════════════════════════`)
console.log(`  BILAN GLOBAL`)
console.log(`═══════════════════════════════════════\n`)
for (const [vp, s] of Object.entries(stats)) {
  console.log(`  ${vp.padEnd(8)} load=${s.load}ms · FCP=${s.paint?.fcp}ms · errors=${s.errors} · reqs=${s.requests.total}/${s.requests.failed}f`)
}
console.log(`\n  Problèmes détectés total: ${problems.length}`)
if (problems.length) problems.slice(0, 20).forEach(p => console.log(`   - ${p}`))
console.log(`\n  Screenshots: ${OUT}`)
