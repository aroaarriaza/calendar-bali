import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''

  if (!process.env.UNSPLASH_ACCESS_KEY || !query) {
    return NextResponse.json({ photos: [] })
  }

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
    {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      next: { revalidate: 3600 }, // cache 1h
    }
  )

  if (!res.ok) return NextResponse.json({ photos: [] })

  const data = await res.json()
  const photos = (data.results ?? []).map((p: {
    urls: { small: string }
    alt_description: string
    user: { name: string; links: { html: string } }
  }) => ({
    url: p.urls.small,
    alt: p.alt_description ?? query,
    credit: p.user.name,
    creditUrl: p.user.links.html,
  }))

  return NextResponse.json({ photos })
}
