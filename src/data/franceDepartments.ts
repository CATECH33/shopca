export type Department = {
  id: string      // INSEE department code (string to preserve leading zero e.g. "06")
  code: string    // same as id, exposed explicitly for display / zip matching
  name: string
  regionId: string
}

const departments: Department[] = [
  { id: '06', code: '06', name: 'Alpes-Maritimes',   regionId: 'provence-alpes-cote-dazur' },
  { id: '10', code: '10', name: 'Aube',               regionId: 'grand-est' },
  { id: '13', code: '13', name: 'Bouches-du-Rhône',   regionId: 'provence-alpes-cote-dazur' },
  { id: '21', code: '21', name: "Côte-d'Or",          regionId: 'bourgogne-franche-comte' },
  { id: '29', code: '29', name: 'Finistère',           regionId: 'bretagne' },
  { id: '30', code: '30', name: 'Gard',                regionId: 'occitanie' },
  { id: '31', code: '31', name: 'Haute-Garonne',       regionId: 'occitanie' },
  { id: '33', code: '33', name: 'Gironde',             regionId: 'nouvelle-aquitaine' },
  { id: '34', code: '34', name: 'Hérault',             regionId: 'occitanie' },
  { id: '35', code: '35', name: 'Ille-et-Vilaine',     regionId: 'bretagne' },
  { id: '38', code: '38', name: 'Isère',               regionId: 'auvergne-rhone-alpes' },
  { id: '44', code: '44', name: 'Loire-Atlantique',    regionId: 'pays-de-la-loire' },
  { id: '49', code: '49', name: 'Maine-et-Loire',      regionId: 'pays-de-la-loire' },
  { id: '51', code: '51', name: 'Marne',               regionId: 'grand-est' },
  { id: '59', code: '59', name: 'Nord',                regionId: 'hauts-de-france' },
  { id: '63', code: '63', name: 'Puy-de-Dôme',        regionId: 'auvergne-rhone-alpes' },
  { id: '67', code: '67', name: 'Bas-Rhin',            regionId: 'grand-est' },
  { id: '69', code: '69', name: 'Rhône',               regionId: 'auvergne-rhone-alpes' },
  { id: '75', code: '75', name: 'Paris',               regionId: 'ile-de-france' },
  { id: '76', code: '76', name: 'Seine-Maritime',      regionId: 'normandie' },
]

export default departments
