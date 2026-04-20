import { type ClassValue, clsx } from "clsx";

// Simple clsx-like utility (no need for tailwind-merge for MVP)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatDurationShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

export function parseYouTubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list");
  } catch {
    // Try as raw playlist ID
    if (/^PL[A-Za-z0-9_-]+$/.test(url) || /^UU[A-Za-z0-9_-]+$/.test(url)) {
      return url;
    }
    return null;
  }
}

export function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; progress: number } {
  const levels = [
    { threshold: 0, title: "Beginner" },
    { threshold: 100, title: "Learner" },
    { threshold: 300, title: "Student" },
    { threshold: 600, title: "Scholar" },
    { threshold: 1000, title: "Intermediate" },
    { threshold: 2000, title: "Advanced" },
    { threshold: 3500, title: "Expert" },
    { threshold: 5000, title: "Master" },
    { threshold: 8000, title: "Grandmaster" },
    { threshold: 12000, title: "Legend" },
  ];

  let currentLevel = 1;
  let currentTitle = "Beginner";
  let nextThreshold = 100;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      currentLevel = i + 1;
      currentTitle = levels[i].title;
      nextThreshold = levels[i + 1]?.threshold || levels[i].threshold + 5000;
      break;
    }
  }

  const prevThreshold = levels[currentLevel - 1]?.threshold || 0;
  const progress = Math.min(
    ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100,
    100
  );

  return { level: currentLevel, title: currentTitle, nextLevelXp: nextThreshold, progress };
}
