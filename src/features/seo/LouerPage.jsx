import React from 'react'
import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import { seoLouer, schemaBreadcrumb, schemaFaq, VILLES } from '../../lib/seo.js'

const TOP_VILLES = ['paris','lyon','marseille','bordeaux','toulouse','nice','nantes','strasbourg','montpellier','lille','rennes','grenoble']
const FAQ = [
  { q: 'Quels documents fournir pour louer un appartement ?', a: 'Le bailleur peut demander : carte d\'identité, 3 derniers bulletins de salaire, contrat de travail, avis d\'imposition et RIB. Un garant peut aussi être exigé.' },
  { q: 'Qu\'est-ce que le dépôt de garantie ?', a: 'Il correspond à 1 mois de loyer hors charges pour un logement non meublé, 2 mois pour un meublé. Il doit être restitué dans les 2 mois suivant le départ (ou 1 mois si aucune dégradation).' },
  { q: 'Quelle est la durée minimale d\'un bail de location ?', a: 'Pour un logement non meublé : 3 ans (1 an si le propriétaire est une SCI ou personne morale). Pour un meublé : 1 an (9 mois pour un étudiant).' },
  { q: 'Peut-on négocier le loyer ?', a: 'Oui, surtout en dehors des zones tendues. Dans les villes avec encadrement des loyers (Paris, Lille…), le loyer est plafonné par la réglementation.' },
  { q: 'Qu\'est-ce que l\'encadrement des loyers ?', a: 'Dans certaines zones tendues, le loyer ne peut pas dépasser un loyer de référence fixé par arrêté préfectoral. Cela concerne notamment Paris, Bordeaux, Lyon, Lille et plusieurs autres villes.' },
]

export default function LouerPage() {
  const seo = seoLouer(null)
  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/louer"
        schemas={[
          schemaBreadcrumb([{ name: 'Accueil', url: '/' }, { name: 'Louer' }]),
          schemaFaq(FAQ),
        ]}
      />
      <SeoLayout
        breadcrumb={[{ name: 'Accueil', url: '/' }, { name: 'Louer' }]}
        hero={
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Location immobilière en France
            </h1>
            <p className="text-white/70 mt-3 text-lg max-w-2xl">
              Appartements meublés, maisons, studios — toutes les annonces de location vérifiées sur SHOPCA.
            </p>
            <Link to="/annonces?mode=location"
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
              Voir les locations →
            </Link>
          </>
        }
      >
        {/* Villes populaires */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Louer par ville</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {VILLES.filter(v => TOP_VILLES.includes(v.slug)).map(v => (
              <Link key={v.slug} to={`/louer/${v.slug}`}
                className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-orange-400 hover:shadow-md transition group">
                <p className="font-bold text-[#0B1F3A] group-hover:text-orange-500 transition">{v.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{v.region}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {VILLES.filter(v => !TOP_VILLES.includes(v.slug)).map(v => (
              <Link key={v.slug} to={`/louer/${v.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* Types de location */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Type de location</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Appartements', icon: '🏢', desc: 'Meublés et non meublés' },
              { label: 'Maisons', icon: '🏠', desc: 'Avec jardin, garage...' },
              { label: 'Studios', icon: '🛏️', desc: 'Idéal étudiants' },
              { label: 'Colocations', icon: '👥', desc: 'Chambre en colocation' },
            ].map(item => (
              <div key={item.label}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition cursor-pointer">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-[#0B1F3A]">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparatif loyers */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Prix des loyers en France (estimation)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-400 font-semibold">Ville</th>
                  <th className="text-right py-2 text-slate-400 font-semibold">Studio</th>
                  <th className="text-right py-2 text-slate-400 font-semibold">T2</th>
                  <th className="text-right py-2 text-slate-400 font-semibold">T3</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { v: 'Paris', s: '900–1 500 €', t2: '1 400–2 200 €', t3: '1 900–3 500 €' },
                  { v: 'Lyon', s: '550–800 €', t2: '800–1 200 €', t3: '1 100–1 700 €' },
                  { v: 'Bordeaux', s: '500–750 €', t2: '750–1 100 €', t3: '1 000–1 500 €' },
                  { v: 'Nice', s: '600–900 €', t2: '900–1 400 €', t3: '1 200–2 000 €' },
                  { v: 'Toulouse', s: '450–700 €', t2: '650–1 000 €', t3: '900–1 400 €' },
                  { v: 'Marseille', s: '450–700 €', t2: '650–1 000 €', t3: '850–1 300 €' },
                ].map(row => (
                  <tr key={row.v} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-[#0B1F3A]">{row.v}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.s}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.t2}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.t3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-3">* Estimations basées sur les tendances du marché locatif 2024-2025. Les prix varient selon le quartier, l'état et les prestations.</p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Questions fréquentes — location immobilière</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
