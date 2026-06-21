import React, { useState, useRef, forwardRef, useId } from 'react'

/* ── CSS injection (once) ───────────────────────────────────── */
const CSS = `
@keyframes _pi_shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
@keyframes _pi_errIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
._pi_err { animation: _pi_errIn .18s ease forwards; }
._pi_shake { animation: _pi_shake .35s ease; }
`
let _piCssInjected = false
function injectCss() {
  if (_piCssInjected || typeof document === 'undefined') return
  _piCssInjected = true
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── Types ──────────────────────────────────────────────────── */
export interface PasmalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:        string
  error?:        string
  hint?:         string
  icon?:         React.ReactNode
  iconRight?:    React.ReactNode
  valid?:        boolean
  size?:         'default' | 'sm'
  dark?:         boolean
  containerClassName?: string
}

/* ── Component ──────────────────────────────────────────────── */
export const PasmalInput = forwardRef<HTMLInputElement, PasmalInputProps>(
  function PasmalInput(
    {
      label, error, hint, icon, iconRight, valid,
      size = 'default', dark = false,
      type = 'text', className = '', containerClassName = '',
      disabled, id: idProp, ...rest
    },
    ref
  ) {
    injectCss()

    const autoId = useId()
    const id = idProp ?? autoId
    const [showPwd, setShowPwd] = useState(false)
    const [shaking, setShaking] = useState(false)
    const prevError = useRef(error)

    // Trigger shake when a new error appears
    React.useEffect(() => {
      if (error && error !== prevError.current) {
        setShaking(true)
        const t = setTimeout(() => setShaking(false), 400)
        prevError.current = error
        return () => clearTimeout(t)
      }
      prevError.current = error
    }, [error])

    const isPwd = type === 'password'
    const inputType = isPwd ? (showPwd ? 'text' : 'password') : type

    const h = size === 'sm' ? 'h-11' : 'h-14'

    const baseBg   = dark ? 'bg-slate-800/60'   : 'bg-slate-50'
    const baseBord = dark ? 'border-slate-700'   : 'border-slate-200'
    const focBord  = 'focus-within:border-orange-500'
    const focRing  = 'focus-within:ring-2 focus-within:ring-orange-100'
    const errBord  = error ? (dark ? '!border-rose-500' : '!border-rose-400') : ''
    const errRing  = error ? '!ring-0' : ''
    const validBord = (!error && valid) ? '!border-emerald-400' : ''

    const textCol  = dark ? 'text-slate-100 placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-400'
    const labelCol = dark ? 'text-slate-300' : 'text-slate-600'

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className={`text-sm font-medium ${labelCol}`}>
            {label}
          </label>
        )}

        <div
          className={`
            relative flex items-center ${h} rounded-[14px] border-2 transition-all duration-200
            ${baseBg} ${baseBord} ${focBord} ${focRing} ${errBord} ${errRing} ${validBord}
            ${disabled ? 'opacity-50 pointer-events-none' : ''}
            ${shaking ? '_pi_shake' : ''}
          `}
        >
          {/* Left icon */}
          {icon && (
            <span className={`absolute left-3.5 flex items-center justify-center pointer-events-none ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            className={`
              w-full h-full bg-transparent outline-none text-sm font-medium
              ${textCol}
              ${icon ? 'pl-10' : 'pl-4'}
              ${(isPwd || iconRight || valid) ? 'pr-10' : 'pr-4'}
              ${className}
            `}
            {...rest}
          />

          {/* Right slot: password toggle OR valid check OR custom iconRight */}
          {isPwd ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
              className={`absolute right-3.5 flex items-center justify-center w-6 h-6 rounded-md transition-colors ${dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label={showPwd ? 'Masquer' : 'Afficher'}
            >
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          ) : valid ? (
            <span className="absolute right-3.5 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          ) : iconRight ? (
            <span className={`absolute right-3.5 flex items-center justify-center pointer-events-none ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              {iconRight}
            </span>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <p className="_pi_err flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </p>
        )}

        {/* Hint (no error) */}
        {!error && hint && (
          <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</p>
        )}
      </div>
    )
  }
)

PasmalInput.displayName = 'PasmalInput'
