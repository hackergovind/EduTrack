import { StatCard } from "@/components/ui/stat-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Flame, Clock, Trophy, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Ideally, fetch real stats here. Doing mock for now.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  const playlistsCount = await prisma.playlist.count({
    where: { userId: session.user.id }
  });

  const stats = {
    totalVideosCompleted: 0,
    totalWatchTimeSecs: 0,
    currentStreak: user?.currentStreak || 0,
    totalXp: user?.totalXp || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
            Dashboard
          </h1>
          <p className="text-var(--text-secondary)">
            Here is what's happening with your learning journey toady.
          </p>
        </div>
        <div className="flex bg-var(--bg-card) border border-var(--border) rounded-lg p-1">
          <button className="px-4 py-1.5 text-sm font-medium bg-var(--surface-100) dark:bg-var(--surface-800) text-var(--text-primary) rounded-md shadow-sm">Overview</button>
          <button className="px-4 py-1.5 text-sm font-medium text-var(--text-secondary) hover:text-var(--text-primary) rounded-md transition-colors">Analytics</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Playlists Tracked"
          value={playlistsCount}
          icon={<BookOpen size={20} />}
          colorClass="text-blue-500"
        />
        <StatCard
          title="Watch Time"
          value={formatDuration(stats.totalWatchTimeSecs)}
          icon={<Clock size={20} />}
          colorClass="text-purple-500"
          trend={{ value: 12, isPositive: true, label: "vs last week" }}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} Days`}
          icon={<Flame size={20} />}
          colorClass="text-orange-500"
        />
        <StatCard
          title="Total XP"
          value={stats.totalXp}
          icon={<Trophy size={20} />}
          colorClass="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-var(--text-primary)">Continue Learning</h2>
              <Link href="/playlists" className="text-sm text-blue-500 hover:text-blue-600 font-medium">View all</Link>
            </div>
            {playlistsCount === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-var(--surface-100) dark:bg-var(--surface-800) flex items-center justify-center text-var(--text-muted) mb-4">
                  <PlayCircle size={32} />
                </div>
                <h3 className="text-lg font-semibold text-var(--text-primary) mb-2">No playlists yet</h3>
                <p className="text-var(--text-secondary) text-sm mb-6 max-w-sm">
                  Import a YouTube playlist to start tracking your progress and earning XP.
                </p>
                <Link href="/playlists" className="btn-primary">
                  Import Playlist
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 text-var(--text-secondary)">
                Resume functionality coming soon.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-blue-500/20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-500/5">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Daily Goal</h2>
            <div className="text-3xl font-black text-var(--text-primary) mb-6">0 / 2 <span className="text-lg font-medium text-var(--text-secondary)">videos</span></div>
            
            <div className="w-full h-3 bg-var(--surface-200) dark:bg-var(--surface-800) rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: "0%" }} />
            </div>
            <p className="text-sm text-var(--text-secondary)">You're on track to hit your daily goal! Keep it up.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
