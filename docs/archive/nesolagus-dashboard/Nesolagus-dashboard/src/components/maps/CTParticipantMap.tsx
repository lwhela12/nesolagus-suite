'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Map, { NavigationControl, MapRef, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ZIP_CENTROIDS } from '@/data/zip_centroids'
import MODELS from '@/data/archetype_models.json'

type ArchetypeBreakdown = Record<string, number>

export type ParticipantPoint = {
  zip: string
  city: string
  count: number
  archetypes?: ArchetypeBreakdown
}

const ARCHETYPE_COLORS: Record<string, string> = Object.fromEntries(
  (MODELS as any[]).map((m: any) => [m.name, m.color])
) as Record<string, string>

function dominantArchetype(a?: ArchetypeBreakdown): string | null {
  if (!a) return null
  let maxKey: string | null = null
  let maxVal = -Infinity
  for (const [k, v] of Object.entries(a)) {
    if (v > maxVal) {
      maxVal = v
      maxKey = k
    }
  }
  return maxKey
}

// Simple, detailed OSM raster style for better zoomed-in context
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'osm', type: 'raster', source: 'osm' },
  ],
} as const

export default function CTParticipantMap({
  points = [] as ParticipantPoint[],
  selectedZip,
  onSelectZip,
}: {
  points?: ParticipantPoint[]
  selectedZip?: string
  onSelectZip?: (zip: string | null) => void
}) {
  const features = useMemo(() => {
    return points
      .map((p) => {
        const geo = ZIP_CENTROIDS[p.zip]
        if (!geo) return null
        const dom = dominantArchetype(p.archetypes)
        return {
          ...p,
          lat: geo.lat,
          lon: geo.lon,
          color: dom ? ARCHETYPE_COLORS[dom] ?? '#64B37A' : '#64B37A',
        }
      })
      .filter(Boolean) as Array<ParticipantPoint & { lat: number; lon: number; color: string }>
  }, [points])

  const center = useMemo(() => ({ latitude: 41.76, longitude: -72.69, zoom: 8 }), [])
  const mapRef = useRef<MapRef | null>(null)
  const [internalSelectedZip, setInternalSelectedZip] = useState<string | null>(null)
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null)

  const selected = useMemo(() => {
    const zip = selectedZip ?? internalSelectedZip
    return features.find((f) => f.zip === zip) ?? null
  }, [features, selectedZip, internalSelectedZip])

  // Position HTML popup overlay; avoid MapLibre Popup to sidestep dev overlay bugs
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !selected) { setOverlayPos(null); return }
    const update = () => {
      try {
        const p = map.project([selected.lon as number, selected.lat as number]) as any
        if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) setOverlayPos({ x: p.x, y: p.y })
      } catch {}
    }
    update()
    map.on('move', update)
    map.on('zoom', update)
    map.on('resize', update)
    return () => {
      map.off('move', update)
      map.off('zoom', update)
      map.off('resize', update)
    }
  }, [selected?.zip])

  function handleSelect(zip: string | null) {
    if (onSelectZip) onSelectZip(zip)
    else setInternalSelectedZip(zip)
  }

  // Build a GeoJSON for stable, performant circle rendering
  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: features.map((f) => ({
      type: 'Feature',
      properties: {
        zip: f.zip,
        city: f.city,
        count: f.count,
        color: f.color,
      },
      geometry: { type: 'Point', coordinates: [f.lon, f.lat] },
    })),
  }) as any, [features])

  // Suppress noisy dev overlay when MapLibre dispatches DOM Events as rejections
  useEffect(() => {
    const onRejection = (ev: any) => {
      const reason = ev?.reason
      const tag = Object.prototype.toString.call(reason)
      if (reason instanceof Event || tag === '[object Event]' || tag === '[object ProgressEvent]') {
        ev?.preventDefault?.()
        ev?.stopImmediatePropagation?.()
        // eslint-disable-next-line no-console
        console.warn('[maplibre] suppressed unhandledrejection', reason)
      }
    }
    const onErrorEvt = (ev: any) => {
      if (!ev?.error && (ev instanceof Event)) {
        ev?.preventDefault?.()
        ev?.stopImmediatePropagation?.()
        // eslint-disable-next-line no-console
        console.warn('[maplibre] suppressed window error event')
      }
    }
    window.addEventListener('unhandledrejection', onRejection, { capture: true })
    window.addEventListener('error', onErrorEvt, { capture: true })
    return () => {
      window.removeEventListener('unhandledrejection', onRejection, { capture: true } as any)
      window.removeEventListener('error', onErrorEvt, { capture: true } as any)
    }
  }, [])

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
      <Map
        ref={mapRef}
        initialViewState={center}
        mapStyle={OSM_STYLE as any}
        // Ensure map fills the container in all browsers
        style={{ width: '100%', height: '100%' }}
        dragRotate={false}
        touchPitch={false}
        onLoad={() => {
          try {
            const map = mapRef.current?.getMap()
            const canvas = map?.getCanvas()
            // Prevent WebGL context-lost from crashing dev overlay
            canvas?.addEventListener('webglcontextlost', (ev: any) => {
              ev?.preventDefault?.()
              // eslint-disable-next-line no-console
              console.warn('[maplibre] webglcontextlost; preventing default')
            })
            // Swallow internal MapLibre errors that bubble as generic Events
            map?.on('error', (e: any) => {
              // eslint-disable-next-line no-console
              console.warn('[maplibre] internal error event suppressed', e?.error || e)
            })
          } catch {}
        }}
        onError={(e: any) => {
          // MapLibre can emit DOM Events in dev; avoid crashing the app
          const err = (e && (e.error || e)) ?? 'Unknown map error'
          // eslint-disable-next-line no-console
          console.warn('[maplibre] error:', err)
        }}
        interactiveLayerIds={["ct-points"]}
        onClick={(evt) => {
          try {
            const map = mapRef.current?.getMap()
            const x = evt.point.x, y = evt.point.y
            const fts = map?.queryRenderedFeatures([x, y], { layers: ["ct-points"] }) || []
            const hit = (fts[0] && (fts[0] as any).properties) as any
            if (hit && hit.zip) handleSelect(String(hit.zip))
          } catch {}
        }}
      >
        <NavigationControl position="top-left" />

        {/* Circles layer for reliable dot rendering */}
        <Source id="ct-points-src" type="geojson" data={geojson as any}>
          <Layer
            id="ct-points"
            type="circle"
            paint={{
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.95,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              // Size by count with gentle scaling
              'circle-radius': [
                'interpolate', ['linear'], ['get', 'count'],
                0, 6,
                1, 8,
                3, 10,
                6, 12,
                10, 14,
                20, 18
              ],
            }}
          />
        </Source>

        {/* HTML popup overlay to avoid MapLibre Popup issues in dev */}
        {selected && overlayPos ? (
          <div
            className="absolute z-10"
            style={{ left: overlayPos.x, top: overlayPos.y, transform: 'translate(-50%, -110%)' }}
          >
            <div className="min-w-[220px] rounded-lg border bg-white/95 backdrop-blur shadow-md p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-gray-900">
                  {(selected.city && selected.city.trim().length) ? selected.city : `ZIP ${selected.zip}`} {selected.city ? selected.zip : ''}
                </div>
                <button
                  onClick={() => handleSelect(null)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                  aria-label="Close"
                >✕</button>
              </div>
              <div className="text-gray-700 mt-1">Participants: {selected.count}</div>
              {selected.archetypes ? (
                <div className="mt-2 space-y-1">
                  {Object.entries(selected.archetypes)
                    .sort((a,b)=>b[1]-a[1])
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: ARCHETYPE_COLORS[k] ?? '#999' }} />
                          {k}
                        </span>
                        <span className="font-medium">{v}</span>
                      </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Map>

      <div className="absolute bottom-3 left-3 rounded-md bg-white/90 backdrop-blur border p-2 text-xs">
        <div className="font-medium mb-1 text-gray-900">Archetypes</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(ARCHETYPE_COLORS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: v }} />
              <span className="text-gray-700">{k}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-gray-500">Marker size ∝ count</div>
      </div>
    </div>
  )
}
