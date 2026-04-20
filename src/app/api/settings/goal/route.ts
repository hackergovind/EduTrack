import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dailyGoal } = await request.json();

    if (!dailyGoal || typeof dailyGoal !== "number" || dailyGoal < 1) {
      return NextResponse.json(
        { error: "Invalid daily goal" },
        { status: 400 }
      );
    }

    // Upsert the daily video goal
    const existingGoal = await prisma.userGoal.findFirst({
      where: {
        userId: session.user.id,
        goalType: "DAILY_VIDEOS",
        isActive: true,
      },
    });

    if (existingGoal) {
      await prisma.userGoal.update({
        where: { id: existingGoal.id },
        data: { targetValue: dailyGoal },
      });
    } else {
      await prisma.userGoal.create({
        data: {
          userId: session.user.id,
          goalType: "DAILY_VIDEOS",
          targetValue: dailyGoal,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
