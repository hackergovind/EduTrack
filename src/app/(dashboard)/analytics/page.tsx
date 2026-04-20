import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, calculateLevel } from "@/lib/utils";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  TrendingUp,
  Calendar,
  PlayCircle,
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Aggregate video progress
  const progressAgg = await prisma.videoProgress.aggregate({
    where: { userId: session.user.id },
    _sum: { watchTimeSecs: true, rewatchCount: true },
    _count: true,
  });

  const completedCount = await prisma.videoProgress.count({
    where: { userId: session.user.id, status: "COMPLETED" },
  });

  const inProgressCount = await prisma.videoProgress.count({
    where: { userId: session.user.id, status: "IN_PROGRESS" },
  });

  const playlistCount = await prisma.playlist.count({
    where: { userId: session.user.id },
  });

  const totalNotes = await prisma.note.count({
    where: { userId: session.user.id },
  });

  // Recent learning sessions
  const recentSessions = await prisma.learningSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 7,
  });

  // XP logs
  const recentXp = await prisma.xpLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalWatchTime = progressAgg._sum.watchTimeSecs || 0;
  const totalXp = user?.totalXp || 0;
  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;
  const levelInfo = calculateLevel(totalXp);

  const stats = [
    {
      label: "Total Watch Time",
      value: formatDuration(totalWatchTime),
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Videos Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: PlayCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total XP",
      value: totalXp.toLocaleString(),
      icon: Trophy,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Longest Streak",
      value: `${longestStreak} days`,
      icon: TrendingUp,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
          Analytics
        </h1>
        <p className="text-var(--text-secondary)">
          Track your learning progress and performance metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-sm text-var(--text-secondary) font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-var(--text-primary)">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-var(--text-primary) mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Level Progress
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {levelInfo.level}
            </div>
            <div>
              <p className="text-xl font-bold text-var(--text-primary)">
                {levelInfo.title}
              </p>
              <p className="text-sm text-var(--text-secondary)">
                {totalXp} / {levelInfo.nextLevelXp} XP to next level
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-var(--surface-200) dark:bg-var(--surface-800) rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Quick Summary */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-var(--text-primary) mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-var(--border)">
              <span className="text-var(--text-secondary) text-sm">
                Playlists Tracked
              </span>
              <span className="font-semibold text-var(--text-primary)">
                {playlistCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-var(--border)">
              <span className="text-var(--text-secondary) text-sm">
                Total Videos Tracked
              </span>
              <span className="font-semibold text-var(--text-primary)">
                {progressAgg._count}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-var(--border)">
              <span className="text-var(--text-secondary) text-sm">
                Notes Written
              </span>
              <span className="font-semibold text-var(--text-primary)">
                {totalNotes}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-var(--text-secondary) text-sm">
                Rewatch Count
              </span>
              <span className="font-semibold text-var(--text-primary)">
                {progressAgg._sum.rewatchCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions & XP Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Learning Sessions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-var(--text-primary) mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" />
            Recent Sessions
          </h2>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-var(--text-secondary)">
              <Calendar
                size={32}
                className="mx-auto mb-3 text-var(--text-muted)"
              />
              <p className="text-sm">No learning sessions recorded yet.</p>
              <p className="text-xs text-var(--text-muted) mt-1">
                Start watching videos to track sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-var(--surface-50) dark:bg-var(--surface-800)/50"
                >
                  <div>
                    <p className="text-sm font-medium text-var(--text-primary)">
                      {s.date}
                    </p>
                    <p className="text-xs text-var(--text-secondary)">
                      {s.videosCompleted} videos •{" "}
                      {formatDuration(s.watchTimeSecs)}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    {s.videosCompleted} completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XP History */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-var(--text-primary) mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            XP History
          </h2>
          {recentXp.length === 0 ? (
            <div className="text-center py-8 text-var(--text-secondary)">
              <Trophy
                size={32}
                className="mx-auto mb-3 text-var(--text-muted)"
              />
              <p className="text-sm">No XP earned yet.</p>
              <p className="text-xs text-var(--text-muted) mt-1">
                Complete videos and achievements to earn XP.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentXp.map((xp) => (
                <div
                  key={xp.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-var(--surface-50) dark:bg-var(--surface-800)/50"
                >
                  <div>
                    <p className="text-sm font-medium text-var(--text-primary)">
                      {xp.reason}
                    </p>
                    <p className="text-xs text-var(--text-secondary)">
                      {new Date(xp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-amber-500">
                    +{xp.amount} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
