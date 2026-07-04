import React, { useId } from 'react'

/* ── CSS injection (once) ───────────────────────────────────── */
const CSS = `
@keyframes _pck_pop { 0%{transform:scale(0.6)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
._pck_check { animation: _pck_pop .2s ease forwards; }
`
let _pckCssInjected = false
function injectCss() {
  if (_pckCssInjected || typeof document === 'undefined') return
  _pckCssInjected = true
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── Types ──────────────────────────────────────────────────── */
export interface ShopCACheckboxProps {
  checked?:        boolean
  defaultChecked?: boolean
  indeterminate?:  boolean
  onChange?:       (checked: boolean) => void
  label?:          React.ReactNode
  hint?:           string
  disabled?:       boolean
  dark?:           boolean
  id?:             string
  name?:           string
  value?:          string
  className?:      string
}

/* ── Component ──────────────────────────────────────────────── */
export function ShopCACheckbox({
  checked,
  defaultChecked,
  indeterminate = false,
  onChange,
  label,
  hint,
  disabled = false,
  dark = false,
  id: idProp,
  name,
  value,
  className = '',
}: ShopCACheckboxProps) {
  injectCss()

  const autoId = useId()
  const id = idProp ?? autoId

  const isChecked = checked ?? false
  const active = isChecked || indeterminate

  const boxBase = `
    relative flex-shrink-0 w-5 h-5 rounded-[6px] border-2 transition-all duration-150 select-none
    ${active
      ? 'bg-orange-500 border-orange-500'
      : dark
        ? 'bg-slate-800 border-slate-600 hover:border-orange-400'
        : 'bg-white border-slate-300 hover:border-orange-400'
    }
    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
  `

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!disabled) onChange?.(e.target.checked)
  }

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Hidden native input (accessibility + form submission) */}
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        ref={el => {
          if (el) el.indeterminate = indeterminate
        }}
      />

      {/* Visual box */}
      <span className={boxBase} style={{ marginTop: label ? '1px' : undefined }}>
        {indeterminate && (
          <span className="_pck_check absolute inset-0 flex items-center justify-center">
            <span className="w-2.5 h-0.5 rounded-full bg-white" />
          </span>
        )}
        {isChecked && !indeterminate && (
          <span className="_pck_check absolute inset-0 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        )}
      </span>

      {/* Label + hint */}
      {(label || hint) && (
        <span className="flex flex-col gap-0.5 leading-none">
          {label && (
            <span className={`text-sm font-medium leading-tight ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
              {label}
            </span>
          )}
          {hint && (
            <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</span>
          )}
        </span>
      )}
    </label>
  )
}
