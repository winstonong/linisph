"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/tasks", label: "Browse", icon: "🔍" },
  { href: "/post-task", label: "Post", icon: "➕", highlight: true },
  { href: "/bookings", label: "My Tasks", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const highlight = "highlight" in item && item.highlight;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              highlight
                ? "text-emerald-600"
                : isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span
              className={`text-xl ${
                highlight
                  ? "bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center -mt-5 shadow-lg"
                  : ""
              }`}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
