import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ClientPlaylistDetail from "./client-page";
import { notFound } from "next/navigation";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const resolvedParams = await params;

  const playlist = await prisma.playlist.findUnique({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: {
      videos: {
        orderBy: { position: "asc" },
        include: {
          progress: {
            where: { userId: session.user.id }
          }
        }
      }
    }
  });

  if (!playlist) {
    notFound();
  }

  // Formatting videos for the client to use easier
  const formattedPlaylist = {
    ...playlist,
    videos: playlist.videos.map((vid) => ({
      ...vid,
      progressStatus: vid.progress[0]?.status || "NOT_STARTED",
      watchTimeSecs: vid.progress[0]?.watchTimeSecs || 0,
      lastPosition: vid.progress[0]?.lastPosition || 0,
      isRewatch: (vid.progress[0]?.rewatchCount || 0) > 0,
    }))
  };

  return <ClientPlaylistDetail initialPlaylist={formattedPlaylist} />;
}
