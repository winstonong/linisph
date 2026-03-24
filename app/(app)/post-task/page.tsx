"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WizardSteps from "@/components/wizard-steps";
import type { Category } from "@/lib/types";

const STEPS = ["What", "Where", "When", "Budget"];

export default function PostTaskPage() {
  return (
    <Suspense>
      <PostTaskWizard />
    </Suspense>
  );
}

function PostTaskWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [categorySlug, setCategorySlug] = useState("");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Manila");
  const [barangay, setBarangay] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [flexible, setFlexible] = useState(false);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const canNext = () => {
    if (step === 0) return categorySlug && title.trim();
    if (step === 1) return address.trim();
    if (step === 2) return flexible || date;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("jobs")
      .insert({
        customer_id: user.id,
        title,
        description: description || null,
        service_type: categorySlug,
        category_slug: categorySlug,
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        address: `${address}${barangay ? `, ${barangay}` : ""}, ${city}`,
        preferred_date: date || tomorrow.toISOString().split("T")[0],
        preferred_time: time || null,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/tasks/${data.id}`);
  };

  return (
    <div className="px-6 pt-10 pb-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">Post a Task</h1>
      <p className="text-gray-500 text-center text-sm mb-6">
        Tell us what you need done
      </p>

      <WizardSteps steps={STEPS} current={step} />

      {/* Step 0: What */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Category
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
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              What do you need done?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep clean 2BR condo"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any specific requirements..."
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 1: Where */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Barangay (optional)
            </label>
            <input
              type="text"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              placeholder="e.g. Poblacion"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Full address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Unit 1205, One Rockwell"
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: When */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <input
              type="checkbox"
              id="flexible"
              checked={flexible}
              onChange={(e) => setFlexible(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="flexible" className="text-sm text-blue-700">
              I&apos;m flexible on timing
            </label>
          </div>

          {!flexible && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Preferred date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Preferred time (optional)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Budget */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Set a budget range so taskers know what to expect.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Min (₱)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="500"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Max (₱)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="1500"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center mt-4">{error}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {loading ? "Posting..." : "Post Task"}
          </button>
        )}
      </div>
    </div>
  );
}
