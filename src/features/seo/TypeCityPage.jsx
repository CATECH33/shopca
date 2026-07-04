import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import {
  getVille, seoTypeVille, TYPES_BIENS,
  schemaBreadcrumb, schemaFaq, VILLES,
} from '../../lib/seo.js'
import { supabase } from '../../lib/supabase.js'

function ListingCard({ l, mode }) {
  return (
    <Link to={`/annonces/${l.id}`}
      className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-orange-300 transition group">
      <div className="h-40 bg-slate-100 overflow-hidden">
        {l.photos?.[0]
          ? <img src={l.photos[0]} alt={l.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">🏠</div>
        }
      </div>
      <div className="p-4">
        <p className="font-bold text-[#0B1F3A] text-sm truncate">{l.title}</p>
        <p className="text-orange-500 font-extrabold text-base mt-1">
          {l.price?.toLocaleString('fr-FR')} €{mode === 'location' ? '/mois' : ''}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {l.surface ? `${l.surface} m²` : ''} {l.rooms ? `· ${l.rooms} pièces` : ''}
        </p>
      </div>
    </Link>
  )
}

export default function TypeCityPage({ mode }) {
  const { type, ville: villeSlug } = useParams()
  const navigate = useNavigate()
  const ville    = getVille(villeSlug)
  const bien     = TYPES_BIENS[type]
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!ville || !bien) { navigate('/404', { replace: true }); return }
    supabase
      .from('listings')
      .select('id, title, price, photos, surface, rooms, city, property_type, status')
      .eq('status', 'active')
      .ilike('city', `%${ville.nom}%`)
      .ilike('property_type', `%${bien.label}%`)
      .limit(6)
      .then(({ data }) => { setListings(data ?? []); setLoading(false) })
  }, [ville, bien, navigate])

  if (!ville || !bien) return null

  const seo = seoTypeVille(mode, type, ville)
  const actionLabel = mode === 'achat' ? 'Acheter' : 'Louer'
  const baseUrl     = mode === 'achat' ? '/acheter' : '/louer'

  const faq = [
    { q: `Comment trouver une ${bien.label} à ${mode === 'achat' ? 'acheter' : 'louer'} à ${ville.nom} ?`, a: `Utilisez les filtres SHOPCA pour cibler les ${bien.labelPluriel} disponibles à ${ville.nom}. Activez une alerte pour être notifié en temps réel des nouvelles annonces.` },
    { q: `Quel budget prévoir pour ${mode === 'achat' ? 'acheter' : 'louer'} une ${bien.label} à ${ville.nom} ?`, a: `Le budget dépend du quartier, de la surface et de l'état du bien. Consultez nos annonces actuelles pour une estimation réaliste du marché à ${ville.nom}.` },
    { q: `Y a-t-il des aides pour ${mode === 'achat' ? 'l\'achat' : 'la location'} d'une ${bien.label} à ${ville.nom} ?`, a: `Oui. Pour l'achat : PTZ (Prêt à Taux Zéro), MaPrimeRénov', ANAH. Pour la location : APL, ALF, ALS selon votre situation. Renseignez-vous auprès de la CAF.` },
  ]

  const breadcrumb = [
    { name: 'Accueil', url: '/' },
    { name: actionLabel, url: baseUrl },
    { name: ville.nom, url: `${baseUrl}/${villeSlug}` },
    { name: bien.labelPluriel.charAt(0).toUpperCase() + bien.labelPluriel.slice(1) },
  ]

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`${baseUrl}/${type}/${villeSlug}`}
        schemas={[
          schemaBreadcrumb(breadcrumb),
          schemaFaq(faq),
        ]}
      />
      <SeoLayout
        breadcrumb={breadcrumb}
        hero={
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {actionLabel}{' '}
              <span className="text-orange-400 capitalize">{bien.labelPluriel}</span>{' '}
              à {ville.nom}
            </h1>
            <p className="text-white/70 mt-3 text-lg">
              {ville.region} · Département {ville.dept}
            </p>
            <Link to={`/annonces?city=${ville.nom}&type=${type}`}
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
              Voir les {bien.labelPluriel} à {ville.nom} →
            </Link>
          </>
        }
      >
        {/* Annonces */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-[#0B1F3A]">
              {bien.labelPluriel.charAt(0).toUpperCase() + bien.labelPluriel.slice(1)} à {mode === 'achat' ? 'vendre' : 'louer'} à {ville.nom}
            </h2>
            <Link to={`/annonces?city=${ville.nom}&type=${type}`} className="text-sm text-orange-500 font-semibold hover:underline">
              Voir tout →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl h-52 animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map(l => <ListingCard key={l.id} l={l} mode={mode} />)}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm mb-3">Pas encore de {bien.labelPluriel} disponibles à {ville.nom}</p>
              <Link to="/annonces" className="text-orange-500 font-semibold text-sm hover:underline">
                Voir toutes les annonces →
              </Link>
            </div>
          )}
        </section>

        {/* Autres types */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Autres recherches à {ville.nom}</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPES_BIENS).filter(([k]) => k !== type).map(([k, b]) => (
              <Link key={k} to={`${baseUrl}/${k}/${villeSlug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {actionLabel} {b.labelPluriel} à {ville.nom}
              </Link>
            ))}
            <Link to={`${baseUrl}/${villeSlug}`}
              className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
              Tout {actionLabel.toLowerCase()} à {ville.nom}
            </Link>
          </div>
        </section>

        {/* Autres villes */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">{actionLabel} {bien.labelPluriel} dans d'autres villes</h2>
          <div className="flex flex-wrap gap-2">
            {VILLES.filter(v => v.slug !== villeSlug).slice(0, 12).map(v => (
              <Link key={v.slug} to={`${baseUrl}/${type}/${v.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Questions fréquentes</h2>
          <div className="space-y-2">
            {faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
