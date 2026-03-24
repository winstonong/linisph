"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StarRating from "@/components/star-rating";

export default function NewReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const jobId = searchParams.get("job");
  const cleanerId = searchParams.get("cleaner");

  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
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

    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId || null,
      job_id: jobId || null,
      customer_id: user.id,
      cleaner_id: cleanerId,
      rating,
      comment: comment || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (bookingId) {
      router.push(`/bookings/${bookingId}`);
    } else if (jobId) {
      router.push(`/jobs/${jobId}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-2">Leave a Review</h1>
      <p className="text-gray-500 text-sm mb-8">
        How was your experience with this cleaner?
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <StarRating value={rating} onChange={setRating} />
          <p className="text-sm text-gray-400 mt-2">
            {rating === 0
              ? "Tap a star to rate"
              : ["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
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
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
