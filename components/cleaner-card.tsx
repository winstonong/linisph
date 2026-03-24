import Link from "next/link";
import type { Profile } from "@/lib/types";

const SERVICE_LABELS: Record<string, string> = {
  regular: "Regular",
  deep_clean: "Deep Clean",
  move_out: "Move-out",
  airbnb: "Airbnb",
  office: "Office",
};

export default function CleanerCard({ cleaner }: { cleaner: Profile }) {
  return (
    <Link
      href={`/cleaners/${cleaner.id}`}
      className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0">
          🧹
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">
              {cleaner.full_name}
            </h3>
            {cleaner.hourly_rate && (
              <span className="text-sm font-bold text-emerald-600 shrink-0">
                ₱{cleaner.hourly_rate}/hr
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm text-gray-600">
              {Number(cleaner.rating_avg) > 0
                ? `${cleaner.rating_avg} (${cleaner.rating_count})`
                : "New"}
            </span>
            {cleaner.barangay && (
              <>
                <span className="text-gray-300 mx-1">·</span>
                <span className="text-sm text-gray-500">{cleaner.barangay}</span>
              </>
            )}
          </div>

          {/* Services */}
          {cleaner.services_offered && cleaner.services_offered.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cleaner.services_offered.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                >
                  {SERVICE_LABELS[s] || s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
