import React from 'react'
import ToggleSwitch from '../components/ToggleSwitch.jsx'
import { I } from '../../lib/ui.jsx'

const ITEMS = [
  {
    key:   'showPhone',
    label: 'Afficher le téléphone publiquement',
    sub:   'Votre numéro sera visible sur votre profil et vos annonces',
    Icon:  I.Phone,
  },
  {
    key:   'whatsappLeads',
    label: 'Recevoir les leads via WhatsApp',
    sub:   'Les prospects pourront vous contacter directement sur WhatsApp',
    Icon:  I.Phone,
  },
  {
    key:   'publicProfile',
    label: 'Profil d\'agence public',
    sub:   'Votre page agence sera indexée et accessible aux visiteurs',
    Icon:  I.Globe,
  },
]

export default function ProStep3({ data, set }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3 flex gap-3">
        <I.Shield size={16} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-700">
          Ces paramètres contrôlent ce que les acheteurs et locataires voient sur votre profil. Vous pourrez les modifier à tout moment depuis votre tableau de bord.
        </p>
      </div>
      <div className="space-y-3">
        {ITEMS.map(({ key, label, sub }) => (
          <ToggleSwitch
            key={key}
            checked={!!data[key]}
            onChange={v => set(key, v)}
            label={label}
            sub={sub}
          />
        ))}
      </div>
    </div>
  )
}
