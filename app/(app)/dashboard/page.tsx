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

  // Get active tasks/bookings count
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .or(
      role === "customer"
        ? `customer_id.eq.${user.id}`
        : `cleaner_id.eq.${user.id}`
    )
    .in("status", ["pending", "confirmed"]);

  const { count: taskCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq(role === "customer" ? "customer_id" : "assigned_cleaner_id", user.id)
    .in("status", ["open", "assigned"]);

  return (
    <div className="px-6 pt-14">
      <h1 className="text-2xl font-bold mb-1">Hi, {name}! 👋</h1>
      <p className="text-gray-500 mb-8">
        {role === "customer"
          ? "What do you need done today?"
          : "Ready to find your next task?"}
      </p>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {role === "customer" ? (
          <>
            <Link
              href="/post-task"
              className="bg-emerald-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-emerald-700 transition"
            >
              <span className="text-2xl">📝</span>
              <span className="font-semibold">Post a Task</span>
              <span className="text-xs text-emerald-200">
                Get offers from taskers
              </span>
            </Link>
            <Link
              href="/tasks"
              className="bg-blue-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-blue-700 transition"
            >
              <span className="text-2xl">🔍</span>
              <span className="font-semibold">Browse Tasks</span>
              <span className="text-xs text-blue-200">
                See what others need
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/tasks"
              className="bg-emerald-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-emerald-700 transition"
            >
              <span className="text-2xl">🔍</span>
              <span className="font-semibold">Browse Tasks</span>
              <span className="text-xs text-emerald-200">
                Find work near you
              </span>
            </Link>
            <Link
              href="/bookings"
              className="bg-blue-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-blue-700 transition"
            >
              <span className="text-2xl">📅</span>
              <span className="font-semibold">My Tasks</span>
              <span className="text-xs text-blue-200">
                {(bookingCount || 0) + (taskCount || 0)} active
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        {(taskCount ?? 0) > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-bold mb-2">Active Tasks</h2>
            <p className="text-gray-600 text-sm">
              You have {taskCount} active task
              {taskCount !== 1 ? "s" : ""}.{" "}
              <Link href="/bookings" className="text-blue-600 font-medium">
                View all →
              </Link>
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold mb-2">Active Bookings</h2>
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
              <Link href="/tasks" className="text-blue-600 font-medium">
                Browse tasks →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
