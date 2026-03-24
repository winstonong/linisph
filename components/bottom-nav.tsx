"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/bookings", label: "Bookings", icon: "📅" },
  { href: "/jobs", label: "Jobs", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {NAV_ITEMS.map((item) => {
        // Cleaners see "Browse" instead of "Bookings" label isn't changing, both roles use bookings
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
