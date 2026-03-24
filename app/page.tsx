import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryGrid from "@/components/category-grid";
import TaskCard from "@/components/task-card";
import type { Category } from "@/lib/types";
import HomeSearch from "./home-search";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Fetch recent open tasks (public)
  const { data: recentTasks } = await supabase
    .from("jobs")
    .select(
      "*, category:categories!jobs_category_slug_fkey(*), customer:profiles!jobs_customer_id_fkey(full_name), bids(count)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">
          LinisPH
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
          >
            Browse Tasks
          </Link>
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Get anything done in Manila
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
            Post a task. Get offers from trusted local taskers. Pick the best
            one. Done.
          </p>

          <HomeSearch />

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-200">
            <span>✓ Free to post</span>
            <span>✓ Get offers fast</span>
            <span>✓ Pay when done</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-12 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-2">
          What do you need done?
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Browse popular categories or post your own task
        </p>
        {categories && (
          <CategoryGrid categories={categories as Category[]} />
        )}
      </section>

      {/* Recent Tasks */}
      {recentTasks && recentTasks.length > 0 && (
        <section className="px-6 py-12 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Tasks</h2>
              <Link
                href="/tasks"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            How LinisPH works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                📝
              </div>
              <h3 className="font-bold mb-1">Post a task</h3>
              <p className="text-sm text-gray-500">
                Tell us what you need done, where, and when.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                💬
              </div>
              <h3 className="font-bold mb-1">Get offers</h3>
              <p className="text-sm text-gray-500">
                Taskers send you offers with their price and message.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                ✅
              </div>
              <h3 className="font-bold mb-1">Get it done</h3>
              <p className="text-sm text-gray-500">
                Pick the best offer, get the job done, leave a review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for taskers */}
      <section className="px-6 py-12 bg-emerald-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">
            Earn money as a tasker
          </h2>
          <p className="text-emerald-100 mb-6">
            Browse open tasks, make offers, and get paid for your skills.
          </p>
          <Link
            href="/signup?role=cleaner"
            className="inline-block px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition"
          >
            Start earning →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-8 bg-gray-50">
        LinisPH &copy; {new Date().getFullYear()} · Manila, Philippines
      </footer>
    </div>
  );
}
