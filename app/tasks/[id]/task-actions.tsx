"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TaskActions({
  taskId,
  status,
}: {
  taskId: string;
  status: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState("");

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    await supabase.from("jobs").update({ status: newStatus }).eq("id", taskId);
    router.refresh();
    setLoading("");
  };

  if (status === "assigned") {
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

  if (status === "open") {
    return (
      <button
        onClick={() => updateStatus("cancelled")}
        disabled={loading !== ""}
        className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50 transition"
      >
        {loading === "cancelled" ? "Cancelling..." : "Cancel Task"}
      </button>
    );
  }

  return null;
}
