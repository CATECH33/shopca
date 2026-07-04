import React from 'react'
import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import { seoAcheter, schemaBreadcrumb, schemaFaq, VILLES } from '../../lib/seo.js'

const TOP_VILLES = ['paris','lyon','marseille','bordeaux','toulouse','nice','nantes','strasbourg','montpellier','lille','rennes','grenoble']
const FAQ = [
  { q: 'Quels sont les frais d\'achat immobilier en France ?', a: 'Les frais d\'achat (frais de notaire) représentent en général 7 à 8 % du prix pour l\'ancien et 2 à 3 % pour le neuf. Ils comprennent les taxes, les droits d\'enregistrement et les honoraires du notaire.' },
  { q: 'Quelle est la durée moyenne d\'un achat immobilier ?', a: 'De la signature du compromis à l\'acte authentique, comptez environ 3 mois. La recherche du bien peut prendre de quelques semaines à plusieurs mois selon le marché.' },
  { q: 'Faut-il passer par une agence pour acheter un bien ?', a: 'Non, mais une agence immobilière apporte sécurité juridique et expertise du marché local. Les honoraires sont en général à la charge du vendeur.' },
  { q: 'Comment obtenir un prêt immobilier ?', a: 'Présentez votre dossier à plusieurs banques (revenus, apport, charges). Comparez les taux. Un courtier peut vous aider à obtenir les meilleures conditions.' },
  { q: 'Qu\'est-ce que le DPE ?', a: 'Le Diagnostic de Performance Énergétique classe le logement de A (très économe) à G (très énergivore). Il est obligatoire pour toute vente depuis 2006.' },
]

export default function AcheterPage() {
  const seo = seoAcheter(null)
  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/acheter"
        schemas={[
          schemaBreadcrumb([{ name: 'Accueil', url: '/' }, { name: 'Acheter' }]),
          schemaFaq(FAQ),
        ]}
      />
      <SeoLayout
        breadcrumb={[{ name: 'Accueil', url: '/' }, { name: 'Acheter' }]}
        hero={
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Acheter un bien immobilier en France
            </h1>
            <p className="text-white/70 mt-3 text-lg max-w-2xl">
              Des milliers d'annonces vérifiées — maisons, appartements, terrains. Trouvez votre futur chez-vous sur SHOPCA.
            </p>
            <Link to="/annonces?mode=achat"
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
              Voir les annonces →
            </Link>
          </>
        }
      >
        {/* Villes populaires */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Acheter par ville</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {VILLES.filter(v => TOP_VILLES.includes(v.slug)).map(v => (
              <Link key={v.slug} to={`/acheter/${v.slug}`}
                className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-orange-400 hover:shadow-md transition group">
                <p className="font-bold text-[#0B1F3A] group-hover:text-orange-500 transition">{v.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{v.region}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {VILLES.filter(v => !TOP_VILLES.includes(v.slug)).map(v => (
              <Link key={v.slug} to={`/acheter/${v.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* Types de biens */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Acheter par type de bien</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'maison', label: 'Maisons', icon: '🏠', desc: 'Maisons individuelles avec jardin' },
              { type: 'appartement', label: 'Appartements', icon: '🏢', desc: 'Studios, T2, T3 et plus' },
              { type: 'terrain', label: 'Terrains', icon: '🏗️', desc: 'Terrains constructibles' },
              { type: 'local', label: 'Locaux commerciaux', icon: '🏪', desc: 'Boutiques, bureaux, entrepôts' },
            ].map(item => (
              <div key={item.type}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition cursor-pointer">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-[#0B1F3A]">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guide achat */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Guide de l'achat immobilier</h2>
          <ol className="space-y-4">
            {[
              { n: 1, t: 'Définissez votre budget', d: 'Calculez votre capacité d\'emprunt, prévoyez les frais de notaire (7–8 % dans l\'ancien) et votre apport personnel.' },
              { n: 2, t: 'Recherchez votre bien', d: 'Utilisez SHOPCA pour consulter des milliers d\'annonces filtrées par ville, type, surface et prix.' },
              { n: 3, t: 'Visitez et négociez', d: 'Préparez vos visites, posez les bonnes questions (DPE, charges, travaux) et faites une offre.' },
              { n: 4, t: 'Signez le compromis', d: 'Le compromis engage les deux parties. Vous disposez de 10 jours pour vous rétracter.' },
              { n: 5, t: 'Obtenez votre financement', d: 'Déposez votre dossier dans plusieurs banques. Vous avez 45 jours pour obtenir votre prêt.' },
              { n: 6, t: 'Signez l\'acte authentique', d: 'Chez le notaire. Vous devenez officiellement propriétaire !' },
            ].map(step => (
              <li key={step.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-extrabold flex items-center justify-center shrink-0">{step.n}</div>
                <div>
                  <p className="font-bold text-[#0B1F3A]">{step.t}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Questions fréquentes — achat immobilier</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
