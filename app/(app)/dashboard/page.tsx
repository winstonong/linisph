import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = (user.user_metadata?.role as UserRole) || "customer";
  const name = user.user_metadata?.full_name || "there";

  // Get recent bookings count
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .or(
      role === "customer"
        ? `customer_id.eq.${user.id}`
        : `cleaner_id.eq.${user.id}`
    )
    .in("status", ["pending", "confirmed"]);

  return (
    <div className="px-6 pt-14">
      <h1 className="text-2xl font-bold mb-1">Hi, {name}! 👋</h1>
      <p className="text-gray-500 mb-8">
        {role === "customer"
          ? "What would you like to get done today?"
          : "Ready to find your next job?"}
      </p>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {role === "customer" ? (
          <>
            <Link
              href="/cleaners"
              className="bg-blue-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-blue-700 transition"
            >
              <span className="text-2xl">🔍</span>
              <span className="font-semibold">Find a Cleaner</span>
              <span className="text-xs text-blue-200">
                Browse profiles & book
              </span>
            </Link>
            <Link
              href="/jobs/new"
              className="bg-emerald-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-emerald-700 transition"
            >
              <span className="text-2xl">📋</span>
              <span className="font-semibold">Post a Job</span>
              <span className="text-xs text-emerald-200">
                Get bids from cleaners
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/jobs"
              className="bg-emerald-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-emerald-700 transition"
            >
              <span className="text-2xl">📋</span>
              <span className="font-semibold">Browse Jobs</span>
              <span className="text-xs text-emerald-200">
                Find work near you
              </span>
            </Link>
            <Link
              href="/bookings"
              className="bg-blue-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-blue-700 transition"
            >
              <span className="text-2xl">📅</span>
              <span className="font-semibold">My Bookings</span>
              <span className="text-xs text-blue-200">
                {bookingCount || 0} active
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Active bookings summary */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 className="font-bold mb-3">Active Bookings</h2>
        {bookingCount && bookingCount > 0 ? (
          <p className="text-gray-600 text-sm">
            You have {bookingCount} active booking
            {bookingCount > 1 ? "s" : ""}.{" "}
            <Link href="/bookings" className="text-blue-600 font-medium">
              View all →
            </Link>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            No active bookings yet.{" "}
            {role === "customer" ? (
              <Link href="/cleaners" className="text-blue-600 font-medium">
                Find a cleaner →
              </Link>
            ) : (
              <Link href="/jobs" className="text-blue-600 font-medium">
                Browse jobs →
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
