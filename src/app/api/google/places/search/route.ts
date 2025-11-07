import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get('query')
    if (!raw) return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    // Normalize query: drop trailing " Day", collapse spaces, trim
    const query = raw
      .replace(/\s+Day\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!query) return NextResponse.json({ results: [], status: 'ZERO_RESULTS' }, { status: 200 })
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
    const data = await res.json()
    if (!res.ok) {
      console.error('Places search failed', { status: res.status, gStatus: data?.status, message: data?.error_message })
      return NextResponse.json({ error: 'Google Places search failed', status: data?.status, message: data?.error_message }, { status: 502 })
    }
    // Treat ZERO_RESULTS as a successful empty payload
    if (data?.status === 'ZERO_RESULTS' || Array.isArray(data?.results) && data.results.length === 0) {
      return NextResponse.json(
        { results: [], status: 'ZERO_RESULTS' },
        { status: 200, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } }
      )
    }
    // If Google returns a non-OK status that is not ZERO_RESULTS, surface as 502
    if (data?.status && data.status !== 'OK') {
      console.error('Places search non-OK', { gStatus: data.status, message: data?.error_message })
      return NextResponse.json({ error: 'Google Places search failed', status: data.status, message: data?.error_message }, { status: 502 })
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      }
    })
  } catch (e: unknown) {
    console.error('Places search route error', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


