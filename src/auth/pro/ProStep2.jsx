import React from 'react'
import AvatarUpload from '../components/AvatarUpload.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { FormField } from '../components/FormField.jsx'
import { I } from '../../lib/ui.jsx'

function CoverUpload({ value, onChange }) {
  const ref = React.useRef()
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange({ file, preview: ev.target.result })
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        Image de couverture
      </label>
      <button type="button" onClick={() => ref.current.click()}
        className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 hover:bg-orange-50 transition-colors overflow-hidden flex items-center justify-center group relative">
        {value?.preview
          ? <img src={value.preview} alt="cover" className="w-full h-full object-cover" />
          : <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-orange-400 transition-colors">
              <I.Image size={22} />
              <span className="text-xs font-semibold">Ajouter une image de couverture</span>
              <span className="text-[10px]">Recommandé : 1200 × 400 px</span>
            </div>
        }
        {value?.preview && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <I.Upload size={18} className="text-white" />
          </div>
        )}
      </button>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function ProStep2({ data, set, error }) {
  const charLeft = 600 - (data.description?.length || 0)

  return (
    <div className="space-y-5">
      <div className="flex gap-6 items-start">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Logo</label>
          <AvatarUpload value={data.logo} onChange={v => set('logo', v)} />
        </div>
        <div className="flex-1">
          <CoverUpload value={data.cover} onChange={v => set('cover', v)} />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Description de l'agence
        </label>
        <textarea value={data.description} onChange={e => set('description', e.target.value)}
          placeholder="Présentez votre agence, vos valeurs, votre expertise…"
          maxLength={600} rows={4}
          className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.10)] bg-white text-sm text-navy-900 placeholder-slate-400 outline-none transition-all resize-none" />
        <p className={`text-[11px] mt-1 text-right ${charLeft < 50 ? 'text-rose-400' : 'text-slate-400'}`}>
          {charLeft} caractères restants
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Réseaux sociaux</label>
        <FormField label="" value={data.facebook} onChange={v => set('facebook', v)}
          placeholder="https://facebook.com/votre-agence" icon={I.Globe} />
        <FormField label="" value={data.instagram} onChange={v => set('instagram', v)}
          placeholder="https://instagram.com/votre-agence" icon={I.Link} />
        <FormField label="" value={data.linkedin} onChange={v => set('linkedin', v)}
          placeholder="https://linkedin.com/company/votre-agence" icon={I.Link} />
      </div>

      <ErrorBanner msg={error} />
    </div>
  )
}
