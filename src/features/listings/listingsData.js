export const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const FALLBACK = [
  { id:'f1',  title:'Studio cosy lumineux',         location:'Paris 11ᵉ · Bastille',     price:320000,  rooms:1, surface:28,  type:'acheter', property_type:'Studio',      is_premium:true,   image_url:unsplash('photo-1502672260266-1c1ef2d93688') },
  { id:'f2',  title:'T3 avec balcon vue dégagée',   location:'Lyon 6ᵉ · Foch',           price:485000,  rooms:3, surface:65,  type:'acheter', property_type:'T3',          is_exclusive:true, image_url:unsplash('photo-1560448204-e02f11c3d0e2') },
  { id:'f3',  title:'Maison contemporaine',          location:'Bordeaux · Caudéran',      price:780000,  rooms:5, surface:142, type:'acheter', property_type:'Maison',                         image_url:unsplash('photo-1564013799919-ab600027ffc6') },
  { id:'f4',  title:'Colocation design 4 ch.',       location:'Nantes · Centre',          price:590,     rooms:4, surface:110, type:'louer',   property_type:'Colocation',                    image_url:unsplash('photo-1522708323590-d24dbb6b0267') },
  { id:'f5',  title:'Loft industriel rénové',        location:'Marseille · Joliette',     price:1450,    rooms:2, surface:72,  type:'louer',   property_type:'T2',          is_premium:true,   image_url:unsplash('photo-1493809842364-78817add7ffb') },
  { id:'f6',  title:'Appartement haussmannien',      location:'Paris 8ᵉ · Monceau',      price:1250000, rooms:4, surface:98,  type:'acheter', property_type:'Appartement', is_prestige:true,  image_url:unsplash('photo-1600585154340-be6161a56a0c') },
  { id:'f7',  title:'Studio étudiant moderne',       location:'Toulouse · Capitole',      price:620,     rooms:1, surface:24,  type:'louer',   property_type:'Studio',                        image_url:unsplash('photo-1554995207-c18c203602cb') },
  { id:'f8',  title:'Villa avec piscine',            location:'Nice · Cimiez',            price:2100000, rooms:6, surface:220, type:'acheter', property_type:'Villa',       is_prestige:true,  image_url:unsplash('photo-1613490493576-7fde63acd811') },
  { id:'f9',  title:'T2 vue mer',                    location:'Biarritz · Grande Plage',  price:390000,  rooms:2, surface:48,  type:'acheter', property_type:'T2',          is_premium:true,   image_url:unsplash('photo-1499793983690-e29da59ef1c2') },
  { id:'f10', title:'Maison de village rénovée',     location:'Aix-en-Provence',          price:650000,  rooms:4, surface:120, type:'acheter', property_type:'Maison',                        image_url:unsplash('photo-1568605114967-8130f3a36994') },
  { id:'f11', title:'Studio lumineux centre-ville',  location:'Strasbourg · Petite France',price:750,   rooms:1, surface:32,  type:'louer',   property_type:'Studio',                        image_url:unsplash('photo-1536376072261-38c75010e6c9') },
  { id:'f12', title:'Penthouse terrasse panorama',   location:'Paris 16ᵉ · Trocadéro',   price:2800000, rooms:5, surface:180, type:'acheter', property_type:'Appartement', is_prestige:true,  image_url:unsplash('photo-1512917774080-9991f1c4c750') },
]

export const AGENCIES = ['Foncia Premium','Century 21 Élite','SHOPCA Verified','Sotheby\'s Realty','BARNES','Engel & Völkers']
export const DPE_COLORS = { A:'#00A651',B:'#51B948',C:'#BECE00',D:'#FECB00',E:'#FB7A08',F:'#EE3424',G:'#C50D13' }
export const PROPERTY_TYPES = ['Appartement','Maison','Studio','T2','T3','Villa','Colocation','Commerce']

export function enrich(l, idx = 0) {
  const seed = typeof l.id === 'string' ? (l.id.charCodeAt(1) || idx + 1) : idx + 1
  return {
    ...l,
    agency:         l.agency         ?? AGENCIES[seed % AGENCIES.length],
    trust_score:    l.trust_score    ?? (90 + ((idx * 7) % 9)),
    viewers:        l.viewers        ?? (4 + ((seed * 3 + idx * 5) % 24)),
    contacts_today: l.contacts_today ?? ((seed + idx * 2) % 8),
    is_new:         l.is_new         ?? ((seed + idx) % 4 === 0),
    is_urgent:      l.is_urgent      ?? ((seed + idx) % 7 === 1),
    dpe:            l.dpe            ?? ['A','B','C','D','E'][seed % 5],
    parking:        l.parking        ?? ((seed + idx) % 3 === 0),
    elevator:       l.elevator       ?? ((seed * 2 + idx) % 4 === 0),
  }
}

export function fmtPrice(l) {
  if (l.price_label) return l.price_label
  if (typeof l.price !== 'number') return l.price ?? ''
  const s = l.price.toLocaleString('fr-FR') + ' €'
  return (l.type === 'louer' || l.type === 'colocation') ? `${s}/mois` : s
}

export function fmtPricePerSqm(l) {
  if (!l.surface || !l.price || l.type === 'louer' || l.type === 'colocation') return null
  return Math.round(l.price / l.surface).toLocaleString('fr-FR') + ' €/m²'
}
