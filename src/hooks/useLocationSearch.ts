import { useState, useCallback, useRef, useEffect } from 'react'
import cities, { type City } from '../data/franceCities'

const DEFAULT_DEBOUNCE_MS = 200
const MAX_RESULTS         = 10

/* ── Normalisation ──────────────────────────────────────────
   Strip accents + lowercase once — shared by indexing and query. */

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/* ── Pre-indexed dataset ────────────────────────────────────
   Normalized fields are computed once at module load so every
   keystroke only does comparisons, never re-normalizes. */

type CityIndexed = City & {
  _name:       string
  _department: string
  _region:     string
}

const INDEX: CityIndexed[] = cities.map(c => ({
  ...c,
  _name:       normalize(c.name),
  _department: normalize(c.department),
  _region:     normalize(c.region),
}))

/* ── Scoring ────────────────────────────────────────────────
   Returns 0 (no match) or a relevance score.
   Zip/department-code queries are detected by a leading digit. */

function scoreCity(c: CityIndexed, raw: string): number {
  const q     = normalize(raw)
  const isZip = /^\d/.test(q)

  if (isZip) {
    if (c.zipcode === q)               return 100
    if (c.zipcode.startsWith(q))       return 90
    if (c.departmentId === q)          return 85
    if (c.departmentId.startsWith(q))  return 70
    return 0
  }

  if (c._name === q)                return 100
  if (c._name.startsWith(q))        return 90
  if (c._name.includes(q))          return 70
  if (c._department === q)           return 65
  if (c._department.startsWith(q))   return 55
  if (c._department.includes(q))     return 40
  if (c._region === q)               return 35
  if (c._region.startsWith(q))       return 25
  if (c._region.includes(q))         return 15
  return 0
}

/* Ties in score are broken by population (larger city first). */
function search(raw: string): City[] {
  const q = raw.trim()
  if (q.length < 2) return []

  const hits: { city: CityIndexed; score: number }[] = []
  for (const c of INDEX) {
    const s = scoreCity(c, q)
    if (s > 0) hits.push({ city: c, score: s })
  }

  hits.sort((a, b) => b.score - a.score || b.city.population - a.city.population)
  return hits.slice(0, MAX_RESULTS).map(h => h.city)
}

/* ── Public API ─────────────────────────────────────────── */

export type UseLocationSearchResult = {
  /** Current raw query string. */
  query:    string
  /** Matched cities, sorted by relevance then population. */
  results:  City[]
  /** True while the debounce timer is running. */
  loading:  boolean
  /** Update the query; triggers a debounced search. */
  setQuery: (q: string) => void
  /** Reset query, results and loading state. */
  clear:    () => void
}

export function useLocationSearch(
  debounceMs = DEFAULT_DEBOUNCE_MS,
): UseLocationSearchResult {
  const [query,   setQueryRaw] = useState('')
  const [results, setResults]  = useState<City[]>([])
  const [loading, setLoading]  = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
    if (timer.current) clearTimeout(timer.current)

    if (!q || q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    timer.current = setTimeout(() => {
      setResults(search(q))
      setLoading(false)
    }, debounceMs)
  }, [debounceMs])

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setQueryRaw('')
    setResults([])
    setLoading(false)
  }, [])

  /* Flush pending timer on unmount. */
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { query, results, loading, setQuery, clear }
}
