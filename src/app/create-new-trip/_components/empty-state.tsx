export const EmptyState = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center">
        {" "}
        <svg
          className="w-16 h-16 text-neutral-950 animate-pulse"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-shadow-2xs mt-4 ">
          No Trip Generated
        </h1>
        <h2 className="text-xl font-medium text-shadow-2xs text-neutral-900 mt-2">
          Talk to sophia to generate your trip.
        </h2>
      </div>
    </div>
  );
};
