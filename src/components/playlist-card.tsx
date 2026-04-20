import Link from "next/link";
import { formatDuration, getRelativeTime } from "@/lib/utils";
import { ProgressRing } from "./ui/progress-ring";
import { ListVideo, MoreVertical, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function PlaylistCard({ playlist }: { playlist: any }) {
  const progressPercent = playlist.videoCount > 0 
    ? (playlist.completedCount / playlist.videoCount) * 100 
    : 0;

  const isCompleted = progressPercent === 100;

  return (
    <Link href={`/playlists/${playlist.id}`} className="group block">
      <div className="glass-card flex flex-col h-full overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-blue-500/50">
        <div className="relative aspect-video bg-var(--surface-100) dark:bg-var(--surface-800) overflow-hidden">
          {playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-var(--text-muted)">
              <ListVideo size={48} className="mb-2 opacity-50" />
            </div>
          )}
          
          {/* Overlay stats */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-100">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="flex bg-black/60 backdrop-blur-md rounded-md px-2 py-1 text-xs font-medium text-white items-center gap-1.5 border border-white/10">
                  <ListVideo size={14} />
                  {playlist.videoCount} videos
                </div>
                <div className="flex bg-black/60 backdrop-blur-md rounded-md px-2 py-1 text-xs font-medium text-white items-center gap-1.5 border border-white/10">
                  <Clock size={14} />
                  {formatDuration(playlist.totalDurationSecs)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Ring overlay */}
          <div className="absolute top-3 right-3 bg-var(--bg-card) rounded-full shadow-lg border border-var(--border) p-0.5">
            {isCompleted ? (
              <div className="w-10 h-10 flex items-center justify-center text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <ProgressRing progress={progressPercent} size={40} strokeWidth={4} />
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="font-bold text-var(--text-primary) line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
              {playlist.title}
            </h3>
            <button className="text-var(--text-muted) hover:text-var(--text-primary) p-1 -mr-1 transition-colors" onClick={(e) => e.preventDefault()}>
              <MoreVertical size={18} />
            </button>
          </div>
          
          <div className="text-sm text-var(--text-secondary) mb-4 line-clamp-1">
            {playlist.channelTitle || "Unknown Channel"}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center text-xs">
              <span className="text-var(--text-muted)">
                Imported {getRelativeTime(new Date(playlist.createdAt))}
              </span>
              <span className="font-medium text-var(--text-secondary)">
                {playlist.completedCount} / {playlist.videoCount} Done
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
