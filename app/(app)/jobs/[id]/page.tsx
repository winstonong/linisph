import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BidForm from "./bid-form";
import BidList from "./bid-list";
import JobActions from "./job-actions";

const SERVICE_LABELS: Record<string, string> = {
  regular: "Regular Cleaning",
  deep_clean: "Deep Clean",
  move_out: "Move-out Clean",
  airbnb: "Airbnb Turnover",
  office: "Office Cleaning",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-green-100", text: "text-green-700", label: "Open" },
  assigned: { bg: "bg-blue-100", text: "text-blue-700", label: "Assigned" },
  completed: { bg: "bg-gray-100", text: "text-gray-600", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
};

export default async function JobDetailPage({
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

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "*, customer:profiles!jobs_customer_id_fkey(full_name, phone)"
    )
    .eq("id", id)
    .single();

  if (!job) notFound();

  const role = user.user_metadata?.role || "customer";
  const isOwner = job.customer_id === user.id;

  // Get bids
  const { data: bids } = await supabase
    .from("bids")
    .select("*, cleaner:profiles!bids_cleaner_id_fkey(full_name, rating_avg, rating_count, barangay)")
    .eq("job_id", id)
    .order("created_at", { ascending: true });

  // Check if cleaner already bid
  const existingBid = bids?.find((b: any) => b.cleaner_id === user.id);

  // Check if review exists (for completed jobs)
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("job_id", id)
    .single();

  const canReview =
    isOwner && job.status === "completed" && !existingReview;

  const style = STATUS_STYLES[job.status] || STATUS_STYLES.open;

  return (
    <div className="px-6 pt-14 pb-6">
      <Link href="/jobs" className="text-sm text-blue-600 mb-4 inline-block">
        ← Back to jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-2xl font-bold flex-1 mr-3">{job.title}</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
        {job.description && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Description
            </div>
            <div className="text-sm text-gray-700 mt-1">{job.description}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Service
            </div>
            <div className="font-medium text-sm">
              {SERVICE_LABELS[job.service_type] || job.service_type}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Budget
            </div>
            <div className="font-medium text-sm">
              {job.budget_min || job.budget_max
                ? `₱${job.budget_min || "?"} – ₱${job.budget_max || "?"}`
                : "Not specified"}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Date
          </div>
          <div className="font-medium text-sm">
            {new Date(job.preferred_date + "T12:00:00").toLocaleDateString(
              "en-US",
              { weekday: "long", month: "long", day: "numeric", year: "numeric" }
            )}
            {job.preferred_time && ` at ${job.preferred_time}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Address
          </div>
          <div className="font-medium text-sm">{job.address}</div>
        </div>
        {!isOwner && job.customer && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Posted by
            </div>
            <div className="font-medium text-sm">{job.customer.full_name}</div>
          </div>
        )}
      </div>

      {/* Cleaner: bid form */}
      {role === "cleaner" && job.status === "open" && !existingBid && (
        <BidForm jobId={id} />
      )}

      {/* Cleaner: already bid */}
      {role === "cleaner" && existingBid && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-blue-700 font-medium">
            You bid ₱{existingBid.price}
          </p>
          <p className="text-blue-500 text-sm mt-1">
            Status: {existingBid.status}
          </p>
        </div>
      )}

      {/* Customer: bid list */}
      {isOwner && bids && bids.length > 0 && (
        <BidList bids={bids} jobId={id} jobStatus={job.status} />
      )}

      {isOwner && (!bids || bids.length === 0) && job.status === "open" && (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 mb-4">
          <p className="text-2xl mb-2">⏳</p>
          <p>Waiting for cleaners to bid on your job.</p>
        </div>
      )}

      {/* Job actions (mark complete / cancel) */}
      <JobActions jobId={id} status={job.status} isOwner={isOwner} />

      {/* Review prompt */}
      {canReview && (
        <Link
          href={`/reviews/new?job=${id}&cleaner=${job.assigned_cleaner_id}`}
          className="block w-full text-center mt-4 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
        >
          ⭐ Leave a Review
        </Link>
      )}
    </div>
  );
}
