import React, { useState } from 'react'
import { I } from '../../lib/ui.jsx'

export function FormField({ label, type = 'text', value, onChange, placeholder, icon: Icon, right, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className={`flex items-center gap-2.5 px-4 h-12 rounded-2xl border-2 bg-white transition-all ${
        error   ? 'border-rose-400 shadow-[0_0_0_3px_rgba(244,63,94,0.10)]' :
        focused ? 'border-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,0.10)]' :
                  'border-slate-200 hover:border-slate-300'
      }`}>
        {Icon && <Icon size={15} className={error ? 'text-rose-400' : focused ? 'text-orange-400' : 'text-slate-400'} />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 text-sm text-navy-900 placeholder-slate-400 bg-transparent outline-none"
        />
        {right}
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1 ml-0.5">{error}</p>}
    </div>
  )
}

export function PasswordField({ label = 'Mot de passe', value, onChange, error }) {
  const [show, setShow] = useState(false)
  return (
    <FormField
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder="••••••••"
      icon={I.Lock}
      error={error}
      right={
        <button type="button" tabIndex={-1} onClick={() => setShow(v => !v)}
          className="text-slate-400 hover:text-navy-700 transition-colors">
          {show ? <I.EyeOff size={15} /> : <I.Eye size={15} />}
        </button>
      }
    />
  )
}
