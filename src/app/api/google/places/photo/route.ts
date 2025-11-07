import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const photo_reference = searchParams.get('photo_reference')
    const maxwidth = searchParams.get('maxwidth') || '800'
    
    if (!photo_reference) {
      return NextResponse.json(
        { error: 'Missing photo_reference parameter' }, 
        { status: 400 }
      )
    }

    const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!key) {
      return NextResponse.json(
        { error: 'Missing GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' }, 
        { status: 500 }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${encodeURIComponent(photo_reference)}&maxwidth=${encodeURIComponent(maxwidth)}&key=${key}`
    
    const inboundReferer = req.headers.get('referer') || undefined
    const inboundUA = req.headers.get('user-agent') || 'TripBuddy/1.0 (Next.js)'
    
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        ...(inboundReferer ? { Referer: inboundReferer } : {}),
        'User-Agent': inboundUA,
      },
      next: { revalidate: 604800 }, // Cache for 7 days
    })

    const contentType = res.headers.get('content-type') || ''
    
    // Check if response is successful and is an image
    if (!res.ok || !/^image\//i.test(contentType)) {
      let message: unknown = undefined
      
      try {
        message = await res.json()
      } catch {
        try {
          message = await res.text()
        } catch {
          message = 'Unable to parse error response'
        }
      }

      console.error('Places photo fetch failed', {
        status: res.status,
        statusText: res.statusText,
        contentType,
        message,
        url: url.replace(key, 'REDACTED_API_KEY'),
        photo_reference_preview: photo_reference.substring(0, 50) + '...',
      })

      // Return helpful error message based on status
      let errorHint = 'Failed to fetch photo from Google Places API'
      
      if (res.status === 404) {
        errorHint = 'Photo reference is invalid or expired. Please fetch a fresh photo reference from the Places API.'
      } else if (res.status === 403) {
        errorHint = 'API key does not have permission to access Places Photo API. Check your Google Cloud Console settings.'
      } else if (res.status === 400) {
        errorHint = 'Invalid request parameters. Check photo_reference and maxwidth values.'
      }

      return NextResponse.json(
        { 
          error: 'Google Places photo failed',
          hint: errorHint,
          status: res.status,
          details: message,
        },
        { status: 502 }
      )
    }

    // Fetch image buffer
    const buf = await res.arrayBuffer()
    
    return new NextResponse(Buffer.from(buf), {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        // Cache images for 7 days (photos never change once fetched)
        'Cache-Control': 'public, max-age=604800, immutable',
        'Expires': new Date(Date.now() + 604800000).toUTCString(),
        'ETag': `"${photo_reference}"`,
      }
    })
    
  } catch (e: unknown) {
    console.error('Places photo route error', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message 
      }, 
      { status: 500 }
    )
  }
}