"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export default function PostTaskPage() {
  return (
    <Suspense>
      <PostTaskForm />
    </Suspense>
  );
}

function PostTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [user, setUser] = useState<any>(null);

  // Task fields
  const [categorySlug, setCategorySlug] = useState("");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Manila");
  const [address, setAddress] = useState("");
  const [flexible, setFlexible] = useState(true);
  const [date, setDate] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  // Auth fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const canSubmit = categorySlug && title.trim() && address.trim();

  const sendEmail = async (payload: Record<string, any>) => {
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const postTask = async (userId: string, userEmail?: string, userName?: string) => {
    setLoading(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("jobs")
      .insert({
        customer_id: userId,
        title,
        description: description || null,
        service_type: categorySlug,
        category_slug: categorySlug,
        budget_min: null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        address: `${address}, ${city}`,
        preferred_date: date || tomorrow.toISOString().split("T")[0],
        preferred_time: null,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Send task-posted email (fire and forget)
    if (userEmail) {
      sendEmail({
        type: "task_posted",
        to: userEmail,
        name: userName || "there",
        taskTitle: title,
        taskId: data.id,
      });
    }

    router.push(`/tasks/${data.id}`);
  };

  const handlePost = async () => {
    if (!canSubmit) return;

    if (user) {
      await postTask(user.id, user.email, user.user_metadata?.full_name);
      return;
    }

    // Auth inline — sign up or log in, then post
    if (!email || !password || (authMode === "signup" && !fullName)) {
      setAuthError("Please fill in all account fields below");
      return;
    }

    setAuthError("");
    setAuthLoading(true);

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: "customer", full_name: fullName } },
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        setAuthLoading(false);
        // Send welcome email for new signup
        sendEmail({ type: "welcome", to: email, name: fullName });
        await postTask(data.user.id, email, fullName);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        setAuthLoading(false);
        await postTask(data.user.id, data.user.email, data.user.user_metadata?.full_name);
      }
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Pindo
        </Link>
        {user ? (
          <span className="text-sm text-gray-500">
            Posting as {user.user_metadata?.full_name || user.email}
          </span>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log in
          </Link>
        )}
      </header>

      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold mb-1">Post a task</h1>
        <p className="text-gray-500 text-sm mb-8">
          Describe what you need and get offers from local taskers
        </p>

        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              What type of task?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition text-sm ${
                    categorySlug === cat.slug
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              What do you need done?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep clean my 2BR condo"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Details{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any specific requirements, number of rooms, special instructions..."
              className={inputClass}
            />
          </div>

          <hr className="border-gray-200" />

          {/* Location */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Where?
            </label>
            <div className="space-y-3">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                <option value="Manila">Manila</option>
                <option value="Makati">Makati</option>
                <option value="Taguig">Taguig (BGC)</option>
                <option value="Quezon City">Quezon City</option>
                <option value="Pasig">Pasig</option>
                <option value="Mandaluyong">Mandaluyong</option>
                <option value="Paranaque">Paranaque</option>
                <option value="Las Pinas">Las Pinas</option>
              </select>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or building name"
                className={inputClass}
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* When */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              When do you need this done?
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition bg-white border-gray-200 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="checkbox"
                  checked={flexible}
                  onChange={(e) => setFlexible(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">
                  I&apos;m flexible on timing
                </span>
              </label>
              {!flexible && (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  className={inputClass}
                />
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Budget */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Budget{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 text-sm">
                ₱
              </span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 1500"
                className={`${inputClass} pl-8`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Taskers can suggest their own price too
            </p>
          </div>

          {/* Inline auth section — only shown if not logged in */}
          {!user && (
            <>
              <hr className="border-gray-200" />

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  {authMode === "signup"
                    ? "Create an account to post"
                    : "Log in to post"}
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  {authMode === "signup"
                    ? "Quick sign up — we just need a few details"
                    : "Welcome back! Enter your credentials"}
                </p>
                <div className="space-y-3">
                  {authMode === "signup" && (
                    <input
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className={inputClass}
                  />
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                  {authMode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthError("");
                        }}
                        className="text-blue-600 font-medium"
                      >
                        Log in
                      </button>
                    </>
                  ) : (
                    <>
                      New to Pindo?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthError("");
                        }}
                        className="text-blue-600 font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">{error}</p>
        )}
        {authError && (
          <p className="text-red-600 text-sm text-center mt-2">{authError}</p>
        )}

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={!canSubmit || loading || authLoading}
          className="w-full mt-8 mb-4 py-4 rounded-xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 disabled:opacity-40 transition"
        >
          {loading || authLoading
            ? "Posting..."
            : user
              ? "Post task"
              : authMode === "signup"
                ? "Sign up & post task"
                : "Log in & post task"}
        </button>
      </div>
    </div>
  );
}
