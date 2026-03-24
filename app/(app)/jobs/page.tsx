import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.user_metadata?.role || "customer";

  let jobs;
  if (role === "customer") {
    // Customer sees their own posted jobs
    const { data } = await supabase
      .from("jobs")
      .select("*, bids(count)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    jobs = data;
  } else {
    // Cleaner sees all open jobs
    const { data } = await supabase
      .from("jobs")
      .select("*, customer:profiles!jobs_customer_id_fkey(full_name)")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    jobs = data;
  }

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {role === "customer" ? "My Jobs" : "Open Jobs"}
        </h1>
        {role === "customer" && (
          <Link
            href="/jobs/new"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
          >
            + Post Job
          </Link>
        )}
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job: any) => {
            const style = STATUS_STYLES[job.status] || STATUS_STYLES.open;
            const bidCount =
              role === "customer" ? job.bids?.[0]?.count || 0 : null;

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm flex-1 mr-2">
                    {job.title}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  {SERVICE_LABELS[job.service_type] || job.service_type} ·{" "}
                  {new Date(
                    job.preferred_date + "T12:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {job.budget_min || job.budget_max ? (
                    <span>
                      ₱{job.budget_min || "?"} – ₱{job.budget_max || "?"}
                    </span>
                  ) : null}
                  {role === "customer" && bidCount !== null && (
                    <span className="text-blue-600 font-medium">
                      {bidCount} bid{bidCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {role === "cleaner" && job.customer && (
                    <span>Posted by {job.customer.full_name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">{role === "customer" ? "📋" : "🔍"}</p>
          <p>
            {role === "customer"
              ? "No jobs posted yet."
              : "No open jobs right now."}
          </p>
          {role === "customer" && (
            <Link
              href="/jobs/new"
              className="text-emerald-600 font-medium text-sm mt-2 inline-block"
            >
              Post your first job →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
