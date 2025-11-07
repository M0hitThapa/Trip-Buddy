"use client";

import React from "react";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import Image from "next/image";

type Trip = {
  id: string;
  author: string;
  date: string;
  title: string;
  description: string;
  image: string;
  authorAvatar: string;
  payload: {
    resp: string;
    ui: "Final";
    itinerary: Array<{
      day: number;
      title?: string;
      morning?: string;
      afternoon?: string;
      evening?: string;
      notes?: string;
      weather?: { summary?: string; tips?: string };
      cafes?: string[];
      hotels?: string[];
      adventures?: string[];
    }>;
    budget?: {
      currency: "USD";
      total: number;
      breakdown: Array<{
        day: number;
        total: number;
        hotels?: { name: string; price: number }[];
        activities?: { name: string; price: number }[];
      }>;
    };
  };
};

const trips: Trip[] = [
  {
    id: "bali-escape",
    author: "TripBuddy",
    date: "Sep 2025",
    title: "Tropical Escape to Bali",
    description: "3-day beach, temples, and cafes around Ubud and Seminyak.",
    image: "/trending1.jpeg",
    authorAvatar: "/trending1.jpeg",
    payload: {
      resp: "A relaxing tropical escape across Bali's beaches and culture.",
      ui: "Final",
      itinerary: [
        {
          day: 1,
          title: "Ubud Temples",
          morning: "Tegallalang Rice Terraces",
          afternoon: "Ubud Palace & Market",
          evening: "Campuhan Ridge Walk",
          cafes: ["Clear Cafe"],
          hotels: ["Ubud Village Hotel"],
          adventures: ["Monkey Forest"],
        },
        {
          day: 2,
          title: "Seminyak & Beach",
          morning: "Seminyak Beach",
          afternoon: "Cafe hopping",
          evening: "Beach sunset at La Plancha",
          cafes: ["Revolver Espresso"],
          hotels: ["The Seminyak Beach Resort"],
          adventures: ["Surf lesson"],
        },
        {
          day: 3,
          title: "Nusa Penida Day Trip",
          morning: "Kelingking Beach",
          afternoon: "Crystal Bay",
          evening: "Return & spa",
          cafes: ["Betelnut Cafe"],
          hotels: ["The Seminyak Beach Resort"],
        },
      ],
      budget: {
        currency: "USD",
        total: 780,
        breakdown: [
          {
            day: 1,
            total: 240,
            hotels: [{ name: "Ubud Village Hotel", price: 180 }],
            activities: [{ name: "Monkey Forest", price: 20 }],
          },
          {
            day: 2,
            total: 260,
            hotels: [{ name: "The Seminyak Beach Resort", price: 200 }],
            activities: [{ name: "Surf lesson", price: 40 }],
          },
          {
            day: 3,
            total: 280,
            hotels: [{ name: "The Seminyak Beach Resort", price: 200 }],
            activities: [{ name: "Nusa Penida ferry", price: 50 }],
          },
        ],
      },
    },
  },
  {
    id: "paris-weekend",
    author: "TripBuddy",
    date: "Sep 2025",
    title: "Paris Weekend Highlights",
    description: "Museums, patisseries and an evening by the Seine.",
    image: "/trending2.jpeg",
    authorAvatar: "/trending2.jpeg",
    payload: {
      resp: "A cozy Parisian weekend with museums and riverside walks.",
      ui: "Final",
      itinerary: [
        {
          day: 1,
          title: "Louvre & Tuileries",
          morning: "Louvre Museum",
          afternoon: "Tuileries Gardens",
          evening: "Seine cruise",
          cafes: ["Cafe de Flore"],
          hotels: ["Hotel Le Meurice"],
        },
        {
          day: 2,
          title: "Montmartre",
          morning: "Sacré-Cœur",
          afternoon: "Artists' Square",
          evening: "Moulin Rouge exterior",
          cafes: ["La Maison Rose"],
          hotels: ["Hotel Le Meurice"],
        },
      ],
      budget: {
        currency: "USD",
        total: 950,
        breakdown: [
          {
            day: 1,
            total: 520,
            hotels: [{ name: "Hotel Le Meurice", price: 450 }],
            activities: [{ name: "Seine cruise", price: 30 }],
          },
          {
            day: 2,
            total: 430,
            hotels: [{ name: "Hotel Le Meurice", price: 400 }],
            activities: [],
          },
        ],
      },
    },
  },
  {
    id: "tokyo-taster",
    author: "TripBuddy",
    date: "Sep 2025",
    title: "Tokyo Taster Tour",
    description: "Shibuya, Asakusa, and sushi—packed into 3 days.",
    image: "/trending3.jpeg",
    authorAvatar: "/trending3.jpeg",
    payload: {
      resp: "A quick taste of Tokyo's modern and traditional highlights.",
      ui: "Final",
      itinerary: [
        {
          day: 1,
          title: "Asakusa",
          morning: "Senso-ji Temple",
          afternoon: "Nakamise Street",
          evening: "Skytree views",
          cafes: ["Blue Bottle"],
          hotels: ["Hotel Niwa Tokyo"],
        },
        {
          day: 2,
          title: "Shibuya & Harajuku",
          morning: "Meiji Shrine",
          afternoon: "Takeshita Street",
          evening: "Shibuya Crossing",
          cafes: ["Streamer Coffee"],
          hotels: ["Hotel Niwa Tokyo"],
        },
        {
          day: 3,
          title: "Tsukiji & Akihabara",
          morning: "Sushi breakfast",
          afternoon: "Gadgets shopping",
          evening: "Odaiba sunset",
          hotels: ["Hotel Niwa Tokyo"],
        },
      ],
      budget: {
        currency: "USD",
        total: 1100,
        breakdown: [
          {
            day: 1,
            total: 350,
            hotels: [{ name: "Hotel Niwa Tokyo", price: 280 }],
          },
          {
            day: 2,
            total: 380,
            hotels: [{ name: "Hotel Niwa Tokyo", price: 280 }],
          },
          {
            day: 3,
            total: 370,
            hotels: [{ name: "Hotel Niwa Tokyo", price: 280 }],
          },
        ],
      },
    },
  },
  {
    id: "goa-getaway",
    author: "TripBuddy",
    date: "Sep 2025",
    title: "Goa Getaway",
    description: "Sun, sand, forts, and shacks across North Goa.",
    image: "/trending4.jpeg",
    authorAvatar: "/trending4.jpeg",
    payload: {
      resp: "A beachy Goa break with forts and cafes.",
      ui: "Final",
      itinerary: [
        {
          day: 1,
          title: "Fort & Beach",
          morning: "Aguada Fort",
          afternoon: "Calangute Beach",
          evening: "Baga nightlife",
          hotels: ["Novotel Candolim"],
        },
        {
          day: 2,
          title: "Old Goa",
          morning: "Basilica of Bom Jesus",
          afternoon: "Panjim Latin Quarter",
          evening: "Cruise on Mandovi",
          hotels: ["Novotel Candolim"],
        },
      ],
      budget: {
        currency: "USD",
        total: 520,
        breakdown: [
          {
            day: 1,
            total: 270,
            hotels: [{ name: "Novotel Candolim", price: 220 }],
          },
          {
            day: 2,
            total: 250,
            hotels: [{ name: "Novotel Candolim", price: 220 }],
          },
        ],
      },
    },
  },
];

type Props = {
  onSelectTrip: (payload: Trip["payload"]) => void;
  gridClassName?: string;
};

export default function TrendingTrips({ onSelectTrip, gridClassName }: Props) {
  return (
    <div className=" m-5">
      <h3 className="text-2xl font-bold text-neutral-800 mb-3 text-center">
        Trending trips
      </h3>
      <div className={gridClassName || "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {trips.map((t) => (
          <div key={t.id} className="mx-auto w-full max-w-xs">
            <FollowerPointerCard title={t.author}>
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-zinc-100 bg-white">
                <div className="relative aspect-[16/12] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100">
                  <Image
                    src={t.image}
                    alt="thumbnail"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover rounded-3xl p-3"
                  />
                </div>
                <div className="p-4">
                  <h2 className="my-1 text-xs text-zinc-500">{t.date}</h2>
                  <h2 className="my-2 text-lg font-bold text-zinc-700">
                    {t.title}
                  </h2>
                  <div className="mt-6 flex flex-row items-center justify-between">
                    <span className="text-sm text-gray-500">TripBuddy</span>
                    <button
                      className="relative z-10 block rounded-sm bg-neutral-950 px-5 py-2 text-sm font-bold text-white"
                      onClick={() => onSelectTrip(t.payload)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </FollowerPointerCard>
          </div>
        ))}
      </div>
    </div>
  );
}
