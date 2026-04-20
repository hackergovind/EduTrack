"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  Settings,
  User,
  Palette,
  Target,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  LogOut,
  Trophy,
  Calendar,
  Flame,
} from "lucide-react";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    totalXp: number;
    level: number;
    title: string;
    currentStreak: number;
    longestStreak: number;
    createdAt: string;
  };
  dailyGoalTarget: number;
}

export function SettingsClient({ user, dailyGoalTarget }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [dailyGoal, setDailyGoal] = useState(dailyGoalTarget);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSaveMessage("Profile updated successfully!");
      } else {
        setSaveMessage("Failed to update profile.");
      }
    } catch {
      setSaveMessage("An error occurred.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleSaveGoal = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/settings/goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoal }),
      });
      if (res.ok) {
        setSaveMessage("Goal updated successfully!");
      } else {
        setSaveMessage("Failed to update goal.");
      }
    } catch {
      setSaveMessage("An error occurred.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
          Settings
        </h1>
        <p className="text-var(--text-secondary)">
          Manage your account, preferences, and learning goals.
        </p>
      </div>

      {/* Save notification */}
      {saveMessage && (
        <div className="glass-card p-3 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-fade-in">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold text-var(--text-primary)">
              {user.name || "User"}
            </h2>
            <p className="text-sm text-var(--text-secondary) mb-4">
              {user.email}
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
                <Trophy size={12} />
                Lvl {user.level} • {user.title}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left mt-6">
              <div className="bg-var(--surface-50) dark:bg-var(--surface-800)/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-var(--text-muted) mb-1">
                  <Flame size={12} className="text-orange-500" />
                  Streak
                </div>
                <p className="font-bold text-var(--text-primary)">
                  {user.currentStreak} days
                </p>
              </div>
              <div className="bg-var(--surface-50) dark:bg-var(--surface-800)/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-var(--text-muted) mb-1">
                  <Trophy size={12} className="text-amber-500" />
                  Total XP
                </div>
                <p className="font-bold text-var(--text-primary)">
                  {user.totalXp.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-var(--text-muted) mt-4 justify-center">
              <Calendar size={12} />
              Joined {joinedDate}
            </div>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-blue-500" />
              <h2 className="text-lg font-bold text-var(--text-primary)">
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-var(--text-secondary) mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-var(--text-secondary) mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-var(--text-muted) mt-1">
                  Email cannot be changed.
                </p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving || name === user.name}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-var(--text-primary)">
                Daily Goal
              </h2>
            </div>
            <p className="text-sm text-var(--text-secondary) mb-4">
              Set the number of videos you want to complete each day.
            </p>
            <div className="flex items-center gap-4 mb-4">
              {[1, 2, 3, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setDailyGoal(val)}
                  className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                    dailyGoal === val
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                      : "bg-var(--surface-100) dark:bg-var(--surface-800) text-var(--text-secondary) hover:bg-var(--surface-200) dark:hover:bg-var(--surface-700)"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <p className="text-xs text-var(--text-muted) mb-4">
              Current goal: <strong>{dailyGoal} videos/day</strong>
            </p>
            <button
              onClick={handleSaveGoal}
              disabled={saving || dailyGoal === dailyGoalTarget}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Update Goal"}
            </button>
          </div>

          {/* Appearance */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette size={20} className="text-purple-500" />
              <h2 className="text-lg font-bold text-var(--text-primary)">
                Appearance
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                    theme === opt.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : "border-var(--border) text-var(--text-secondary) hover:border-var(--text-muted)"
                  }`}
                >
                  <opt.icon size={24} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-red-500" />
              <h2 className="text-lg font-bold text-var(--text-primary)">
                Account
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn-secondary text-red-500 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
