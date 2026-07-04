import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ShopCAOption {
  value: string
  label: string
}

interface ShopCASelectProps {
  value: string
  onChange: (value: string) => void
  options: (ShopCAOption | string)[]
  placeholder?: string
  icon?: React.ReactNode
  /** Auto-activé si options.length > 4 */
  searchable?: boolean
  size?: 'default' | 'sm' | 'xs'
  /** Trigger sombre (panneau navy) */
  dark?: boolean
  /** Trigger transparent — à embarquer dans un conteneur existant */
  ghost?: boolean
  disabled?: boolean
  error?: boolean
  className?: string
  /** Classes supplémentaires sur le bouton trigger (ex: pill coloré) */
  triggerClassName?: string
}

function norm(o: ShopCAOption | string): ShopCAOption {
  return typeof o === 'string' ? { value: o, label: o } : o
}

let _styleInjected = false
function ensureCSS() {
  if (_styleInjected || typeof document === 'undefined') return
  _styleInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes _psl_in { from { opacity:0; transform:translateY(-8px) scale(.97) } to { opacity:1; transform:none } }
    ._psl_drop { animation: _psl_in .18s cubic-bezier(.22,1,.36,1) }
    ._psl_list::-webkit-scrollbar { display:none }
    ._psl_list { scrollbar-width:none; -ms-overflow-style:none }
  `
  document.head.appendChild(s)
}

const SIZES = {
  default: { h: 60, r: 14, fs: 14, px: 16, gap: 10 },
  sm:      { h: 40, r: 12, fs: 13, px: 12, gap: 8  },
  xs:      { h: 36, r: 10, fs: 12, px: 10, gap: 6  },
}

export function ShopCASelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner…',
  icon,
  searchable,
  size = 'default',
  dark = false,
  ghost = false,
  disabled = false,
  error = false,
  className = '',
  triggerClassName = '',
}: ShopCASelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hi, setHi] = useState(0)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const trigRef   = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

  const all      = options.map(norm)
  const filtered = query.trim()
    ? all.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : all
  const sel       = all.find(o => o.value === value)
  const doSearch  = searchable ?? all.length > 4

  useEffect(ensureCSS, [])

  const computePos = () => {
    if (!trigRef.current) return
    const r = trigRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const dropH      = Math.min(filtered.length * 44 + (doSearch ? 60 : 16), 240)
    const openUp     = spaceBelow < dropH + 10 && r.top > spaceBelow
    setPos({
      top:   openUp ? r.top  + window.scrollY - dropH - 6
                    : r.bottom + window.scrollY + 6,
      left:  r.left + window.scrollX,
      width: r.width,
    })
  }

  const openMenu = () => {
    if (disabled) return
    computePos()
    setOpen(true)
    setHi(Math.max(0, all.findIndex(o => o.value === value)))
  }

  const closeMenu = () => { setOpen(false); setQuery('') }

  const pick = (val: string) => { onChange(val); closeMenu() }

  useEffect(() => {
    if (!open) return
    const fn = (e: MouseEvent) => {
      if (!trigRef.current?.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open])

  useEffect(() => {
    if (open && doSearch) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    const el = listRef.current?.children[hi] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [hi])

  useEffect(() => { setHi(0) }, [query])

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openMenu() }
      return
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setHi(h => Math.min(h + 1, filtered.length - 1)); break
      case 'ArrowUp':   e.preventDefault(); setHi(h => Math.max(h - 1, 0)); break
      case 'Home':      e.preventDefault(); setHi(0); break
      case 'End':       e.preventDefault(); setHi(filtered.length - 1); break
      case 'Enter':     e.preventDefault(); if (filtered[hi]) pick(filtered[hi].value); break
      case 'Escape':    closeMenu(); trigRef.current?.focus(); break
    }
  }

  const { h, r, fs, px, gap } = SIZES[size]

  const borderColor = error
    ? '#FCA5A5'
    : open
      ? '#FF6B00'
      : dark
        ? 'rgba(255,255,255,0.12)'
        : '#E5E7EB'

  const trigStyle: React.CSSProperties = ghost
    ? {
        display: 'flex', alignItems: 'center', gap: `${gap}px`,
        width: '100%', background: 'transparent', border: 'none',
        padding: 0, outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontSize: `${fs}px`,
        color: sel ? 'inherit' : '#94A3B8', fontWeight: sel ? 500 : 400,
      }
    : {
        display: 'flex', alignItems: 'center', gap: `${gap}px`,
        width: '100%', height: `${h}px`,
        padding: `0 ${px}px`,
        borderRadius: `${r}px`,
        border: `1.5px solid ${borderColor}`,
        background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
        boxShadow: open
          ? '0 0 0 3px rgba(255,107,0,0.12)'
          : error
            ? '0 0 0 3px rgba(252,165,165,0.2)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color .18s, box-shadow .18s',
        textAlign: 'left',
        outline: 'none',
        fontSize: `${fs}px`,
        color: sel
          ? (dark ? '#fff' : '#0F172A')
          : (dark ? 'rgba(255,255,255,0.3)' : '#94A3B8'),
        fontWeight: sel ? 500 : 400,
      }

  return (
    <div className={className} style={{ position: 'relative' }} onKeyDown={onKey}>
      <button
        ref={trigRef}
        type="button"
        disabled={disabled}
        onClick={() => open ? closeMenu() : openMenu()}
        className={triggerClassName}
        style={trigStyle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && (
          <span style={{ flexShrink: 0, display: 'flex', color: dark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sel?.label ?? placeholder}
        </span>
        {/* Chevron animé */}
        <svg
          style={{
            flexShrink: 0,
            transition: 'transform .25s cubic-bezier(.22,1,.36,1)',
            transform: open ? 'rotate(180deg)' : 'none',
            color: ghost
              ? 'currentColor'
              : dark
                ? 'rgba(255,255,255,0.35)'
                : '#94A3B8',
            opacity: ghost ? 0.45 : 1,
          }}
          width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && createPortal(
        <div
          className="_psl_drop"
          style={{
            position: 'absolute',
            top: pos.top, left: pos.left, width: pos.width,
            zIndex: 9999,
            borderRadius: 16,
            border: '1px solid #E5E7EB',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(15,23,42,0.13), 0 2px 8px rgba(15,23,42,0.06)',
            overflow: 'hidden',
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {doSearch && (
            <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F8FAFC', borderRadius: 10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A' }}
                />
              </div>
            </div>
          )}

          <div
            ref={listRef}
            className="_psl_list"
            style={{ maxHeight: 224, overflowY: 'auto', padding: '6px 0' }}
            role="listbox"
          >
            {filtered.length === 0
              ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
                  Aucun résultat
                </div>
              )
              : filtered.map((opt, i) => {
                  const isSel = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      onMouseEnter={() => setHi(i)}
                      onClick={() => pick(opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 14px',
                        fontSize: 14, color: isSel ? '#FF6B00' : '#0F172A',
                        fontWeight: isSel ? 600 : 400,
                        background: i === hi ? '#FFF7F0' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        textAlign: 'left', transition: 'background .08s',
                      }}
                    >
                      <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {isSel && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5">
                            <path d="m20 6-11 11-5-5"/>
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  )
                })
            }
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ShopCASelect
