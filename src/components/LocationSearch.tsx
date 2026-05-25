import React, { useState, useRef, useEffect } from 'react'
import { useLocationSearch } from '../hooks/useLocationSearch'
import type { City } from '../data/franceCities'

/* ── Icons (inline SVG — no external lib) ───────────────── */

const IconSearch = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const IconMapPin = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconX = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

const IconSpinner = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'spin 0.7s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </svg>
)

/* ── Props ──────────────────────────────────────────────── */

type Props = {
  /** Controlled value — set from outside to sync or clear the input. */
  value?:       string
  /** Fired on every selection; null when the field is cleared. */
  onSelect?:    (city: City | null) => void
  placeholder?: string
  debounceMs?:  number
  dark?:        boolean
  className?:   string
}

/* ── Component ──────────────────────────────────────────── */

export default function LocationSearch({
  value       = '',
  onSelect,
  placeholder = 'Paris, Lyon, 10000…',
  debounceMs,
  dark        = false,
  className   = '',
}: Props) {
  const { setQuery, results, loading, clear } = useLocationSearch(debounceMs)

  const [inputValue, setInputValue] = useState(value)
  const [open,       setOpen]       = useState(false)
  const [activeIdx,  setActiveIdx]  = useState(-1)

  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Sync external value → local state (e.g. parent resets the field) */
  useEffect(() => {
    setInputValue(value)
    if (!value) clear()
  }, [value])   // eslint-disable-line react-hooks/exhaustive-deps

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Handlers ─────────────────────────────────────────── */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)
    setQuery(v)
    setActiveIdx(-1)
    setOpen(true)
  }

  const handleSelect = (city: City) => {
    setInputValue(city.name)
    clear()
    setOpen(false)
    setActiveIdx(-1)
    onSelect?.(city)
  }

  const handleClear = () => {
    setInputValue('')
    clear()
    setOpen(false)
    onSelect?.(null)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && results[activeIdx]) handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  /* ── Dropdown visibility ──────────────────────────────── */

  const queryLongEnough = inputValue.trim().length >= 2
  const showDropdown    = open && queryLongEnough

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>

      {/* ── Input ─────────────────────────────────────── */}
      <div className={`flex items-center gap-2.5 px-4 h-12 rounded-2xl border transition-all ${
        dark
          ? 'bg-white/5 border-white/10 focus-within:border-orange-500/50 focus-within:bg-white/[0.07]'
          : 'bg-white border-slate-200 shadow-sm focus-within:border-orange-400 focus-within:shadow-orange-100/60 focus-within:shadow-md'
      }`}>

        {/* Left icon: spinner when loading, search otherwise */}
        <span className={`shrink-0 transition-colors ${
          loading
            ? (dark ? 'text-orange-400' : 'text-orange-500')
            : (dark ? 'text-white/30' : 'text-slate-400')
        }`}>
          {loading ? <IconSpinner /> : <IconSearch />}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${
            dark
              ? 'text-white placeholder-white/30'
              : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleClear() }}
            className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
              dark
                ? 'text-white/30 hover:text-white/70 hover:bg-white/10'
                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Effacer"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* ── Dropdown ──────────────────────────────────── */}
      {showDropdown && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-[200] mt-2 rounded-2xl border overflow-hidden shadow-xl ${
            dark
              ? 'bg-[#0B1120] border-white/10'
              : 'bg-white border-slate-100'
          }`}
        >
          {/* Loading skeleton */}
          {loading && (
            <div className={`px-4 py-4 text-xs text-center ${dark ? 'text-white/30' : 'text-slate-400'}`}>
              Recherche…
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && results.map((city, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={city.id}
                role="option"
                aria-selected={isActive}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(city) }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-0 ${
                  dark ? 'border-white/5' : 'border-slate-50'
                } ${
                  isActive
                    ? 'bg-orange-500'
                    : dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                {/* Pin icon */}
                <span className={`shrink-0 ${
                  isActive ? 'text-white/70' : (dark ? 'text-orange-400' : 'text-orange-400')
                }`}>
                  <IconMapPin />
                </span>

                {/* City name + subtitle */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${
                    isActive ? 'text-white' : (dark ? 'text-white' : 'text-slate-800')
                  }`}>
                    {city.name}
                  </div>
                  <div className={`text-xs truncate ${
                    isActive ? 'text-orange-100' : (dark ? 'text-white/40' : 'text-slate-400')
                  }`}>
                    {city.department} · {city.region}
                  </div>
                </div>

                {/* Zipcode badge */}
                <span className={`shrink-0 text-[11px] font-mono ${
                  isActive ? 'text-orange-100' : (dark ? 'text-white/25' : 'text-slate-400')
                }`}>
                  {city.zipcode}
                </span>
              </button>
            )
          })}

          {/* No results */}
          {!loading && results.length === 0 && (
            <div className={`px-4 py-6 text-sm text-center ${dark ? 'text-white/30' : 'text-slate-400'}`}>
              Aucun résultat pour{' '}
              <span className={`font-semibold ${dark ? 'text-white/50' : 'text-slate-600'}`}>
                « {inputValue} »
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
