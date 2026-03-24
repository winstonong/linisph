"use client";

import { useRouter } from "next/navigation";

const FILTERS = [
  { value: "", label: "All" },
  { value: "regular", label: "Regular" },
  { value: "deep_clean", label: "Deep Clean" },
  { value: "move_out", label: "Move-out" },
  { value: "airbnb", label: "Airbnb" },
  { value: "office", label: "Office" },
];

export default function CleanerFilters({ active }: { active: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() =>
            router.push(f.value ? `/cleaners?service=${f.value}` : "/cleaners")
          }
          className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
            active === f.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
