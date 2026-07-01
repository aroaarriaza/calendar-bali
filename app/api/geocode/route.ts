import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  if (!q) return NextResponse.json({ coords: null })

  const query = encodeURIComponent(`${q} Bali Indonesia`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=id`,
    {
      headers: {
        'User-Agent': 'CalendarBali/1.0 (https://calendar-bali.vercel.app)',
        'Accept-Language': 'es',
      },
      next: { revalidate: 86400 },
    }
  )

  if (!res.ok) return NextResponse.json({ coords: null })

  const data = await res.json()
  if (!data.length) return NextResponse.json({ coords: null })

  const { lat, lon } = data[0]
  return NextResponse.json({ coords: [parseFloat(lat), parseFloat(lon)] })
}
