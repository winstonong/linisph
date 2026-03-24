import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingStatusBadge from "@/components/booking-status-badge";
import type { BookingStatus } from "@/lib/types";

const SERVICE_LABELS: Record<string, string> = {
  regular: "Regular Cleaning",
  deep_clean: "Deep Clean",
  move_out: "Move-out Clean",
  airbnb: "Airbnb Turnover",
  office: "Office Cleaning",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.user_metadata?.role || "customer";
  const filterCol = role === "customer" ? "customer_id" : "cleaner_id";

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, cleaner:profiles!bookings_cleaner_id_fkey(full_name), customer:profiles!bookings_customer_id_fkey(full_name)"
    )
    .eq(filterCol, user.id)
    .order("created_at", { ascending: false });

  const active = bookings?.filter(
    (b: any) => b.status === "pending" || b.status === "confirmed"
  );
  const past = bookings?.filter(
    (b: any) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      b.status === "declined"
  );

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {/* Active */}
      <h2 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
        Active
      </h2>
      {active && active.length > 0 ? (
        <div className="space-y-3 mb-8">
          {active.map((b: any) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">
                  {role === "customer"
                    ? b.cleaner?.full_name
                    : b.customer?.full_name}
                </span>
                <BookingStatusBadge status={b.status as BookingStatus} />
              </div>
              <div className="text-sm text-gray-500">
                {SERVICE_LABELS[b.service_type] || b.service_type} ·{" "}
                {new Date(b.scheduled_date + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-8">No active bookings.</p>
      )}

      {/* Past */}
      <h2 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
        Past
      </h2>
      {past && past.length > 0 ? (
        <div className="space-y-3">
          {past.map((b: any) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">
                  {role === "customer"
                    ? b.cleaner?.full_name
                    : b.customer?.full_name}
                </span>
                <BookingStatusBadge status={b.status as BookingStatus} />
              </div>
              <div className="text-sm text-gray-500">
                {SERVICE_LABELS[b.service_type] || b.service_type} ·{" "}
                {new Date(b.scheduled_date + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No past bookings.</p>
      )}
    </div>
  );
}
