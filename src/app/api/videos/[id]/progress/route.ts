import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const videoId = (await params).id;
    const body = await req.json();
    const { status, watchTimeSecs, lastPosition } = body;

    // Find progress or create it
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        }
      },
      update: {
        status: status !== undefined ? status : undefined,
        watchTimeSecs: watchTimeSecs !== undefined ? watchTimeSecs : undefined,
        lastPosition: lastPosition !== undefined ? lastPosition : undefined,
        lastWatchedAt: new Date(),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {})
      },
      create: {
        userId: session.user.id,
        videoId,
        status: status || "IN_PROGRESS",
        watchTimeSecs: watchTimeSecs || 0,
        lastPosition: lastPosition || 0,
        lastWatchedAt: new Date(),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {})
      }
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
