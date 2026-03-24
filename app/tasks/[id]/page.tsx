import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import OfferForm from "@/components/offer-form";
import OfferList from "@/components/offer-list";
import TaskActions from "./task-actions";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-green-100", text: "text-green-700", label: "Open" },
  assigned: { bg: "bg-blue-100", text: "text-blue-700", label: "Assigned" },
  completed: { bg: "bg-gray-100", text: "text-gray-600", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: task } = await supabase
    .from("jobs")
    .select(
      "*, category:categories!jobs_category_slug_fkey(*), customer:profiles!jobs_customer_id_fkey(full_name, phone)"
    )
    .eq("id", id)
    .single();

  if (!task) notFound();

  const role = user?.user_metadata?.role || null;
  const isOwner = user?.id === task.customer_id;
  const isTasker = role === "cleaner";

  // Get offers
  const { data: offers } = await supabase
    .from("bids")
    .select(
      "*, cleaner:profiles!bids_cleaner_id_fkey(full_name, rating_avg, rating_count, barangay)"
    )
    .eq("job_id", id)
    .order("created_at", { ascending: true });

  const existingOffer = offers?.find((o: any) => o.cleaner_id === user?.id);

  // Check for review
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("job_id", id)
    .maybeSingle();

  const canReview =
    isOwner && task.status === "completed" && !existingReview;

  const style = STATUS_STYLES[task.status] || STATUS_STYLES.open;
  const budgetText =
    task.budget_min || task.budget_max
      ? `₱${task.budget_min || "?"} – ₱${task.budget_max || "?"}`
      : "Not specified";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Pindo
        </Link>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Sign up
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href="/tasks"
          className="text-sm text-blue-600 mb-4 inline-block"
        >
          ← Back to tasks
        </Link>

        {/* Task header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {task.category && (
                <span className="text-xl">{task.category.icon}</span>
              )}
              <h1 className="text-2xl font-bold">{task.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {task.category && <span>{task.category.name}</span>}
              <span>·</span>
              <span>Posted by {task.customer?.full_name}</span>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.bg} ${style.text}`}
          >
            {style.label}
          </span>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-4">
          {task.description && (
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Description
              </div>
              <p className="text-gray-700 mt-1">{task.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Budget
              </div>
              <div className="font-semibold text-emerald-600">{budgetText}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Date
              </div>
              <div className="font-medium text-sm">
                {new Date(
                  task.preferred_date + "T12:00:00"
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {task.preferred_time && ` at ${task.preferred_time}`}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Location
            </div>
            <div className="font-medium text-sm">{task.address}</div>
          </div>
        </div>

        {/* Tasker: offer form */}
        {isTasker && task.status === "open" && !existingOffer && (
          <OfferForm taskId={id} />
        )}

        {/* Tasker: already offered */}
        {isTasker && existingOffer && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-center">
            <p className="text-blue-700 font-medium">
              You offered ₱{existingOffer.price}
            </p>
            <p className="text-blue-500 text-sm mt-1">
              Status: {existingOffer.status}
            </p>
          </div>
        )}

        {/* Not logged in: CTA */}
        {!user && task.status === "open" && (
          <div className="bg-blue-50 rounded-2xl p-6 text-center mb-4">
            <p className="font-semibold text-blue-800 mb-2">
              Want to make an offer?
            </p>
            <Link
              href="/signup?role=cleaner"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700"
            >
              Sign up as a tasker
            </Link>
          </div>
        )}

        {/* Owner: offer list */}
        {isOwner && offers && offers.length > 0 && (
          <OfferList offers={offers} taskId={id} taskStatus={task.status} />
        )}

        {isOwner && (!offers || offers.length === 0) && task.status === "open" && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mb-4">
            <p className="text-3xl mb-2">⏳</p>
            <p>Waiting for taskers to make offers.</p>
          </div>
        )}

        {/* Task actions */}
        {isOwner && (
          <TaskActions taskId={id} status={task.status} />
        )}

        {/* Review prompt */}
        {canReview && (
          <Link
            href={`/reviews/new?job=${id}&cleaner=${task.assigned_cleaner_id}`}
            className="block w-full text-center mt-4 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          >
            ⭐ Leave a Review
          </Link>
        )}
      </div>
    </div>
  );
}
