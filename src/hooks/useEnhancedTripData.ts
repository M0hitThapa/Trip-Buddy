/*
  eslint-disable @typescript-eslint/no-explicit-any
*/
import { useState, useEffect } from 'react'

type PlaceData = {
  name: string
  rating?: number
  photos?: string[]
  priceLevel?: number
  address?: string
  placeId?: string
}

type EnhancedPlace = {
  name: string
  description?: string
  rating?: number
  photos?: string[]
  priceLevel?: number
  address?: string
  estimatedCost?: number
}

export function useEnhancedTripData(tripDetail: any, destination: string) {
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripDetail) {
      setLoading(false)
      return
    }

    // Simple in-memory cache for this effect run
    const cache = new Map<string, PlaceData | null>()

    const fetchPlaceData = async (placeName: string, context: string): Promise<PlaceData | null> => {
      try {
        const query = context ? `${placeName} ${context}` : placeName
        if (cache.has(query)) return cache.get(query) ?? null
        const searchRes = await fetch(`/api/google/places/search?query=${encodeURIComponent(query)}`)
        if (!searchRes.ok) return null
        
        const searchData = await searchRes.json()
        const place = searchData?.results?.[0]
        if (!place) return null

        const result: PlaceData = {
          name: place.name || placeName,
          rating: place.rating,
          photos: place.photos?.slice(0, 3).map((p: any) => p.photo_reference) || [],
          priceLevel: place.price_level,
          address: place.formatted_address,
          placeId: place.place_id
        }
        cache.set(query, result)
        return result
      } catch (error) {
        console.error(`Error fetching place data for ${placeName}:`, error)
        return null
      }
    }

    const enrichItinerary = async () => {
      setLoading(true)
      const itinerary = (tripDetail?.itinerary || []).slice(0, 3)
      
      // Process in batches to avoid overwhelming the API
      const BATCH_SIZE = 3
      const enrichedItinerary: any[] = []
      
      for (let i = 0; i < itinerary.length; i += BATCH_SIZE) {
        const batch = itinerary.slice(i, i + BATCH_SIZE)
        const enrichedBatch = await Promise.all(
          batch.map(async (day: any) => {
            const enrichedDay = { ...day }

            // Fetch photos for the day's main activities (only if not already present)
            if (day.title && !day.photos?.length) {
              const placeData = await fetchPlaceData(day.title, destination)
              if (placeData?.photos?.length) {
                enrichedDay.photos = placeData.photos
              }
            }

            // Enrich cafes (only fetch if missing data)
          if (day.cafeDetails?.length) {
            enrichedDay.cafeDetails = await Promise.all(
              day.cafeDetails.slice(0, 3).map(async (cafe: any) => {
                // Skip API call if already has photos and rating
                if (cafe.photos?.length && cafe.rating) {
                  return cafe
                }
                const data = await fetchPlaceData(cafe.name, destination)
                return {
                  ...cafe,
                  rating: data?.rating || cafe.rating,
                  photos: data?.photos || cafe.photos || [],
                  price: cafe.price || estimatePriceFromLevel(data?.priceLevel),
                  address: data?.address || cafe.address
                }
              })
            )
          } else if (day.cafes?.length) {
            // Convert simple cafe names to detailed objects
            enrichedDay.cafeDetails = await Promise.all(
              day.cafes.slice(0, 3).map(async (cafeName: string) => {
                const data = await fetchPlaceData(cafeName, destination)
                return {
                  name: cafeName,
                  rating: data?.rating,
                  photos: data?.photos || [],
                  price: estimatePriceFromLevel(data?.priceLevel),
                  address: data?.address
                }
              })
            )
          }

          // Enrich hotels (only fetch if missing data)
          if (day.hotelDetails?.length) {
            enrichedDay.hotelDetails = await Promise.all(
              day.hotelDetails.slice(0, 2).map(async (hotel: any) => {
                // Skip API call if already has photos and rating
                if (hotel.photos?.length && hotel.rating) {
                  return hotel
                }
                const data = await fetchPlaceData(hotel.name, destination)
                return {
                  ...hotel,
                  rating: data?.rating || hotel.rating,
                  photos: data?.photos || hotel.photos || [],
                  price: hotel.price || estimateHotelPrice(data?.priceLevel),
                  address: data?.address || hotel.address
                }
              })
            )
          } else if (day.hotels?.length) {
            enrichedDay.hotelDetails = await Promise.all(
              day.hotels.slice(0, 2).map(async (hotelName: string) => {
                const data = await fetchPlaceData(hotelName, destination)
                return {
                  name: hotelName,
                  rating: data?.rating,
                  photos: data?.photos || [],
                  price: estimateHotelPrice(data?.priceLevel),
                  address: data?.address
                }
              })
            )
          }

          // Enrich adventures (only fetch if missing data)
          if (day.adventureDetails?.length) {
            enrichedDay.adventureDetails = await Promise.all(
              day.adventureDetails.slice(0, 3).map(async (adventure: any) => {
                // Skip API call if already has photos and rating
                if (adventure.photos?.length && adventure.rating) {
                  return adventure
                }
                const data = await fetchPlaceData(adventure.name, destination)
                return {
                  ...adventure,
                  rating: data?.rating || adventure.rating,
                  photos: data?.photos || adventure.photos || [],
                  ticketPrice: adventure.ticketPrice || estimateActivityPrice(data?.priceLevel),
                  address: data?.address || adventure.address
                }
              })
            )
          } else if (day.adventures?.length) {
            enrichedDay.adventureDetails = await Promise.all(
              day.adventures.slice(0, 3).map(async (adventureName: string) => {
                const data = await fetchPlaceData(adventureName, destination)
                return {
                  name: adventureName,
                  rating: data?.rating,
                  photos: data?.photos || [],
                  ticketPrice: estimateActivityPrice(data?.priceLevel),
                  address: data?.address
                }
              })
            )
          }

          // Enrich hidden gems
          if (day.hiddenGems?.length) {
            enrichedDay.hiddenGems = await Promise.all(
              day.hiddenGems.slice(0, 1).map(async (gem: any) => {
                const data = await fetchPlaceData(gem.name, destination)
                return {
                  ...gem,
                  rating: data?.rating,
                  photos: data?.photos || [],
                  address: data?.address
                }
              })
            )
          }

            return enrichedDay
          })
        )
        
        enrichedItinerary.push(...enrichedBatch)
        
        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < itinerary.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      // Calculate comprehensive budget
      const budget = calculateComprehensiveBudget(enrichedItinerary, tripDetail)

      const enhanced = {
        ...tripDetail,
        itinerary: enrichedItinerary,
        budgetEstimate: budget,
        destination: destination || tripDetail.destination
      }

      setEnhancedData(enhanced)
      setLoading(false)
    }

    enrichItinerary()
  }, [tripDetail, destination])

  return { enhancedData, loading }
}

// Helper functions for price estimation
function estimatePriceFromLevel(priceLevel?: number): number {
  if (!priceLevel) return 15
  const prices = [5, 15, 30, 50, 100]
  return prices[priceLevel - 1] || 15
}

function estimateHotelPrice(priceLevel?: number): number {
  if (!priceLevel) return 100
  const prices = [50, 100, 200, 350, 500]
  return prices[priceLevel - 1] || 100
}

function estimateActivityPrice(priceLevel?: number): number {
  if (!priceLevel) return 25
  const prices = [10, 25, 50, 100, 200]
  return prices[priceLevel - 1] || 25
}

function calculateComprehensiveBudget(itinerary: any[], tripDetail: any) {
  let totalAccommodation = 0
  let totalFood = 0
  let totalActivities = 0
  let totalTransport = 0

  itinerary.forEach(day => {
    // Accommodation
    if (day.hotelDetails?.length) {
      const avgHotelPrice = day.hotelDetails.reduce((sum: number, h: any) => 
        sum + (h.price || 100), 0) / day.hotelDetails.length
      totalAccommodation += avgHotelPrice
    }

    // Food (breakfast, lunch, dinner, cafes)
    totalFood += 15 // Breakfast estimate
    totalFood += 20 // Lunch estimate
    totalFood += 30 // Dinner estimate
    if (day.cafeDetails?.length) {
      day.cafeDetails.forEach((cafe: any) => {
        totalFood += cafe.price || 10
      })
    }

    // Activities
    if (day.adventureDetails?.length) {
      day.adventureDetails.forEach((activity: any) => {
        totalActivities += activity.ticketPrice || 25
      })
    }

    // Local transport per day
    totalTransport += 20
  })

  // Add flight estimate
  const flightEstimate = 500 // Per person round trip estimate
  totalTransport += flightEstimate

  const total = totalAccommodation + totalFood + totalActivities + totalTransport

  return {
    currency: tripDetail?.budgetEstimate?.currency || 'USD',
    total: Math.round(total),
    categories: [
      { 
        category: 'Accommodation', 
        cost: Math.round(totalAccommodation),
        notes: `Hotels and lodging for ${itinerary.length} days`
      },
      { 
        category: 'Food & Dining', 
        cost: Math.round(totalFood),
        notes: 'Meals, cafes, and restaurants'
      },
      { 
        category: 'Activities & Entertainment', 
        cost: Math.round(totalActivities),
        notes: 'Tours, tickets, and experiences'
      },
      { 
        category: 'Transportation', 
        cost: Math.round(totalTransport),
        notes: 'Flights and local transport'
      }
    ]
  }
}
