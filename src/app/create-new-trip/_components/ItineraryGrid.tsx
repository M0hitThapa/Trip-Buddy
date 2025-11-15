"use client";

import React, { useEffect, useState } from "react";
import {
  Sun,
  SunMedium,
  Moon,
  Star,
  StickyNote,
  CloudSun,
  Coffee,
  Hotel,
  Mountain,
} from "lucide-react";
import PlaceBadge from "./PlaceBadge";
import TripMap from "./TripMap";

export type ItineraryItem = {
  day: number;
  date?: string;
  title?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  description?: string;
  notes?: string;
  weather?: { summary?: string; tips?: string };
  cafes?: string[];
  hotels?: string[];
  adventures?: string[];
  mapsLinks?: string[];
  hiddenGems?: { name: string; description?: string }[];
  cafeDetails?: { name: string; description?: string; rating?: number }[];
  hotelDetails?: {
    name: string;
    description?: string;
    rating?: number;
    price?: number;
  }[];
  adventureDetails?: {
    name: string;
    description?: string;
    rating?: number;
    ticketPrice?: number;
  }[];
  photos?: string[];
};

export type DayCostBreakdown = {
  day: number;
  total: number;
  hotels?: { name: string; price: number }[];
  activities?: { name: string; price: number }[];
};

type Props = {
  itinerary: ItineraryItem[];
  costs?: DayCostBreakdown[];
  hideTitle?: boolean;
  hideMap?: boolean;
};

const ItineraryGrid = ({
  itinerary,
  costs,
  hideTitle = false,
  hideMap = false,
}: Props) => {
  const costByDay = new Map<number, DayCostBreakdown>(
    (costs ?? []).map((c) => [c.day, c])
  );

  // Extract destination from itinerary text for better place searches
  const destination = React.useMemo(() => {
    if (!itinerary?.length) return "";
    const texts: string[] = [];
    for (const d of itinerary) {
      if (d.title) texts.push(d.title);
      if (d.morning) texts.push(d.morning);
      if (d.afternoon) texts.push(d.afternoon);
      if (d.evening) texts.push(d.evening);
    }
    if (texts.length === 0) return "";

    const STOPWORDS = new Set([
      "Morning",
      "Afternoon",
      "Evening",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Hotel",
      "Cafe",
      "Café",
      "Adventure",
      "Adventures",
      "Day",
      "Plan",
      "Tour",
      "Visit",
      "Explore",
      "Exploring",
      "City",
      "Center",
      "Centre",
      "Park",
      "Museum",
      "Beach",
      "Lake",
      "River",
      "Mountain",
    ]);

    const candidates: Record<string, number> = {};
    const add = (s?: string) => {
      if (!s) return;
      const key = s.trim();
      if (!key) return;
      const firstToken = key.split(/\s+/)[0];
      if (STOPWORDS.has(firstToken)) return;
      // avoid overly generic one-word tokens
      if (key.split(" ").length === 1 && STOPWORDS.has(key)) return;
      candidates[key] = (candidates[key] || 0) + 1;
    };

    for (const t of texts) {
      // Prefer phrases after "in" or "to"
      const preps = t.match(
        /\b(?:in|to)\s+([A-Z][\w'\-]+(?:\s+[A-Z][\w'\-]+){0,2})/g
      );
      if (preps) {
        for (const m of preps) {
          const cap = m.replace(/^(?:in|to)\s+/i, "").trim();
          add(cap);
        }
      }
      // General capitalized sequences up to 3 words
      const caps = t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g);
      if (caps) caps.forEach((c) => add(c));
    }

    // Pick the most frequent, prefer multi-word, then longest
    let best = "";
    let bestScore = -1;
    for (const [cand, count] of Object.entries(candidates)) {
      const words = cand.split(" ").length;
      const score = count * 10 + Math.min(words, 3) * 3 + cand.length * 0.01;
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    return best;
  }, [itinerary]);

  // Cache photo references per day if AI didn't provide photos
  const [photoRefsByDay, setPhotoRefsByDay] = useState<
    Record<number, string[]>
  >({});
  const [photoErrors, setPhotoErrors] = useState<Set<number>>(new Set());

  // Build a unique list of places to visualize on the map
  const mapQueries = React.useMemo(() => {
    const list: {
      id: string;
      name: string;
      query: string;
      day?: number;
      kind?: string;
    }[] = [];
    const seen = new Set<string>();
    const add = (name?: string, ctx?: string, day?: number, kind?: string) => {
      if (!name) return;
      // Skip day titles (contain emojis or "Day X")
      if (/day\s+\d+/i.test(name) || /[🗓️📅]/.test(name)) return;

      const q = ctx ? `${name} ${ctx}` : name;
      const key = (day ? `${day}-` : "") + q.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ id: key, name, query: q, day, kind });
    };
    for (const it of itinerary) {
      // Don't add day titles to map
      it.cafes?.forEach((c) => add(c, destination, it.day, "cafe"));
      it.hotels?.forEach((h) => add(h, destination, it.day, "hotel"));
      it.adventures?.forEach((a) => add(a, destination, it.day, "adventure"));
      it.cafeDetails?.forEach((c) => add(c.name, destination, it.day, "cafe"));
      it.hotelDetails?.forEach((h) =>
        add(h.name, destination, it.day, "hotel")
      );
      it.adventureDetails?.forEach((a) =>
        add(a.name, destination, it.day, "adventure")
      );
      it.hiddenGems?.forEach((g) => add(g.name, destination, it.day, "hidden"));
    }
    return list;
  }, [itinerary, destination]);

  // Extract a place-like term from free text (very light heuristic)
  const extractPlaceFromText = (t?: string) => {
    if (!t) return "";
    // try "in <Place>" or "to <Place>"
    const inMatch = t.match(/\b(?:in|to)\s+([A-Z][\w\s,'-]{2,})/);
    if (inMatch?.[1]) return inMatch[1].trim();
    // otherwise pick first Capitalized word sequence  (e.g., "Central Park")
    const capSeq = t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
    return capSeq?.[1] || "";
  };

  // Build a best-effort search query for a day's image
  const buildQuery = (item: ItineraryItem) => {
    // Skip day titles (they contain emojis, "Day X", etc.)
    const isDayTitle =
      item.title &&
      (/day\s+\d+/i.test(item.title) || /[🗓️📅]/.test(item.title));

    // Prefer specific places over day titles
    const direct =
      item.hotels?.[0] ||
      item.cafes?.[0] ||
      item.adventures?.[0] ||
      (!isDayTitle ? item.title : null);
    if (direct) return direct;
    const fromText =
      extractPlaceFromText(item.morning) ||
      extractPlaceFromText(item.afternoon) ||
      extractPlaceFromText(item.evening);
    return fromText || destination || "landmark";
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const tasks = itinerary.map(async (it) => {
        // Skip if photos already exist or we already have an error
        if (Array.isArray(it.photos) && it.photos.length > 0) return;
        if (photoRefsByDay[it.day]?.length) return;
        if (photoErrors.has(it.day)) return;

        const q = buildQuery(it);
        if (!q) return;

        try {
          console.debug(
            "[ItineraryGrid] fetching photo for day",
            it.day,
            "query =",
            q
          );

          const res = await fetch(
            `/api/google/places/search?query=${encodeURIComponent(q)}`
          );

          if (!res.ok) {
            console.warn(
              `[ItineraryGrid] Search failed for day ${it.day}:`,
              res.status,
              res.statusText
            );
            if (!cancelled) {
              setPhotoErrors((prev) => new Set(prev).add(it.day));
            }
            return;
          }

          const data = await res.json();
          const ref: string | undefined =
            data?.results?.[0]?.photos?.[0]?.photo_reference;

          console.debug(
            "[ItineraryGrid] day",
            it.day,
            "photo ref found =",
            !!ref
          );

          if (!cancelled && ref) {
            setPhotoRefsByDay((prev) => ({ ...prev, [it.day]: [ref] }));
          } else if (!cancelled) {
            // No photo found, mark as error to prevent retrying
            setPhotoErrors((prev) => new Set(prev).add(it.day));
          }
        } catch (err) {
          console.error(
            `[ItineraryGrid] Error fetching photo for day ${it.day}:`,
            err
          );
          if (!cancelled) {
            setPhotoErrors((prev) => new Set(prev).add(it.day));
          }
        }
      });
      await Promise.all(tasks);
    };
    run();
    return () => {
      cancelled = true;
    };
    // We intentionally don't include photoRefsByDay/photoErrors to avoid re-running on state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary]);

  if (!itinerary?.length) return null;

  return (
    <div className="p-6 h-full overflow-y-auto">
      {!hideTitle && (
        <h2 className="text-2xl font-bold tracking-tight mb-5">
          Your Professional Trip Plan
        </h2>
      )}
      {!hideMap && mapQueries.length > 0 && (
        <div className="mb-6">
          <TripMap queries={mapQueries} height={380} />
        </div>
      )}
      <div className="space-y-6">
        {itinerary.map((item) => (
          <section key={item.day} className="overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-neutral-100">
              <div>
                <div className="text-sm uppercase tracking-wide text-neutral-500">
                  Day {item.day}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mt-0.5">
                  {item.title || "Planned Activities"}
                </h3>
                {item.date && (
                  <div className="text-sm text-neutral-600 mt-0.5">
                    {item.date}
                  </div>
                )}
              </div>
              {costByDay.get(item.day) && (
                <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-800">
                  <Star className="size-4 text-amber-500" />
                  <span>
                    $
                    {costByDay.get(item.day)?.total?.toFixed?.(2) ??
                      costByDay.get(item.day)?.total}{" "}
                    USD
                  </span>
                </div>
              )}
            </div>
            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Day description if provided */}
              {item.description && (
                <div className="text-sm text-neutral-700 leading-relaxed pl-4 py-2 border-l-4 border-rose-500">
                  {item.description}
                </div>
              )}

              {/* Time blocks (single-column for readability) */}
              <div className="grid grid-cols-1 gap-4">
                {item.morning && (
                  <div className="rounded-md shadow-input p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sun className="size-4.5 text-amber-600" />
                      <div className="text-sm font-semibold text-amber-900">
                        Morning
                      </div>
                    </div>
                    <p className="text-sm text-amber-900/90 leading-relaxed">
                      {item.morning}
                    </p>
                  </div>
                )}
                {item.afternoon && (
                  <div className="rounded-md shadow-input p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <SunMedium className="size-4.5 text-sky-600" />
                      <div className="text-sm font-semibold text-sky-900">
                        Afternoon
                      </div>
                    </div>
                    <p className="text-sm text-sky-900/90 leading-relaxed">
                      {item.afternoon}
                    </p>
                  </div>
                )}
                {item.evening && (
                  <div className="rounded-md shadow-input p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Moon className="size-4.5 text-indigo-600" />
                      <div className="text-sm font-semibold text-indigo-900">
                        Evening
                      </div>
                    </div>
                    <p className="text-sm text-indigo-900/90 leading-relaxed">
                      {item.evening}
                    </p>
                  </div>
                )}
              </div>
              {(item.weather?.summary || item.weather?.tips) && (
                <div className="rounded-md shadow-input p-3">
                  <div className="flex items-start gap-2">
                    <CloudSun className="size-4.5 mt-0.5 text-orange-600" />
                    <div className="text-sm text-orange-900">
                      {item.weather?.summary && (
                        <div className="font-medium">
                          Weather:{" "}
                          <span className="font-normal">
                            {item.weather.summary}
                          </span>
                        </div>
                      )}
                      {item.weather?.tips && (
                        <div className="text-xs text-orange-900/90 mt-0.5">
                          Tip: {item.weather.tips}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {item.notes && (
                <div className="rounded-md shadow-input p-3">
                  <div className="flex items-start gap-2">
                    <StickyNote className="size-4.5 mt-0.5 text-neutral-600" />
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden gems */}
              {item.hiddenGems?.length ? (
                <div className="flex items-start gap-2">
                  <Star className="size-4.5 mt-1 text-amber-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">
                      Hidden Gems
                    </div>
                    <div className="ml-1 space-y-1">
                      {item.hiddenGems.map((g, idx) => (
                        <PlaceBadge
                          key={`gem-${g.name}-${idx}`}
                          name={g.name}
                          description={g.description}
                          query={
                            destination ? `${g.name} ${destination}` : g.name
                          }
                          day={item.day}
                          kind="hidden"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {item.cafeDetails?.length ? (
                <div className="flex items-start gap-2">
                  <Coffee className="size-4.5 mt-1 text-rose-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">Cafes</div>
                    <div className="ml-1 space-y-1">
                      {item.cafeDetails.map((c, idx) => (
                        <PlaceBadge
                          key={`cafe-${c.name}-${idx}`}
                          name={c.name}
                          description={c.description}
                          rating={c.rating}
                          query={
                            destination ? `${c.name} ${destination}` : c.name
                          }
                          day={item.day}
                          kind="cafe"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.cafes?.length ? (
                <div className="flex items-start gap-2">
                  <Coffee className="size-4.5 mt-1 text-rose-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">Cafes</div>
                    <div className="ml-1 space-y-1">
                      {item.cafes.map((c, idx) => (
                        <PlaceBadge
                          key={`cafe-${c}-${idx}`}
                          name={c}
                          query={destination ? `${c} ${destination}` : c}
                          day={item.day}
                          kind="cafe"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              {item.hotelDetails?.length ? (
                <div className="flex items-start gap-2">
                  <Hotel className="size-4.5 mt-1 text-indigo-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">Hotels</div>
                    <div className="ml-1 space-y-1">
                      {item.hotelDetails.map((h, idx) => (
                        <PlaceBadge
                          key={`hotel-${h.name}-${idx}`}
                          name={h.name}
                          description={h.description}
                          rating={h.rating}
                          price={h.price}
                          query={
                            destination ? `${h.name} ${destination}` : h.name
                          }
                          day={item.day}
                          kind="hotel"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.hotels?.length ? (
                <div className="flex items-start gap-2">
                  <Hotel className="size-4.5 mt-1 text-indigo-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">Hotels</div>
                    <div className="ml-1 space-y-1">
                      {item.hotels.map((h, idx) => (
                        <PlaceBadge
                          key={`hotel-${h}-${idx}`}
                          name={h}
                          query={destination ? `${h} ${destination}` : h}
                          day={item.day}
                          kind="hotel"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              {item.adventureDetails?.length ? (
                <div className="flex items-start gap-2">
                  <Mountain className="size-4.5 mt-1 text-emerald-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">
                      Adventures
                    </div>
                    <div className="ml-1 space-y-1">
                      {item.adventureDetails.map((a, idx) => (
                        <PlaceBadge
                          key={`adv-${a.name}-${idx}`}
                          name={a.name}
                          description={a.description}
                          rating={a.rating}
                          ticketPrice={a.ticketPrice}
                          query={
                            destination ? `${a.name} ${destination}` : a.name
                          }
                          day={item.day}
                          kind="adventure"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.adventures?.length ? (
                <div className="flex items-start gap-2">
                  <Mountain className="size-4.5 mt-1 text-emerald-600" />
                  <div className="text-md text-neutral-700 leading-relaxed">
                    <div className="font-semibold text-neutral-800">
                      Adventures
                    </div>
                    <div className="ml-1 space-y-1">
                      {item.adventures.map((a, idx) => (
                        <PlaceBadge
                          key={`adv-${a}-${idx}`}
                          name={a}
                          query={destination ? `${a} ${destination}` : a}
                          day={item.day}
                          kind="adventure"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {costByDay.get(item.day) ? (
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-semibold text-neutral-900">
                    Costs (USD)
                  </div>
                  {costByDay.get(item.day)?.hotels?.length ? (
                    <div className="text-sm text-neutral-700">
                      Hotels:{" "}
                      {costByDay
                        .get(item.day)!
                        .hotels!.map((h) => `${h.name} ($${h.price})`)
                        .join(", ")}
                    </div>
                  ) : null}
                  {costByDay.get(item.day)?.activities?.length ? (
                    <div className="text-sm text-neutral-700">
                      Activities:{" "}
                      {costByDay
                        .get(item.day)!
                        .activities!.map((a) => `${a.name} ($${a.price})`)
                        .join(", ")}
                    </div>
                  ) : null}
                  <div className="text-sm text-neutral-800">
                    Day total: $
                    {costByDay.get(item.day)?.total?.toFixed?.(2) ??
                      costByDay.get(item.day)?.total}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ItineraryGrid;
