import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import {
  getVille, seoAcheter, seoLouer,
  schemaBreadcrumb, schemaFaq, VILLES,
} from '../../lib/seo.js'
import { supabase } from '../../lib/supabase.js'

function fmtPrice(n) {
  if (!n) return '—'
  return n.toLocaleString('fr-FR') + ' €'
}

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
        <p className="text-orange-500 font-extrabold text-base mt-1">{fmtPrice(l.price)}{mode === 'location' ? '/mois' : ''}</p>
        <p className="text-xs text-slate-400 mt-1">{l.surface ? `${l.surface} m²` : ''} {l.rooms ? `· ${l.rooms} pièces` : ''}</p>
      </div>
    </Link>
  )
}

export default function CityPage({ mode }) {
  const { ville: villeSlug } = useParams()
  const navigate = useNavigate()
  const ville = getVille(villeSlug)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ville) { navigate('/404', { replace: true }); return }
    supabase
      .from('listings')
      .select('id, title, price, photos, surface, rooms, city, status')
      .eq('status', 'active')
      .ilike('city', `%${ville.nom}%`)
      .limit(6)
      .then(({ data }) => { setListings(data ?? []); setLoading(false) })
  }, [ville, navigate])

  if (!ville) return null

  const seo = mode === 'achat' ? seoAcheter(ville) : seoLouer(ville)
  const actionLabel = mode === 'achat' ? 'Acheter' : 'Louer'
  const baseUrl     = mode === 'achat' ? '/acheter' : '/louer'

  const faq = mode === 'achat' ? [
    { q: `Quel est le prix moyen au m² à ${ville.nom} ?`, a: `Le prix au m² à ${ville.nom} varie selon les quartiers. Consultez nos annonces pour les prix actuels du marché.` },
    { q: `Est-ce le bon moment pour acheter à ${ville.nom} ?`, a: `Le marché immobilier à ${ville.nom} évolue. Analysez les tendances locales et votre capacité d'emprunt avant de décider.` },
    { q: `Quels sont les quartiers les plus recherchés à ${ville.nom} ?`, a: `${ville.nom} compte plusieurs secteurs prisés selon vos critères (transports, écoles, commerces). Nos agences partenaires peuvent vous guider.` },
  ] : [
    { q: `Quel est le loyer moyen à ${ville.nom} ?`, a: `Le loyer moyen à ${ville.nom} dépend du type de bien et du quartier. Consultez nos annonces pour les prix actuels.` },
    { q: `Y a-t-il un encadrement des loyers à ${ville.nom} ?`, a: `L'encadrement des loyers s'applique dans plusieurs grandes villes françaises. Renseignez-vous auprès de la mairie de ${ville.nom} pour connaître les règles en vigueur.` },
    { q: `Combien de temps faut-il pour trouver un logement à ${ville.nom} ?`, a: `Dans les zones tendues comme ${ville.nom}, prévoyez 2 à 8 semaines. Activer les alertes PASMAL augmente vos chances de trouver rapidement.` },
  ]

  const breadcrumb = [
    { name: 'Accueil', url: '/' },
    { name: actionLabel, url: baseUrl },
    { name: ville.nom },
  ]

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`${baseUrl}/${villeSlug}`}
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
              {mode === 'achat'
                ? <>Acheter un bien immobilier à <span className="text-orange-400">{ville.nom}</span></>
                : <>Location immobilière à <span className="text-orange-400">{ville.nom}</span></>
              }
            </h1>
            <p className="text-white/70 mt-3 text-lg">
              {ville.region} · Département {ville.dept}
            </p>
            <Link to={`/annonces?city=${ville.nom}`}
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
              Voir les annonces à {ville.nom} →
            </Link>
          </>
        }
      >
        {/* Annonces récentes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-[#0B1F3A]">
              Annonces à {ville.nom}
            </h2>
            <Link to={`/annonces?city=${ville.nom}`} className="text-sm text-orange-500 font-semibold hover:underline">
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
              <p className="text-slate-400 text-sm mb-3">Pas encore d'annonces à {ville.nom}</p>
              <Link to="/annonces" className="text-orange-500 font-semibold text-sm hover:underline">
                Voir toutes les annonces →
              </Link>
            </div>
          )}
        </section>

        {/* Autres types */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">
            {mode === 'achat' ? `Acheter` : `Louer`} par type à {ville.nom}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['maison', 'appartement'].map(type => (
              <Link key={type} to={`${baseUrl}/${type}/${villeSlug}`}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition text-center group">
                <div className="text-2xl mb-1">{type === 'maison' ? '🏠' : '🏢'}</div>
                <p className="font-bold text-[#0B1F3A] text-sm capitalize group-hover:text-orange-500 transition">
                  {mode === 'achat' ? 'Acheter' : 'Louer'} {type}
                </p>
              </Link>
            ))}
            <Link to={`/agences/${villeSlug}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition text-center group">
              <div className="text-2xl mb-1">🏢</div>
              <p className="font-bold text-[#0B1F3A] text-sm group-hover:text-orange-500 transition">Agences à {ville.nom}</p>
            </Link>
            <Link to={`/annonces?city=${ville.nom}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition text-center group">
              <div className="text-2xl mb-1">🔍</div>
              <p className="font-bold text-[#0B1F3A] text-sm group-hover:text-orange-500 transition">Toutes les annonces</p>
            </Link>
          </div>
        </section>

        {/* Villes proches */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Autres villes</h2>
          <div className="flex flex-wrap gap-2">
            {VILLES.filter(v => v.slug !== villeSlug).slice(0, 12).map(v => (
              <Link key={v.slug} to={`${baseUrl}/${v.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">
            Questions fréquentes — {mode === 'achat' ? 'achat' : 'location'} à {ville.nom}
          </h2>
          <div className="space-y-2">
            {faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
