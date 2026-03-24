"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/post-task?title=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/post-task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="flex bg-white rounded-2xl overflow-hidden shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Clean my 2BR condo in Makati"
          className="flex-1 px-5 py-4 text-gray-900 text-base focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition shrink-0"
        >
          Post a task
        </button>
      </div>
    </form>
  );
}
