import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I } from '../../lib/ui.jsx'

const VSTATUS = {
  none:     { label: 'Non vérifié',           bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',    Icon: I.Alert },
  pending:  { label: 'Vérification en cours', bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',    Icon: I.Alert },
  verified: { label: 'Agence vérifiée',       bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',  Icon: I.BadgeCheck },
  premium:  { label: 'Premium Partner',       bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',   Icon: I.Sparkles },
}
const STATUS_ORDER = ['none', 'pending', 'verified', 'premium']

const REVIEW_STATE = {
  reviewing: { label: "En cours d'examen",  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   Icon: I.Alert },
  approved:  { label: 'Dossier approuvé',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: I.CheckCircle },
  rejected:  { label: 'Dossier refusé',     bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    Icon: I.Alert },
}

const BENEFITS = [
  { id: 'badge',      Icon: I.BadgeCheck,  label: 'Badge vérifié',        desc: 'Un sceau officiel PASMAL affiché sur chaque annonce.',         minStatus: 'verified' },
  { id: 'seo',        Icon: I.TrendingUp,  label: 'Boost SEO',            desc: 'Vos annonces remontent en tête des résultats de recherche.',    minStatus: 'verified' },
  { id: 'visibility', Icon: I.Eye,         label: 'Meilleure visibilité', desc: 'Exposition prioritaire dans notre newsletter et les alertes.',   minStatus: 'verified' },
  { id: 'crm',        Icon: I.Users,       label: 'Accès CRM premium',    desc: 'Gérez tous vos contacts, leads et suivis depuis un seul outil.', minStatus: 'premium'  },
  { id: 'support',    Icon: I.Shield,      label: 'Support prioritaire',  desc: 'Un conseiller dédié répond en moins de 2 h ouvrées.',           minStatus: 'premium'  },
]

const VER_STEPS = [
  { n: 1, label: 'Compte créé',       key: 'none' },
  { n: 2, label: 'Documents soumis',  key: 'pending' },
  { n: 3, label: 'Vérifié',           key: 'verified' },
  { n: 4, label: 'Premium Partner',   key: 'premium' },
]

function VerificationBadge({ status, size = 'sm' }) {
  const cfg = VSTATUS[status] || VSTATUS.none
  const Icon = cfg.Icon
  const pad  = size === 'lg' ? 'px-4 py-2 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5'
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${cfg.bg} ${cfg.text} ${cfg.border} ${pad}`}>
      <Icon size={size === 'lg' ? 16 : 12} />
      {cfg.label}
    </span>
  )
}

function AdminReviewPanel({ reviewState, setReviewState }) {
  const cfg = REVIEW_STATE[reviewState]
  const Icon = cfg.Icon
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <I.Shield size={12} /> Revue admin
        </div>
        <div className="flex gap-1">
          {Object.keys(REVIEW_STATE).map((k) => (
            <button key={k} onClick={() => setReviewState(k)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${reviewState === k ? `${REVIEW_STATE[k].bg} ${REVIEW_STATE[k].text} ${REVIEW_STATE[k].border} border` : 'text-slate-400 hover:text-slate-600'}`}>
              {REVIEW_STATE[k].label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className={`px-5 py-4 border-l-4 ${reviewState === 'approved' ? 'border-emerald-400' : reviewState === 'rejected' ? 'border-rose-400' : 'border-amber-400'}`}>
        <div className={`flex items-start gap-3 ${cfg.text}`}>
          <Icon size={20} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-sm mb-0.5">{cfg.label}</div>
            {reviewState === 'reviewing' && (
              <p className="text-xs text-amber-600 leading-relaxed">Votre dossier est en cours d'examen par notre équipe. Délai estimé : 48 h ouvrées.</p>
            )}
            {reviewState === 'approved' && (
              <p className="text-xs text-emerald-600 leading-relaxed">Félicitations ! Votre agence a été vérifiée et votre badge est maintenant actif sur toutes vos annonces.</p>
            )}
            {reviewState === 'rejected' && (
              <>
                <p className="text-xs text-rose-600 leading-relaxed mb-2">Votre dossier n'a pas pu être validé. Motif : document illisible ou expiré.</p>
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2">
                  Soumettre à nouveau <I.ArrowRight size={11} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Documents reçus</div>
        {[
          { label: 'Extrait KBIS',            ok: true },
          { label: "Pièce d'identité",        ok: reviewState !== 'rejected' },
          { label: "Justificatif d'adresse",  ok: false },
        ].map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2 text-xs py-0.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {ok ? <I.Check size={8} strokeWidth={3} /> : <I.Alert size={8} />}
            </span>
            <span className={ok ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgencyVerificationPage() {
  const navigate = useNavigate()
  const [status,      setStatus]      = useState('none')
  const [reviewState, setReviewState] = useState('reviewing')

  const statusIdx = STATUS_ORDER.indexOf(status)

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors">
            <I.ChevronLeft size={16} /> Retour
          </button>
          <div className="font-bold text-navy-900 text-sm">Vérification agence</div>
          <VerificationBadge status={status} />
        </div>
      </div>

      {/* Demo switcher */}
      <div className="bg-[#0B1F3A] py-2 px-4 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Prévisualiser :</span>
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${status === s ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {VSTATUS[s].label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex gap-8 items-start">

          {/* Center content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Banner — shown for none / pending */}
            <AnimatePresence>
              {(status === 'none' || status === 'pending') && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  className="relative overflow-hidden rounded-2xl bg-[#0B1F3A] px-6 py-5 flex items-center gap-4"
                >
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-orange-500 opacity-15 blur-3xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                    <I.TrendingUp size={22} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-extrabold text-base mb-0.5">
                      Les agences vérifiées reçoivent <span className="text-orange-400">jusqu'à 4× plus</span> de contacts.
                    </div>
                    <div className="text-slate-400 text-xs">Complétez votre vérification pour booster immédiatement votre visibilité.</div>
                  </div>
                  {status === 'none' && (
                    <button onClick={() => navigate('/auth/register/pro')}
                      className="shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
                      Commencer <I.ArrowRight size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress steps */}
            <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Progression de la vérification</div>
              <div className="flex items-start gap-0">
                {VER_STEPS.map((s, i) => {
                  const done   = statusIdx > i
                  const active = statusIdx === i
                  const last   = i === VER_STEPS.length - 1
                  return (
                    <React.Fragment key={s.n}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500 text-white' : active ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {done ? <I.Check size={14} strokeWidth={3} /> : s.n}
                        </div>
                        <div className={`mt-2 text-[11px] font-semibold text-center leading-tight ${done ? 'text-emerald-600' : active ? 'text-orange-600' : 'text-slate-400'}`}>{s.label}</div>
                      </div>
                      {!last && (
                        <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all ${statusIdx > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Status-specific panel */}
            <AnimatePresence mode="wait">
              <motion.div key={status}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {status === 'none' && (
                  <div className="bg-white rounded-2xl border border-slate-200 px-6 py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <I.Shield size={28} className="text-slate-400" />
                    </div>
                    <h3 className="font-extrabold text-navy-900 text-lg mb-2">Votre agence n'est pas encore vérifiée</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Soumettez vos documents pour obtenir le badge officiel PASMAL et multiplier vos contacts qualifiés.</p>
                    <button onClick={() => navigate('/auth/register/pro')}
                      className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      Démarrer la vérification <I.ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {status === 'pending' && (
                  <AdminReviewPanel reviewState={reviewState} setReviewState={setReviewState} />
                )}

                {status === 'verified' && (
                  <div className="bg-white rounded-2xl border border-emerald-200 px-6 py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <I.BadgeCheck size={24} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-navy-900 text-base mb-1">Agence vérifiée PASMAL</h3>
                        <p className="text-slate-500 text-sm mb-3">Votre badge est actif. Vos annonces bénéficient d'une exposition prioritaire auprès de 2,4 M d'acheteurs qualifiés.</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">4×</span> plus de contacts
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">Top 3</span> dans les recherches
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="font-bold text-navy-900">Badge</span> sur toutes les annonces
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {status === 'premium' && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1a3a6e] rounded-2xl px-6 py-6 border border-orange-500/30">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-500 opacity-10 blur-3xl pointer-events-none" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                        <I.Sparkles size={22} className="text-orange-400" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/20 border border-orange-400/30 text-orange-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                          <I.Sparkles size={10} /> Premium Partner
                        </div>
                        <h3 className="font-extrabold text-white text-base mb-1">Statut élite actif</h3>
                        <p className="text-slate-400 text-sm">Vous bénéficiez de tous les avantages PASMAL, d'un CRM intégré et d'un conseiller dédié.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Benefits grid */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Avantages de la vérification</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BENEFITS.map(({ id, Icon, label, desc, minStatus }) => {
                  const unlocked = STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf(minStatus)
                  return (
                    <motion.div key={id} whileHover={unlocked ? { y: -2 } : {}}
                      className={`rounded-2xl border p-4 transition-all ${unlocked ? 'bg-white border-slate-200 hover:border-orange-200 hover:shadow-md' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={`text-sm font-bold ${unlocked ? 'text-navy-900' : 'text-slate-400'}`}>{label}</div>
                            {!unlocked && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {VSTATUS[minStatus].label}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs leading-relaxed ${unlocked ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</div>
                        </div>
                        {unlocked && (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <I.Check size={10} strokeWidth={3} className="text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">

            {/* Badge preview card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-[#0B1F3A] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-extrabold text-sm">AG</div>
                <div>
                  <div className="text-white font-bold text-sm">Agence Demo</div>
                  <div className="text-slate-400 text-xs">Paris, Île-de-France</div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-slate-100">
                <VerificationBadge status={status} size="sm" />
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Apparence sur vos annonces</div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 text-[10px] font-bold">AG</div>
                    <span className="text-xs font-semibold text-navy-900">Agence Demo</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full w-3/4 mb-1" />
                  <div className="h-2 bg-slate-200 rounded-full w-1/2 mb-2" />
                  <VerificationBadge status={status} size="sm" />
                </div>
              </div>
            </div>

            {/* Trust stats */}
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Chiffres de confiance</div>
              {[
                { label: 'Agences vérifiées',      val: '1 240+' },
                { label: 'Contacts générés / mois', val: '86 400' },
                { label: 'Satisfaction agences',   val: '4,8 / 5' },
                { label: 'Délai de vérification',  val: '48 h' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-bold text-navy-900">{val}</span>
                </div>
              ))}
            </div>

            {/* CTA upgrade */}
            <AnimatePresence>
              {(status === 'none' || status === 'pending') && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-4 text-white text-center"
                >
                  <I.Sparkles size={20} className="mx-auto mb-2 opacity-80" />
                  <div className="font-bold text-sm mb-1">Passez Premium Partner</div>
                  <div className="text-xs text-orange-100 mb-3">CRM intégré, conseiller dédié et badge élite.</div>
                  <button onClick={() => navigate('/tarifs')}
                    className="w-full bg-white text-orange-600 font-bold text-xs py-2 rounded-xl hover:bg-orange-50 transition-colors">
                    Voir les offres
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
