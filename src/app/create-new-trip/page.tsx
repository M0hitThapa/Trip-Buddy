"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Chatbot from "./_components/chatbot";
import TripDisplay from "./_components/TripDisplay";
import type { Id } from "../../../convex/_generated/dataModel";
import { EmptyState } from "./_components/empty-state";
import type { ItineraryItem, DayCostBreakdown } from "./_components/ItineraryGrid";

// Using shared types from ItineraryGrid

type AiResponse = {
  itinerary?: ItineraryItem[];
  budget?: {
    currency?: string;
    total?: number;
    breakdown?: DayCostBreakdown[];
    estimatedBreakdown?: Array<{
      category: string;
      cost: number;
      notes: string;
    }>;
  };
  tripTitle?: string;
  duration?: string;
  travelStyle?: string;
  travelerType?: string;
  season?: string;
  overview?: string;
  quickFacts?: Record<string, string>;
  flights?: unknown;
  accommodation?: unknown;
  recommendedCafes?: Array<{
    name: string;
    description?: string;
    type?: string;
    mapsLink?: string;
  }>;
  packingChecklist?: string[];
  localTips?: string[];
};

function PageContent() {
  const [tripData, setTripData] = useState<AiResponse | null>(null);
  const [chatKey, setChatKey] = useState<number>(0);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [showItineraryMobile, setShowItineraryMobile] =
    useState<boolean>(false);
  const search = useSearchParams();
  const editId = search?.get("edit");
  const existingTrip = useQuery(
    api.tripDetail.GetTrip,
    editId ? { id: editId as unknown as Id<"TripDetailTable"> } : "skip"
  );
  const newFlag = search?.get("new");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("new") === "1") {
      setTripData(null);
      setChatKey((k) => k + 1);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.toString());
    }
  }, [newFlag]);
  const handleFinal = (payload: AiResponse) => {
    setTripData(payload);
    // Auto-open itinerary on small screens
    if (isSmallScreen) setShowItineraryMobile(true);
  };

  // Detect small screens (tablets/mobiles)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1024px)"); // <lg
    const apply = () => setIsSmallScreen(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return (
    <SidebarProvider>
      <AppSidebar />

      <div
        className="relative h-screen w-full border border-neutral-200 shadow-2xs overflow-hidden"
        style={{
          background: "#f5f5f5", // neutral-200 background
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
          backgroundSize: "20px 20px",
        }}
      >
        {/* Background div with absolute positioning */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#f5f5f5", // neutral-200 background
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content with z-10 to ensure it appears on top */}
        {/* <div className="relative z-10 flex justify-between mx-4 mt-2">
    <SidebarTrigger className="-ml-1 bg-white border-2 border-neutral-300 rounded-md shadow p-5" />
    <div>
      <SignOutButtons />
    </div>
  </div> */}

        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 w-full h-full overflow-hidden">
          <div
            className={`h-full min-h-0 overflow-hidden flex flex-col ${isSmallScreen && showItineraryMobile ? "hidden" : ""}`}
          >
            <Chatbot key={chatKey} onFinal={handleFinal} editTripId={editId} />
          </div>
          <div
            className={`bg-white/60 h-full overflow-hidden flex flex-col ${isSmallScreen && !showItineraryMobile ? "hidden md:flex" : ""}`}
          >
            {tripData || existingTrip?.tripDetail ? (
              <>
                {isSmallScreen && (
                  <div className="px-6 pt-4 pb-2">
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium border border-neutral-300 bg-white hover:bg-neutral-100"
                      onClick={() => setShowItineraryMobile(false)}
                    >
                      ← Back
                    </button>
                  </div>
                )}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <TripDisplay
                    tripData={tripData || existingTrip?.tripDetail || {}}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <EmptyState />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageContent />
    </Suspense>
  );
}
