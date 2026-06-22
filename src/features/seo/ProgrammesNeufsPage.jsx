import React from 'react'
import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import { schemaBreadcrumb, schemaFaq, VILLES } from '../../lib/seo.js'

const FAQ = [
  { q: 'Quels sont les avantages d\'acheter dans le neuf ?', a: 'Frais de notaire réduits (2–3 % vs 7–8 %), garanties constructeur (décennale, parfait achèvement, bon fonctionnement), exonération de taxe foncière les 2 premières années, normes RE2020 pour l\'efficacité énergétique.' },
  { q: 'Qu\'est-ce que la VEFA ?', a: 'La Vente en l\'État Futur d\'Achèvement permet d\'acheter un logement sur plan. Vous payez par tranches à mesure de l\'avancement des travaux. Vous bénéficiez de toutes les garanties légales du neuf.' },
  { q: 'Le PTZ est-il accessible pour un programme neuf ?', a: 'Oui, le Prêt à Taux Zéro (PTZ) est disponible pour l\'achat d\'un logement neuf sous conditions de ressources. Il peut financer jusqu\'à 40 % du prix selon la zone géographique.' },
  { q: 'Quels sont les délais de livraison d\'un programme neuf ?', a: 'En général 18 à 30 mois après signature du contrat de réservation. Des pénalités de retard sont dues par le promoteur en cas de dépassement de délai.' },
]

export default function ProgrammesNeufsPage() {
  return (
    <>
      <SeoHead
        title="Programmes neufs en France — Achat appartement neuf | PASMAL"
        description="Découvrez tous les programmes immobiliers neufs en France. Appartements et maisons neufs, VEFA, PTZ, garanties constructeur. Investissez dans le neuf avec PASMAL."
        keywords="programme neuf France, appartement neuf, maison neuve, VEFA, PTZ, investissement neuf immobilier"
        canonical="/programmes-neufs"
        schemas={[
          schemaBreadcrumb([{ name: 'Accueil', url: '/' }, { name: 'Programmes neufs' }]),
          schemaFaq(FAQ),
        ]}
      />
      <SeoLayout
        breadcrumb={[{ name: 'Accueil', url: '/' }, { name: 'Programmes neufs' }]}
        hero={
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Programmes immobiliers neufs en France
            </h1>
            <p className="text-white/70 mt-3 text-lg max-w-2xl">
              Appartements et maisons neufs — VEFA, PTZ, garanties constructeur. Investissez sereinement dans le neuf.
            </p>
            <Link to="/annonces?type=neuf"
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
              Voir les programmes neufs →
            </Link>
          </>
        }
      >
        {/* Avantages */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Pourquoi acheter dans le neuf ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '💰', t: 'Frais de notaire réduits', d: '2 à 3 % dans le neuf contre 7 à 8 % dans l\'ancien. Une économie substantielle sur votre achat.' },
              { icon: '🛡️', t: 'Garanties constructeur', d: 'Garantie décennale, parfait achèvement et bon fonctionnement. Vous êtes protégé pendant 10 ans.' },
              { icon: '🌱', t: 'Normes RE2020', d: 'Logements basse consommation, charges réduites. La norme RE2020 garantit des logements écoperformants.' },
              { icon: '📋', t: 'PTZ et aides', d: 'Accès au Prêt à Taux Zéro et à d\'autres aides fiscales comme la loi Pinel pour l\'investissement locatif.' },
            ].map(item => (
              <div key={item.t} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div>
                  <p className="font-bold text-[#0B1F3A]">{item.t}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Villes programmes neufs */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Programmes neufs par ville</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {VILLES.slice(0, 12).map(v => (
              <Link key={v.slug} to={`/annonces?type=neuf&city=${v.nom}`}
                className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-orange-400 hover:shadow-md transition group">
                <p className="font-bold text-[#0B1F3A] group-hover:text-orange-500 transition">{v.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{v.region}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Questions fréquentes — immobilier neuf</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
