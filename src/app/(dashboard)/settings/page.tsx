import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/utils";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userGoals: { where: { isActive: true } },
    },
  });

  if (!user) return null;

  const levelInfo = calculateLevel(user.totalXp);
  const dailyGoal = user.userGoals.find((g) => g.goalType === "DAILY_VIDEOS");

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        totalXp: user.totalXp,
        level: levelInfo.level,
        title: levelInfo.title,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        createdAt: user.createdAt.toISOString(),
      }}
      dailyGoalTarget={dailyGoal?.targetValue ?? 2}
    />
  );
}
