import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BookingStatusBadge from "@/components/booking-status-badge";
import BookingActions from "./actions";
import type { BookingStatus } from "@/lib/types";

const SERVICE_LABELS: Record<string, string> = {
  regular: "Regular Cleaning",
  deep_clean: "Deep Clean",
  move_out: "Move-out Clean",
  airbnb: "Airbnb Turnover",
  office: "Office Cleaning",
};

export default async function BookingDetailPage({
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

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, cleaner:profiles!bookings_cleaner_id_fkey(*), customer:profiles!bookings_customer_id_fkey(*)"
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const role = user.user_metadata?.role || "customer";
  const isCustomer = role === "customer";
  const otherPerson = isCustomer ? booking.cleaner : booking.customer;

  // Check if a review exists for this booking
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", id)
    .single();

  const canReview =
    isCustomer && booking.status === "completed" && !existingReview;

  return (
    <div className="px-6 pt-14 pb-6">
      {/* Back link */}
      <Link
        href="/bookings"
        className="text-sm text-blue-600 mb-4 inline-block"
      >
        ← Back to bookings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <BookingStatusBadge status={booking.status as BookingStatus} />
      </div>

      {/* Person card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {isCustomer ? "Cleaner" : "Customer"}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
            {isCustomer ? "🧹" : "👤"}
          </div>
          <div>
            <p className="font-semibold">{otherPerson?.full_name}</p>
            {otherPerson?.phone && (
              <p className="text-sm text-gray-500">{otherPerson.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Service
          </div>
          <div className="font-medium">
            {SERVICE_LABELS[booking.service_type] || booking.service_type}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Date
          </div>
          <div className="font-medium">
            {new Date(booking.scheduled_date + "T12:00:00").toLocaleDateString(
              "en-US",
              { weekday: "long", month: "long", day: "numeric", year: "numeric" }
            )}
            {booking.scheduled_time && ` at ${booking.scheduled_time}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Address
          </div>
          <div className="font-medium">{booking.address}</div>
        </div>
        {booking.notes && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Notes
            </div>
            <div className="text-sm text-gray-600">{booking.notes}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <BookingActions
        bookingId={booking.id}
        status={booking.status}
        role={role}
      />

      {/* Review prompt */}
      {canReview && (
        <Link
          href={`/reviews/new?booking=${booking.id}&cleaner=${booking.cleaner_id}`}
          className="block w-full text-center mt-4 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
        >
          ⭐ Leave a Review
        </Link>
      )}
    </div>
  );
}
