// ── Données villes ────────────────────────────────────────────────────────────
export const VILLES = [
  { slug: 'paris',              nom: 'Paris',              region: 'Île-de-France',             dept: '75', pop: 2161000 },
  { slug: 'lyon',               nom: 'Lyon',               region: 'Auvergne-Rhône-Alpes',      dept: '69', pop: 522000  },
  { slug: 'marseille',          nom: 'Marseille',           region: 'Provence-Alpes-Côte d\'Azur', dept: '13', pop: 870000 },
  { slug: 'bordeaux',           nom: 'Bordeaux',            region: 'Nouvelle-Aquitaine',         dept: '33', pop: 257000  },
  { slug: 'toulouse',           nom: 'Toulouse',            region: 'Occitanie',                  dept: '31', pop: 471000  },
  { slug: 'nice',               nom: 'Nice',                region: 'Provence-Alpes-Côte d\'Azur', dept: '06', pop: 342000 },
  { slug: 'nantes',             nom: 'Nantes',              region: 'Pays de la Loire',           dept: '44', pop: 314000  },
  { slug: 'strasbourg',         nom: 'Strasbourg',          region: 'Grand Est',                  dept: '67', pop: 285000  },
  { slug: 'montpellier',        nom: 'Montpellier',         region: 'Occitanie',                  dept: '34', pop: 290000  },
  { slug: 'lille',              nom: 'Lille',               region: 'Hauts-de-France',            dept: '59', pop: 233000  },
  { slug: 'rennes',             nom: 'Rennes',              region: 'Bretagne',                   dept: '35', pop: 217000  },
  { slug: 'grenoble',           nom: 'Grenoble',            region: 'Auvergne-Rhône-Alpes',      dept: '38', pop: 158000  },
  { slug: 'toulon',             nom: 'Toulon',              region: 'Provence-Alpes-Côte d\'Azur', dept: '83', pop: 171000 },
  { slug: 'aix-en-provence',    nom: 'Aix-en-Provence',     region: 'Provence-Alpes-Côte d\'Azur', dept: '13', pop: 142000 },
  { slug: 'angers',             nom: 'Angers',              region: 'Pays de la Loire',           dept: '49', pop: 155000  },
  { slug: 'brest',              nom: 'Brest',               region: 'Bretagne',                   dept: '29', pop: 142000  },
  { slug: 'dijon',              nom: 'Dijon',               region: 'Bourgogne-Franche-Comté',    dept: '21', pop: 157000  },
  { slug: 'nimes',              nom: 'Nîmes',               region: 'Occitanie',                  dept: '30', pop: 151000  },
  { slug: 'le-havre',           nom: 'Le Havre',            region: 'Normandie',                  dept: '76', pop: 175000  },
  { slug: 'reims',              nom: 'Reims',               region: 'Grand Est',                  dept: '51', pop: 184000  },
  { slug: 'rouen',              nom: 'Rouen',               region: 'Normandie',                  dept: '76', pop: 112000  },
  { slug: 'tours',              nom: 'Tours',               region: 'Centre-Val de Loire',        dept: '37', pop: 136000  },
  { slug: 'metz',               nom: 'Metz',                region: 'Grand Est',                  dept: '57', pop: 118000  },
  { slug: 'clermont-ferrand',   nom: 'Clermont-Ferrand',    region: 'Auvergne-Rhône-Alpes',      dept: '63', pop: 147000  },
  { slug: 'perpignan',          nom: 'Perpignan',           region: 'Occitanie',                  dept: '66', pop: 122000  },
  { slug: 'caen',               nom: 'Caen',                region: 'Normandie',                  dept: '14', pop: 108000  },
  { slug: 'nancy',              nom: 'Nancy',               region: 'Grand Est',                  dept: '54', pop: 104000  },
  { slug: 'orleans',            nom: 'Orléans',             region: 'Centre-Val de Loire',        dept: '45', pop: 115000  },
  { slug: 'limoges',            nom: 'Limoges',             region: 'Nouvelle-Aquitaine',         dept: '87', pop: 130000  },
  { slug: 'poitiers',           nom: 'Poitiers',            region: 'Nouvelle-Aquitaine',         dept: '86', pop: 90000   },
]

export function getVille(slug) {
  return VILLES.find(v => v.slug === slug) ?? null
}

// ── Types de biens ────────────────────────────────────────────────────────────
export const TYPES_BIENS = {
  maison:       { label: 'maison',       labelPluriel: 'maisons',        icon: '🏠' },
  appartement:  { label: 'appartement',  labelPluriel: 'appartements',   icon: '🏢' },
  terrain:      { label: 'terrain',      labelPluriel: 'terrains',       icon: '🏗️' },
  local:        { label: 'local commercial', labelPluriel: 'locaux commerciaux', icon: '🏪' },
}

// ── SEO helpers ───────────────────────────────────────────────────────────────
const BASE_URL = 'https://shopca.fr'

export function canonicalUrl(path) {
  return `${BASE_URL}${path}`
}

export function ogImageUrl(path = '/og-default.png') {
  return `${BASE_URL}${path}`
}

// ── Titres & descriptions dynamiques ─────────────────────────────────────────
export function seoAcheter(ville) {
  if (!ville) return {
    title: 'Acheter un bien immobilier en France | SHOPCA',
    description: 'Trouvez votre bien immobilier à acheter en France. Maisons, appartements, terrains. +10 000 annonces vérifiées sur SHOPCA.',
    keywords: 'acheter immobilier France, achat maison France, achat appartement France',
  }
  return {
    title: `Acheter un bien immobilier à ${ville.nom} (${ville.dept}) | SHOPCA`,
    description: `Découvrez ${ville.nom > 0 ? 'les' : 'les'} annonces immobilières à vendre à ${ville.nom}. Maisons, appartements, terrains en ${ville.region}. Trouvez votre bien idéal sur SHOPCA.`,
    keywords: `acheter immobilier ${ville.nom}, achat maison ${ville.nom}, achat appartement ${ville.nom}, immobilier ${ville.nom} ${ville.dept}`,
  }
}

export function seoLouer(ville) {
  if (!ville) return {
    title: 'Location immobilière en France | SHOPCA',
    description: 'Trouvez votre logement à louer en France. Maisons, appartements meublés et non meublés. +5 000 annonces de location sur SHOPCA.',
    keywords: 'location immobilier France, louer maison France, louer appartement France',
  }
  return {
    title: `Location immobilière à ${ville.nom} (${ville.dept}) | SHOPCA`,
    description: `Toutes les annonces de location à ${ville.nom}. Appartements, maisons, studios à louer en ${ville.region}. Trouvez rapidement votre prochain logement.`,
    keywords: `location ${ville.nom}, louer appartement ${ville.nom}, louer maison ${ville.nom}, location ${ville.dept}`,
  }
}

export function seoAgences(ville) {
  if (!ville) return {
    title: 'Agences immobilières en France | SHOPCA',
    description: 'Trouvez les meilleures agences immobilières en France. Agences certifiées, notées et vérifiées sur SHOPCA.',
    keywords: 'agence immobilière France, meilleures agences immobilières',
  }
  return {
    title: `Agences immobilières à ${ville.nom} | SHOPCA`,
    description: `Liste des agences immobilières à ${ville.nom} et ses alentours. Agences certifiées SHOPCA en ${ville.region}. Comparez, contactez et trouvez votre partenaire immobilier.`,
    keywords: `agence immobilière ${ville.nom}, agences immo ${ville.nom}, ${ville.nom} immobilier agence`,
  }
}

export function seoTypeVille(mode, type, ville) {
  const modeLabel = mode === 'acheter' ? 'Achat' : 'Location'
  const actionLabel = mode === 'acheter' ? 'acheter' : 'louer'
  const bien = TYPES_BIENS[type]
  if (!bien || !ville) return { title: 'SHOPCA Immobilier', description: '', keywords: '' }
  return {
    title: `${modeLabel} ${bien.labelPluriel} à ${ville.nom} (${ville.dept}) | SHOPCA`,
    description: `${bien.labelPluriel.charAt(0).toUpperCase() + bien.labelPluriel.slice(1)} à ${actionLabel} à ${ville.nom}. ${modeLabel} de ${bien.label} en ${ville.region} — comparez les offres sur SHOPCA.`,
    keywords: `${actionLabel} ${bien.label} ${ville.nom}, ${bien.labelPluriel} ${ville.nom}, ${bien.label} ${mode} ${ville.dept}`,
  }
}

// ── Schema.org ────────────────────────────────────────────────────────────────
export function schemaBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  }
}

export function schemaOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'SHOPCA',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Plateforme immobilière premium en France — achat, location, agences.',
    areaServed: { '@type': 'Country', name: 'France' },
    sameAs: [],
  }
}

export function schemaFaq(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function schemaRealEstateListing(listing) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${BASE_URL}/annonces/${listing.id}`,
    image: listing.photos?.[0] ?? undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressCountry: 'FR',
    },
  }
}
