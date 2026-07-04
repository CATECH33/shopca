/* ============================================================
   SHOPCA Trust Engine — anti-fraud scoring (frontend only)
   Pure functions, no side effects, no backend.
   ============================================================ */

/* Severity weights are subtracted from 100. A "warn" verdict deducts
   half of the weight, a "fail" deducts the full weight. */
export const CHECKS = [
  {
    id: 'price_anomaly',
    label: 'Prix anormal',
    category: 'pricing',
    weight: 20,
    test: (l) => {
      const expected = (l.market_price_per_m2 || 5500) * (l.surface || 50)
      if (!expected || !l.price) return { verdict: 'pass', message: 'Prix non comparé' }
      const dev = Math.abs(l.price - expected) / expected
      const pct = (dev * 100).toFixed(0)
      if (dev > 0.35) return { verdict: 'fail', message: `Prix s'écarte de ${pct}% du marché (estimé ${formatPrice(expected)})` }
      if (dev > 0.20) return { verdict: 'warn', message: `Prix décalé de ${pct}% du marché — à vérifier` }
      return { verdict: 'pass', message: `Prix aligné sur le marché (±${pct}%)` }
    },
  },
  {
    id: 'spam',
    label: 'Spam détecté',
    category: 'content',
    weight: 15,
    test: (l) => {
      const text = (l.description || '').toLowerCase()
      const patterns = [
        'contact whatsapp', 'paiement crypto', 'urgent vente', 'sans visite',
        'western union', 'pas d\'agence', 'paypal famille', 'envoi par dhl',
        'transfert bancaire à l\'étranger', 'envoyez vos coordonnées',
      ]
      const hits = patterns.filter((p) => text.includes(p))
      if (hits.length >= 2) return { verdict: 'fail', message: `${hits.length} expressions à risque : « ${hits.slice(0,2).join(' », « ')} »` }
      if (hits.length === 1) return { verdict: 'warn', message: `Expression suspecte : « ${hits[0]} »` }
      return { verdict: 'pass', message: 'Aucune expression suspecte détectée' }
    },
  },
  {
    id: 'duplicate',
    label: 'Annonce dupliquée',
    category: 'integrity',
    weight: 15,
    test: (l) => {
      const s = l.duplicate_score || 0
      if (s >= 90) return { verdict: 'fail', message: `Similitude ${s}% avec ${l.duplicate_ref || 'une autre annonce'}` }
      if (s >= 70) return { verdict: 'warn', message: `Forte similitude (${s}%) à examiner` }
      return { verdict: 'pass', message: 'Annonce unique sur la plateforme' }
    },
  },
  {
    id: 'photos',
    label: 'Photos suspectes',
    category: 'media',
    weight: 15,
    test: (l) => {
      const flags = l.photo_flags || []
      if (flags.includes('stock')) return { verdict: 'fail', message: 'Photos identifiées comme provenant d\'une banque d\'images' }
      if (flags.includes('watermark')) return { verdict: 'fail', message: 'Watermark détecté — photos volées d\'une autre annonce' }
      if (flags.includes('low_res')) return { verdict: 'warn', message: 'Photos en très basse résolution' }
      if ((l.photo_count || 0) < 3) return { verdict: 'warn', message: `Seulement ${l.photo_count || 0} photo(s) — attendez-vous à 5+` }
      return { verdict: 'pass', message: `${l.photo_count} photos haute qualité validées` }
    },
  },
  {
    id: 'kyc',
    label: 'Vérification du compte',
    category: 'account',
    weight: 20,
    test: (l) => {
      if (!l.account_verified) return { verdict: 'fail', message: 'Compte non vérifié — KYC manquant' }
      if (!l.phone_verified) return { verdict: 'warn', message: 'Téléphone non vérifié' }
      return { verdict: 'pass', message: 'KYC + téléphone validés' }
    },
  },
  {
    id: 'completeness',
    label: 'Complétude de l\'annonce',
    category: 'content',
    weight: 15,
    test: (l) => {
      let s = 0
      if ((l.description || '').length > 200) s += 1
      if ((l.photo_count || 0) >= 5) s += 1
      if (l.surface) s += 1
      if (l.rooms) s += 1
      if (s <= 1) return { verdict: 'fail', message: 'Annonce très incomplète' }
      if (s <= 2) return { verdict: 'warn', message: 'Champs manquants à compléter' }
      return { verdict: 'pass', message: 'Annonce complète et détaillée' }
    },
  },
]

export function scoreListing(listing) {
  const signals = CHECKS.map((c) => ({ id: c.id, label: c.label, category: c.category, weight: c.weight, ...c.test(listing) }))
  const penalty = signals.reduce((sum, s) => sum + (s.verdict === 'fail' ? s.weight : s.verdict === 'warn' ? s.weight * 0.5 : 0), 0)
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)))
  const tier = tierFor(score)
  const recommendation = recommendationFor(tier, signals)
  return { score, tier, signals, recommendation }
}

export function tierFor(score) {
  if (score >= 80) return 'trusted'
  if (score >= 60) return 'watch'
  if (score >= 40) return 'suspicious'
  return 'high-risk'
}

export const TIER_META = {
  trusted:     { label: 'Confiance',     tone: 'emerald', color: '#10B981', shortLabel: 'OK',    badge: 'Vérifié',      icon: 'check'  },
  watch:       { label: 'À surveiller',  tone: 'amber',   color: '#F59E0B', shortLabel: 'Watch', badge: 'À surveiller', icon: 'eye'    },
  suspicious:  { label: 'Suspect',       tone: 'orange',  color: '#FF6B00', shortLabel: 'Risque',badge: 'Suspect',      icon: 'alert'  },
  'high-risk': { label: 'Risque élevé',  tone: 'rose',    color: '#E11D48', shortLabel: 'Block', badge: 'Bloquer',      icon: 'shield' },
}

function recommendationFor(tier, signals) {
  if (tier === 'trusted')   return { action: 'approve',  text: 'Aucune action requise.' }
  if (tier === 'watch')     return { action: 'monitor',  text: 'Mise sous surveillance recommandée.' }
  if (tier === 'suspicious') {
    const fails = signals.filter((s) => s.verdict === 'fail')
    return { action: 'review',  text: `${fails.length} signal${fails.length > 1 ? 's' : ''} bloquant${fails.length > 1 ? 's' : ''} — examen humain requis.` }
  }
  return { action: 'suspend', text: 'Suspension immédiate — fraude probable.' }
}

function formatPrice(n) { return Math.round(n).toLocaleString('fr-FR') + ' €' }

/* ============================================================
   Mock listings dataset (frontend demo)
   ============================================================ */
const u = (id, w = 220) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const MOCK_LISTINGS = [
  {
    id: 'PSM-2410', title: 'Studio cosy lumineux Bastille', city: 'Paris 11ᵉ',
    owner: 'Camille Lefèvre', owner_kind: 'particulier', image_url: u('photo-1502672260266-1c1ef2d93688'),
    price: 320000, surface: 28, rooms: 1, market_price_per_m2: 11200,
    photo_count: 9, photo_flags: [],
    description: 'Magnifique studio entièrement rénové au cœur de Bastille. Parquet d\'origine, hauteur sous plafond exceptionnelle, cuisine équipée et salle d\'eau moderne. Idéal premier achat ou investissement locatif. Charges réduites, immeuble en très bon état avec ravalement récent. À deux pas du métro Bastille.',
    account_verified: true, phone_verified: true, duplicate_score: 12, published_at: '2026-05-10',
  },
  {
    id: 'PSM-2411', title: 'Maison 200 m² Bordeaux NEUVE',  city: 'Bordeaux',
    owner: 'Pierre Martin', owner_kind: 'particulier', image_url: u('photo-1564013799919-ab600027ffc6'),
    price: 220000, surface: 200, rooms: 7, market_price_per_m2: 4800,
    photo_count: 2, photo_flags: ['stock'],
    description: 'Maison à saisir urgent vente. Pas d\'agence. Contact WhatsApp uniquement. Visite après acompte.',
    account_verified: false, phone_verified: false, duplicate_score: 8, published_at: '2026-05-15',
  },
  {
    id: 'PSM-2412', title: 'T3 avec balcon vue dégagée', city: 'Lyon 6ᵉ',
    owner: 'Foncia Premium', owner_kind: 'agence', image_url: u('photo-1560448204-e02f11c3d0e2'),
    price: 485000, surface: 65, rooms: 3, market_price_per_m2: 6900,
    photo_count: 14, photo_flags: [],
    description: 'Au 4ème étage avec ascenseur, ce magnifique T3 traversant offre 65 m² lumineux donnant sur un balcon plein sud avec vue dégagée. Composition : entrée, séjour double avec accès balcon, cuisine indépendante équipée, deux chambres calmes, salle de bains, WC séparés. Cave et place de parking en sous-sol incluses. Copropriété saine, charges 180€/mois. DPE classe C. Coup de cœur garanti.',
    account_verified: true, phone_verified: true, duplicate_score: 18, published_at: '2026-05-12',
  },
  {
    id: 'PSM-2413', title: 'Appartement 50m² Nice centre', city: 'Nice',
    owner: 'inconnu_492', owner_kind: 'particulier', image_url: u('photo-1493809842364-78817add7ffb'),
    price: 95000, surface: 50, rooms: 2, market_price_per_m2: 5400,
    photo_count: 3, photo_flags: ['watermark'],
    description: 'Bel appartement à vendre. Paiement crypto accepté. Pas d\'agence. Envoyez vos coordonnées pour visite.',
    account_verified: false, phone_verified: false, duplicate_score: 94, duplicate_ref: 'PSM-2401', published_at: '2026-05-16',
  },
  {
    id: 'PSM-2414', title: 'Villa contemporaine avec piscine', city: 'Aix-en-Provence',
    owner: 'BARNES Premium', owner_kind: 'agence', image_url: u('photo-1613490493576-7fde63acd811'),
    price: 1850000, surface: 220, rooms: 6, market_price_per_m2: 8400,
    photo_count: 22, photo_flags: [],
    description: 'Magnifique villa contemporaine signée par un architecte renommé, posée sur un terrain de 1 800 m² avec piscine chauffée à débordement, pool house, jardin paysager et garage double. Volumes généreux baignés de lumière naturelle grâce aux baies vitrées coulissantes. 5 chambres dont une suite parentale avec dressing et salle de bains attenante. Cuisine sur-mesure ouverte sur séjour cathédrale. Domotique intégrée, climatisation réversible, alarme. Quartier résidentiel calme et recherché.',
    account_verified: true, phone_verified: true, duplicate_score: 4, published_at: '2026-05-08',
  },
  {
    id: 'PSM-2415', title: 'Coloc design 4ch Nantes', city: 'Nantes',
    owner: 'Thomas Robert', owner_kind: 'particulier', image_url: u('photo-1522708323590-d24dbb6b0267'),
    price: 590, surface: 110, rooms: 4, market_price_per_m2: 4500,
    photo_count: 6, photo_flags: ['low_res'],
    description: 'Colocation 4 chambres dans appartement design entièrement meublé. Espaces communs spacieux, cuisine équipée, salon TV, salle de bain et toilettes séparés. Quartier dynamique proche du centre. Chambre disponible immédiatement.',
    account_verified: true, phone_verified: false, duplicate_score: 22, published_at: '2026-05-14',
  },
  {
    id: 'PSM-2416', title: 'Loft industriel Marseille Joliette', city: 'Marseille',
    owner: 'Engel & Völkers', owner_kind: 'agence', image_url: u('photo-1493809842364-78817add7ffb'),
    price: 690000, surface: 95, rooms: 3, market_price_per_m2: 4200,
    photo_count: 18, photo_flags: [],
    description: 'Rare sur le marché — superbe loft industriel de 95 m² au cœur du nouveau quartier branché de la Joliette. Verrière atelier d\'origine, poutres apparentes, sol béton ciré. Hauteur sous plafond 4,20 m. Cuisine ouverte design, mezzanine bureau, deux espaces nuit. Climatisation réversible, fibre optique. Parking sécurisé en sous-sol. Idéal résidence principale ou pied-à-terre.',
    account_verified: true, phone_verified: true, duplicate_score: 6, published_at: '2026-05-11',
  },
  {
    id: 'PSM-2417', title: 'T2 Toulouse Capitole', city: 'Toulouse',
    owner: 'Inès Martin', owner_kind: 'particulier', image_url: u('photo-1600585154340-be6161a56a0c'),
    price: 245000, surface: 48, rooms: 2, market_price_per_m2: 4200,
    photo_count: 11, photo_flags: [],
    description: 'Charmant T2 de 48 m² au pied du Capitole. Composition : entrée, séjour avec cuisine américaine équipée, chambre calme sur cour, salle d\'eau avec WC. Parquet, moulures, cheminée d\'agrément. Au 2ème étage d\'un immeuble pierre du XIXème siècle. Copropriété saine, charges modérées 95€/mois. Idéal premier achat ou investissement locatif rentable. À 3 minutes à pied du métro.',
    account_verified: true, phone_verified: true, duplicate_score: 11, published_at: '2026-05-13',
  },
  {
    id: 'PSM-2418', title: 'Appartement', city: 'Lille',
    owner: 'fast_seller_22', owner_kind: 'particulier', image_url: u('photo-1554995207-c18c203602cb'),
    price: 89000, surface: 60, rooms: 3, market_price_per_m2: 3580,
    photo_count: 1, photo_flags: ['watermark', 'low_res'],
    description: 'Vente urgente. Western Union accepté. Sans visite préalable.',
    account_verified: false, phone_verified: false, duplicate_score: 76, duplicate_ref: 'PSM-2398', published_at: '2026-05-17',
  },
  {
    id: 'PSM-2419', title: 'Studio étudiant Rennes', city: 'Rennes',
    owner: 'Léa Bernard', owner_kind: 'particulier', image_url: u('photo-1554995207-c18c203602cb'),
    price: 620, surface: 24, rooms: 1, market_price_per_m2: 4000,
    photo_count: 4, photo_flags: [],
    description: 'Studio meublé idéal étudiant à 2 minutes du campus. Lit double, bureau, kitchenette équipée, salle d\'eau. Chauffage compris dans les charges. Disponible dès maintenant.',
    account_verified: true, phone_verified: true, duplicate_score: 9, published_at: '2026-05-09',
  },
]
