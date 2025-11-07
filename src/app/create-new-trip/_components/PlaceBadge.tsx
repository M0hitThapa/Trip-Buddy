"use client"

import React, { useEffect, useState } from 'react'
import { usePlacesSearch, usePlaceDetails } from '@/hooks/useApiCache'
import { ImageOff } from 'lucide-react'
import Image from 'next/image'


type Props = {
  name: string
  query?: string
  description?: string
  rating?: number
  price?: number
  ticketPrice?: number
  day?: number
  kind?: string
  photos?: string[]
  address?: string
  disableLookup?: boolean
}

export default function PlaceBadge({ name, query, description, rating, price, ticketPrice, day, kind, photos, address, disableLookup }: Props) {
  const [photoRef, setPhotoRef] = useState<string | null>(photos?.[0] || null)
  const [placeUrl, setPlaceUrl] = useState<string | null>(null)
  const [placeRating, setPlaceRating] = useState<number | null>(null)
  const [placePriceLevel, setPlacePriceLevel] = useState<number | null>(null)
  const [placeDescription, setPlaceDescription] = useState<string | null>(description || null)
  const [placeAddress, setPlaceAddress] = useState<string | null>(address || null)
  const [imageError, setImageError] = useState(false)
  const [altPhotoTried, setAltPhotoTried] = useState(false)

  // Only fetch if lookup is not disabled
  const shouldFetch = !disableLookup && !!(query || name)

  // Use custom hooks with automatic caching
  const { data: searchData } = usePlacesSearch(query || name, shouldFetch)

  // Get place_id from search results
  const placeId = searchData?.results?.[0]?.place_id

  // Fetch detailed place information including editorial_summary
  const { data: detailsData } = usePlaceDetails(placeId, shouldFetch)

  useEffect(() => {
    // Update with pre-fetched photos if available
    if (photos?.length && !photoRef) {
      setPhotoRef(photos[0])
    }
  }, [photos, photoRef])

  // Process search results
  useEffect(() => {
    if (!searchData) return
    const top = searchData?.results?.[0]
    const ref = top?.photos?.[0]?.photo_reference || null
    if (!photoRef) setPhotoRef(ref)
    setPlaceUrl(top?.url || (top?.place_id ? `https://www.google.com/maps/place/?q=place_id:${top.place_id}` : null))
    if (!rating && typeof top?.rating === 'number') setPlaceRating(top.rating as number)
    if (typeof top?.price_level === 'number') setPlacePriceLevel(top.price_level as number)
    
    // Set basic info from search results if details not available yet
    if (!placeAddress && !detailsData) {
      const addr = top?.formatted_address || top?.vicinity || null
      if (addr) setPlaceAddress(addr)
    }
  }, [searchData, rating, photoRef, placeAddress, detailsData])

  // Process detailed place information
  useEffect(() => {
    if (!detailsData?.result) return
    const details = detailsData.result
    
    // Set description from editorial_summary
    if (!placeDescription) {
      const desc = details?.editorial_summary?.overview || details?.vicinity || null
      if (desc) setPlaceDescription(desc)
    }
    
    // Set address from details (more complete than search results)
    if (!placeAddress) {
      const addr = details?.formatted_address || details?.vicinity || null
      if (addr) setPlaceAddress(addr)
    }

    // Update rating and price level from details if not already set
    if (!rating && typeof details?.rating === 'number') setPlaceRating(details.rating as number)
    if (typeof details?.price_level === 'number') setPlacePriceLevel(details.price_level as number)

    // If search didn't provide a photo, try details photos
    if (!photoRef && Array.isArray(details?.photos) && details.photos.length > 0) {
      setPhotoRef(details.photos[0].photo_reference || null)
    }
  }, [detailsData, rating, placeDescription, placeAddress])

  const finalRating = typeof rating === 'number' ? rating : placeRating
  const priceLevel = placePriceLevel
  const priceLabel = typeof price === 'number' ? `$${price}` : (typeof ticketPrice === 'number' ? `$${ticketPrice}` : null)
  const stableId = React.useMemo(() => {
    const q = (query || name).toLowerCase()
    return (day ? `${day}-` : '') + q
  }, [query, name, day])

  return (
    <div
      className="flex items-start gap-3"
      onMouseEnter={() => {
        try { window.dispatchEvent(new CustomEvent('trip-map-hover', { detail: { id: stableId, kind } })) } catch {}
      }}
      onMouseLeave={() => {
        try { window.dispatchEvent(new CustomEvent('trip-map-hover-clear', { detail: { id: stableId } })) } catch {}
      }}
    >
      <div className="size-20 rounded-md overflow-hidden bg-neutral-200 flex items-center justify-center relative">
        {photoRef && !imageError ? (
          <Image
            src={`/api/google/places/photo?photo_reference=${encodeURIComponent(photoRef)}&maxwidth=640`}
            alt={name}
            fill
            sizes="80px"
            className="object-cover"
            onError={() => {
              // Try a secondary photo from details if available once
              try {
                const alt = detailsData?.result?.photos?.[1]?.photo_reference
                if (!altPhotoTried && alt && alt !== photoRef) {
                  setAltPhotoTried(true)
                  setImageError(false)
                  setPhotoRef(alt)
                  return
                }
              } catch {}
              setImageError(true)
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-neutral-400">
            <ImageOff className="size-8" />
            <span className="text-[9px] mt-1">No Image</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-900 font-semibold truncate">{name}</span>
          {finalRating ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
              ★ {finalRating.toFixed(1)}
            </span>
          ) : null}
          {typeof priceLevel === 'number' ? (
            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
              {'$'.repeat(Math.max(1, Math.min(4, priceLevel)))}
            </span>
          ) : null}
          {priceLabel ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900">
              {priceLabel}
            </span>
          ) : null}
          {placeUrl ? (
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm bg-rose-700 px-2 py-0.5 text-[11px] font-semibold text-white shadow hover:bg-rose-800 transition"
              title="Open in Google Maps"
            >
              Open in Maps
            </a>
          ) : null}
        </div>
        {placeDescription ? (
          <p className="mt-1 text-xs text-neutral-700 line-clamp-2">{placeDescription}</p>
        ) : null}
        {placeAddress ? (
          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-1">📍 {placeAddress}</p>
        ) : null}
      </div>
    </div>
  )
}


