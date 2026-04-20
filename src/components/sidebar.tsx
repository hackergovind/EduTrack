"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListVideo, 
  BarChart3, 
  BookOpen, 
  Settings, 
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Playlists", href: "/playlists", icon: ListVideo },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Notes", href: "/notes", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-var(--bg-sidebar) border-r border-var(--border) hidden md:flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-var(--border)">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white">
          <GraduationCap size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight gradient-text">EduTrack</span>
      </div>
      
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider mb-2 px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" 
                  : "text-var(--text-secondary) hover:bg-var(--surface-100) hover:text-var(--text-primary) dark:hover:bg-var(--surface-800)"
              )}
            >
              <item.icon size={18} className={isActive ? "text-blue-500" : ""} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-var(--border)">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" 
              : "text-var(--text-secondary) hover:bg-var(--surface-100) hover:text-var(--text-primary) dark:hover:bg-var(--surface-800)"
          )}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
