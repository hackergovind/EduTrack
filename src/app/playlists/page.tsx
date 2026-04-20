import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PlaylistCard } from "@/components/playlist-card";
import { PlusCircle, Search } from "lucide-react";
import ClientPlaylistsPage from "./client-page";

export default async function PlaylistsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const playlists = await prisma.playlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      videos: {
        include: {
          progress: {
            where: { userId: session.user.id }
          }
        }
      }
    }
  });

  // Calculate generic progress for each playlist
  const formattedPlaylists = playlists.map(p => {
    const completedCount = p.videos.filter(
      v => v.progress[0]?.status === "COMPLETED"
    ).length;

    return {
      ...p,
      completedCount,
    };
  });

  return <ClientPlaylistsPage initialPlaylists={formattedPlaylists} />;
}
