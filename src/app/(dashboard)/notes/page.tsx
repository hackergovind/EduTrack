import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDurationShort, getRelativeTime } from "@/lib/utils";
import { BookOpen, FileText, Clock, Video, Search } from "lucide-react";
import Link from "next/link";

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: {
      video: {
        include: {
          playlist: {
            select: { id: true, title: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Group notes by playlist
  const grouped = new Map<
    string,
    { playlistTitle: string; playlistId: string; notes: typeof notes }
  >();

  for (const note of notes) {
    const key = note.video.playlist.id;
    if (!grouped.has(key)) {
      grouped.set(key, {
        playlistTitle: note.video.playlist.title,
        playlistId: key,
        notes: [],
      });
    }
    grouped.get(key)!.notes.push(note);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
            Notes
          </h1>
          <p className="text-var(--text-secondary)">
            All your learning notes in one place. {notes.length} note
            {notes.length !== 1 ? "s" : ""} total.
          </p>
        </div>
      </div>

      {notes.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-6">
            <BookOpen size={40} />
          </div>
          <h2 className="text-xl font-bold text-var(--text-primary) mb-2">
            No notes yet
          </h2>
          <p className="text-var(--text-secondary) max-w-md mx-auto mb-6">
            Start taking notes while watching videos. Notes are timestamped and
            organized by video for easy reference later.
          </p>
          <Link href="/playlists" className="btn-primary">
            Go to Playlists
          </Link>
        </div>
      ) : (
        /* Notes List grouped by playlist */
        <div className="space-y-6">
          {Array.from(grouped.values()).map((group) => (
            <div key={group.playlistId} className="glass-card overflow-hidden">
              {/* Playlist Header */}
              <div className="px-6 py-4 bg-var(--surface-50) dark:bg-var(--surface-800)/50 border-b border-var(--border)">
                <Link
                  href={`/playlists/${group.playlistId}`}
                  className="flex items-center gap-2 group"
                >
                  <Video
                    size={16}
                    className="text-blue-500 group-hover:text-blue-600 transition-colors"
                  />
                  <h2 className="font-semibold text-var(--text-primary) group-hover:text-blue-500 transition-colors">
                    {group.playlistTitle}
                  </h2>
                  <span className="text-xs text-var(--text-muted) ml-auto">
                    {group.notes.length} note{group.notes.length !== 1 ? "s" : ""}
                  </span>
                </Link>
              </div>

              {/* Notes within playlist */}
              <div className="divide-y divide-var(--border)">
                {group.notes.map((note) => (
                  <div
                    key={note.id}
                    className="px-6 py-4 hover:bg-var(--surface-50) dark:hover:bg-var(--surface-800)/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-var(--surface-100) dark:bg-var(--surface-800) flex items-center justify-center shrink-0 mt-0.5">
                        <FileText
                          size={16}
                          className="text-var(--text-muted)"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-var(--text-primary) truncate">
                            {note.video.title}
                          </span>
                          {note.videoTimestamp !== null && (
                            <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Clock size={10} />
                              {formatDurationShort(note.videoTimestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-var(--text-secondary) whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                        <p className="text-xs text-var(--text-muted) mt-2">
                          {getRelativeTime(new Date(note.updatedAt))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
