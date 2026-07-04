import React from 'react'
import { I } from '../../../lib/ui.jsx'
import { ShopCAInput } from '../../../components/ui/ShopCAInput'

export function FormField({ label, type = 'text', value, onChange, placeholder, icon: Icon, error }) {
  return (
    <ShopCAInput
      type={type}
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      icon={Icon ? <Icon size={15} /> : undefined}
      error={error}
    />
  )
}

export function PasswordField({ label = 'Mot de passe', value, onChange, error }) {
  return (
    <ShopCAInput
      type="password"
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="••••••••"
      icon={<I.Lock size={15} />}
      error={error}
    />
  )
}
