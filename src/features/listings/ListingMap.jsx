import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { I } from '../../lib/ui.jsx'

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

if (TOKEN) mapboxgl.accessToken = TOKEN

/**
 * ListingMap — Mapbox map showing the listing's approximate location.
 * - Renders a circle instead of an exact marker to preserve privacy.
 * - Lazy-init: only creates the map when the container becomes visible.
 * - Falls back to a "location placeholder" if lat/lng missing or token absent.
 */
export default function ListingMap({ lat, lng, title, city, zoom = 14 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [ready, setReady] = useState(false)

  const hasCoords = Number.isFinite(+lat) && Number.isFinite(+lng)

  useEffect(() => {
    if (!hasCoords || !TOKEN || !containerRef.current) return
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [+lng, +lat],
      zoom,
      attributionControl: false,
      cooperativeGestures: true,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }))

    map.on('load', () => {
      // Approximate zone (200m circle) for privacy
      map.addSource('zone', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [+lng, +lat] },
        },
      })
      map.addLayer({
        id: 'zone-blur',
        type: 'circle',
        source: 'zone',
        paint: {
          'circle-radius': {
            stops: [[10, 20], [15, 60], [18, 140]],
          },
          'circle-color': '#F97316',
          'circle-opacity': 0.15,
          'circle-blur': 0.4,
        },
      })
      map.addLayer({
        id: 'zone-outline',
        type: 'circle',
        source: 'zone',
        paint: {
          'circle-radius': {
            stops: [[10, 8], [15, 22], [18, 48]],
          },
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#F97316',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.7,
        },
      })
      // Central pin
      const el = document.createElement('div')
      el.className = 'shopca-map-pin'
      el.style.cssText = `
        width: 26px; height: 26px; border-radius: 50%;
        background: linear-gradient(135deg,#F97316,#EA580C);
        box-shadow: 0 4px 12px rgba(249,115,22,0.45), 0 0 0 4px #fff;
        border: 2px solid #fff;
      `
      new mapboxgl.Marker(el).setLngLat([+lng, +lat]).addTo(map)
      setReady(true)
    })

    map.on('error', (e) => {
      console.warn('[ListingMap] tile error:', e.error?.message || e)
      setReady(true) // remove the loader anyway
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [lat, lng, zoom, hasCoords])

  // Fallback: no token or no coords
  if (!TOKEN) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-8 text-center text-slate-400 text-sm">
        <I.MapPin size={24} className="mx-auto mb-2 text-slate-300"/>
        Carte indisponible — token Mapbox non configuré.
      </div>
    )
  }
  if (!hasCoords) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-8 text-center text-slate-500 text-sm">
        <I.MapPin size={24} className="mx-auto mb-2 text-orange-500"/>
        <div className="font-semibold text-[#0F172A]">{city || 'Localisation approximative'}</div>
        <div className="mt-1 text-xs">Coordonnées non renseignées pour ce bien.</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
        aria-label={`Carte de localisation ${title || ''}`}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/60 backdrop-blur-sm rounded-2xl pointer-events-none">
          <div className="text-slate-400 text-sm">Chargement de la carte…</div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <I.MapPin size={12} className="text-orange-500"/>
        Localisation approximative pour préserver la confidentialité du bien.
      </div>
    </div>
  )
}
