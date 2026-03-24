import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Profile, Review } from "@/lib/types";

const SERVICE_LABELS: Record<string, string> = {
  regular: "Regular Cleaning",
  deep_clean: "Deep Clean",
  move_out: "Move-out Clean",
  airbnb: "Airbnb Turnover",
  office: "Office Cleaning",
};

export default async function CleanerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cleaner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "cleaner")
    .single();

  if (!cleaner) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, customer:profiles!reviews_customer_id_fkey(full_name)")
    .eq("cleaner_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const isCustomer = user.user_metadata?.role === "customer";

  return (
    <div className="px-6 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl shrink-0">
          🧹
        </div>
        <div>
          <h1 className="text-2xl font-bold">{cleaner.full_name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-yellow-500">★</span>
            <span>
              {Number(cleaner.rating_avg) > 0
                ? `${cleaner.rating_avg} (${cleaner.rating_count} reviews)`
                : "New cleaner"}
            </span>
            {cleaner.barangay && (
              <>
                <span className="text-gray-300">·</span>
                <span>{cleaner.barangay}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rate + Availability */}
      <div className="flex gap-3 mb-6">
        {cleaner.hourly_rate && (
          <div className="bg-emerald-50 rounded-xl px-4 py-3 flex-1 text-center">
            <div className="text-xl font-bold text-emerald-700">
              ₱{cleaner.hourly_rate}
            </div>
            <div className="text-xs text-emerald-600">per hour</div>
          </div>
        )}
        <div
          className={`rounded-xl px-4 py-3 flex-1 text-center ${
            cleaner.is_available ? "bg-green-50" : "bg-gray-100"
          }`}
        >
          <div
            className={`text-sm font-semibold ${
              cleaner.is_available ? "text-green-700" : "text-gray-500"
            }`}
          >
            {cleaner.is_available ? "✓ Available" : "Unavailable"}
          </div>
        </div>
      </div>

      {/* Bio */}
      {cleaner.bio && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{cleaner.bio}</p>
        </div>
      )}

      {/* Services */}
      {cleaner.services_offered && cleaner.services_offered.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Services</h2>
          <div className="flex flex-wrap gap-2">
            {cleaner.services_offered.map((s: string) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm"
              >
                {SERVICE_LABELS[s] || s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3">
          Reviews {cleaner.rating_count > 0 && `(${cleaner.rating_count})`}
        </h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r: any) => (
              <div
                key={r.id}
                className="bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {r.customer?.full_name || "Customer"}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < r.rating ? "text-yellow-400" : "text-gray-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        )}
      </div>

      {/* Book button */}
      {isCustomer && cleaner.is_available && (
        <Link
          href={`/bookings/new?cleaner=${cleaner.id}`}
          className="block w-full text-center py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition sticky bottom-24"
        >
          Request Booking
        </Link>
      )}
    </div>
  );
}
