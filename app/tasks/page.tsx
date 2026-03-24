import { createClient } from "@/lib/supabase/server";
import TaskCard from "@/components/task-card";
import TaskFilters from "@/components/task-filters";
import Link from "next/link";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const supabase = await createClient();

  // Fetch categories for filters
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Build task query
  let query = supabase
    .from("jobs")
    .select(
      "*, category:categories!jobs_category_slug_fkey(*), customer:profiles!jobs_customer_id_fkey(full_name), bids(count)"
    )
    .eq("status", "open");

  if (category) {
    query = query.eq("category_slug", category);
  }

  if (sort === "budget_high") {
    query = query.order("budget_max", { ascending: false, nullsFirst: false });
  } else if (sort === "budget_low") {
    query = query.order("budget_min", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: tasks } = await query.limit(20);

  const activeCategory = categories?.find(
    (c: any) => c.slug === category
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Pindo
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Sign up
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">
            {activeCategory
              ? `${activeCategory.icon} ${activeCategory.name} Tasks`
              : "Browse Tasks"}
          </h1>
          <Link
            href="/post-task"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
          >
            + Post Task
          </Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {tasks?.length || 0} open task{tasks?.length !== 1 ? "s" : ""}
        </p>

        <TaskFilters
          categories={categories || []}
          activeCategory={category || ""}
          activeSort={sort || ""}
        />

        <div className="space-y-3 mt-6">
          {tasks && tasks.length > 0 ? (
            tasks.map((task: any) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p>No open tasks found.</p>
              <Link
                href="/post-task"
                className="text-blue-600 font-medium text-sm mt-2 inline-block"
              >
                Post the first one →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
