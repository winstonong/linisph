"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookingActions({
  bookingId,
  status,
  role,
}: {
  bookingId: string;
  status: string;
  role: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState("");

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);
    router.refresh();
    setLoading("");
  };

  // Cleaner: confirm or decline pending bookings
  if (role === "cleaner" && status === "pending") {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => updateStatus("confirmed")}
          disabled={loading !== ""}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {loading === "confirmed" ? "Confirming..." : "✓ Confirm"}
        </button>
        <button
          onClick={() => updateStatus("declined")}
          disabled={loading !== ""}
          className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition"
        >
          {loading === "declined" ? "Declining..." : "✗ Decline"}
        </button>
      </div>
    );
  }

  // Customer: cancel pending, or mark confirmed as complete
  if (role === "customer") {
    if (status === "pending") {
      return (
        <button
          onClick={() => updateStatus("cancelled")}
          disabled={loading !== ""}
          className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50 transition"
        >
          {loading === "cancelled" ? "Cancelling..." : "Cancel Booking"}
        </button>
      );
    }
    if (status === "confirmed") {
      return (
        <button
          onClick={() => updateStatus("completed")}
          disabled={loading !== ""}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {loading === "completed" ? "Completing..." : "✓ Mark as Complete"}
        </button>
      );
    }
  }

  return null;
}
