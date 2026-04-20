"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatDuration } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  MoreVertical,
  Search,
  ArrowLeft,
  X,
  Pencil,
  Save,
  ChevronDown,
  ChevronUp,
  SkipForward,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ClientPlaylistDetail({
  initialPlaylist,
}: {
  initialPlaylist: any;
}) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(playlist.title);
  const [editTags, setEditTags] = useState(playlist.tags || "");
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerCollapsed, setPlayerCollapsed] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoListRef = useRef<HTMLDivElement>(null);

  const completedCount = playlist.videos.filter(
    (v: any) => v.progressStatus === "COMPLETED"
  ).length;
  const progressPercent =
    playlist.videoCount > 0
      ? (completedCount / playlist.videoCount) * 100
      : 0;

  // Find the active video object
  const activeVideo = playlist.videos.find(
    (v: any) => v.id === activeVideoId
  );

  // Find the first incomplete video for "Resume Learning"
  const firstIncompleteVideo = playlist.videos.find(
    (v: any) =>
      v.progressStatus === "IN_PROGRESS" ||
      v.progressStatus === "NOT_STARTED"
  );

  const playVideo = useCallback(
    async (video: any) => {
      setActiveVideoId(video.id);
      setShowPlayer(true);
      setPlayerCollapsed(false);

      // Scroll to player
      setTimeout(() => {
        playerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      // Auto-mark as IN_PROGRESS if NOT_STARTED
      if (video.progressStatus === "NOT_STARTED") {
        // Optimistic update
        setPlaylist((prev: any) => ({
          ...prev,
          videos: prev.videos.map((vid: any) =>
            vid.id === video.id
              ? { ...vid, progressStatus: "IN_PROGRESS" }
              : vid
          ),
        }));

        try {
          const res = await fetch(`/api/videos/${video.id}/progress`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "IN_PROGRESS" }),
          });
          if (!res.ok) throw new Error("Failed to update status");
        } catch {
          // Revert on error silently
        }
      }
    },
    []
  );

  const playNextVideo = useCallback(() => {
    if (!activeVideoId) return;
    const currentIndex = playlist.videos.findIndex(
      (v: any) => v.id === activeVideoId
    );
    if (currentIndex < playlist.videos.length - 1) {
      playVideo(playlist.videos[currentIndex + 1]);
    } else {
      toast.info("You've reached the end of the playlist!");
    }
  }, [activeVideoId, playlist.videos, playVideo]);

  const toggleVideoStatus = async (
    videoId: string,
    currentStatus: string
  ) => {
    let newStatus = "IN_PROGRESS";
    if (currentStatus === "IN_PROGRESS") newStatus = "COMPLETED";
    if (currentStatus === "COMPLETED") newStatus = "NOT_STARTED";

    // Optimistic UI Update
    setPlaylist((prev: any) => ({
      ...prev,
      videos: prev.videos.map((vid: any) =>
        vid.id === videoId
          ? { ...vid, progressStatus: newStatus }
          : vid
      ),
    }));

    try {
      const res = await fetch(`/api/videos/${videoId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      if (newStatus === "COMPLETED") {
        toast.success("Video marked as completed! 🎉");
      }
    } catch (error) {
      toast.error("Failed to sync progress");
      setPlaylist(initialPlaylist);
    }
  };

  const handleResumeLearning = () => {
    if (firstIncompleteVideo) {
      playVideo(firstIncompleteVideo);
    } else if (playlist.videos.length > 0) {
      playVideo(playlist.videos[0]);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeVideo) return;
    await toggleVideoStatus(activeVideo.id, activeVideo.progressStatus);
    // Auto-advance to next after marking complete
    const currentStatus = activeVideo.progressStatus;
    if (
      currentStatus === "NOT_STARTED" ||
      currentStatus === "IN_PROGRESS"
    ) {
      // After marking complete, play next
      setTimeout(() => playNextVideo(), 500);
    }
  };

  const filteredVideos = playlist.videos.filter((v: any) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-2 text-sm text-var(--text-muted) mb-2">
        <Link
          href="/playlists"
          className="hover:text-var(--text-primary) flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Playlists
        </Link>
      </div>

      {/* Header Card */}
      <div className="glass-card overflow-hidden flex flex-col md:flex-row relative">
        <div className="w-full md:w-1/3 max-w-sm aspect-video md:aspect-square lg:aspect-video relative bg-var(--surface-100)">
          {playlist.thumbnail ? (
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-var(--text-muted)">
              <PlayCircle size={48} />
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-field text-xl font-bold"
                    placeholder="Playlist title"
                  />
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Tags (comma-separated)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPlaylist((prev: any) => ({
                          ...prev,
                          title: editTitle,
                          tags: editTags,
                        }));
                        setIsEditing(false);
                        toast.success("Details updated!");
                      }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Save size={14} /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditTitle(playlist.title);
                        setEditTags(playlist.tags || "");
                        setIsEditing(false);
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-var(--text-primary) tracking-tight mb-2">
                    {playlist.title}
                  </h1>
                  <p className="text-lg text-var(--text-secondary)">
                    {playlist.channelTitle}
                  </p>
                </>
              )}
            </div>
            <div className="hidden sm:block shrink-0">
              <ProgressRing
                progress={progressPercent}
                size={64}
                strokeWidth={6}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-var(--surface-100) dark:bg-var(--surface-800) px-3 py-1 rounded-full text-sm font-medium">
              {playlist.videoCount} Videos
            </span>
            <span className="bg-var(--surface-100) dark:bg-var(--surface-800) px-3 py-1 rounded-full text-sm font-medium">
              {formatDuration(playlist.totalDurationSecs)} Total
            </span>
            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full text-sm font-medium">
              {completedCount} Completed
            </span>
            {playlist.tags &&
              playlist.tags.split(",").map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>

          <div className="sm:hidden flex items-center gap-4 mb-6 bg-var(--surface-100) dark:bg-var(--surface-800) p-4 rounded-xl border border-var(--border)">
            <ProgressRing
              progress={progressPercent}
              size={48}
              strokeWidth={5}
            />
            <div>
              <div className="font-bold">
                {completedCount} of {playlist.videoCount} completed
              </div>
              <div className="text-sm text-var(--text-muted)">
                {progressPercent === 100
                  ? "All done! 🎉"
                  : "Keep going!"}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResumeLearning}
              className="btn-primary flex-1 sm:flex-none"
            >
              <PlayCircle size={18} />
              {firstIncompleteVideo
                ? "Resume Learning"
                : "Watch Again"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex-1 sm:flex-none"
            >
              <Pencil size={16} />
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {showPlayer && activeVideo && (
        <div ref={playerRef} className="glass-card overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-var(--border) bg-var(--surface-50) dark:bg-var(--surface-800)/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <h3 className="font-semibold text-sm truncate text-var(--text-primary)">
                Now Playing: {activeVideo.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPlayerCollapsed(!playerCollapsed)}
                className="p-1.5 rounded-lg hover:bg-var(--surface-200) dark:hover:bg-var(--surface-700) text-var(--text-muted) transition-colors"
                title={playerCollapsed ? "Expand" : "Collapse"}
              >
                {playerCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
              <button
                onClick={() => {
                  setShowPlayer(false);
                  setActiveVideoId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-var(--surface-200) dark:hover:bg-var(--surface-700) text-var(--text-muted) transition-colors"
                title="Close player"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!playerCollapsed && (
            <div className="relative">
              <div className="aspect-video bg-black">
                <iframe
                  key={activeVideo.youtubeVideoId}
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-var(--surface-50) dark:bg-var(--surface-800)/50 border-t border-var(--border)">
                <div className="flex items-center gap-2 text-sm text-var(--text-secondary)">
                  <Clock size={14} />
                  <span>{formatDuration(activeVideo.durationSecs)}</span>
                  <span className="text-var(--text-muted)">•</span>
                  <span className="text-var(--text-muted)">
                    Video{" "}
                    {playlist.videos.findIndex(
                      (v: any) => v.id === activeVideoId
                    ) + 1}{" "}
                    of {playlist.videos.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkComplete}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeVideo.progressStatus === "COMPLETED"
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-var(--surface-100) dark:bg-var(--surface-700) text-var(--text-secondary) hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                    )}
                  >
                    <CheckCircle2 size={14} />
                    {activeVideo.progressStatus === "COMPLETED"
                      ? "Completed"
                      : "Mark Complete"}
                  </button>
                  <button
                    onClick={playNextVideo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-var(--surface-100) dark:bg-var(--surface-700) text-var(--text-secondary) hover:text-var(--text-primary) transition-colors"
                  >
                    <SkipForward size={14} />
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--text-muted)"
            size={18}
          />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="text-sm text-var(--text-muted)">
          {filteredVideos.length} video
          {filteredVideos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Videos List */}
      <div ref={videoListRef} className="glass-card divide-y divide-var(--border)">
        {filteredVideos.map((video: any, index: number) => {
          const isCompleted = video.progressStatus === "COMPLETED";
          const inProgress = video.progressStatus === "IN_PROGRESS";
          const isPlaying = video.id === activeVideoId;

          return (
            <div
              key={video.id}
              className={cn(
                "p-4 flex gap-4 transition-all items-start sm:items-center group cursor-pointer",
                isPlaying
                  ? "bg-blue-50/60 dark:bg-blue-500/10 ring-1 ring-blue-500/30"
                  : isCompleted
                    ? "bg-emerald-50/30 dark:bg-emerald-500/5"
                    : "hover:bg-var(--surface-50) dark:hover:bg-var(--surface-800)/50"
              )}
              onClick={() => playVideo(video)}
            >
              <div className="shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoStatus(video.id, video.progressStatus);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    isCompleted
                      ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20"
                      : inProgress
                        ? "text-amber-500 border-2 border-amber-500"
                        : "text-var(--text-muted) hover:text-var(--text-primary) border-2 border-var(--border) hover:border-var(--text-secondary)"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : inProgress ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  ) : null}
                </button>
              </div>

              <div className="hidden sm:block shrink-0 w-32 aspect-video bg-var(--surface-100) rounded overflow-hidden relative group/thumb">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className={cn(
                      "w-full h-full object-cover transition-all",
                      isCompleted && "opacity-50 grayscale"
                    )}
                  />
                )}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {formatDuration(video.durationSecs)}
                </div>
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying ? (
                    <Pause size={24} className="text-white" />
                  ) : (
                    <Play
                      size={24}
                      className="text-white fill-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "font-medium line-clamp-2",
                    isPlaying && "text-blue-600 dark:text-blue-400",
                    isCompleted &&
                      !isPlaying &&
                      "text-var(--text-secondary) line-through decoration-var(--text-muted) decoration-1"
                  )}
                >
                  <span className="text-var(--text-muted) text-xs font-mono mr-2">
                    {index + 1}.
                  </span>
                  {video.title}
                </h4>

                <div className="flex items-center gap-2 mt-1.5">
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium">
                      <span className="flex gap-0.5">
                        <span className="w-0.5 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span
                          className="w-0.5 h-3 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="w-0.5 h-3 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </span>
                      Now Playing
                    </span>
                  )}
                  <div className="sm:hidden flex items-center gap-2 text-xs text-var(--text-muted)">
                    <Clock size={12} />{" "}
                    {formatDuration(video.durationSecs)}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playVideo(video);
                }}
                className={cn(
                  "shrink-0 p-2 rounded-full transition-all",
                  isPlaying
                    ? "text-blue-500 bg-blue-100 dark:bg-blue-500/20"
                    : "text-var(--text-muted) hover:text-var(--text-primary) hover:bg-var(--surface-100) dark:hover:bg-var(--surface-800) opacity-0 group-hover:opacity-100 focus:opacity-100"
                )}
              >
                {isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="fill-current" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
