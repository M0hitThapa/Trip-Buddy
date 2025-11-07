"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMutation, useQuery as useConvexQuery } from "convex/react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useUserDetail } from "../provider";
import { useInvalidateCache } from "@/hooks/useApiCache";
import type { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";

export default function TripsPage() {
  const { user } = useUser();
  const { userDetail } = useUserDetail() as {
    userDetail?: { _id?: Id<"userTable"> };
  };
  const trips = useConvexQuery(
    api.tripDetail.ListTripsByUser,
    userDetail?._id ? { uid: userDetail._id } : "skip"
  );
  const deleteTrip = useMutation(api.tripDetail.DeleteTrip);
  const { invalidateTrips } = useInvalidateCache();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Your Trips</h1>
          {!user ? (
            <div className="text-neutral-600">Sign in to view your trips.</div>
          ) : !trips ? (
            <div className="text-neutral-600">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-neutral-600">
              No trips yet. Generate one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trips.map((t) => (
                <TripCard
                  key={t._id}
                  t={t}
                  onDelete={async (id: Id<"TripDetailTable">) => {
                    try {
                      await deleteTrip({ id });
                      // Invalidate trips cache after deletion
                      invalidateTrips();
                    } catch (err) {
                      console.error("Failed to delete trip", err);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

type ItineraryItem = { photos?: string[]; title?: string; hotels?: string[] };
type TripDoc = {
  _id: Id<"TripDetailTable">;
  tripDetail?: {
    resp?: string;
    destination?: string;
    city?: string;
    country?: string;
    itinerary?: ItineraryItem[];
  };
};

function TripCard({
  t,
  onDelete,
}: {
  t: TripDoc;
  onDelete: (id: Id<"TripDetailTable">) => Promise<void>;
}) {
  const allPhotos: string[] =
    t.tripDetail?.itinerary?.flatMap((d) => d?.photos || []) || [];
  const firstPhoto: string | undefined = allPhotos[0];
  const [imgSrc, setImgSrc] = useState<string | null>(
    firstPhoto
      ? `/api/google/places/photo?photo_reference=${encodeURIComponent(firstPhoto)}&maxwidth=640`
      : null
  );

  const { fromTo, searchQuery } = useMemo(() => {
    const resp: string = t.tripDetail?.resp || "";
    // Try to parse "from X to Y"
    const m = resp.match(/from\s+([^.,;\n]+?)\s+to\s+([^.,;\n]+)/i);
    const from = m?.[1]?.trim();
    let to = m?.[2]?.trim();
    // Fallback for destination
    if (!to) {
      to =
        t.tripDetail?.destination ||
        t.tripDetail?.city ||
        t.tripDetail?.country;
      if (!to) {
        const firstTitle = t.tripDetail?.itinerary?.[0]?.title;
        const firstHotel = t.tripDetail?.itinerary?.[0]?.hotels?.[0];
        to = firstTitle || firstHotel || "";
      }
    }
    const fromTo =
      from || to ? `From ${from || "—"} to ${to || "—"}` : "Saved Trip";
    const searchQuery = to || from || "";
    return { fromTo, searchQuery };
  }, [t]);

  // Use React Query for caching photo searches
  const { data: searchData } = useQuery({
    queryKey: ["trip-card-photo", searchQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/google/places/search?query=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !imgSrc && !!searchQuery,
    staleTime: 30 * 60 * 1000, // 30 minutes - trip photos don't change
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (imgSrc || !searchData) return;
    const ref: string | undefined =
      searchData?.results?.[0]?.photos?.[0]?.photo_reference;
    if (ref) {
      setImgSrc(
        `/api/google/places/photo?photo_reference=${encodeURIComponent(ref)}&maxwidth=640`
      );
    }
  }, [imgSrc, searchData]);

  return (
    <a href={`/trips/${t._id}`} className="mx-auto w-full max-w-xs">
      <div className="relative h-full overflow-hidden rounded-2xl border-2 border-zinc-100 bg-white">
        <div className="relative aspect-[16/12] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt="thumbnail"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover rounded-3xl p-3"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3">
              <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                <svg
                  className="w-14 h-14 text-neutral-700"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="my-1 text-base font-bold text-zinc-700 line-clamp-2">
            {fromTo}
          </h2>
          <div className="mt-6 flex flex-row items-center justify-between">
            <span className="text-sm text-gray-500">TripBuddy</span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-neutral-950 hover:bg-neutral-800 px-3 py-2 text-sm font-bold text-white cursor-pointer shadow-md">
                View
              </span>
              <button
                className="rounded bg-rose-700 hover:bg-rose-600 px-3 py-2 text-sm font-bold text-white cursor-pointer shadow-md"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await onDelete(t._id);
                }}
                title="Delete trip"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
