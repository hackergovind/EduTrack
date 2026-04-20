"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Play, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ImportPlaylistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<any>(null);

  if (!isOpen) return null;

  const handleFetch = async () => {
    if (!url) return toast.error("Please enter a URL");
    
    setLoading(true);
    try {
      const res = await fetch("/api/playlists/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, previewOnly: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch playlist");

      setPreview(data.playlist);
      setStep(2);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/playlists/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, previewOnly: false }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Playlist imported successfully!");
      setStep(3);
      
      // Navigate to the new playlist after brief delay
      setTimeout(() => {
        onClose();
        router.push(`/playlists/${data.playlist.id}`);
        router.refresh();
      }, 1500);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-var(--bg-card) border border-var(--border) rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-var(--border)">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Play className="text-red-500" size={24} />
            Import Playlist
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-var(--surface-100) transition-colors text-var(--text-secondary)">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Step 1: Input URL */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-var(--text-secondary) text-sm">
                Paste a YouTube playlist link below to import all its videos and start tracking your progress.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube Playlist URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--text-muted)">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/playlist?list=..."
                    className="input-field pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                <div className="shrink-0 mt-0.5">ℹ️</div>
                <p>Private playlists cannot be imported unless you use your own OAuth token. Unlisted playlists work fine.</p>
              </div>

              <button 
                onClick={handleFetch} 
                disabled={!url || loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Fetch Details"}
              </button>
            </div>
          )}

          {/* Step 2: Confirm Preview */}
          {step === 2 && preview && (
            <div className="space-y-6 animate-slide-up">
              <div className="glass-card overflow-hidden">
                <div className="aspect-video relative bg-var(--surface-100)">
                  {preview.thumbnail && <img src={preview.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{preview.title}</h3>
                  <p className="text-sm text-var(--text-secondary) mb-3">{preview.channelTitle}</p>
                  
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex bg-var(--surface-100) dark:bg-var(--surface-800) px-3 py-1.5 rounded-md">
                      <span className="text-var(--text-muted) mr-2">Videos:</span> {preview.videoCount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)} 
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  onClick={handleImport} 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Import Now"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="py-8 flex flex-col items-center text-center animate-scale-in">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Import Successful!</h3>
              <p className="text-var(--text-secondary)">Your playlist has been saved. Redirecting to your new dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
