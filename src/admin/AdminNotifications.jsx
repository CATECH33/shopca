import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { I, Button, Badge } from '../lib/ui.jsx'

const NOTIFS = [
  { id:'N-001', title:'Annonce bloquée par l\'IA', body:'PSM-2418 — duplicate détecté à 94%', channel:'push+email', target:'Admin',     time:'Il y a 3 min',  read:false },
  { id:'N-002', title:'Nouvelle agence à valider', body:'BARNES Lyon a soumis son dossier KYC', channel:'push',       target:'Admin',     time:'Il y a 18 min', read:false },
  { id:'N-003', title:'Alerte immo disponible',    body:'12 nouvelles annonces à Lyon 6e',       channel:'email',      target:'Julien M.', time:'Il y a 1h',     read:true  },
  { id:'N-004', title:'Paiement reçu',             body:'Pack Visibilité — Camille Lefèvre',     channel:'email',      target:'Camille L.',time:'Il y a 2h',     read:true  },
  { id:'N-005', title:'KYC approuvé',              body:'Foncia Antibes validé avec succès',     channel:'push+email', target:'Foncia',    time:'Hier',          read:true  },
]

const RULES = [
  { id:'R-001', event:'Nouvelle inscription',         channels:['email'],        active:true  },
  { id:'R-002', event:'KYC soumis',                   channels:['push','email'], active:true  },
  { id:'R-003', event:'Paiement reçu',                channels:['email'],        active:true  },
  { id:'R-004', event:'Annonce signalée',             channels:['push'],         active:true  },
  { id:'R-005', event:'Duplicate détecté par l\'IA',  channels:['push','email'], active:true  },
  { id:'R-006', event:'Abonnement expiré',            channels:['email'],        active:false },
]

export default function AdminNotifications() {
  const [tab, setTab] = useState('history')

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Opérations</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="opacity-60 mt-1 text-sm">Historique des notifications et règles d'envoi automatique.</p>
        </div>
        <Button variant="primary" size="sm"><I.Plus size={14}/> Nouvelle règle</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Envoyées (24h)',  value:'284',   icon:I.Bell  },
          { label:'Push',           value:'142',   icon:I.Zap   },
          { label:'Email',          value:'142',   icon:I.Mail  },
          { label:'Non lues',       value:'2',     icon:I.Alert },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-4 bg-current/[0.04] border border-current/10 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0"><k.icon size={16}/></span>
            <div>
              <div className="text-xl font-extrabold">{k.value}</div>
              <div className="text-[11px] opacity-60">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-full border border-current/10 bg-current/[0.03] w-fit">
        {[['history','Historique'],['rules','Règles d\'envoi']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} className={`text-xs font-semibold px-4 py-1.5 rounded-full transition ${tab===k?'bg-orange-500 text-white':'opacity-60 hover:opacity-100'}`}>{l}</button>
        ))}
      </div>

      {tab === 'history' && (
        <div className="space-y-2">
          {NOTIFS.map((n,i) => (
            <motion.div key={n.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition ${n.read?'border-current/10 bg-current/[0.02]':'border-orange-500/20 bg-orange-500/[0.04]'}`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read?'bg-current/[0.07]':'bg-orange-500/15 text-orange-500'}`}>
                <I.Bell size={15}/>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"/>}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-current/10 opacity-60">{n.channel}</span>
                </div>
                <div className="text-[12px] opacity-60 mt-0.5">{n.body}</div>
                <div className="text-[11px] opacity-40 mt-1">→ {n.target} · {n.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'rules' && (
        <div className="rounded-3xl border border-current/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-current/10 bg-current/[0.03]">
                {['Événement déclencheur','Canaux','Statut','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider opacity-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RULES.map((r,i)=>(
                <motion.tr key={r.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}} className="border-b border-current/5 hover:bg-current/[0.03] transition">
                  <td className="px-4 py-3 font-semibold">{r.event}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.channels.map(c=><span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md bg-current/[0.07] border border-current/10">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.active?'emerald':'amber'}>{r.active?'Actif':'Inactif'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="w-7 h-7 rounded-lg bg-current/[0.07] hover:bg-current/[0.12] flex items-center justify-center transition"><I.Edit size={13}/></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
