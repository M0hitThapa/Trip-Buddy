import Image from "next/image";
import React from "react";

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay conscious of costs",
    image: "/low.png",
    color: "bg-green-100 text-green-600",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep cost on the average side",
    image: "/middle.png",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Don't worry about cost",
    image: "/high.png",
    color: "bg-purple-100 text-purple-600",
  },
];

type BudgetUiProps = { onSelectedOption: (value: string) => void };

function BudgetUi({ onSelectedOption }: BudgetUiProps) {
  const [custom, setCustom] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-sm">
        {SelectBudgetOptions.map((item, index) => (
          <div
            key={index}
            className="py-2 border shadow-input rounded-lg bg-white hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-center hover:bg-rose-200 items-center"
            onClick={() => onSelectedOption(item.title + ":" + item.desc)}
          >
            <div className="bg-gray-50 border-2 border-neutral-200 rounded-md flex items-center justify-center">
              <Image src={item.image} alt="image" height={50} width={50} />
            </div>
            <h2 className="text-md font-semibold text-neutral-700 text-shadow-sm">
              {item.title}
            </h2>
          </div>
        ))}
      </div>
      {/* Custom budget input */}
      <div className="mt-3 flex items-center gap-2 max-w-md">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = custom.trim();
              if (!v) return;
              if (v.length < 2) {
                setError("Please enter at least 2 characters.");
                return;
              }
              if (v.length > 50) {
                setError("Maximum length is 50 characters.");
                return;
              }
              setError(null);
              onSelectedOption(`Budget: ${v}`);
              setCustom("");
            }
          }}
          placeholder="Custom budget (e.g., $1500 total, mid-range)"
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
            if (v.length > 50) {
              setError("Maximum length is 50 characters.");
              return;
            }
            setError(null);
            onSelectedOption(`Budget: ${v}`);
            setCustom("");
          }}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm font-semibold shadow-md hover:bg-neutral-800"
        >
          Add
        </button>
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        Examples: $1500 total, $200/day, mid-range hotels, budget-friendly
      </div>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}

export default BudgetUi;
