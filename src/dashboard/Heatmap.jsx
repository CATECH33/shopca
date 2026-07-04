import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { I, Button, Badge } from '../lib/ui.jsx'

/* ============================================================
   Heatmap — Hot-zones map for real-estate listings
   - React Leaflet + CircleMarker (heat circles)
   - Light & Dark tile layers (CartoDB)
   - Local mock data
   ============================================================ */

const CITIES = [
  { name: 'Paris',         lat: 48.8566, lng:  2.3522, score: 97, listings: 4820, pricePerM2: 11400, growth: '+8.2%', region: 'Île-de-France' },
  { name: 'Lyon',          lat: 45.7640, lng:  4.8357, score: 82, listings: 1980, pricePerM2: 5680,  growth: '+5.1%', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Bordeaux',      lat: 44.8378, lng: -0.5792, score: 79, listings: 1410, pricePerM2: 4980,  growth: '+6.7%', region: 'Nouvelle-Aquitaine' },
  { name: 'Marseille',     lat: 43.2965, lng:  5.3698, score: 71, listings: 2310, pricePerM2: 3920,  growth: '+4.4%', region: 'PACA' },
  { name: 'Nice',          lat: 43.7102, lng:  7.2620, score: 88, listings: 1240, pricePerM2: 6210,  growth: '+9.3%', region: 'PACA' },
  { name: 'Toulouse',      lat: 43.6047, lng:  1.4442, score: 68, listings: 1620, pricePerM2: 4120,  growth: '+3.8%', region: 'Occitanie' },
  { name: 'Nantes',        lat: 47.2184, lng: -1.5536, score: 74, listings: 1180, pricePerM2: 4520,  growth: '+5.9%', region: 'Pays de la Loire' },
  { name: 'Strasbourg',    lat: 48.5734, lng:  7.7521, score: 61, listings: 880,  pricePerM2: 3820,  growth: '+2.7%', region: 'Grand Est' },
  { name: 'Lille',         lat: 50.6292, lng:  3.0573, score: 63, listings: 1010, pricePerM2: 3580,  growth: '+3.1%', region: 'Hauts-de-France' },
  { name: 'Montpellier',   lat: 43.6108, lng:  3.8767, score: 76, listings: 940,  pricePerM2: 4380,  growth: '+6.2%', region: 'Occitanie' },
  { name: 'Rennes',        lat: 48.1173, lng: -1.6778, score: 70, listings: 720,  pricePerM2: 4010,  growth: '+5.4%', region: 'Bretagne' },
  { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474, score: 84, listings: 610, pricePerM2: 5240,  growth: '+7.5%', region: 'PACA' },
  { name: 'Cannes',        lat: 43.5528, lng:  7.0174, score: 81, listings: 510,  pricePerM2: 7980,  growth: '+6.8%', region: 'PACA' },
  { name: 'Annecy',        lat: 45.8992, lng:  6.1294, score: 78, listings: 410,  pricePerM2: 5640,  growth: '+8.1%', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Saint-Malo',    lat: 48.6493, lng: -2.0257, score: 58, listings: 280,  pricePerM2: 3920,  growth: '+2.4%', region: 'Bretagne' },
  { name: 'Reims',         lat: 49.2583, lng:  4.0317, score: 45, listings: 520,  pricePerM2: 2810,  growth: '+1.2%', region: 'Grand Est' },
  { name: 'Le Havre',      lat: 49.4944, lng:  0.1079, score: 38, listings: 480,  pricePerM2: 2210,  growth: '-0.5%', region: 'Normandie' },
  { name: 'Limoges',       lat: 45.8336, lng:  1.2611, score: 32, listings: 310,  pricePerM2: 1640,  growth: '-1.1%', region: 'Nouvelle-Aquitaine' },
]

const FRANCE_CENTER = [46.6, 2.5]
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'

const heatColor = (score) => {
  if (score >= 85) return '#DC2626' // red
  if (score >= 70) return '#FF6B00' // orange (brand)
  if (score >= 55) return '#F59E0B' // amber
  if (score >= 40) return '#10B981' // emerald
  return '#0EA5E9'                  // sky (cool)
}

const heatLabel = (score) => {
  if (score >= 85) return 'Brûlante'
  if (score >= 70) return 'Très chaude'
  if (score >= 55) return 'Chaude'
  if (score >= 40) return 'Tempérée'
  return 'Calme'
}

const fmtEUR = (n) => n.toLocaleString('fr-FR') + ' €'

export default function Heatmap() {
  const [theme, setTheme] = useState('light')
  const [minScore, setMinScore] = useState(0)
  const dark = theme === 'dark'

  const cities = useMemo(() => CITIES.filter((c) => c.score >= minScore).sort((a, b) => b.score - a.score), [minScore])
  const top5 = cities.slice(0, 5)

  const totals = useMemo(() => {
    const listings = cities.reduce((s, c) => s + c.listings, 0)
    const avgPrice = Math.round(cities.reduce((s, c) => s + c.pricePerM2, 0) / cities.length)
    const hottest = cities[0]
    return { listings, avgPrice, hottest }
  }, [cities])

  return (
    <div className={`space-y-6 transition-colors ${dark ? '-mx-4 lg:-mx-8 -my-6 lg:-my-8 px-4 lg:px-8 py-6 lg:py-8 bg-navy-900' : ''}`}>
      {/* Leaflet style overrides (premium look) */}
      <style>{`
        .leaflet-container { font-family: 'Inter', system-ui, sans-serif; background: ${dark ? '#0B1F3A' : '#F7F9FC'}; }
        .leaflet-control-attribution { background: rgba(255,255,255,0.7) !important; font-size: 10px !important; backdrop-filter: blur(6px); }
        .leaflet-control-zoom a {
          background: ${dark ? 'rgba(255,255,255,0.08)' : 'white'} !important;
          color: ${dark ? '#fff' : '#0B1F3A'} !important;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E2E8F0'} !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover { background: ${dark ? 'rgba(255,255,255,0.15)' : '#F1F5F9'} !important; }
        .shopca-tip {
          background: ${dark ? '#0B1F3A' : '#FFFFFF'} !important;
          color: ${dark ? '#FFFFFF' : '#0B1F3A'} !important;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'} !important;
          border-radius: 14px !important;
          padding: 10px 12px !important;
          box-shadow: 0 20px 50px rgba(11,31,58,0.15) !important;
        }
        .shopca-tip::before { display: none !important; }
      `}</style>

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 relative z-10">
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-orange-400' : 'text-orange-600'}`}>Géographie</div>
          <h1 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>Heatmap des annonces</h1>
          <p className={`mt-1 text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>Zones les plus actives en France · {totals.listings.toLocaleString('fr-FR')} annonces analysées</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <div className={`flex items-center p-1 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
            {[['light','Clair'],['dark','Sombre']].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTheme(k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                  theme === k
                    ? (dark ? 'bg-navy-900 text-white shadow-soft' : 'bg-white text-navy-900 shadow-soft')
                    : (dark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-navy-900')
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Button variant={dark ? 'ghost' : 'outline'} size="sm"><I.Download size={14}/> Exporter</Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        <StatPill dark={dark} icon={I.Building} label="Annonces sur la carte" value={totals.listings.toLocaleString('fr-FR')} />
        <StatPill dark={dark} icon={I.TrendingUp} label="Ville la plus chaude" value={totals.hottest?.name || '—'} accent />
        <StatPill dark={dark} icon={I.Tag} label="Prix moyen au m²" value={`${totals.avgPrice.toLocaleString('fr-FR')} €`} />
        <StatPill dark={dark} icon={I.MapPin} label="Villes analysées" value={CITIES.length} />
      </div>

      {/* Map + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 relative z-10">
        {/* Map card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className={`rounded-3xl overflow-hidden border shadow-card ${dark ? 'bg-navy-800 border-white/10' : 'bg-white border-slate-100'}`}
        >
          <div className={`px-5 py-4 flex items-center justify-between border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
            <div className={`font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>France · Activité en direct</div>
            <Badge tone="orange">Mis à jour il y a 4 min</Badge>
          </div>
          <div className="h-[520px] lg:h-[600px] relative">
            <MapContainer
              center={FRANCE_CENTER}
              zoom={6}
              minZoom={5}
              maxZoom={11}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer attribution={ATTR} url={dark ? TILES.dark : TILES.light} />
              {cities.map((c) => {
                const r = 10 + Math.min(c.score, 100) * 0.28
                const color = heatColor(c.score)
                return (
                  <React.Fragment key={c.name}>
                    {/* Soft outer glow */}
                    <CircleMarker
                      center={[c.lat, c.lng]}
                      radius={r * 1.9}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.10, weight: 0 }}
                      interactive={false}
                    />
                    {/* Inner heat core */}
                    <CircleMarker
                      center={[c.lat, c.lng]}
                      radius={r}
                      pathOptions={{
                        color: '#FFFFFF', weight: 2,
                        fillColor: color, fillOpacity: 0.85,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} opacity={1} className="shopca-tip" sticky>
                        <CityTip city={c} />
                      </Tooltip>
                    </CircleMarker>
                  </React.Fragment>
                )
              })}
            </MapContainer>

            {/* Floating legend (bottom-left) */}
            <div className={`absolute bottom-4 left-4 z-[400] backdrop-blur-md border rounded-2xl p-3 shadow-card ${dark ? 'bg-navy-900/80 border-white/15' : 'bg-white/90 border-slate-100'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark ? 'text-white/60' : 'text-slate-500'}`}>Score d'activité</div>
              <div className="flex items-center gap-1.5">
                {[
                  { c: '#0EA5E9', l: '<40' },
                  { c: '#10B981', l: '40-55' },
                  { c: '#F59E0B', l: '55-70' },
                  { c: '#FF6B00', l: '70-85' },
                  { c: '#DC2626', l: '85+' },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col items-center gap-0.5">
                    <span className="w-6 h-3 rounded-md ring-1 ring-white/40" style={{ background: s.c }} />
                    <span className={`text-[9px] ${dark ? 'text-white/70' : 'text-slate-600'}`}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Filter slider */}
          <div className={`rounded-2xl p-5 border ${dark ? 'bg-navy-800 border-white/10' : 'bg-white border-slate-100 shadow-soft'}`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${dark ? 'text-white/60' : 'text-slate-500'}`}>Filtrer par activité</div>
            <div className={`flex items-baseline justify-between mb-2 ${dark ? 'text-white' : 'text-navy-900'}`}>
              <div className="text-2xl font-extrabold">{minScore}<span className={`text-sm font-medium ${dark ? 'text-white/50' : 'text-slate-500'}`}> /100</span></div>
              <Badge tone={minScore >= 70 ? 'orange' : 'slate'}>{heatLabel(Math.max(minScore, 1))}</Badge>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-orange-600"
            />
            <div className={`text-[10px] mt-1 ${dark ? 'text-white/50' : 'text-slate-400'}`}>{cities.length} villes affichées</div>
          </div>

          {/* Top zones */}
          <div className={`rounded-2xl border ${dark ? 'bg-navy-800 border-white/10' : 'bg-white border-slate-100 shadow-soft'}`}>
            <div className={`px-5 py-4 flex items-center justify-between border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
              <div className={`font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>Top zones chaudes</div>
              <Badge tone="orange">Live</Badge>
            </div>
            <ul className="p-2">
              {top5.map((c, i) => (
                <motion.li
                  key={c.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                >
                  <span className={`text-xs font-bold w-5 shrink-0 ${dark ? 'text-white/40' : 'text-slate-400'}`}>#{i + 1}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: heatColor(c.score) }} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{c.name}</div>
                    <div className={`text-[11px] truncate ${dark ? 'text-white/50' : 'text-slate-500'}`}>{c.listings.toLocaleString('fr-FR')} annonces · {fmtEUR(c.pricePerM2)}/m²</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-navy-900'}`}>{c.score}</div>
                    <div className="text-[10px] font-semibold text-emerald-500">{c.growth}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Insight card */}
          <div className={`rounded-2xl p-5 relative overflow-hidden ${dark ? 'bg-gradient-to-br from-orange-500/15 to-orange-500/0 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-white border border-orange-100'}`}>
            <I.Sparkles size={16} className={dark ? 'text-orange-400 mb-2' : 'text-orange-600 mb-2'} />
            <div className={`text-sm font-bold mb-1 ${dark ? 'text-white' : 'text-navy-900'}`}>Insight IA</div>
            <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-slate-600'}`}>
              <span className="font-semibold">Annecy</span> et <span className="font-semibold">Aix-en-Provence</span> affichent la plus forte croissance d'activité ce mois-ci (+8% en moyenne). Idéal pour cibler de nouvelles annonces premium.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Sub-components (local)
   ============================================================ */
function CityTip({ city }) {
  return (
    <div className="text-[12px] leading-snug min-w-[180px]">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-bold text-[13px]">{city.name}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: heatColor(city.score) + '22', color: heatColor(city.score) }}>
          {heatLabel(city.score)}
        </span>
      </div>
      <div className="opacity-70 text-[10px] mb-2">{city.region}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div className="opacity-60">Score</div><div className="font-bold text-right">{city.score}/100</div>
        <div className="opacity-60">Annonces</div><div className="font-bold text-right">{city.listings.toLocaleString('fr-FR')}</div>
        <div className="opacity-60">Prix/m²</div><div className="font-bold text-right">{fmtEUR(city.pricePerM2)}</div>
        <div className="opacity-60">Croissance</div><div className="font-bold text-right text-emerald-500">{city.growth}</div>
      </div>
    </div>
  )
}

function StatPill({ dark, icon: Icon, label, value, accent }) {
  return (
    <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
      dark
        ? 'bg-navy-800 border-white/10'
        : 'bg-white border-slate-100 shadow-soft'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-orange-600 text-white' : (dark ? 'bg-white/10 text-orange-400' : 'bg-orange-50 text-orange-600')}`}>
        <Icon size={18}/>
      </div>
      <div className="min-w-0">
        <div className={`text-[11px] truncate ${dark ? 'text-white/55' : 'text-slate-500'}`}>{label}</div>
        <div className={`font-extrabold text-base lg:text-lg truncate ${dark ? 'text-white' : 'text-navy-900'}`}>{value}</div>
      </div>
    </div>
  )
}
