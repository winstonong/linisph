"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BidList({
  bids,
  jobId,
  jobStatus,
}: {
  bids: any[];
  jobId: string;
  jobStatus: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState("");

  const acceptBid = async (bidId: string, cleanerId: string) => {
    setLoading(bidId);

    // Accept this bid
    await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bidId);

    // Reject all other bids
    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("job_id", jobId)
      .neq("id", bidId);

    // Update job status
    await supabase
      .from("jobs")
      .update({ status: "assigned", assigned_cleaner_id: cleanerId })
      .eq("id", jobId);

    router.refresh();
    setLoading("");
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-3">
        Bids ({bids.length})
      </h3>
      <div className="space-y-3">
        {bids.map((bid: any) => {
          const statusColor =
            bid.status === "accepted"
              ? "text-green-600"
              : bid.status === "rejected"
              ? "text-red-500"
              : "text-gray-500";

          return (
            <div
              key={bid.id}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-semibold text-sm">
                    {bid.cleaner?.full_name}
                  </span>
                  {bid.cleaner?.barangay && (
                    <span className="text-xs text-gray-400 ml-2">
                      {bid.cleaner.barangay}
                    </span>
                  )}
                </div>
                <span className="font-bold text-emerald-600">
                  ₱{bid.price}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span className="text-yellow-500">★</span>
                <span>
                  {Number(bid.cleaner?.rating_avg) > 0
                    ? `${bid.cleaner.rating_avg} (${bid.cleaner.rating_count})`
                    : "New"}
                </span>
                <span className={`font-medium ${statusColor}`}>
                  · {bid.status}
                </span>
              </div>

              {bid.message && (
                <p className="text-sm text-gray-600 mb-3">{bid.message}</p>
              )}

              {jobStatus === "open" && bid.status === "pending" && (
                <button
                  onClick={() => acceptBid(bid.id, bid.cleaner_id)}
                  disabled={loading !== ""}
                  className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading === bid.id ? "Accepting..." : "Accept Bid"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
