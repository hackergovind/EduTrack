"use client";

import { useState } from "react";
import { PlaylistCard } from "@/components/playlist-card";
import { ImportPlaylistModal } from "@/components/import-playlist-modal";
import { PlusCircle, Search, Filter } from "lucide-react";

export default function ClientPlaylistsPage({ initialPlaylists }: { initialPlaylists: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaylists = initialPlaylists.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.channelTitle && p.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
            My Playlists
          </h1>
          <p className="text-var(--text-secondary)">
            Manage your courses and track your video consumption.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusCircle size={18} />
          Import Playlist
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--text-muted)" size={18} />
          <input 
            type="text" 
            placeholder="Search playlists..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary gap-2 hidden sm:flex">
          <Filter size={18} />
          Filter & Sort
        </button>
      </div>

      {initialPlaylists.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center border-dashed border-2">
          <div className="text-var(--text-muted) mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">No playlists found</h3>
          <p className="text-var(--text-secondary) max-w-md mb-6">You haven't imported any playlists yet. Start by importing a YouTube playlist URL.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Import Your First Playlist
          </button>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12 text-var(--text-secondary)">
          No playlists match your search "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      <ImportPlaylistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
