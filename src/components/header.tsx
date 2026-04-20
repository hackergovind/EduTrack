"use client";

import { Bell, Search, Menu, Zap, Flame } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export function Header({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-var(--border) bg-var(--bg-card)/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-var(--text-secondary)">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex relative w-64 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--text-muted)" size={18} />
          <input 
            type="text" 
            placeholder="Search playlists, notes..." 
            className="w-full bg-var(--bg) border border-var(--border) rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-var(--text-primary)"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200 dark:border-orange-500/20">
          <Flame size={16} className="fill-orange-500" />
          <span>12 Days</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-500/20">
          <Zap size={16} className="fill-blue-500" />
          <span>Lvl 4</span>
        </div>

        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-var(--surface-100) dark:hover:bg-var(--surface-800) text-var(--text-secondary) transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        <button className="p-2 rounded-full hover:bg-var(--surface-100) dark:hover:bg-var(--surface-800) text-var(--text-secondary) transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-var(--bg-card)"></span>
        </button>

        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-var(--bg-card) border border-var(--border) rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-1">
            <div className="px-4 py-2 border-b border-var(--border) mb-1">
              <div className="text-sm font-semibold text-var(--text-primary) truncate">{user?.name}</div>
              <div className="text-xs text-var(--text-secondary) truncate">{user?.email}</div>
            </div>
            <button className="px-4 py-2 text-sm text-left text-var(--text-secondary) hover:bg-var(--surface-100) dark:hover:bg-var(--surface-800) w-full transition-colors">
              Profile
            </button>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
