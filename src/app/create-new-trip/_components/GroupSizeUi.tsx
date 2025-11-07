import Image from "next/image";
import React from "react";

export const SelectTravelsList = [
  {
    id: 1,
    title: "Solo",
    desc: "A sole traveler in exploration",
    image: "/single.png",
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "Two travelers in tandem",
    image: "/couple.png",
    people: "2 People",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun loving adventurers",
    image: "/family.png",
    people: "3 to 5 People",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A bunch of thrill-seekers",
    image: "/friend.png",
    people: "5 to 10 People",
  },
];

type GroupSizeUiProps = { onSelectedOption: (value: string) => void };

function GroupSizeUi({ onSelectedOption }: GroupSizeUiProps) {
  const [custom, setCustom] = React.useState("");
  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-sm">
        {SelectTravelsList.map((item, index) => (
          <div
            key={index}
            className="py-2 border shadow-input rounded-lg bg-white hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-center hover:bg-rose-200 items-center"
            onClick={() => onSelectedOption(item.title + ":" + item.people)}
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
      {/* Custom group size input */}
      <div className="mt-3 flex items-center gap-2 max-w-md">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              onSelectedOption(`Group size: ${custom.trim()}`);
              setCustom("");
            }
          }}
          placeholder="Custom group (e.g., 3 adults + 1 child)"
          className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        />
        <button
          type="button"
          onClick={() => {
            if (custom.trim()) {
              onSelectedOption(`Group size: ${custom.trim()}`);
              setCustom("");
            }
          }}
          className="px-3 py-1.5 rounded-sm bg-neutral-900 text-white text-sm font-semibold shadow-lg hover:bg-neutral-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default GroupSizeUi;
