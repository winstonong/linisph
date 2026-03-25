"use client";

import { useRouter } from "next/navigation";

const HERO_CATEGORIES = [
  { slug: "cleaning", label: "Cleaner (one-off)", icon: "🧹" },
  { slug: "housekeeper", label: "Regular housekeeper", icon: "🏠" },
  { slug: "handyman", label: "Handyman", icon: "🔧" },
  { slug: "moving", label: "Mover", icon: "📦" },
  { slug: "other", label: "Everything else", icon: "✨" },
];

export default function HomeSearch() {
  const router = useRouter();

  const handlePick = (slug: string) => {
    router.push(`/post-task?category=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="max-w-md mx-auto space-y-3">
      {HERO_CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handlePick(cat.slug)}
          className="w-full flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-left hover:bg-white/20 transition group"
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-lg font-semibold text-white group-hover:translate-x-1 transition-transform">
            {cat.label}
          </span>
          <span className="ml-auto text-white/50 group-hover:text-white/80 transition">
            →
          </span>
        </button>
      ))}
    </div>
  );
}
