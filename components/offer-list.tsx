"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OfferList({
  offers,
  taskId,
  taskStatus,
}: {
  offers: any[];
  taskId: string;
  taskStatus: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState("");

  const acceptOffer = async (offerId: string, cleanerId: string) => {
    setLoading(offerId);

    await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", offerId);

    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("job_id", taskId)
      .neq("id", offerId);

    await supabase
      .from("jobs")
      .update({ status: "assigned", assigned_cleaner_id: cleanerId })
      .eq("id", taskId);

    router.refresh();
    setLoading("");
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-3">Offers ({offers.length})</h3>
      <div className="space-y-3">
        {offers.map((offer: any) => {
          const statusColor =
            offer.status === "accepted"
              ? "text-green-600"
              : offer.status === "rejected"
              ? "text-red-500"
              : "text-gray-500";

          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-semibold text-sm">
                    {offer.cleaner?.full_name}
                  </span>
                  {offer.cleaner?.barangay && (
                    <span className="text-xs text-gray-400 ml-2">
                      {offer.cleaner.barangay}
                    </span>
                  )}
                </div>
                <span className="font-bold text-emerald-600">
                  ₱{offer.price}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span className="text-yellow-500">★</span>
                <span>
                  {Number(offer.cleaner?.rating_avg) > 0
                    ? `${offer.cleaner.rating_avg} (${offer.cleaner.rating_count})`
                    : "New"}
                </span>
                <span className={`font-medium ${statusColor}`}>
                  · {offer.status}
                </span>
              </div>

              {offer.message && (
                <p className="text-sm text-gray-600 mb-3">{offer.message}</p>
              )}

              {taskStatus === "open" && offer.status === "pending" && (
                <button
                  onClick={() => acceptOffer(offer.id, offer.cleaner_id)}
                  disabled={loading !== ""}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading === offer.id ? "Accepting..." : "Accept Offer"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
