'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import { useEnhancedTripData } from '@/hooks/useEnhancedTripData'
import type { Id } from '../../../../convex/_generated/dataModel'
import { MapPin, ExternalLink, Plane, Hotel, Coffee, Package, AlertCircle } from 'lucide-react'
import ItineraryGrid from '../../create-new-trip/_components/ItineraryGrid'

export default function TripDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as unknown as Id<'TripDetailTable'>
  
  // Convex handles caching automatically with real-time subscriptions
  const trip = useConvexQuery(api.tripDetail.GetTrip, id ? { id } : 'skip')

  // Parse tripDetail if it's stored as string
  const parsedTripDetail = useMemo(() => {
    if (!trip?.tripDetail) return null
    if (typeof trip.tripDetail === 'string') {
      try {
        return JSON.parse(trip.tripDetail)
      } catch (e) {
        console.error('Error parsing trip detail:', e)
        return null
      }
    }
    return trip.tripDetail
  }, [trip])

  const destination = parsedTripDetail?.destination || ''
  
  // Enable automatic data enrichment with Google Places API
  const enableEnrichment = true
  const { enhancedData, loading } = useEnhancedTripData(
    enableEnrichment ? parsedTripDetail : null, 
    destination
  )
  
  const tripData = enhancedData || parsedTripDetail
  const isLoading = !trip || (enableEnrichment && loading)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <div className="text-neutral-600 text-center">
                <div className="font-medium">Loading your trip...</div>
                {loading && <div className="text-sm mt-1">Fetching place details and images</div>}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  ← Back to Trips
                </button>
                <button
                  onClick={() => router.push(`/trips/${encodeURIComponent(id as unknown as string)}/edit`)}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  ✏️ Edit Trip
                </button>
              </div>

              {/* Trip Title */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                <h1 className="text-4xl font-bold text-neutral-900 mb-3">
                  {tripData?.tripTitle || '✈️ Your Trip Itinerary'}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                  {tripData?.duration && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Duration:</span> {tripData.duration}
                    </span>
                  )}
                  {tripData?.travelStyle && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Style:</span> {tripData.travelStyle}
                    </span>
                  )}
                  {tripData?.travelerType && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Type:</span> {tripData.travelerType}
                    </span>
                  )}
                  {tripData?.season && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Best Season:</span> {tripData.season}
                    </span>
                  )}
                </div>
              </div>

              {/* Trip Overview */}
              {tripData?.overview && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    🧭 Trip Overview
                  </h2>
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{tripData.overview}</p>
                </div>
              )}

              {/* Quick Facts */}
              {tripData?.quickFacts && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    🧾 Quick Facts
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-neutral-200">
                        {Object.entries(tripData.quickFacts).map(([key, value]) => (
                          <tr key={key} className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-semibold text-neutral-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td className="py-3 px-4 text-neutral-700">{value as string}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Flights & Arrival */}
              {tripData?.flights && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Plane className="w-6 h-6" /> Flights & Arrival
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Suggested Route:</h3>
                      <p className="text-neutral-700">{tripData.flights.suggestedRoute}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Average Flight Time: {tripData.flights.averageFlightTime}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Arrival Airport:</h3>
                      <p className="text-neutral-700">{tripData.flights.arrivalAirport}</p>
                      <p className="text-sm text-neutral-600 mt-1">{tripData.flights.arrivalDescription}</p>
                      {tripData.flights.mapsLink && (
                        <a
                          href={tripData.flights.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                        >
                          <MapPin className="w-4 h-4" /> View on Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {tripData?.accommodation && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Hotel className="w-6 h-6" /> Accommodation
                  </h2>
                  {tripData.accommodation.hotelExample && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Hotel Example: {tripData.accommodation.hotelExample.name}
                      </h3>
                      <p className="text-neutral-700 mb-2">{tripData.accommodation.hotelExample.description}</p>
                      {tripData.accommodation.hotelExample.mapsLink && (
                        <a
                          href={tripData.accommodation.hotelExample.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <MapPin className="w-4 h-4" /> View on Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                  {tripData.accommodation.alternativeAreas && tripData.accommodation.alternativeAreas.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Alternative Areas:</h3>
                      <div className="space-y-2">
                        {tripData.accommodation.alternativeAreas.map((area: { area: string; description: string }, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <span className="font-medium text-neutral-900">{area.area}:</span>
                            <span className="text-neutral-700">{area.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Cafés & Restaurants */}
              {tripData?.recommendedCafes && tripData.recommendedCafes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Coffee className="w-6 h-6" /> Recommended Cafés & Restaurants
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 font-semibold text-neutral-900">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-neutral-900">Description</th>
                          <th className="text-left py-3 px-4 font-semibold text-neutral-900">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {tripData.recommendedCafes.map((cafe: { name: string; description: string; type: string; mapsLink?: string }, idx: number) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-medium text-neutral-900">{cafe.name}</td>
                            <td className="py-3 px-4 text-neutral-700">{cafe.description}</td>
                            <td className="py-3 px-4 text-neutral-600">{cafe.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Day-by-Day Itinerary - Using ItineraryGrid for consistency */}
              {tripData?.itinerary && tripData.itinerary.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    📅 Day-by-Day Itinerary
                  </h2>
                  <ItineraryGrid 
                    itinerary={tripData.itinerary} 
                    costs={tripData?.budget?.breakdown || []} 
                    hideTitle={true}
                    hideMap={false}
                  />
                </div>
              )}

              {/* Budget Estimate */}
              {tripData?.budget && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    💰 Estimated Budget (Per Person)
                  </h2>
                  {tripData.budget.estimatedBreakdown && (
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 font-semibold text-neutral-900">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-neutral-900">Cost ({tripData.budget.currency})</th>
                            <th className="text-left py-3 px-4 font-semibold text-neutral-900">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {tripData.budget.estimatedBreakdown.map((item: { category: string; cost: number; notes: string }, idx: number) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="py-3 px-4 font-medium text-neutral-900">{item.category}</td>
                              <td className="py-3 px-4 text-neutral-700">${item.cost}</td>
                              <td className="py-3 px-4 text-neutral-600 text-sm">{item.notes}</td>
                            </tr>
                          ))}
                          <tr className="bg-neutral-50 font-bold">
                            <td className="py-3 px-4 text-neutral-900">Total Estimate</td>
                            <td className="py-3 px-4 text-emerald-600">${tripData.budget.total}</td>
                            <td className="py-3 px-4"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Packing Checklist */}
              {tripData?.packingChecklist && tripData.packingChecklist.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6" /> Packing Checklist
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tripData.packingChecklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-neutral-700">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Local Tips */}
              {tripData?.localTips && tripData.localTips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" /> Local Tips
                  </h2>
                  <ul className="space-y-2">
                    {tripData.localTips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-neutral-700">
                        <span className="text-amber-600 mt-1">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


