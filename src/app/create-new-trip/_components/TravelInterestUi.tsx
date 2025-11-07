import React, { useMemo, useState } from "react";
import {
  Mountain,
  Camera,
  Palette,
  Utensils,
  PartyPopper,
  Bed,
  Waves,
  TreePine,
  Music,
  ShoppingBag,
  Globe2,
} from "lucide-react";

export const TravelInterestOptions = [
  {
    id: 1,
    title: "Adventure",
    Icon: Mountain,
    bg: "bg-lime-100",
    text: "text-lime-700",
  },
  {
    id: 2,
    title: "Sightseeing",
    Icon: Camera,
    bg: "bg-violet-100",
    text: "text-violet-700",
  },
  {
    id: 3,
    title: "Cultural",
    Icon: Palette,
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  {
    id: 4,
    title: "Food",
    Icon: Utensils,
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  {
    id: 5,
    title: "Nightlife",
    Icon: PartyPopper,
    bg: "bg-red-100",
    text: "text-red-700",
  },
  {
    id: 6,
    title: "Relaxation",
    Icon: Bed,
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
  {
    id: 7,
    title: "Beach",
    Icon: Waves,
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  {
    id: 8,
    title: "Nature",
    Icon: TreePine,
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    id: 9,
    title: "Music & Festivals",
    Icon: Music,
    bg: "bg-rose-100",
    text: "text-rose-700",
  },
  {
    id: 10,
    title: "Shopping",
    Icon: ShoppingBag,
    bg: "bg-indigo-100",
    text: "text-indigo-700",
  },
  {
    id: 11,
    title: "Global Experiences",
    Icon: Globe2,
    bg: "bg-cyan-100",
    text: "text-cyan-700",
  },
];

type TravelInterestUiProps = { onSelectedOption: (value: string) => void };

function TravelInterestUi({ onSelectedOption }: TravelInterestUiProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const toggle = (title: string) => {
    setSelected((prev) => {
      const exists = prev.includes(title);
      if (exists) return prev.filter((t) => t !== title);
      return [...prev, title];
    });
  };

  const canSubmit = selected.length >= 1;
  const helperText = useMemo(() => {
    if (selected.length === 0) return "Choose one or more interests";
    return `${selected.length} selected`;
  }, [selected]);

  return (
    <div className="mt-4 max-w-lg">
      <div className="text-sm text-neutral-700 mb-3">
        Pick your travel interests
      </div>
      <div className="flex flex-wrap gap-3">
        {TravelInterestOptions.map((item) => {
          const isSelected = selected.includes(item.title);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.title)}
              className={`flex items-center gap-2 px-2 py-1 rounded border text-sm font-semibold shadow-md transition 
                ${
                  isSelected
                    ? "bg-neutral-700 text-neutral-100 border-neutral-700"
                    : `${item.bg} ${item.text} border-transparent hover:opacity-90`
                }`}
            >
              <item.Icon className="w-4 h-4" />
              {item.title}
            </button>
          );
        })}
      </div>
      {/* Custom interest input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = custom.trim();
              if (!v) return;
              // Validation: 2-30 chars
              if (v.length < 2) {
                setError("Please enter at least 2 characters.");
                return;
              }
              if (v.length > 30) {
                setError("Maximum length is 30 characters.");
                return;
              }
              setError(null);
              if (!selected.includes(v)) setSelected((prev) => [...prev, v]);
              setCustom("");
            }
          }}
          placeholder="Type a custom interest (e.g., photography, hiking)"
          className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        />
        <button
          type="button"
          onClick={() => {
            const v = custom.trim();
            if (!v) return;
            if (v.length < 2) {
              setError("Please enter at least 2 characters.");
              return;
            }
            if (v.length > 30) {
              setError("Maximum length is 30 characters.");
              return;
            }
            setError(null);
            if (!selected.includes(v)) setSelected((prev) => [...prev, v]);
            setCustom("");
          }}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm font-semibold shadow-md hover:bg-neutral-800"
        >
          Add
        </button>
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        Examples: photography, cafe hopping, hiking, street food
      </div>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800"
            >
              {s}
              <button
                type="button"
                onClick={() =>
                  setSelected((prev) => prev.filter((v) => v !== s))
                }
                className="ml-1 rounded-full px-1 text-neutral-500 hover:text-neutral-800"
                aria-label={`Remove ${s}`}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-neutral-600">{helperText}</div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSelectedOption(`Interests: ${selected.join(", ")}`)}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition 
            ${
              canSubmit
                ? "bg-rose-700 text-white hover:bg-rose-800"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default TravelInterestUi;
