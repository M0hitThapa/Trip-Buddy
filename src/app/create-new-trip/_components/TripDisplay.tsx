"use client";

import React from "react";
import {
  MapPin,
  ExternalLink,
  Plane,
  Hotel,
  Coffee,
  Package,
  AlertCircle,
} from "lucide-react";
import ItineraryGrid from "./ItineraryGrid";
import type { ItineraryItem, DayCostBreakdown } from "./ItineraryGrid";

type TripData = {
  tripTitle?: string;
  duration?: string;
  travelStyle?: string;
  travelerType?: string;
  season?: string;
  overview?: string;
  quickFacts?: Record<string, string>;
  flights?: {
    suggestedRoute?: string;
    averageFlightTime?: string;
    arrivalAirport?: string;
    arrivalDescription?: string;
    mapsLink?: string;
  };
  accommodation?: {
    hotelExample?: {
      name: string;
      description: string;
      mapsLink?: string;
    };
    alternativeAreas?: Array<{
      area: string;
      description: string;
    }>;
  };
  recommendedCafes?: Array<{
    name: string;
    description: string;
    type: string;
    mapsLink?: string;
  }>;
  budget?: {
    currency?: string;
    total?: number;
    estimatedBreakdown?: Array<{
      category: string;
      cost: number;
      notes: string;
    }>;
    breakdown?: Array<{
      day: number;
      total: number;
      hotels?: Array<{ name: string; price: number }>;
      activities?: Array<{ name: string; price: number }>;
    }>;
  };
  itinerary?: ItineraryItem[];
  packingChecklist?: string[];
  localTips?: string[];
};

type Props = {
  tripData: TripData;
};

export default function TripDisplay({ tripData }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Trip Title */}
        {tripData?.tripTitle && (
          <div className=" p-6">
            <h1 className="text-3xl font-black text-neutral-900 mb-3">
              {tripData.tripTitle}
            </h1>
            <div className="flex flex-wrap flex-col gap-3 text-sm text-neutral-600">
              {tripData.duration && (
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">Duration:</span>{" "}
                  {tripData.duration}
                </span>
              )}
              {tripData.travelStyle && (
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">Style:</span>{" "}
                  {tripData.travelStyle}
                </span>
              )}
              {tripData.travelerType && (
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">Type:</span>{" "}
                  {tripData.travelerType}
                </span>
              )}
              {tripData.season && (
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">Best Season:</span>{" "}
                  {tripData.season}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trip Overview */}
        {tripData?.overview && (
          <div className=" p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
              🧭 Trip Overview
            </h2>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
              {tripData.overview}
            </p>
          </div>
        )}

        {/* Quick Facts */}
        {tripData?.quickFacts &&
          Object.keys(tripData.quickFacts).length > 0 && (
            <div className=" p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                🧾 Quick Facts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-neutral-200">
                    {Object.entries(tripData.quickFacts).map(([key, value]) => (
                      <tr key={key} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-semibold text-neutral-900 capitalize text-sm">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td className="py-2 px-3 text-neutral-700 text-sm">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Flights & Arrival */}
        {tripData?.flights && (
          <div className=" p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5" /> Flights & Arrival
            </h2>
            <div className="space-y-3">
              {tripData.flights.suggestedRoute && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1 text-base">
                    Suggested Route:
                  </h3>
                  <p className="text-neutral-700 text-sm">
                    {tripData.flights.suggestedRoute}
                  </p>
                  {tripData.flights.averageFlightTime && (
                    <p className="text-xs text-neutral-600 mt-1">
                      Average Flight Time: {tripData.flights.averageFlightTime}
                    </p>
                  )}
                </div>
              )}
              {tripData.flights.arrivalAirport && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1 text-base">
                    Arrival Airport:
                  </h3>
                  <p className="text-neutral-700 text-sm">
                    {tripData.flights.arrivalAirport}
                  </p>
                  {tripData.flights.arrivalDescription && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {tripData.flights.arrivalDescription}
                    </p>
                  )}
                  {tripData.flights.mapsLink && (
                    <a
                      href={tripData.flights.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-2"
                    >
                      <MapPin className="w-3 h-3" /> View on Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accommodation */}
        {tripData?.accommodation && (
          <div className=" p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5" /> Accommodation
            </h2>
            {tripData.accommodation.hotelExample && (
              <div className="mb-4">
                <h3 className="font-semibold text-neutral-900 mb-1 text-sm">
                  Hotel Example: {tripData.accommodation.hotelExample.name}
                </h3>
                <p className="text-neutral-700 mb-2 text-sm">
                  {tripData.accommodation.hotelExample.description}
                </p>
                {tripData.accommodation.hotelExample.mapsLink && (
                  <a
                    href={tripData.accommodation.hotelExample.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    <MapPin className="w-3 h-3" /> View on Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
            {tripData.accommodation.alternativeAreas &&
              tripData.accommodation.alternativeAreas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm">
                    Alternative Areas:
                  </h3>
                  <div className="space-y-1">
                    {tripData.accommodation.alternativeAreas.map(
                      (area, idx) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className="font-medium text-neutral-900">
                            {area.area}:
                          </span>
                          <span className="text-neutral-700">
                            {area.description}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Recommended Cafés */}
        {tripData?.recommendedCafes && tripData.recommendedCafes.length > 0 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5" /> Recommended Cafés & Restaurants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                      Name
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                      Description
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {tripData.recommendedCafes.map((cafe, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 font-medium text-neutral-900 text-sm">
                        {cafe.name}
                      </td>
                      <td className="py-2 px-3 text-neutral-700 text-sm">
                        {cafe.description}
                      </td>
                      <td className="py-2 px-3 text-neutral-600 text-sm">
                        {cafe.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Day-by-Day Itinerary */}
        {tripData?.itinerary && tripData.itinerary.length > 0 && (
          <div className=" p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              📅 Day-by-Day Itinerary
            </h2>
            <ItineraryGrid
              itinerary={tripData.itinerary as ItineraryItem[]}
              costs={(tripData?.budget?.breakdown || []) as DayCostBreakdown[]}
              hideTitle={true}
              hideMap={false}
            />
          </div>
        )}

        {/* Budget Estimate */}
        {tripData?.budget?.estimatedBreakdown &&
          tripData.budget.estimatedBreakdown.length > 0 && (
            <div className=" p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                💰 Estimated Budget (Per Person)
              </h2>
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                        Category
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                        Cost ({tripData.budget.currency || "USD"})
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-900 text-sm">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {tripData.budget.estimatedBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-medium text-neutral-900 text-sm">
                          {item.category}
                        </td>
                        <td className="py-2 px-3 text-neutral-700 text-sm">
                          ${item.cost}
                        </td>
                        <td className="py-2 px-3 text-neutral-600 text-xs">
                          {item.notes}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-neutral-50 font-bold">
                      <td className="py-2 px-3 text-neutral-900 text-sm">
                        Total Estimate
                      </td>
                      <td className="py-2 px-3 text-emerald-600 text-sm">
                        ${tripData.budget.total}
                      </td>
                      <td className="py-2 px-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Packing Checklist */}
        {tripData?.packingChecklist && tripData.packingChecklist.length > 0 && (
          <div className=" p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Packing Checklist
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tripData.packingChecklist.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-neutral-700 text-sm"
                >
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Local Tips */}
        {tripData?.localTips && tripData.localTips.length > 0 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Local Tips
            </h2>
            <ul className="space-y-2">
              {tripData.localTips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-neutral-700 text-sm"
                >
                  <span className="text-amber-600 mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
