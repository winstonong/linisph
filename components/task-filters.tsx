"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

export default function TaskFilters({
  categories,
  activeCategory,
  activeSort,
}: {
  categories: Category[];
  activeCategory: string;
  activeSort: string;
}) {
  const router = useRouter();

  const buildUrl = (cat?: string, sort?: string) => {
    const params = new URLSearchParams();
    const c = cat !== undefined ? cat : activeCategory;
    const s = sort !== undefined ? sort : activeSort;
    if (c) params.set("category", c);
    if (s) params.set("sort", s);
    return `/tasks${params.toString() ? "?" + params.toString() : ""}`;
  };

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => router.push(buildUrl(""))}
          className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
            !activeCategory
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => router.push(buildUrl(cat.slug))}
            className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
              activeCategory === cat.slug
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={activeSort}
        onChange={(e) => router.push(buildUrl(undefined, e.target.value))}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600"
      >
        <option value="">Newest first</option>
        <option value="budget_high">Budget: High to Low</option>
        <option value="budget_low">Budget: Low to High</option>
      </select>
    </div>
  );
}
