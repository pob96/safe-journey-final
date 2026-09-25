import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ─── Geo helpers ───────────────────────────────────────────────────────────────
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calcDistance(points: [number, number][]): number {
  return points.slice(1).reduce((sum, p, i) => sum + haversine(points[i][0], points[i][1], p[0], p[1]), 0)
}

export function nearestPointDist(pos: [number, number], route: [number, number][]): number {
  if (!route.length) return 0
  return Math.min(...route.map((p) => haversine(pos[0], pos[1], p[0], p[1])))
}

// App-wide consistent activity emojis (women)
export const ACTIVITY_EMOJIS: Record<string, string> = {
  run:   '🏃‍♀️',
  walk:  '🚶‍♀️',
  hike:  '🥾',
  cycle: '🚴‍♀️',
}

const SPEEDS: Record<string, number> = { run: 8, walk: 5, hike: 4, cycle: 16 }

export type ActivityType = 'run' | 'walk' | 'hike' | 'cycle'

export interface RouteInfo {
  points: [number, number][]
  distance: number
  name: string
  activityType: ActivityType
  estimatedMinutes: number
}

// ─── Map event helpers ─────────────────────────────────────────────────────────
function ClickHandler({ onAdd }: { onAdd: (pt: [number, number]) => void }) {
  useMapEvents({ click: (e) => onAdd([e.latlng.lat, e.latlng.lng]) })
  return null
}

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, 15, { duration: 1.2 }) }, []) // eslint-disable-line
  return null
}

// ─── Route Planner Map ────────────────────────────────────────────────────────
export function MapPlanner({ onConfirm }: { onConfirm: (info: RouteInfo) => void }) {
  const [points, setPoints] = useState<[number, number][]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(true)
  const [activity, setActivity] = useState<ActivityType>('run')
  const [routeName, setRouteName] = useState('Custom Route')

  const distance = calcDistance(points)
  const estimatedMinutes = distance > 0 ? Math.round((distance / SPEEDS[activity]) * 60) : 0

  useEffect(() => {
    if (!navigator.geolocation) { setUserPos([51.505, -0.09]); setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocating(false) },
      () => { setUserPos([51.505, -0.09]); setLocating(false) },
      { timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    if (points.length !== 1) return
    const [lat, lon] = points[0]
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { 'Accept-Language': 'en-US,en' },
    })
      .then((r) => r.json())
      .then((data) => {
        const a = data.address || {}
        const area = a.neighbourhood || a.suburb || a.quarter || a.village || a.town || a.city || 'Local'
        const suffix = { run: 'Run', walk: 'Walk', hike: 'Trail', cycle: 'Ride' }[activity]
        setRouteName(`${area} ${suffix}`)
      })
      .catch(() => {})
  }, [points.length, activity])

  const addPoint = (pt: [number, number]) => setPoints((prev) => [...prev, pt])
  const undo = () => setPoints((prev) => prev.slice(0, -1))
  const clear = () => { setPoints([]); setRouteName('Custom Route') }

  const center: [number, number] = userPos || [51.505, -0.09]

  const activityMeta: { key: ActivityType; label: string }[] = [
    { key: 'run',   label: 'run' },
    { key: 'walk',  label: 'walk' },
    { key: 'hike',  label: 'hike' },
    { key: 'cycle', label: 'cycle/\nroller' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Map */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {locating ? (
          <div className="h-full flex items-center justify-center glass-1">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
              <p className="text-sm text-[#7A6860]">Finding your location…</p>
            </div>
          </div>
        ) : (
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'/>
            <FlyTo center={center}/>
            <ClickHandler onAdd={addPoint}/>
            {userPos && (
              <>
                <CircleMarker center={userPos} radius={14} pathOptions={{ color: 'rgba(74,124,89,0.22)', fillColor: 'rgba(74,124,89,0.18)', fillOpacity: 1, weight: 0 }}/>
                <CircleMarker center={userPos} radius={7} pathOptions={{ color: '#fff', fillColor: '#4A7C59', fillOpacity: 1, weight: 2 }}/>
              </>
            )}
            {points.length > 1 && (
              <Polyline positions={points} pathOptions={{ color: '#4A7C59', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}/>
            )}
            {points.map((p, i) => (
              <CircleMarker key={i} center={p} radius={i === 0 ? 8 : i === points.length - 1 ? 8 : 5}
                pathOptions={{ color: '#fff', fillColor: i === 0 ? '#4A7C59' : i === points.length - 1 ? '#1A2A4A' : '#C8DDFB', fillOpacity: 1, weight: 2 }}/>
            ))}
          </MapContainer>
        )}

        {/* Floating map controls */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: '↩', color: '#2A1F18', disabled: points.length === 0, action: undo, title: 'Undo' },
            { label: '✕', color: '#B03030', disabled: points.length === 0, action: clear, title: 'Clear' },
          ].map((btn) => (
            <button key={btn.title} onClick={btn.action} disabled={btn.disabled} title={btn.title}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', boxShadow: '0 2px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.80)', color: btn.color, fontSize: 16, cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.38 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Tap hint */}
        {points.length === 0 && !locating && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.68)', boxShadow: '0 4px 16px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.80)', fontSize: 12, color: '#2A1F18', fontWeight: 500, whiteSpace: 'nowrap' }}>
            📍 Tap the map to trace your route
          </div>
        )}
      </div>

      {/* Bottom control panel */}
      <div className="glass-3 border-t border-white/30 px-4 pt-3 pb-4 space-y-3">
        {/* Activity selector — women emojis */}
        <div style={{ display: 'flex', gap: 6 }}>
          {activityMeta.map(({ key, label }) => (
            <button key={key} onClick={() => setActivity(key)}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 14,
                fontSize: 10, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
                lineHeight: 1.3, whiteSpace: 'pre-line', textAlign: 'center',
                ...(activity === key
                  ? { background: 'rgba(200,221,251,0.60)', color: '#0A1A3A', border: '1px solid rgba(200,221,251,0.65)', backdropFilter: 'blur(14px)', boxShadow: '0 2px 10px rgba(100,150,255,0.12), inset 0 1px 0 rgba(255,255,255,0.60)' }
                  : { background: 'rgba(255,255,255,0.28)', color: '#6A5848', border: '1px solid rgba(255,255,255,0.45)', backdropFilter: 'blur(10px)' }),
              }}>
              <span style={{ display: 'block', fontSize: 15, marginBottom: 2 }}>{ACTIVITY_EMOJIS[key]}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Stats row — route name wraps, never truncates */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Distance', value: distance > 0 ? `${distance.toFixed(2)} km` : '—' },
            { label: 'Est. time', value: estimatedMinutes > 0 ? `${estimatedMinutes} min` : '—' },
            { label: 'Route', value: points.length > 0 ? routeName : '—' },
          ].map((s) => (
            <div key={s.label} className="glass-1"
              style={{ flex: s.label === 'Route' ? 1.6 : 1, padding: '8px 6px', borderRadius: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#2A1F18', wordBreak: 'break-word', lineHeight: 1.3 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Confirm */}
        <button className="btn-blue" disabled={points.length < 2}
          onClick={() => onConfirm({ points, distance, name: routeName, activityType: activity, estimatedMinutes })}>
          {points.length === 0 ? 'Tap map to start route' : points.length === 1 ? 'Add another point to continue' : `Confirm ${routeName} →`}
        </button>
      </div>
    </div>
  )
}

// ─── Active Journey Map ───────────────────────────────────────────────────────
export function ActiveJourneyMap({ route, currentPos }: {
  route: [number, number][]
  currentPos?: [number, number] | null
}) {
  const center: [number, number] = currentPos || (route.length > 0 ? route[0] : [51.505, -0.09])

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>
      {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#4A7C59', weight: 3.5, dashArray: '8 5', opacity: 0.65, lineCap: 'round' }}/>}
      {route.length > 0 && <CircleMarker center={route[0]} radius={7} pathOptions={{ color: '#fff', fillColor: '#4A7C59', fillOpacity: 1, weight: 2 }}/>}
      {route.length > 1 && <CircleMarker center={route[route.length - 1]} radius={8} pathOptions={{ color: '#fff', fillColor: '#1A2A4A', fillOpacity: 1, weight: 2 }}/>}
      {currentPos && (
        <>
          <CircleMarker center={currentPos} radius={18} pathOptions={{ color: 'rgba(74,124,89,0)', fillColor: 'rgba(74,124,89,0.18)', fillOpacity: 1, weight: 0 }}/>
          <CircleMarker center={currentPos} radius={8} pathOptions={{ color: '#fff', fillColor: '#4A7C59', fillOpacity: 1, weight: 2.5 }}/>
        </>
      )}
    </MapContainer>
  )
}

// ─── Static fallback SVG map ──────────────────────────────────────────────────
export function StaticFallbackMap({ variant = 'normal', className = '' }: {
  variant?: 'normal' | 'offroute' | 'concern' | 'buddy'; className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg viewBox="0 0 390 260" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sfmBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8EEE4"/>
            <stop offset="100%" stopColor="#DDE8EB"/>
          </linearGradient>
        </defs>
        <rect width="390" height="260" fill="url(#sfmBg)"/>
        <line x1="0" y1="70"  x2="390" y2="70"  stroke="rgba(255,255,255,0.88)" strokeWidth="10"/>
        <line x1="0" y1="150" x2="390" y2="150" stroke="rgba(255,255,255,0.88)" strokeWidth="10"/>
        <line x1="0" y1="220" x2="390" y2="220" stroke="rgba(255,255,255,0.76)" strokeWidth="7"/>
        <line x1="75"  y1="0" x2="75"  y2="260" stroke="rgba(255,255,255,0.76)" strokeWidth="7"/>
        <line x1="195" y1="0" x2="195" y2="260" stroke="rgba(255,255,255,0.88)" strokeWidth="10"/>
        <line x1="305" y1="0" x2="305" y2="260" stroke="rgba(255,255,255,0.76)" strokeWidth="7"/>
        <rect x="80"  y="75"  width="50"  height="70" rx="6" fill="rgba(200,218,195,0.72)"/>
        <rect x="80"  y="155" width="50"  height="60" rx="6" fill="rgba(195,215,210,0.72)"/>
        <rect x="140" y="75"  width="50"  height="70" rx="6" fill="rgba(205,220,198,0.72)"/>
        <rect x="200" y="75"  width="100" height="70" rx="6" fill="rgba(200,218,195,0.72)"/>
        <rect x="200" y="155" width="100" height="60" rx="6" fill="rgba(195,215,210,0.72)"/>
        <rect x="310" y="75"  width="75"  height="70" rx="6" fill="rgba(205,220,198,0.72)"/>
        <rect x="0"   y="75"  width="70"  height="70" rx="6" fill="rgba(195,215,210,0.72)"/>
        <ellipse cx="255" cy="40" rx="65" ry="32" fill="rgba(175,210,175,0.62)"/>
        <ellipse cx="45"  cy="38" rx="40" ry="26" fill="rgba(175,210,175,0.62)"/>
        <path d="M 55 220 Q 55 150 135 150 Q 195 150 195 70 Q 195 38 255 38 Q 310 38 310 70 Q 310 110 305 150"
          fill="none" stroke="#4A7C59" strokeWidth="3" strokeDasharray="7 4" strokeLinecap="round" opacity="0.52"/>
        {(variant === 'offroute') && <path d="M 55 220 Q 55 170 95 170 Q 165 170 175 210 Q 185 230 215 230" fill="none" stroke="#C4713A" strokeWidth="3.5" strokeLinecap="round" opacity="0.85"/>}
        {(variant === 'concern') && <path d="M 55 220 Q 55 170 95 170 Q 160 170 168 200" fill="none" stroke="#C43A3A" strokeWidth="3.5" strokeLinecap="round" opacity="0.9"/>}
        <circle cx="55" cy="220" r="7" fill="#4A7C59"/><circle cx="55" cy="220" r="4" fill="white"/>
        <circle cx="305" cy="150" r="8" fill="#2D3A2E"/><circle cx="305" cy="150" r="4.5" fill="white"/>
        {variant === 'normal' && <><circle cx="195" cy="70" r="13" fill="#4A7C59" opacity="0.2"/><circle cx="195" cy="70" r="7" fill="#4A7C59"/><circle cx="195" cy="70" r="3.5" fill="white"/></>}
        {variant === 'offroute' && <><circle cx="200" cy="225" r="13" fill="#C4713A" opacity="0.22"/><circle cx="200" cy="225" r="7" fill="#C4713A"/><circle cx="200" cy="225" r="3.5" fill="white"/></>}
        {variant === 'concern' && <><circle cx="163" cy="200" r="14" fill="#C43A3A" opacity="0.25"/><circle cx="163" cy="200" r="8" fill="#C43A3A"/><circle cx="163" cy="200" r="4" fill="white"/></>}
        {variant === 'buddy' && <><circle cx="195" cy="90" r="13" fill="#4A7C59" opacity="0.2"/><circle cx="195" cy="90" r="7" fill="#4A7C59"/><circle cx="195" cy="90" r="3.5" fill="white"/></>}
      </svg>
      <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.30) 0%, transparent 100%)' }}/>
    </div>
  )
}

// ─── Polished onboarding map visual ──────────────────────────────────────────
// Clean, modern-looking map — not AI-generated fantasy style
export function OnboardingMapVisual() {
  return (
    <div style={{ width: 216, height: 138, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.60)', boxShadow: '0 12px 40px rgba(80,60,40,0.14), inset 0 1px 0 rgba(255,255,255,0.65)' }}>
      <svg viewBox="0 0 216 138" style={{ width: '100%', height: '100%' }}>
        {/* Clean light background */}
        <rect width="216" height="138" fill="#EDF2EA"/>
        {/* Park area */}
        <rect x="110" y="4" width="100" height="58" rx="10" fill="#C5DDBC" opacity="0.80"/>
        <text x="160" y="36" textAnchor="middle" fontSize="7.5" fill="#5A7A52" fontFamily="system-ui,sans-serif" fontWeight="500">Park</text>
        {/* Primary roads */}
        <line x1="0" y1="68" x2="216" y2="68" stroke="white" strokeWidth="11"/>
        <line x1="108" y1="0" x2="108" y2="138" stroke="white" strokeWidth="11"/>
        {/* Secondary roads */}
        <line x1="0"   y1="34" x2="108" y2="34" stroke="white" strokeWidth="6"/>
        <line x1="108" y1="34" x2="216" y2="34" stroke="white" strokeWidth="6"/>
        <line x1="0"   y1="104" x2="108" y2="104" stroke="white" strokeWidth="6"/>
        <line x1="54"  y1="68"  x2="54"  y2="138" stroke="white" strokeWidth="6"/>
        <line x1="162" y1="0"   x2="162" y2="68"  stroke="white" strokeWidth="6"/>
        {/* City blocks */}
        <rect x="4"   y="4"   width="48" height="28" rx="5" fill="#DDE5D8" opacity="0.85"/>
        <rect x="4"   y="72"  width="48" height="30" rx="5" fill="#D8E2D5" opacity="0.85"/>
        <rect x="58"  y="4"   width="48" height="28" rx="5" fill="#DDE5D8" opacity="0.85"/>
        <rect x="58"  y="72"  width="48" height="30" rx="5" fill="#D8E2D5" opacity="0.85"/>
        <rect x="4"   y="108" width="100" height="26" rx="5" fill="#DDE5D8" opacity="0.85"/>
        <rect x="114" y="72"  width="98"  height="30" rx="5" fill="#D8E2D5" opacity="0.85"/>
        <rect x="114" y="108" width="98"  height="26" rx="5" fill="#DDE5D8" opacity="0.85"/>
        {/* Route line */}
        <path d="M 26 120 Q 26 68 54 68 Q 108 68 108 34 Q 108 14 162 14"
          fill="none" stroke="#4A7C59" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.92"/>
        {/* Start marker */}
        <circle cx="26" cy="120" r="6.5" fill="#4A7C59"/><circle cx="26" cy="120" r="3.5" fill="white"/>
        {/* End marker */}
        <circle cx="162" cy="14" r="7.5" fill="#1A2A4A"/><circle cx="162" cy="14" r="4" fill="white"/>
        {/* Current position */}
        <circle cx="78" cy="56" r="11" fill="#4A7C59" opacity="0.17"/>
        <circle cx="78" cy="56" r="6.5" fill="#4A7C59"/>
        <circle cx="78" cy="56" r="3.5" fill="white"/>
      </svg>
    </div>
  )
}
