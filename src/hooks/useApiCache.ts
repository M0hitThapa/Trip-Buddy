import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIResponse {
  data?: {
    itinerary?: unknown
    destination?: string
  }
}

/**
 * Custom hook for Google Places Search with automatic caching
 */
export function usePlacesSearch(query: string, enabled: boolean = true) {
  // Normalize query to improve cache hits
  // Remove " Day" suffix and extra spaces
  const normalizedQuery = query
    .replace(/\s+Day\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return useQuery({
    queryKey: ['places-search', normalizedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/google/places/search?query=${encodeURIComponent(normalizedQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: enabled && !!normalizedQuery,
    staleTime: 10 * 60 * 1000, // 10 minutes - places don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Custom hook for Google Places Details with automatic caching
 */
export function usePlaceDetails(placeId: string | null | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['places-details', placeId],
    queryFn: async () => {
      if (!placeId) return null
      const res = await fetch(`/api/google/places/details?place_id=${encodeURIComponent(placeId)}`)
      if (!res.ok) throw new Error('Details fetch failed')
      return res.json()
    },
    enabled: enabled && !!placeId,
    staleTime: 15 * 60 * 1000, // 15 minutes - place details rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Custom hook for Google Places Photo with automatic caching
 */
export function usePlacePhoto(photoReference: string | null | undefined, maxwidth: number = 640) {
  return useQuery({
    queryKey: ['places-photo', photoReference, maxwidth],
    queryFn: () => {
      if (!photoReference) return null
      return `/api/google/places/photo?photo_reference=${encodeURIComponent(photoReference)}&maxwidth=${maxwidth}`
    },
    enabled: !!photoReference,
    staleTime: 60 * 60 * 1000, // 1 hour - photos never change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Custom hook for AI model chat with caching (for repeated similar queries)
 */
export function useAIChat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (messages: Message[]) => {
      const res = await fetch('/api/aimodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      if (!res.ok) throw new Error('AI request failed')
      return res.json() as Promise<AIResponse>
    },
    onSuccess: (data) => {
      // Cache successful AI responses
      if (data?.data?.itinerary && data?.data?.destination) {
        queryClient.setQueryData(['ai-trip', data.data.destination], data)
      }
    },
  })
}

/**
 * Hook to retrieve cached AI trip data
 */
export function useCachedAITrip(destination: string | undefined) {
  return useQuery<AIResponse>({
    queryKey: ['ai-trip', destination],
    queryFn: () => {
      throw new Error('This query should only be used to retrieve cached data')
    },
    enabled: false, // Never actually fetch, only use cache
    staleTime: Infinity,
  })
}

/**
 * Custom hook for fetching day photos with caching
 */
export function useDayPhoto(query: string | null | undefined, enabled: boolean = true) {
  // Normalize query
  const normalizedQuery = query
    ? query.replace(/\s+Day\s*$/i, '').replace(/\s+/g, ' ').trim()
    : null
  
  return useQuery({
    queryKey: ['day-photo', normalizedQuery],
    queryFn: async () => {
      if (!normalizedQuery) return null
      const res = await fetch(`/api/google/places/search?query=${encodeURIComponent(normalizedQuery)}`)
      if (!res.ok) return null
      const data = await res.json()
      return data?.results?.[0]?.photos?.[0]?.photo_reference || null
    },
    enabled: enabled && !!normalizedQuery,
    staleTime: 30 * 60 * 1000, // 30 minutes - day photos don't change
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Hook to prefetch places data (for better UX)
 */
export function usePrefetchPlaces() {
  const queryClient = useQueryClient()
  
  return {
    prefetchSearch: (query: string) => {
      queryClient.prefetchQuery({
        queryKey: ['places-search', query],
        queryFn: async () => {
          const res = await fetch(`/api/google/places/search?query=${encodeURIComponent(query)}`)
          if (!res.ok) throw new Error('Search failed')
          return res.json()
        },
        staleTime: 10 * 60 * 1000,
      })
    },
    prefetchDetails: (placeId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['places-details', placeId],
        queryFn: async () => {
          const res = await fetch(`/api/google/places/details?place_id=${encodeURIComponent(placeId)}`)
          if (!res.ok) throw new Error('Details fetch failed')
          return res.json()
        },
        staleTime: 15 * 60 * 1000,
      })
    },
  }
}

/**
 * Custom hook for fetching trip list with caching
 * TODO: Integrate with Convex queries
 */
export function useTrips(uid: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['trips', uid],
    queryFn: async () => {
      if (!uid) return []
      
      // TODO: Replace with actual Convex query
      // Example:
      // const res = await fetch(`/api/trips?uid=${uid}`)
      // if (!res.ok) throw new Error('Failed to fetch trips')
      // return res.json()
      
      return []
    },
    enabled: enabled && !!uid,
    staleTime: 2 * 60 * 1000, // 2 minutes - trips can change
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Custom hook for fetching single trip with caching
 * TODO: Integrate with Convex queries
 */
export function useTrip(tripId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!tripId) return null
      
      // TODO: Replace with actual Convex query
      // Example:
      // const res = await fetch(`/api/trips/${tripId}`)
      // if (!res.ok) throw new Error('Failed to fetch trip')
      // return res.json()
      
      return null
    },
    enabled: enabled && !!tripId,
    staleTime: 5 * 60 * 1000, // 5 minutes - trip details don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to invalidate/refresh cached data
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient()
  
  return {
    invalidatePlaces: () => {
      queryClient.invalidateQueries({ queryKey: ['places-search'] })
      queryClient.invalidateQueries({ queryKey: ['places-details'] })
    },
    invalidateTrips: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['trip'] })
    },
    invalidateAI: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-trip'] })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries()
    },
    clearCache: () => {
      queryClient.clear()
    },
  }
}