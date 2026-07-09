import React, { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useNavigate } from 'react-router-dom'
import { I } from '../../lib/ui.jsx'

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
if (TOKEN) mapboxgl.accessToken = TOKEN

// France center + zoom that fits main metros
const DEFAULT_CENTER = [2.3522, 46.6031]
const DEFAULT_ZOOM = 5.2

function fmtPrice(l) {
  if (l.price_label) return l.price_label
  if (typeof l.price !== 'number') return l.price ?? ''
  const s = l.price.toLocaleString('fr-FR') + ' €'
  return (l.type === 'louer' || l.type === 'colocation') ? `${s}/mois` : s
}

/**
 * ListingsMap — Full-width map with clustered markers for the /annonces list.
 * - Reads listings.lat / listings.lng
 * - Clusters at low zoom, individual markers at zoom >= 12
 * - Popup on marker click with image, title, price, "Voir l'annonce" link
 */
export default function ListingsMap({ listings }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: (listings || [])
      .filter(l => Number.isFinite(+l.lat) && Number.isFinite(+l.lng))
      .map(l => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [+l.lng, +l.lat] },
        properties: {
          id: String(l.id),
          title: l.title || '',
          price: fmtPrice(l),
          location: l.location || l.city || '',
          image: l.image_url || l.images?.[0] || '',
          rooms: l.rooms || null,
          surface: l.surface || null,
          is_premium: !!l.is_premium,
        },
      })),
  }), [listings])

  const withCoords = geojson.features.length
  const withoutCoords = (listings?.length || 0) - withCoords

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      cooperativeGestures: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }))
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    map.on('load', () => {
      map.addSource('listings', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 48,
      })

      // Cluster bubbles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#F97316', 10, '#EA580C', 25, '#C2410C'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 25, 30],
          'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff',
        },
      })
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Individual markers (as circles with premium highlight)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['case', ['get', 'is_premium'], '#F97316', '#0B1F3A'],
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Click cluster → zoom
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties.cluster_id
        map.getSource('listings').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.easeTo({ center: features[0].geometry.coordinates, zoom })
        })
      })
      map.on('mouseenter', 'clusters',        () => map.getCanvas().style.cursor = 'pointer')
      map.on('mouseleave', 'clusters',        () => map.getCanvas().style.cursor = '')
      map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer')
      map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '')

      // Marker click → popup
      map.on('click', 'unclustered-point', (e) => {
        const f = e.features[0]
        const p = f.properties
        const coords = f.geometry.coordinates.slice()
        const imgHtml = p.image
          ? `<img src="${p.image}" alt="" style="width:100%;height:120px;object-fit:cover;border-top-left-radius:12px;border-top-right-radius:12px;display:block"/>`
          : ''
        const rooms = p.rooms ? `${p.rooms} p.` : ''
        const surface = p.surface ? `${p.surface} m²` : ''
        const meta = [rooms, surface].filter(Boolean).join(' · ')
        const html = `
          <div style="width:240px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
            ${imgHtml}
            <div style="padding:12px 14px 8px">
              <div style="font-weight:800;color:#0F172A;font-size:14px;line-height:1.3;margin-bottom:2px">${p.title || 'Annonce'}</div>
              <div style="color:#64748B;font-size:12px;margin-bottom:6px">${p.location || ''}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div style="color:#F97316;font-weight:800;font-size:15px">${p.price || ''}</div>
                ${meta ? `<div style="color:#94A3B8;font-size:11px">${meta}</div>` : ''}
              </div>
              <a href="/annonces/${p.id}" data-listing-id="${p.id}" style="display:block;text-align:center;margin-top:10px;background:#F97316;color:#fff;font-weight:700;font-size:12px;padding:8px;border-radius:10px;text-decoration:none">Voir l'annonce →</a>
            </div>
          </div>`
        const popup = new mapboxgl.Popup({ offset: 16, closeButton: true, maxWidth: '260px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map)

        // Intercept anchor click → SPA navigate
        setTimeout(() => {
          const link = popup.getElement().querySelector('a[data-listing-id]')
          if (link) link.addEventListener('click', (ev) => {
            ev.preventDefault()
            navigate(`/annonces/${p.id}`)
          })
        }, 0)
      })

      // Fit to markers
      if (withCoords > 0) {
        const bounds = geojson.features.reduce((b, f) => b.extend(f.geometry.coordinates), new mapboxgl.LngLatBounds(geojson.features[0].geometry.coordinates, geojson.features[0].geometry.coordinates))
        map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 })
      }
      setReady(true)
    })

    map.on('error', (e) => {
      console.warn('[ListingsMap] tile error:', e.error?.message || e)
      setError('Erreur de chargement des tuiles Mapbox.')
      setReady(true)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Update source when listings change
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const src = map.getSource('listings')
    if (src) src.setData(geojson)
  }, [geojson])

  if (!TOKEN) {
    return (
      <div className="rounded-3xl bg-white border border-slate-100 p-16 text-center shadow-sm">
        <I.MapPin size={32} className="mx-auto mb-3 text-slate-300"/>
        <div className="text-slate-500 text-sm">Carte indisponible — token Mapbox non configuré.</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[calc(100vh-260px)] min-h-[500px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50"/>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/60 backdrop-blur-sm rounded-3xl pointer-events-none">
          <div className="text-slate-400 text-sm">Chargement de la carte…</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-white shadow"/>
          <span className="text-slate-600 font-medium">Premium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-navy-900 ring-2 ring-white shadow"/>
          <span className="text-slate-600 font-medium">Standard</span>
        </div>
        <div className="h-4 w-px bg-slate-200"/>
        <span className="text-slate-500">
          <strong className="text-[#0F172A]">{withCoords}</strong> bien{withCoords > 1 ? 's' : ''}
          {withoutCoords > 0 && <span className="text-slate-400"> · {withoutCoords} sans coord.</span>}
        </span>
      </div>

      {error && (
        <div className="absolute top-4 left-4 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-600 shadow">
          {error}
        </div>
      )}
    </div>
  )
}
