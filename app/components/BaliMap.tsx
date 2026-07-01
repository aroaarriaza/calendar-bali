'use client'

import { useEffect, useRef } from 'react'
import type { CalendarEvent } from '../types'

const CAT_COLORS: Record<string, string> = {
  activity: '#E8A820',
  travel:   '#04B8AC',
  social:   '#E0508A',
  wellness: '#30C870',
  football: '#E03030',
}

interface Props {
  events: CalendarEvent[]
  onEventClick: (ev: CalendarEvent) => void
}

export default function BaliMap({ events, onEventClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then(L => {
      // Fix default icon paths in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [-8.46, 115.17],
        zoom: 10,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapRef.current = map

      const eventsWithCoords = events.filter((e): e is CalendarEvent & { coords: [number, number] } => !!e.coords)

      eventsWithCoords.forEach(ev => {
        const color = CAT_COLORS[ev.category] ?? '#E8A820'
        const day   = ev.date.slice(8)

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background: ${color};
              border: 2px solid rgba(255,255,255,0.9);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              width: 32px; height: 32px;
              box-shadow: 0 3px 14px rgba(0,0,0,0.4);
              display: flex; align-items: center; justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 0.6rem; font-weight: 700; color: white; line-height: 1; text-align: center;">
                ${day}
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        })

        const title = ev.title.replace(/\p{Emoji}/gu, '').trim()
        const popup = L.popup({
          className: 'bali-popup',
          closeButton: true,
          maxWidth: 220,
        }).setContent(`
          <div style="
            font-family: Georgia, serif;
            padding: 4px 2px;
          ">
            <div style="font-size: 0.65rem; color: ${color}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">
              ${ev.date.slice(8)} julio
            </div>
            <div style="font-size: 0.9rem; font-weight: 600; color: #1a0f0a; margin-bottom: 6px; line-height: 1.2;">
              ${ev.title}
            </div>
            ${ev.time ? `<div style="font-size: 0.75rem; color: #8a6040;">${ev.time}h</div>` : ''}
            <button onclick="window.__baliMapClick('${ev.id}')" style="
              margin-top: 8px; width: 100%; padding: 6px;
              background: ${color}; color: white; border: none;
              border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 600;
            ">Ver evento</button>
          </div>
        `)

        L.marker(ev.coords!, { icon }).addTo(map).bindPopup(popup)
      })

      // Global callback for popup button
      ;(window as unknown as Record<string, unknown>).__baliMapClick = (id: string) => {
        const ev = events.find(e => e.id === id)
        if (ev) onEventClick(ev)
      }

      // Fit map to markers if any
      if (eventsWithCoords.length > 0) {
        const group = L.featureGroup(
          eventsWithCoords.map(ev => L.marker(ev.coords!))
        )
        map.fitBounds(group.getBounds().pad(0.2))
      }
    })

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any).remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        .leaflet-container { background: #0a1520; }
        .bali-popup .leaflet-popup-content-wrapper {
          background: rgba(255,248,235,0.97);
          border-radius: 12px;
          border: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }
        .bali-popup .leaflet-popup-tip { background: rgba(255,248,235,0.97); }
        .bali-popup .leaflet-popup-content { margin: 12px 14px; }
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
    </>
  )
}
