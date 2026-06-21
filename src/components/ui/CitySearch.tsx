import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useCitySearch, expandApiCity, type CityResult } from '../../hooks/useCitySearch'

/* ── CSS (injecté une seule fois) ───────────────────────────── */
let _css = false
function ensureCSS() {
  if (_css || typeof document === 'undefined') return
  _css = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes _cs_in { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
    ._cs_drop { animation:_cs_in .18s cubic-bezier(.22,1,.36,1) }
    ._cs_list::-webkit-scrollbar { display:none }
    ._cs_list { scrollbar-width:none; -ms-overflow-style:none }
    @keyframes _cs_spin { to{transform:rotate(360deg)} }
    ._cs_spin { animation:_cs_spin .7s linear infinite }
  `
  document.head.appendChild(s)
}

/* ── SVG Icons (no external lib) ───────────────────────────── */
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)
const IconSpinner = () => (
  <svg className="_cs_spin" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const IconLocate = ({ spinning }: { spinning?: boolean }) => (
  <svg className={spinning ? '_cs_spin' : ''} width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {spinning
      ? <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      : <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>
    }
  </svg>
)

/* ── Types ──────────────────────────────────────────────────── */
export type { CityResult }

interface Props {
  value?:       string
  onChange?:    (value: string) => void
  onSelect?:    (city: CityResult | null) => void
  placeholder?: string
  /** Mode embarqué : pas de container propre, s'intègre dans le parent */
  bare?:        boolean
  dark?:        boolean
  className?:   string
}

/* ── Composant ──────────────────────────────────────────────── */
export function CitySearch({
  value       = '',
  onChange,
  onSelect,
  placeholder = 'Paris, Lyon, 69000…',
  bare        = false,
  dark        = false,
  className   = '',
}: Props) {
  const { results, total, loading, setQuery, clear } = useCitySearch()

  const [inputVal,  setInputVal]  = useState(value)
  const [open,      setOpen]      = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [dropPos,   setDropPos]   = useState({ top: 0, left: 0, width: 0 })
  const [geoLoading, setGeoLoading] = useState(false)

  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  useEffect(ensureCSS, [])

  /* Sync valeur externe → locale */
  useEffect(() => {
    setInputVal(value ?? '')
    if (!value) clear()
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Position dropdown sous le wrapper */
  const computePos = useCallback(() => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    setDropPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width })
  }, [])

  /* Clic hors → fermer */
  useEffect(() => {
    if (!open) return
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) { setOpen(false); setActiveIdx(-1) }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open])

  /* Scroll page → fermer */
  useEffect(() => {
    if (!open) return
    const fn = () => { setOpen(false); setActiveIdx(-1) }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [open])

  /* Scroll résultat actif dans la vue */
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.children[activeIdx] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIdx])

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputVal(v)
    setQuery(v)
    onChange?.(v)
    setActiveIdx(-1)
    computePos()
    setOpen(v.trim().length >= 1)
  }

  const handleSelect = useCallback((city: CityResult) => {
    setInputVal(city.name)
    clear()
    setOpen(false)
    setActiveIdx(-1)
    onChange?.(city.name)
    onSelect?.(city)
  }, [onChange, onSelect, clear])

  const handleClear = () => {
    setInputVal('')
    onChange?.('')
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
    }
  }

  /* ── Géolocalisation ──────────────────────────────────────── */
  const handleGeo = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res  = await fetch(
            `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lng}` +
            `&fields=nom,code,codesPostaux,codeDepartement,departement,codeRegion,region,population,centre&limit=1`
          )
          const data = await res.json()
          if (data[0]) {
            const expanded = expandApiCity(data[0])
            if (expanded[0]) handleSelect(expanded[0])
          }
        } catch { /* silencieux */ }
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000, maximumAge: 60000 }
    )
  }

  /* ── Styles ───────────────────────────────────────────────── */
  const showDrop    = open && inputVal.trim().length >= 1
  const hasResults  = results.length > 0

  const inputCls = `flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${
    dark ? 'text-white placeholder-white/30' : 'text-slate-900 placeholder-slate-400'
  }`

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>

      {/* ── Ligne d'input ────────────────────────────────────── */}
      {bare ? (
        /* Mode embarqué — pas de container propre */
        <div className="flex items-center gap-2 w-full">
          {loading && (
            <span style={{ color: dark ? '#FB923C' : '#F97316', flexShrink: 0 }}>
              <IconSpinner />
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) { computePos(); setOpen(true) } }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className={inputCls}
          />
          {!inputVal && (
            <button type="button" onMouseDown={e => { e.preventDefault(); handleGeo() }}
              title="Utiliser ma position"
              style={{ flexShrink: 0, padding: 4, borderRadius: 99, color: geoLoading ? '#F97316' : '#94A3B8',
                       background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <IconLocate spinning={geoLoading} />
            </button>
          )}
          {inputVal && (
            <button type="button" onMouseDown={e => { e.preventDefault(); handleClear() }}
              style={{ flexShrink: 0, padding: 3, borderRadius: 99, color: '#CBD5E1',
                       background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <IconX />
            </button>
          )}
        </div>
      ) : (
        /* Mode autonome — container stylé */
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
          height: 48, borderRadius: 16,
          border: `1.5px solid ${open ? '#FF6B00' : '#E5E7EB'}`,
          background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
          boxShadow: open ? '0 0 0 3px rgba(255,107,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'border-color .18s, box-shadow .18s',
        }}>
          <span style={{ flexShrink: 0, color: loading ? '#F97316' : '#94A3B8', display: 'flex' }}>
            {loading ? <IconSpinner /> : <IconSearch />}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) { computePos(); setOpen(true) } }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                     fontSize: 14, color: dark ? '#fff' : '#0F172A' }}
          />
          {!inputVal && (
            <button type="button" onMouseDown={e => { e.preventDefault(); handleGeo() }}
              title="Utiliser ma position"
              style={{ flexShrink: 0, padding: 4, borderRadius: 99,
                       color: geoLoading ? '#F97316' : '#94A3B8',
                       background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <IconLocate spinning={geoLoading} />
            </button>
          )}
          {inputVal && (
            <button type="button" onMouseDown={e => { e.preventDefault(); handleClear() }}
              style={{ flexShrink: 0, padding: 3, borderRadius: 99, color: '#CBD5E1',
                       background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <IconX />
            </button>
          )}
        </div>
      )}

      {/* ── Dropdown (Portal) ────────────────────────────────── */}
      {showDrop && createPortal(
        <div
          className="_cs_drop"
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 280),
            zIndex: 9999, borderRadius: 16, border: '1px solid #E5E7EB',
            background: '#fff', boxShadow: '0 8px 32px rgba(15,23,42,0.13),0 2px 8px rgba(15,23,42,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* ── Compteur de résultats ── */}
          {!loading && hasResults && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px 6px', borderBottom: '1px solid #F1F5F9',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {total} commune{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 10, color: '#CBD5E1' }}>↑↓ Entrée</span>
            </div>
          )}

          {/* ── Chargement ── */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px',
                          fontSize: 13, color: '#94A3B8' }}>
              <IconSpinner />
              Recherche en cours…
            </div>
          )}

          {/* ── Liste des résultats ── */}
          {!loading && hasResults && (
            <div ref={listRef} className="_cs_list"
              style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 0' }}
              role="listbox">
              {results.map((city, i) => {
                const isActive = i === activeIdx
                return (
                  <button
                    key={city.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={e => { e.preventDefault(); handleSelect(city) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '9px 14px',
                      background: isActive ? '#FFF7F0' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'background .08s',
                    }}
                  >
                    {/* Icône pin */}
                    <span style={{ flexShrink: 0, color: isActive ? '#FF6B00' : '#94A3B8', display: 'flex', marginTop: 1 }}>
                      <IconPin />
                    </span>

                    {/* Ville + code postal + sous-titre */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                        <span style={{
                          fontSize: 14, fontWeight: 600, color: isActive ? '#FF6B00' : '#0F172A',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {city.name}
                        </span>
                        {city.zipcode && (
                          <span style={{
                            fontSize: 12, fontFamily: 'monospace',
                            color: isActive ? '#FF6B00' : '#94A3B8', flexShrink: 0,
                          }}>
                            ({city.zipcode})
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 11, color: isActive ? '#FDBA74' : '#94A3B8',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1,
                      }}>
                        {[city.department, city.region].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Aucun résultat ── */}
          {!loading && !hasResults && inputVal.trim().length >= 1 && (
            <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
              Aucun résultat pour{' '}
              <span style={{ fontWeight: 600, color: '#64748B' }}>«&nbsp;{inputVal}&nbsp;»</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default CitySearch
