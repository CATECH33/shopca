import React, { forwardRef, useId } from 'react'

/* ── CSS (once) ─────────────────────────────────────────────── */
const CSS = `
input[data-pasmal-date]::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; right: 0; width: 40px; height: 100%; cursor: pointer; }
input[data-pasmal-date]::-webkit-inner-spin-button,
input[data-pasmal-date]::-webkit-clear-button { display: none; }
`
let _pdt_injected = false
function injectCss() {
  if (_pdt_injected || typeof document === 'undefined') return
  _pdt_injected = true
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── Types ──────────────────────────────────────────────────── */
export interface PasmalDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:    string
  error?:    string
  hint?:     string
  dark?:     boolean
  size?:     'default' | 'sm'
  containerClassName?: string
}

/* ── Component ──────────────────────────────────────────────── */
export const PasmalDatePicker = forwardRef<HTMLInputElement, PasmalDatePickerProps>(
  function PasmalDatePicker(
    { label, error, hint, dark = false, size = 'default', containerClassName = '', disabled, id: idProp, className = '', ...rest },
    ref
  ) {
    injectCss()

    const autoId = useId()
    const id = idProp ?? autoId
    const h = size === 'sm' ? 'h-11' : 'h-14'

    const baseBg   = dark ? 'bg-slate-800/60'  : 'bg-slate-50'
    const baseBord = dark ? 'border-slate-700'  : 'border-slate-200'
    const textCol  = dark ? 'text-slate-100'    : 'text-slate-900'
    const labelCol = dark ? 'text-slate-300'    : 'text-slate-600'
    const errBord  = error ? '!border-rose-400' : ''

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className={`text-sm font-medium ${labelCol}`}>{label}</label>
        )}

        <div className={`
          relative flex items-center ${h} rounded-[14px] border-2 transition-all duration-200
          ${baseBg} ${baseBord} ${errBord}
          focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}>
          {/* Calendar icon */}
          <span className={`absolute left-3.5 pointer-events-none ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>

          <input
            ref={ref}
            id={id}
            type="date"
            disabled={disabled}
            data-pasmal-date
            className={`
              w-full h-full bg-transparent outline-none text-sm font-medium pl-10 pr-10
              ${textCol}
              ${className}
            `}
            {...rest}
          />

          {/* Clickable calendar icon overlay (right side) */}
          <span className={`absolute right-3.5 pointer-events-none ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </p>
        )}
        {!error && hint && (
          <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</p>
        )}
      </div>
    )
  }
)

PasmalDatePicker.displayName = 'PasmalDatePicker'
