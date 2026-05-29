import React from 'react'
import DocumentUpload from '../components/DocumentUpload.jsx'
import { I } from '../../lib/ui.jsx'

export default function ProStep4({ data, set }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex gap-3">
        <I.Shield size={16} className="text-navy-700 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600">
          La vérification permet d'obtenir le badge <strong>Agence vérifiée</strong> sur votre profil. Ces documents sont traités de façon confidentielle et ne sont pas publiés.
        </p>
      </div>

      <DocumentUpload
        label="Extrait Kbis"
        hint="Kbis de moins de 3 mois"
        value={data.kbis}
        onChange={v => set('kbis', v)}
      />

      <DocumentUpload
        label="Pièce d'identité du dirigeant"
        hint="CNI ou passeport en cours de validité"
        value={data.idDoc}
        onChange={v => set('idDoc', v)}
      />

      <div className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-5 flex items-center gap-3 opacity-60">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <I.User size={18} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">Selfie de vérification</p>
          <p className="text-xs text-slate-400 mt-0.5">Disponible prochainement — vérification via IA</p>
        </div>
        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full shrink-0">
          Bientôt
        </span>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Tous les documents sont optionnels à cette étape. Vous pourrez les soumettre depuis votre tableau de bord.
      </p>
    </div>
  )
}
