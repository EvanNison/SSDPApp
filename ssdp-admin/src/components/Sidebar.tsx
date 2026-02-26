"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Courses", href: "/courses", icon: "🎓" },
  { label: "Users", href: "/users", icon: "👥" },
  { label: "News", href: "/news", icon: "📰" },
  { label: "Menu", href: "/menu", icon: "☰" },
  { label: "Chapters", href: "/chapters", icon: "🏫" },
  { label: "Ambassadors", href: "/ambassadors", icon: "🎖️" },
  { label: "Chat", href: "/chat", icon: "💬" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Reports", href: "/reports", icon: "📋" },
  { label: "Alerts", href: "/alerts", icon: "🚨" },
  { label: "Lobby Day", href: "/lobby", icon: "🏛️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-ssdp-navy min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-wider">SSDP</h1>
        <p className="text-ssdp-teal text-xs uppercase tracking-wide mt-1">
          Admin Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-ssdp-blue text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-3 text-gray-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
