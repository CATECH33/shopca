import React, { useState, useRef, useEffect } from 'react'
import { franceCities } from '../data/franceCities.ts'

/* ── inline SVGs (no external lib) ──────────────────────── */
const MapPin = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const XIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

/* ── component ───────────────────────────────────────────── */
export default function LocationAutocomplete({
  value      = '',
  onChange,
  onSelect,
  placeholder = 'Paris, Lyon, Bordeaux…',
}) {
  const [query,     setQuery]     = useState(value)
  const [open,      setOpen]      = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)

  /* keep query in sync when value prop changes externally (e.g. cleared by parent) */
  useEffect(() => { setQuery(value ?? '') }, [value])

  /* filter dataset */
  const results = query.trim().length >= 1
    ? franceCities.filter((c) =>
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.zipcode.startsWith(query) ||
        c.region.toLowerCase().includes(query.toLowerCase())
      )
    : []

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* select a city */
  const handleSelect = (city) => {
    setQuery(city.city)
    setOpen(false)
    setActiveIdx(-1)
    onChange?.(city.city)
    onSelect?.({ ...city, name: city.city })
  }

  /* keyboard navigation */
  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && results[activeIdx]) handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange?.(e.target.value)
    setActiveIdx(-1)
    setOpen(true)
  }

  const handleClear = () => {
    setQuery('')
    onChange?.('')
    onSelect?.(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* ── input row ─────────────────────────────────────── */}
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

        {query && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear() }}
            className="shrink-0 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* ── dropdown ──────────────────────────────────────── */}
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 z-[200] mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          style={{ top: 'calc(100% + 6px)' }}
        >
          {results.map((city, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={city.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(city) }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-orange-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-white/80' : 'text-orange-400'}>
                  <MapPin />
                </span>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {city.city}
                  </div>
                  <div className={`text-xs truncate ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                    {city.region}
                  </div>
                </div>

                <span className={`shrink-0 text-[11px] font-mono ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                  {city.zipcode}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
