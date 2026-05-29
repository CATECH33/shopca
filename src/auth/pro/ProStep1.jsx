import React from 'react'
import { FormField } from '../components/FormField.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { I } from '../../lib/ui.jsx'
import { formatSiret } from '../validators/proValidators.js'

const BUSINESS_TYPES = [
  'Agence immobilière',
  'Promoteur immobilier',
  'Mandataire indépendant',
  'Gestionnaire de biens',
  'Notaire',
  'Autre',
]

export default function ProStep1({ data, set, error }) {
  const f = (key) => (v) => { set(key, v) }

  return (
    <div className="space-y-4">
      <FormField label="Nom de la société" value={data.companyName} onChange={f('companyName')}
        placeholder="Immobilier Dupont & Associés" icon={I.Building} />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="SIRET" value={data.siret}
          onChange={v => set('siret', formatSiret(v))}
          placeholder="123 456 789 01234" icon={I.Shield} />
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Type d'activité
          </label>
          <div className="flex items-center gap-2.5 px-4 h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white transition-all">
            <I.Building size={15} className="text-slate-400 shrink-0" />
            <select value={data.businessType} onChange={e => set('businessType', e.target.value)}
              className="flex-1 text-sm text-navy-900 bg-transparent outline-none appearance-none cursor-pointer">
              <option value="">Sélectionner…</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <I.ChevronDown size={14} className="text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      <FormField label="E-mail professionnel" type="email" value={data.email} onChange={f('email')}
        placeholder="contact@votre-agence.fr" icon={I.Mail} />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Téléphone" value={data.phone} onChange={f('phone')}
          placeholder="+33 1 23 45 67 89" icon={I.Phone} />
        <FormField label="Site web" value={data.website} onChange={f('website')}
          placeholder="https://votre-agence.fr" icon={I.Globe} />
      </div>

      <FormField label="Adresse" value={data.address} onChange={f('address')}
        placeholder="12 rue de la Paix, 75001 Paris" icon={I.MapPin} />

      <ErrorBanner msg={error} />
    </div>
  )
}
