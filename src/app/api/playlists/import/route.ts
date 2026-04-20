import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseYouTubePlaylistId, parseISODuration } from "@/lib/utils";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const isDemoMode = !YOUTUBE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, previewOnly = true } = await req.json();

    const playlistId = parseYouTubePlaylistId(url);
    if (!playlistId) {
      return NextResponse.json({ error: "Invalid YouTube playlist URL" }, { status: 400 });
    }

    // CHECK IF THIS PLAYLIST ALREADY EXISTS FOR THIS USER
    if (!previewOnly) {
      const existing = await prisma.playlist.findFirst({
        where: { userId: session.user.id, youtubePlaylistId: playlistId }
      });
      if (existing) {
        return NextResponse.json({ error: "You are already tracking this playlist" }, { status: 400 });
      }
    }

    // DEMO MODE - MOCK DATA
    if (isDemoMode) {
      const mockPlaylist = {
        title: "Mock Web Development Course",
        channelTitle: "Mock Channel",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
        videoCount: 5,
        totalDurationSecs: 3600,
      };

      if (previewOnly) {
        return NextResponse.json({ playlist: mockPlaylist });
      }

      // Proceed to save mock data
      const savedPlaylist = await prisma.playlist.create({
        data: {
          ...mockPlaylist,
          userId: session.user.id,
          youtubePlaylistId: playlistId + "-mock",
          videos: {
            create: Array.from({ length: 5 }).map((_, i) => ({
              youtubeVideoId: `mock-vid-${i}`,
              title: `Mock Video Lesson ${i + 1}`,
              durationSecs: 720,
              position: i,
              thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
            }))
          }
        }
      });
      return NextResponse.json({ playlist: savedPlaylist });
    }

    // REAL YOUTUBE API
    const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });

    // 1. Fetch Playlist Details
    const playlistRes = await youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      id: [playlistId],
    });

    if (!playlistRes.data.items || playlistRes.data.items.length === 0) {
      return NextResponse.json({ error: "Playlist not found or is private" }, { status: 404 });
    }

    const pl = playlistRes.data.items[0];
    const playlistData = {
      title: pl.snippet?.title || "Unknown Title",
      description: pl.snippet?.description || "",
      thumbnail: pl.snippet?.thumbnails?.maxres?.url || pl.snippet?.thumbnails?.high?.url || "",
      channelTitle: pl.snippet?.channelTitle || "",
      videoCount: pl.contentDetails?.itemCount || 0,
      totalDurationSecs: 0, // Will calculate after fetching videos
    };

    if (previewOnly) {
      return NextResponse.json({ playlist: playlistData });
    }

    // 2. Fetch all videos in playlist
    let allVideoItems: any[] = [];
    let nextPageToken: string | null | undefined = undefined;

    do {
      const itemsRes: any = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken || undefined,
      });

      if (itemsRes.data.items) {
        allVideoItems = allVideoItems.concat(itemsRes.data.items);
      }
      nextPageToken = itemsRes.data.nextPageToken;
    } while (nextPageToken);

    // Filter out deleted/private videos
    const validVideos = allVideoItems.filter((item) => item.snippet?.title !== "Private video" && item.snippet?.title !== "Deleted video");

    // 3. Fetch video durations
    // YouTube requires fetching the actual video details to get duration
    const videoIds = validVideos.map((item) => item.snippet?.resourceId?.videoId).filter(Boolean) as string[];
    
    // Batch requesting video details (max 50 per request)
    const videoDetailsMap = new Map();
    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50);
      const videosRes = await youtube.videos.list({
        part: ["contentDetails"],
        id: batchIds,
      });
      videosRes.data.items?.forEach((vid) => {
        if (vid.id && vid.contentDetails?.duration) {
          videoDetailsMap.set(vid.id, parseISODuration(vid.contentDetails.duration));
        }
      });
    }

    // Prepare videos for saving
    let totalDuration = 0;
    const transformedVideos = validVideos.map((item, index) => {
      const vid = item.snippet?.resourceId?.videoId;
      const durationSecs = vid ? videoDetailsMap.get(vid) || 0 : 0;
      totalDuration += durationSecs;

      return {
        youtubeVideoId: vid!,
        title: item.snippet?.title || "Unknown",
        description: item.snippet?.description || "",
        thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || "",
        channelTitle: item.snippet?.videoOwnerChannelTitle || "",
        publishedAt: item.snippet?.publishedAt || "",
        durationSecs,
        position: index,
      };
    });

    // 4. Save to DB
    const savedPlaylist = await prisma.playlist.create({
      data: {
        userId: session.user.id,
        youtubePlaylistId: playlistId,
        title: playlistData.title,
        description: playlistData.description,
        thumbnail: playlistData.thumbnail,
        channelTitle: playlistData.channelTitle,
        videoCount: transformedVideos.length,
        totalDurationSecs: totalDuration,
        videos: {
          create: transformedVideos
        }
      }
    });

    return NextResponse.json({ playlist: savedPlaylist });

  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process playlist" }, { status: 500 });
  }
}
