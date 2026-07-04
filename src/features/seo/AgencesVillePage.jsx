import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SeoHead from '../../components/SeoHead.jsx'
import SeoLayout, { FaqItem } from './SeoLayout.jsx'
import { getVille, seoAgences, schemaBreadcrumb, schemaFaq, VILLES } from '../../lib/seo.js'
import { supabase } from '../../lib/supabase.js'

export default function AgencesVillePage() {
  const { ville: villeSlug } = useParams()
  const navigate = useNavigate()
  const ville = getVille(villeSlug)
  const [agences, setAgences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ville) { navigate('/404', { replace: true }); return }
    supabase
      .from('agencies')
      .select('id, name, logo_url, city, status, plan, agent_count, description')
      .eq('status', 'approved')
      .ilike('city', `%${ville.nom}%`)
      .limit(9)
      .then(({ data }) => { setAgences(data ?? []); setLoading(false) })
  }, [ville, navigate])

  if (!ville) return null

  const seo = seoAgences(ville)
  const breadcrumb = [
    { name: 'Accueil', url: '/' },
    { name: 'Agences', url: '/agences' },
    { name: ville.nom },
  ]

  const faq = [
    { q: `Comment choisir une agence immobilière à ${ville.nom} ?`, a: `Vérifiez la réputation, le nombre d'annonces actives, les avis clients et la spécialisation de l'agence (résidentiel, commercial, neuf...). Les agences certifiées SHOPCA ont passé notre processus de vérification.` },
    { q: `Combien coûte une agence immobilière à ${ville.nom} ?`, a: `Les honoraires d'agence représentent en général 3 à 8 % du prix de vente, à la charge du vendeur ou partagés. Pour une location, comptez 1 mois de loyer maximum (loi Alur).` },
    { q: `Puis-je vendre sans agence à ${ville.nom} ?`, a: `Oui, la vente de particulier à particulier est possible. Cependant, une agence apporte expertise du marché local, diffusion des annonces, visites et sécurisation juridique de la transaction.` },
  ]

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`/agences/${villeSlug}`}
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
              Agences immobilières à <span className="text-orange-400">{ville.nom}</span>
            </h1>
            <p className="text-white/70 mt-3 text-lg">
              {ville.region} · Agences certifiées SHOPCA
            </p>
          </>
        }
      >
        {/* Agences */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Agences à {ville.nom}</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : agences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agences.map(a => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-orange-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    {a.logo_url
                      ? <img src={a.logo_url} alt={a.name} className="w-10 h-10 rounded-xl object-cover" loading="lazy" />
                      : <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-extrabold">{a.name?.[0]}</div>
                    }
                    <div>
                      <p className="font-bold text-[#0B1F3A] text-sm">{a.name}</p>
                      {a.plan && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold capitalize">{a.plan}</span>}
                    </div>
                  </div>
                  {a.description && <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>}
                  {a.agent_count > 0 && <p className="text-xs text-slate-400 mt-2">{a.agent_count} agent{a.agent_count > 1 ? 's' : ''}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm mb-3">Pas encore d'agences référencées à {ville.nom}</p>
              <Link to="/agences" className="text-orange-500 font-semibold text-sm hover:underline">
                Voir toutes les agences →
              </Link>
            </div>
          )}
        </section>

        {/* Autres villes */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Agences dans d'autres villes</h2>
          <div className="flex flex-wrap gap-2">
            {VILLES.filter(v => v.slug !== villeSlug).slice(0, 15).map(v => (
              <Link key={v.slug} to={`/agences/${v.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 transition">
                {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">Questions fréquentes — agences à {ville.nom}</h2>
          <div className="space-y-2">
            {faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </section>
      </SeoLayout>
    </>
  )
}
