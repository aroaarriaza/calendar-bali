import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename') ?? 'archivo'
    const contentType = request.headers.get('content-type') || 'application/octet-stream'

    // Use arrayBuffer instead of streaming — más compatible con iOS Safari
    const buffer = await request.arrayBuffer()

    const blob = await put(`calendar/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType,
    })

    return NextResponse.json({ url: blob.url, name: filename })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}
