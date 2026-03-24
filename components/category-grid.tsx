import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryGrid({
  categories,
  linkPrefix = "/tasks?category=",
}: {
  categories: Category[];
  linkPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`${linkPrefix}${cat.slug}`}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition text-center"
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-sm font-semibold text-gray-800">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
