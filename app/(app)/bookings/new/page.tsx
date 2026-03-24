"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const SERVICE_OPTIONS = [
  { value: "regular", label: "Regular Cleaning" },
  { value: "deep_clean", label: "Deep Clean" },
  { value: "move_out", label: "Move-out Clean" },
  { value: "airbnb", label: "Airbnb Turnover" },
  { value: "office", label: "Office Cleaning" },
];

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cleanerId = searchParams.get("cleaner");

  const supabase = createClient();
  const [cleaner, setCleaner] = useState<Profile | null>(null);
  const [serviceType, setServiceType] = useState("regular");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cleanerId) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", cleanerId)
      .single()
      .then(({ data }) => {
        if (data) setCleaner(data as Profile);
      });
  }, [cleanerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !cleanerId) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("bookings").insert({
      customer_id: user.id,
      cleaner_id: cleanerId,
      service_type: serviceType,
      scheduled_date: date,
      scheduled_time: time || null,
      address,
      notes: notes || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/bookings");
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-2">Request Booking</h1>

      {cleaner && (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
            🧹
          </div>
          <div>
            <p className="font-semibold text-sm">{cleaner.full_name}</p>
            <p className="text-xs text-gray-500">
              {cleaner.hourly_rate ? `₱${cleaner.hourly_rate}/hr` : ""}{" "}
              {cleaner.barangay ? `· ${cleaner.barangay}` : ""}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Service type
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SERVICE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Preferred time (optional)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Your address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Unit 1205, One Rockwell, Makati"
            required
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any special instructions..."
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Sending request..." : "Send Booking Request"}
        </button>
      </form>
    </div>
  );
}
