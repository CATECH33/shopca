import React, { forwardRef, useId } from 'react'

export interface ShopCATextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string
  error?:    string
  hint?:     string
  dark?:     boolean
  containerClassName?: string
}

export const ShopCATextarea = forwardRef<HTMLTextAreaElement, ShopCATextareaProps>(
  function ShopCATextarea(
    { label, error, hint, dark = false, containerClassName = '', disabled, id: idProp, className = '', ...rest },
    ref
  ) {
    const autoId = useId()
    const id = idProp ?? autoId

    const baseBg   = dark ? 'bg-slate-800/60'  : 'bg-slate-50'
    const baseBord = dark ? 'border-slate-700'  : 'border-slate-200'
    const textCol  = dark ? 'text-slate-100 placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-400'
    const labelCol = dark ? 'text-slate-300'    : 'text-slate-600'
    const errBord  = error ? '!border-rose-400' : ''

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className={`text-sm font-medium ${labelCol}`}>{label}</label>
        )}

        <div className={`
          rounded-[14px] border-2 transition-all duration-200
          ${baseBg} ${baseBord} ${errBord}
          focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}>
          <textarea
            ref={ref}
            id={id}
            disabled={disabled}
            className={`
              w-full bg-transparent outline-none text-sm font-medium p-4 resize-none
              ${textCol} ${className}
            `}
            {...rest}
          />
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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

ShopCATextarea.displayName = 'ShopCATextarea'
