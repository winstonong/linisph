"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, SERVICE_TYPES } from "@/lib/types";

const SERVICE_OPTIONS = [
  { value: "regular", label: "Regular Cleaning" },
  { value: "deep_clean", label: "Deep Clean" },
  { value: "move_out", label: "Move-out Clean" },
  { value: "airbnb", label: "Airbnb Turnover" },
  { value: "office", label: "Office Cleaning" },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [barangay, setBarangay] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setBarangay(data.barangay || "");
        setBio(data.bio || "");
        setHourlyRate(data.hourly_rate?.toString() || "");
        setServices(data.services_offered || []);
        setIsAvailable(data.is_available);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const updates: Record<string, unknown> = {
      full_name: fullName,
      phone,
      barangay,
    };

    if (profile?.role === "cleaner") {
      updates.bio = bio;
      updates.hourly_rate = hourlyRate ? parseInt(hourlyRate) : null;
      updates.services_offered = services;
      updates.is_available = isAvailable;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile!.id);

    if (error) {
      setMessage("Error saving: " + error.message);
    } else {
      setMessage("Profile updated!");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="px-6 pt-14 text-center text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Barangay</label>
          <input
            type="text"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="e.g. Poblacion, Makati"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {profile?.role === "cleaner" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-600">
                About you
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell customers about your experience..."
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Hourly rate (₱)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="e.g. 250"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Services offered
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() =>
                      setServices((prev) =>
                        prev.includes(s.value)
                          ? prev.filter((v) => v !== s.value)
                          : [...prev, s.value]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      services.includes(s.value)
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="available" className="text-sm text-gray-600">
                Available for bookings
              </label>
            </div>
          </>
        )}

        {message && (
          <p
            className={`text-sm text-center ${
              message.startsWith("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <button
        onClick={handleSignOut}
        className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition text-sm"
      >
        Sign out
      </button>
    </div>
  );
}
