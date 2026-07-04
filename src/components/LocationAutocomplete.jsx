import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import franceCities from '../data/franceCities.json'

/* ── localStorage keys ───────────────────────────────────── */
const LS_RECENT = 'shopca_recent_locations'
const LS_FAVS   = 'shopca_fav_locations'
const MAX_RECENT = 5
const MAX_FAVS   = 5

const loadLS  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const saveLS  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

/* ── Haversine distance (km) ─────────────────────────────── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ── normalize diacritics ─────────────────────────────────── */
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* ── inline SVGs ─────────────────────────────────────────── */
const MapPin = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const XIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)
const ChevronRight = () => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const LocateIcon = ({ spinning }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    className={spinning ? 'animate-spin' : ''}>
    {spinning
      ? <><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></>
      : <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>
    }
  </svg>
)

/* ── RADIUS OPTIONS ──────────────────────────────────────── */
const RADIUS_OPTIONS = [
  { km: 5,  label: '+5 km' },
  { km: 10, label: '+10 km' },
  { km: 25, label: '+25 km' },
  { km: 50, label: '+50 km' },
]

/* ── component ───────────────────────────────────────────── */
export default function LocationAutocomplete({
  value       = '',
  onChange,
  onSelect,
  placeholder = 'Paris, Lyon, Bordeaux…',
  showRadius  = false,
  radius      = 0,
  onRadiusChange,
}) {
  const [query,       setQuery]       = useState(value)
  const [open,        setOpen]        = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)
  const [geoLoading,  setGeoLoading]  = useState(false)
  const [geoError,    setGeoError]    = useState('')
  const [recent,      setRecent]      = useState(() => loadLS(LS_RECENT))
  const [favs,        setFavs]        = useState(() => loadLS(LS_FAVS))
  const [nearbyCity,  setNearbyCity]  = useState(null) // city used as "nearby" reference
  const [nearbyKm,    setNearbyKm]    = useState(10)

  const wrapRef  = useRef(null)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  useEffect(() => { setQuery(value ?? '') }, [value])

  /* ── search results ───────────────────────────────────── */
  const results = useMemo(() => {
    const q = norm(query.trim())
    if (q.length < 1) return []
    return franceCities
      .filter(c => {
        const n = norm(c.name)
        return n.includes(q) || c.zipcode.startsWith(query.trim()) || norm(c.department || '').includes(q)
      })
      .sort((a, b) => {
        const na = norm(a.name), nb = norm(b.name)
        const sa = na.startsWith(q) ? 1 : 0, sb = nb.startsWith(q) ? 1 : 0
        if (sa !== sb) return sb - sa
        return (b.population || 0) - (a.population || 0)
      })
      .slice(0, 12)
  }, [query])

  /* ── nearby cities for current nearbyCity+radius ─────── */
  const nearbyCities = useMemo(() => {
    if (!nearbyCity?.lat) return []
    return franceCities
      .filter(c => c.id !== nearbyCity.id && haversine(nearbyCity.lat, nearbyCity.lng, c.lat, c.lng) <= nearbyKm)
      .sort((a, b) => haversine(nearbyCity.lat, nearbyCity.lng, a.lat, a.lng) - haversine(nearbyCity.lat, nearbyCity.lng, b.lat, b.lng))
      .slice(0, 6)
  }, [nearbyCity, nearbyKm])

  /* group search results by region */
  const grouped = useMemo(() => {
    const map = {}
    results.forEach(c => { const r = c.region || 'Autre'; if (!map[r]) map[r] = []; map[r].push(c) })
    return Object.entries(map)
  }, [results])

  /* ── close on outside click ──────────────────────────── */
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setActiveIdx(-1) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── scroll active into view ─────────────────────────── */
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      listRef.current.querySelector(`[data-idx="${activeIdx}"]`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIdx])

  /* ── persist recent + favs ───────────────────────────── */
  const addRecent = useCallback((city) => {
    setRecent(prev => {
      const next = [city, ...prev.filter(c => c.id !== city.id)].slice(0, MAX_RECENT)
      saveLS(LS_RECENT, next)
      return next
    })
  }, [])

  const toggleFav = useCallback((city, e) => {
    e?.stopPropagation()
    setFavs(prev => {
      const exists = prev.some(c => c.id === city.id)
      const next = exists ? prev.filter(c => c.id !== city.id) : [city, ...prev].slice(0, MAX_FAVS)
      saveLS(LS_FAVS, next)
      return next
    })
  }, [])

  /* ── select ──────────────────────────────────────────── */
  const handleSelect = useCallback((city) => {
    setQuery(city.name)
    setOpen(false)
    setActiveIdx(-1)
    setNearbyCity(city)
    addRecent(city)
    onChange?.(city.name)
    onSelect?.(city)
  }, [onChange, onSelect, addRecent])

  /* ── keyboard ────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter')     { e.preventDefault(); if (activeIdx >= 0 && results[activeIdx]) handleSelect(results[activeIdx]) }
    else if (e.key === 'Escape')    { setOpen(false); setActiveIdx(-1); inputRef.current?.blur() }
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange?.(e.target.value)
    setActiveIdx(-1)
    setOpen(true)
  }

  const handleClear = () => {
    setQuery('')
    setNearbyCity(null)
    onChange?.('')
    onSelect?.(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  /* ── geolocation ─────────────────────────────────────── */
  const handleGeo = () => {
    if (!navigator.geolocation) { setGeoError('Géolocalisation non supportée'); return }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const nearest = franceCities.reduce((best, c) => {
          const d = haversine(lat, lng, c.lat, c.lng)
          return d < best.d ? { city: c, d } : best
        }, { city: null, d: Infinity }).city
        setGeoLoading(false)
        if (nearest) handleSelect(nearest)
      },
      (err) => {
        setGeoLoading(false)
        setGeoError(err.code === 1 ? 'Accès refusé' : 'Localisation impossible')
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }

  /* ── dropdown panel ─────────────────────────────────── */
  const showEmpty = query.trim().length === 0
  const isFav     = (city) => favs.some(f => f.id === city.id)

  const CityRow = ({ city, idx, section }) => {
    const isActive = section === 'results' && idx === activeIdx
    return (
      <button
        key={city.id}
        data-idx={section === 'results' ? idx : undefined}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleSelect(city) }}
        onMouseEnter={() => section === 'results' && setActiveIdx(idx)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors group ${
          isActive ? 'bg-orange-500' : 'hover:bg-slate-50'
        }`}
      >
        <span className={`shrink-0 ml-1 ${isActive ? 'text-orange-200' : 'text-slate-300'}`}><ChevronRight /></span>
        <span className={`flex-1 text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{city.name}</span>
        {city.department && (
          <span className={`hidden sm:inline shrink-0 text-[11px] truncate max-w-[80px] ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>{city.department}</span>
        )}
        {city.zipcode && (
          <span className={`shrink-0 text-[11px] font-mono ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>{city.zipcode}</span>
        )}
        {/* fav toggle — only for search results */}
        {section === 'results' && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(city) }}
            className={`shrink-0 p-1 rounded-full transition-colors ${
              isFav(city)
                ? (isActive ? 'text-orange-200' : 'text-rose-400')
                : (isActive ? 'text-orange-300 opacity-60' : 'text-slate-200 group-hover:text-slate-400')
            }`}
          >
            <HeartIcon filled={isFav(city)} />
          </button>
        )}
      </button>
    )
  }

  const SectionHeader = ({ icon, label, action }) => (
    <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
      <div className="flex items-center gap-1.5">
        <span className="text-orange-400">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">{label}</span>
      </div>
      {action}
    </div>
  )

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* ── input row ───────────────────────────────────── */}
      <div className="flex items-center gap-2 w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none"
        />

        {/* geolocation button */}
        {!query && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleGeo() }}
            title="Utiliser ma position"
            className={`shrink-0 p-1 rounded-full transition-colors ${
              geoLoading ? 'text-orange-500' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            <LocateIcon spinning={geoLoading} />
          </button>
        )}

        {query && (
          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleClear() }}
            className="shrink-0 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <XIcon />
          </button>
        )}
      </div>

      {/* geo error */}
      {geoError && !open && (
        <p className="text-[11px] text-rose-500 mt-1">{geoError}</p>
      )}

      {/* ── radius selector ─────────────────────────────── */}
      {showRadius && nearbyCity && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-0.5">Rayon :</span>
          {RADIUS_OPTIONS.map(opt => (
            <button
              key={opt.km}
              type="button"
              onClick={() => { setNearbyKm(opt.km); onRadiusChange?.(opt.km) }}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                nearbyKm === opt.km
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── dropdown ───────────────────────────────────── */}
      {open && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 z-[200] mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-96 overflow-y-auto"
          style={{ top: 'calc(100% + 6px)' }}
        >
          {/* ── empty query: recents + favs + geo CTA ── */}
          {showEmpty && (
            <>
              {/* Géolocalisation CTA */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleGeo() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-slate-50"
              >
                <span className={`w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 ${geoLoading ? 'text-orange-400' : 'text-orange-500'}`}>
                  <LocateIcon spinning={geoLoading} />
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {geoLoading ? 'Localisation en cours…' : 'Utiliser ma position'}
                </span>
              </button>

              {/* Favoris */}
              {favs.length > 0 && (
                <div>
                  <SectionHeader
                    icon={<HeartIcon filled />}
                    label="Lieux favoris"
                    action={
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setFavs([]); saveLS(LS_FAVS, []) }}
                        className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors">Effacer</button>
                    }
                  />
                  {favs.map(city => <CityRow key={city.id} city={city} section="favs" />)}
                  <div className="h-px bg-slate-100 mx-4 my-0.5" />
                </div>
              )}

              {/* Recherches récentes */}
              {recent.length > 0 && (
                <div>
                  <SectionHeader
                    icon={<ClockIcon />}
                    label="Recherches récentes"
                    action={
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setRecent([]); saveLS(LS_RECENT, []) }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">Effacer</button>
                    }
                  />
                  {recent.map(city => <CityRow key={city.id} city={city} section="recent" />)}
                </div>
              )}

              {/* Villes populaires if nothing stored */}
              {favs.length === 0 && recent.length === 0 && (
                <div>
                  <SectionHeader icon={<MapPin />} label="Villes populaires" />
                  {franceCities.slice(0, 5).map(city => <CityRow key={city.id} city={city} section="popular" />)}
                </div>
              )}
            </>
          )}

          {/* ── search results ── */}
          {!showEmpty && results.length > 0 && (
            <>
              {grouped.map(([region, cities], regionIdx) => (
                <div key={region}>
                  {regionIdx > 0 && <div className="h-px bg-slate-100 mx-4 my-0.5" />}
                  <SectionHeader icon={<MapPin />} label={region} />
                  {cities.map(city => {
                    const flatIdx = results.indexOf(city)
                    return <CityRow key={city.id} city={city} idx={flatIdx} section="results" />
                  })}
                </div>
              ))}

              {/* Nearby suggestions (shown after results when a city was previously selected) */}
              {nearbyCity && nearbyCities.length > 0 && (
                <>
                  <div className="h-px bg-slate-100 mx-4 my-0.5" />
                  <div>
                    <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400"><MapPin size={12} /></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Villes proches de {nearbyCity.name}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {RADIUS_OPTIONS.slice(0, 3).map(opt => (
                          <button key={opt.km} type="button"
                            onMouseDown={(e) => { e.preventDefault(); setNearbyKm(opt.km) }}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all ${
                              nearbyKm === opt.km ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    {nearbyCities.map(city => <CityRow key={city.id} city={city} section="nearby" />)}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── no results ── */}
          {!showEmpty && results.length === 0 && (
            <div className="px-4 py-5 text-center text-sm text-slate-400">
              Aucun résultat pour « {query} »
            </div>
          )}
        </div>
      )}
    </div>
  )
}
