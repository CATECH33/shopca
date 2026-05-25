export type Region = {
  id: string    // kebab-case slug
  code: string  // INSEE code (2 digits, post-2016)
  name: string
}

const regions: Region[] = [
  { id: 'ile-de-france',            code: '11', name: 'Île-de-France' },
  { id: 'auvergne-rhone-alpes',     code: '84', name: 'Auvergne-Rhône-Alpes' },
  { id: 'bourgogne-franche-comte',  code: '27', name: 'Bourgogne-Franche-Comté' },
  { id: 'bretagne',                 code: '53', name: 'Bretagne' },
  { id: 'centre-val-de-loire',      code: '24', name: 'Centre-Val de Loire' },
  { id: 'grand-est',                code: '44', name: 'Grand Est' },
  { id: 'hauts-de-france',          code: '32', name: 'Hauts-de-France' },
  { id: 'normandie',                code: '28', name: 'Normandie' },
  { id: 'nouvelle-aquitaine',       code: '75', name: 'Nouvelle-Aquitaine' },
  { id: 'occitanie',                code: '76', name: 'Occitanie' },
  { id: 'pays-de-la-loire',         code: '52', name: 'Pays de la Loire' },
  { id: 'provence-alpes-cote-dazur',code: '93', name: "Provence-Alpes-Côte d'Azur" },
  { id: 'corse',                    code: '94', name: 'Corse' },
]

export default regions
