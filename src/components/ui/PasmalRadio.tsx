import React, { useId, createContext, useContext } from 'react'

/* ── CSS (once) ─────────────────────────────────────────────── */
const CSS = `
@keyframes _prd_dot { 0%{transform:scale(0)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }
._prd_dot { animation: _prd_dot .18s ease forwards; }
`
let _prdCssInjected = false
function injectCss() {
  if (_prdCssInjected || typeof document === 'undefined') return
  _prdCssInjected = true
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── RadioGroup context ─────────────────────────────────────── */
interface RadioCtx {
  name:      string
  value:     string
  onChange:  (v: string) => void
  dark:      boolean
  disabled:  boolean
  variant:   'default' | 'card'
}
const RadioContext = createContext<RadioCtx | null>(null)

/* ── RadioGroup ─────────────────────────────────────────────── */
export interface RadioGroupProps {
  name:       string
  value:      string
  onChange:   (v: string) => void
  children:   React.ReactNode
  dark?:      boolean
  disabled?:  boolean
  variant?:   'default' | 'card'
  label?:     string
  className?: string
}

export function RadioGroup({
  name, value, onChange, children,
  dark = false, disabled = false, variant = 'default',
  label, className = '',
}: RadioGroupProps) {
  injectCss()
  return (
    <RadioContext.Provider value={{ name, value, onChange, dark, disabled, variant }}>
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <p className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</p>
        )}
        <div className={variant === 'card' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2'}>
          {children}
        </div>
      </div>
    </RadioContext.Provider>
  )
}

/* ── Radio option ───────────────────────────────────────────── */
export interface PasmalRadioProps {
  value:       string
  label?:      React.ReactNode
  hint?:       string
  icon?:       React.ReactNode
  disabled?:   boolean
  dark?:       boolean
  id?:         string
  name?:       string
  checked?:    boolean
  onChange?:   (v: string) => void
  className?:  string
}

export function PasmalRadio({
  value, label, hint, icon,
  disabled: disabledProp,
  dark: darkProp,
  id: idProp,
  name: nameProp,
  checked: checkedProp,
  onChange: onChangeProp,
  className = '',
}: PasmalRadioProps) {
  injectCss()

  const ctx    = useContext(RadioContext)
  const autoId = useId()
  const id     = idProp ?? autoId

  const isChecked  = ctx ? ctx.value === value : (checkedProp ?? false)
  const isDisabled = ctx ? ctx.disabled || (disabledProp ?? false) : (disabledProp ?? false)
  const isDark     = ctx ? ctx.dark : (darkProp ?? false)
  const variant    = ctx?.variant ?? 'default'
  const inputName  = ctx?.name ?? nameProp ?? ''

  function handleChange() {
    if (isDisabled) return
    ctx ? ctx.onChange(value) : onChangeProp?.(value)
  }

  /* ── Card variant ───────────────────────────────────────── */
  if (variant === 'card') {
    return (
      <label
        htmlFor={id}
        className={`
          relative flex items-center gap-3 p-4 rounded-[14px] border-2 cursor-pointer
          transition-all duration-150 select-none
          ${isChecked
            ? 'border-orange-500 bg-orange-50/80 shadow-sm shadow-orange-100'
            : isDark
              ? 'border-slate-700 bg-slate-800/60 hover:border-orange-400'
              : 'border-slate-200 bg-slate-50 hover:border-orange-300'
          }
          ${isDisabled ? 'opacity-40 pointer-events-none' : ''}
          ${className}
        `}
      >
        <input
          type="radio"
          id={id}
          name={inputName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="sr-only"
        />
        {icon && <span className={isChecked ? 'text-orange-500' : isDark ? 'text-slate-400' : 'text-slate-400'}>{icon}</span>}
        <span className="flex flex-col gap-0.5 flex-1 min-w-0">
          {label && <span className={`text-sm font-semibold ${isChecked ? 'text-orange-600' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>}
          {hint  && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</span>}
        </span>
        {/* Radio dot indicator */}
        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${isChecked ? 'border-orange-500 bg-orange-500' : isDark ? 'border-slate-600' : 'border-slate-300'}`}>
          {isChecked && (
            <span className="_prd_dot w-2 h-2 rounded-full bg-white" />
          )}
        </span>
      </label>
    )
  }

  /* ── Default variant ────────────────────────────────────── */
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-3 cursor-pointer select-none ${isDisabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      <input
        type="radio"
        id={id}
        name={inputName}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className="sr-only"
      />
      {/* Circle */}
      <span className={`
        relative flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-px
        transition-all duration-150
        ${isChecked ? 'border-orange-500 bg-orange-500' : isDark ? 'border-slate-600 hover:border-orange-400' : 'border-slate-300 hover:border-orange-400'}
      `}>
        {isChecked && <span className="_prd_dot w-2 h-2 rounded-full bg-white" />}
      </span>

      {(label || hint) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className={`text-sm font-medium leading-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>}
          {hint  && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</span>}
        </span>
      )}
    </label>
  )
}
