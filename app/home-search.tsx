"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXCHANGE_RATES: Record<string, { rate: number; symbol: string; label: string }> = {
  PHP: { rate: 1, symbol: "₱", label: "PHP" },
  USD: { rate: 0.017, symbol: "$", label: "USD" },
  AUD: { rate: 0.027, symbol: "A$", label: "AUD" },
  GBP: { rate: 0.014, symbol: "£", label: "GBP" },
  EUR: { rate: 0.016, symbol: "€", label: "EUR" },
  CAD: { rate: 0.024, symbol: "C$", label: "CAD" },
};

const CATEGORIES = [
  {
    slug: "cleaning",
    label: "Cleaner (one-off)",
    icon: "🧹",
    ratePhp: 400,
    description: "Deep cleans, move-out cleans, one-time tidying",
  },
  {
    slug: "housekeeper",
    label: "Regular housekeeper",
    icon: "🏠",
    ratePhp: 150,
    description: "Weekly or bi-weekly home upkeep",
  },
  {
    slug: "handyman",
    label: "Handyman",
    icon: "🔧",
    ratePhp: 200,
    description: "Repairs, installations, odd jobs",
  },
  {
    slug: "moving",
    label: "Mover",
    icon: "📦",
    ratePhp: 180,
    description: "Packing, loading, transport, unloading",
  },
  {
    slug: "other",
    label: "Everything else",
    icon: "✨",
    ratePhp: null,
    description: "Errands, admin, events, and more",
  },
];

function formatRate(ratePhp: number | null, currency: string): string {
  if (ratePhp === null) return "";
  const { rate, symbol } = EXCHANGE_RATES[currency];
  const converted = ratePhp * rate;
  if (currency === "PHP") {
    return `${symbol}${Math.round(converted)}/hr`;
  }
  return `${symbol}${converted.toFixed(2)}/hr`;
}

export default function HomeSearch() {
  const router = useRouter();
  const [currency, setCurrency] = useState("PHP");

  const handlePick = (slug: string) => {
    router.push(`/post-task?category=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Currency picker */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Object.entries(EXCHANGE_RATES).map(([code, { label }]) => (
          <button
            key={code}
            onClick={() => setCurrency(code)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              currency === code
                ? "bg-white text-blue-700 shadow-sm"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handlePick(cat.slug)}
            className="w-full flex items-center gap-4 px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-left hover:bg-white/20 transition group"
          >
            <span className="text-2xl flex-shrink-0">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-white group-hover:translate-x-0.5 transition-transform">
                  {cat.label}
                </span>
                {cat.ratePhp && (
                  <span className="text-sm font-bold text-emerald-300 whitespace-nowrap">
                    from {formatRate(cat.ratePhp, currency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">{cat.description}</p>
            </div>
            <span className="text-white/40 group-hover:text-white/70 transition flex-shrink-0">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
