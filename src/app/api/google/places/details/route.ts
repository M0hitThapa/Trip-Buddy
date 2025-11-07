import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const place_id = searchParams.get('place_id')
    if (!place_id) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })
    const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' }, { status: 500 })

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=name,formatted_address,geometry,rating,photos,price_level,editorial_summary,vicinity,url&key=${key}`
    const res = await fetch(url, { next: { revalidate: 7200 } }) // Cache for 2 hours
    const data = await res.json()
    if (!res.ok || data?.status && data.status !== 'OK') {
      console.error('Places details failed', { status: res.status, gStatus: data?.status, message: data?.error_message })
      return NextResponse.json({ error: 'Google Places details failed', status: data?.status, message: data?.error_message }, { status: 502 })
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Cache for 2 hours
      }
    })
  } catch (e: unknown) {
    console.error('Places details route error', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



