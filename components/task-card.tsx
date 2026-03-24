import Link from "next/link";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TaskCard({ task }: { task: any }) {
  const budgetText =
    task.budget_min || task.budget_max
      ? `₱${task.budget_min || "?"} – ₱${task.budget_max || "?"}`
      : null;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.category && (
              <span className="text-lg">{task.category.icon}</span>
            )}
            <h3 className="font-semibold text-gray-900 truncate">
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            {task.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {task.category.name}
              </span>
            )}
            <span>·</span>
            <span>{task.address?.split(",")[0]}</span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{timeAgo(task.created_at)}</span>
            {task.preferred_date && (
              <span>
                📅{" "}
                {new Date(task.preferred_date + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </span>
            )}
            {task.bids !== undefined && (
              <span className="text-blue-600 font-medium">
                {task.bids.length || task.bids[0]?.count || 0} offer
                {(task.bids.length || task.bids[0]?.count || 0) !== 1
                  ? "s"
                  : ""}
              </span>
            )}
          </div>
        </div>

        {budgetText && (
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-emerald-600">
              {budgetText}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
