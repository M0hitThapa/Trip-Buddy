/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  This component integrates directly with the Google Maps browser globals and
  MarkerClusterer UMD bundle. To keep the code concise without pulling in
  heavy type packages, we allow `any` for third-party objects.
*/
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// Lightweight, dependency-free Google Maps component that resolves place
// coordinates using the existing /api/google/places/search endpoint.
// Usage: <TripMap queries={["Eiffel Tower Paris", "Louvre Museum Paris"]} />
// In our integration we pass queries derived from the itinerary.

type PlacePoint = {
  id: string;
  name: string;
  query: string;
  lat: number;
  lng: number;
  url?: string;
  rating?: number;
};

type TripMapProps = {
  queries: {
    id: string;
    name: string;
    query: string;
    day?: number;
    kind?: string;
  }[];
  className?: string;
  height?: number;
};

function TripMap({ queries, className, height = 360 }: TripMapProps) {
  const [ready, setReady] = useState(false);
  const [points, setPoints] = useState<PlacePoint[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const [clustererReady, setClustererReady] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Load Google Maps JS API exactly once across the app
  const loadGoogleMapsOnce = (apiKey?: string) => {
    if (!apiKey) return Promise.reject(new Error("Missing API key"));
    const w = window as any;
    if (w.google?.maps) return Promise.resolve();
    if (w.__gmapsLoadPromise) return w.__gmapsLoadPromise as Promise<void>;
    w.__gmapsLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById("gmaps-js");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", (e) => reject(e));
        return;
      }
      const s = document.createElement("script");
      s.id = "gmaps-js";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
    return w.__gmapsLoadPromise as Promise<void>;
  };

  // Load MarkerClusterer UMD once
  const loadMarkerClustererOnce = () => {
    const w = window as any;
    if (w.markerClusterer) return Promise.resolve();
    if (w.__markerClustererPromise) return w.__markerClustererPromise as Promise<void>;
    w.__markerClustererPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById("marker-clusterer-umd");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", (e) => reject(e));
        return;
      }
      const s = document.createElement("script");
      s.id = "marker-clusterer-umd";
      s.src = "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
    return w.__markerClustererPromise as Promise<void>;
  };

  // Subtle custom map style for a clean, neutral look
  const mapStyle = useMemo(
    () =>
      [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
        {
          featureType: "administrative.land_parcel",
          elementType: "labels.text.fill",
          stylers: [{ color: "#bdbdbd" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#eeeeee" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#dadada" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          featureType: "road.local",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
        {
          featureType: "transit.line",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }],
        },
        {
          featureType: "transit.station",
          elementType: "geometry",
          stylers: [{ color: "#eeeeee" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#c9e7ff" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
      ] as unknown,
    []
  );

  // Load coordinates for all queries
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const list: PlacePoint[] = [];
      for (const q of queries) {
        try {
          const res = await fetch(
            `/api/google/places/search?query=${encodeURIComponent(q.query)}`
          );
          if (!res.ok) continue;
          const data = await res.json();
          const top = data?.results?.[0];
          const loc = top?.geometry?.location;
          if (!loc) continue;
          list.push({
            id: q.id,
            name: q.name,
            query: q.query,
            lat: loc.lat,
            lng: loc.lng,
            url:
              top?.url ||
              (top?.place_id
                ? `https://www.google.com/maps/place/?q=place_id:${top.place_id}`
                : undefined),
            rating: typeof top?.rating === "number" ? top.rating : undefined,
          });
        } catch (e) {
          // ignore
        }
      }
      if (!cancelled) setPoints(list);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [queries]);

  // Initialize or update map when ready or points change
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const googleObj = (window as unknown as { google?: any }).google as
      | any
      | undefined;
    if (!googleObj) return;
    // Some loader modes (e.g., loading=async) expose classes only after importLibrary.
    // Ensure the legacy constructor is available before proceeding.
    if (typeof googleObj?.maps?.Map !== "function") return;

    // Create map instance once
    if (!mapInstanceRef.current) {
      const map = new googleObj.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // default: India center
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        styles: mapStyle,
      });
      mapInstanceRef.current = map;
      infoRef.current = new googleObj.maps.InfoWindow();
    }

    // Clear old markers & clusterer
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    markersRef.current = [];
    if (clustererRef.current) {
      try {
        (clustererRef.current as any)?.clearMarkers?.();
      } catch {}
      clustererRef.current = null;
    }

    // Helper: color by kind
    const kindColor = (kind?: string) => {
      switch (kind) {
        case "hotel":
          return "#6366f1"; // indigo
        case "cafe":
          return "#ef4444"; // rose/red
        case "adventure":
          return "#10b981"; // emerald
        case "hidden":
          return "#f59e0b"; // amber
        case "title":
          return "#3b82f6"; // blue
        default:
          return "#e11d48"; // fallback rose
      }
    };

    // Build a lookup from id -> query meta to get day/kind
    const metaById = new Map<
      string,
      { day?: number; kind?: string; name: string }
    >();
    for (const q of queries)
      metaById.set(q.id, { day: q.day, kind: q.kind, name: q.name });

    // Add markers
    const bounds = new googleObj.maps.LatLngBounds();
    const pointsWithMeta = points.map((pt) => ({
      ...pt,
      day: metaById.get(pt.id)?.day,
      kind: metaById.get(pt.id)?.kind,
    }));

    const filtered = pointsWithMeta.filter((p) =>
      selectedDay ? p.day === selectedDay : true
    );

    const markerList: any[] = [];
    filtered.forEach((p) => {
      const color = kindColor(p.kind);
      const dayLabel = p.day ? `D${p.day}` : "";
      const marker = new googleObj.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstanceRef.current!,
        title: p.name,
        // Custom circular icon matching brand, with white stroke
        icon: {
          path: googleObj.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.98,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 8,
        },
        label: dayLabel
          ? ({
              text: dayLabel,
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "700",
            } as unknown)
          : undefined,
      });
      marker.addListener("click", () => {
        const html = `
          <div style="max-width:220px">
            <div style="font-size:12px;color:#6b7280;margin-bottom:2px">${dayLabel || "Place"}</div>
            <div style="font-weight:600;color:#111827;margin-bottom:4px">${p.name}</div>
            ${p.rating ? `<div style=\"font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #fef3c7;border-radius:9999px;padding:2px 6px;display:inline-block;margin-bottom:6px\">★ ${p.rating.toFixed(1)}</div>` : ""}
            ${p.url ? `<a href=\"${p.url}\" target=\"_blank\" rel=\"noopener\" style=\"font-size:12px;color:#2563eb;text-decoration:underline\">Open in Google Maps</a>` : ""}
          </div>
        `;
        infoRef.current?.setContent(html);
        infoRef.current?.open({ map: mapInstanceRef.current!, anchor: marker });
      });
      markersRef.current.push(marker);
      markerList.push(marker);
      bounds.extend(marker.getPosition()!);
    });

    // Draw per-day polylines to visualize flow
    const byDay = new Map<number, { lat: number; lng: number }[]>();
    filtered.forEach((p) => {
      if (!p.day) return;
      const arr = byDay.get(p.day) || [];
      arr.push({ lat: p.lat, lng: p.lng });
      byDay.set(p.day, arr);
    });
    const dayColors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#6366f1",
      "#14b8a6",
    ];
    byDay.forEach((coords, day) => {
      if (coords.length < 2) return;
      const poly = new googleObj.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: dayColors[(day - 1) % dayColors.length],
        strokeOpacity: 0.9,
        strokeWeight: 3,
        map: mapInstanceRef.current!,
      });
      // Store polylines alongside markers for cleanup
      markersRef.current.push(poly as any);
    });

    // Fit bounds if we have multiple points
    if (!bounds.isEmpty()) {
      mapInstanceRef.current!.fitBounds(bounds, 48);
    }

    // Initialize clustering if library is available
    if (
      clustererReady &&
      (window as unknown as { markerClusterer?: any }).markerClusterer &&
      markerList.length
    ) {
      const MC = (window as any).markerClusterer;
      try {
        clustererRef.current = new MC.MarkerClusterer({
          map: mapInstanceRef.current!,
          markers: markerList,
        });
      } catch {}
    }
  }, [ready, points, mapStyle, clustererReady, selectedDay, queries]);

  // Hover sync: highlight marker on PlaceBadge hover
  useEffect(() => {
    const onHover = (e: CustomEvent<{ id?: string }>) => {
      const id = e?.detail?.id;
      if (!id) return;
      const googleObj = (window as unknown as { google?: any }).google;
      const found = (markersRef.current as Array<any>).find(
        (m) =>
          m.getTitle &&
          (m.getTitle() as string)?.toLowerCase &&
          id.includes((m.getTitle() as string).toLowerCase())
      );
      if (found) {
        try {
          found.setAnimation(googleObj?.maps?.Animation?.BOUNCE);
          setTimeout(() => found.setAnimation(null), 600);
        } catch {}
        try {
          mapInstanceRef.current?.panTo(found.getPosition());
        } catch {}
      }
    };
    const onClear = () => {
      /* no-op */
    };
    window.addEventListener("trip-map-hover", onHover as EventListener);
    window.addEventListener("trip-map-hover-clear", onClear as EventListener);
    return () => {
      window.removeEventListener("trip-map-hover", onHover as EventListener);
      window.removeEventListener("trip-map-hover-clear", onClear as EventListener);
    };
  }, []);
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY) as string | undefined;

  // Load external scripts once and flip readiness flags
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        await loadGoogleMapsOnce(apiKey);
        if (!cancelled) setReady(true);
      } catch (e) {
        // keep ready = false
      }
      try {
        await loadMarkerClustererOnce();
        if (!cancelled) setClustererReady(true);
      } catch (e) {
        // optional: ignore clusterer failure
      }
    };
    if (typeof window !== "undefined" && apiKey) run();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  return (
    <div
      className={
        "rounded-md border border-neutral-200 bg-white shadow-input overflow-hidden " +
        (className || "")
      }
    >
      <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">Trip Map</div>
          <div className="text-xs text-neutral-600">
            Explore all places planned in your itinerary
          </div>
        </div>
        {/* Day filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            className={`px-2 py-1 rounded-md text-xs border ${selectedDay === null ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}
            onClick={() => setSelectedDay(null)}
          >
            All
          </button>
          {[...new Set(queries.map((q) => q.day).filter(Boolean))]
            .sort((a, b) => (a as number) - (b as number))
            .map((d) => (
              <button
                key={`day-chip-${d}`}
                className={`px-2 py-1 rounded-md text-xs border ${selectedDay === d ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}
                onClick={() => setSelectedDay(d as number)}
              >
                D{d}
              </button>
            ))}
        </div>
      </div>
      {/* Legend */}
      <div className="px-5 py-2 border-b border-neutral-100 text-xs text-neutral-700 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "#3b82f6" }}
          ></span>
          Title
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "#6366f1" }}
          ></span>
          Hotel
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "#ef4444" }}
          ></span>
          Cafe
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "#10b981" }}
          ></span>
          Adventure
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "#f59e0b" }}
          ></span>
          Hidden Gem
        </span>
      </div>
      <div ref={mapRef} style={{ height }} />
      {/* Load Google Maps and MarkerClusterer via singleton loaders */}
      {!apiKey && (
        <div className="p-3 text-xs text-red-600">
          Missing Google Maps API key (set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or
          GOOGLE_MAPS_API_KEY in .env.local)
        </div>
      )}
    </div>
  );
}

export default TripMap;
