import { NextResponse } from 'next/server'

// Bali bounding box — descartar resultados fuera de la isla
const BALI = { minLat: -8.85, maxLat: -8.05, minLon: 114.43, maxLon: 115.73 }

function inBali(lat: number, lon: number) {
  return lat >= BALI.minLat && lat <= BALI.maxLat && lon >= BALI.minLon && lon <= BALI.maxLon
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  if (!q) return NextResponse.json({ coords: null })

  // Photon: OSM geocoder con bias de posición centrado en Bali
  const query = encodeURIComponent(`${q} Bali`)
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${query}&limit=5&lang=en&lat=-8.45&lon=115.17`,
    {
      headers: { 'User-Agent': 'CalendarBali/1.0 (https://calendar-bali.vercel.app)' },
      next: { revalidate: 86400 },
    }
  )

  if (!res.ok) return NextResponse.json({ coords: null })

  const data = await res.json()
  const features: { geometry: { coordinates: [number, number] } }[] = data.features ?? []

  // Photon devuelve [lon, lat] — tomar el primer resultado dentro de Bali
  for (const f of features) {
    const [lon, lat] = f.geometry.coordinates
    if (inBali(lat, lon)) {
      return NextResponse.json({ coords: [lat, lon] })
    }
  }

  return NextResponse.json({ coords: null })
}
