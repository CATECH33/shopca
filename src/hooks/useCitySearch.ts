import { useState, useCallback, useRef, useEffect } from 'react'
import regions from '../data/franceRegions'

/* ── Constants ─────────────────────────────────────────────── */
const GEO_API  = 'https://geo.api.gouv.fr'
const FIELDS   = 'nom,code,codesPostaux,codeDepartement,departement,codeRegion,region,population,centre'
const LIMIT    = 30
const DEBOUNCE = 200

/* ── Normalise diacritiques + lowercase ────────────────────── */
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* ── Détecte si la saisie est uniquement des chiffres ─────── */
const isDigits = (s: string) => /^\d+$/.test(s.trim())

/* ── Tente de matcher une région française ─────────────────── */
function matchRegion(q: string): string | null {
  const n = norm(q)
  if (n.length < 3) return null
  const found = regions.find(r => {
    const rn = norm(r.name)
    return rn === n || rn.startsWith(n) || n.startsWith(rn.slice(0, 5))
  })
  return found?.code ?? null
}

/* ── Type résultat public ───────────────────────────────────── */
export interface CityResult {
  id:             string
  name:           string
  zipcode:        string
  department:     string
  departmentCode: string
  region:         string
  regionCode:     string
  lat:            number
  lng:            number
  population:     number
}

/* ── Expandeur : 1 commune API → N lignes (1 par code postal) */
export function expandApiCity(c: Record<string, any>): CityResult[] {
  const codes: string[] = c.codesPostaux?.length ? c.codesPostaux : ['']
  const lat = c.centre?.coordinates?.[1] ?? 0
  const lng = c.centre?.coordinates?.[0] ?? 0
  return codes.map(zip => ({
    id:             `${c.code ?? c.id}_${zip}`,
    name:           c.nom ?? c.name ?? '',
    zipcode:        zip,
    department:     c.departement?.nom ?? c.department ?? '',
    departmentCode: c.codeDepartement ?? c.departmentCode ?? '',
    region:         c.region?.nom  ?? (typeof c.region === 'string' ? c.region : '') ?? '',
    regionCode:     c.codeRegion   ?? '',
    lat,
    lng,
    population:     c.population ?? 0,
  }))
}

/* ── Construire l'URL selon le type de saisie ──────────────── */
function buildUrl(q: string): string {
  const t = q.trim()

  if (isDigits(t)) {
    if (t.length === 5) {
      // Code postal exact
      return `${GEO_API}/communes?codePostal=${t}&fields=${FIELDS}&boost=population&limit=${LIMIT}`
    }
    // Code département (1-3 chiffres)
    return `${GEO_API}/communes?codeDepartement=${t}&fields=${FIELDS}&boost=population&limit=${LIMIT}`
  }

  const regionCode = matchRegion(t)
  if (regionCode) {
    return `${GEO_API}/communes?codeRegion=${regionCode}&fields=${FIELDS}&boost=population&limit=${LIMIT}`
  }

  // Recherche par nom de ville (défaut)
  return `${GEO_API}/communes?nom=${encodeURIComponent(t)}&fields=${FIELDS}&boost=population&limit=${LIMIT}`
}

/* ── Fetch ─────────────────────────────────────────────────── */
async function fetchResults(
  q: string,
  signal: AbortSignal,
): Promise<{ results: CityResult[]; total: number }> {
  const trimmed = q.trim()
  if (trimmed.length < 1) return { results: [], total: 0 }

  const res = await fetch(buildUrl(trimmed), { signal })
  if (!res.ok) throw new Error(`geo.api.gouv.fr ${res.status}`)

  const data: Record<string, any>[] = await res.json()
  const results = data.flatMap(expandApiCity)
  return { results, total: results.length }
}

/* ── Hook public ────────────────────────────────────────────── */
export interface UseCitySearchResult {
  query:    string
  results:  CityResult[]
  total:    number
  loading:  boolean
  setQuery: (q: string) => void
  clear:    () => void
}

export function useCitySearch(debounceMs = DEBOUNCE): UseCitySearchResult {
  const [query,   setQueryState] = useState('')
  const [results, setResults]    = useState<CityResult[]>([])
  const [total,   setTotal]      = useState(0)
  const [loading, setLoading]    = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (!q || q.trim().length < 1) {
      setResults([]); setTotal(0); setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const ac = new AbortController()
      abortRef.current = ac
      try {
        const { results: r, total: t } = await fetchResults(q, ac.signal)
        setResults(r); setTotal(t); setLoading(false)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setResults([]); setTotal(0); setLoading(false)
        }
      }
    }, debounceMs)
  }, [debounceMs])

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
    setQueryState(''); setResults([]); setTotal(0); setLoading(false)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { query, results, total, loading, setQuery, clear }
}
