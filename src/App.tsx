/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { PlayerBar } from "./components/PlayerBar";
import { Visualizer } from "./components/Visualizer";
import { LibraryView } from "./components/Library";
import { StatsView } from "./components/Stats";
import { AIPlaylistView } from "./components/AIPlaylist";
import { EqView } from "./components/EqView";
import { Library, Activity, Sparkles, Settings2 } from "lucide-react";
import { getAllTracks, getAllStats } from "./lib/db";
import { PlayStat } from "./types";

function MainLayout() {
  const [activeTab, setActiveTab] = useState<"library" | "stats" | "ai" | "eq">("library");
  const { currentTrack, setLibrary, library } = usePlayer();
  const [stats, setStats] = useState<PlayStat[]>([]);

  // Load persistence
  useEffect(() => {
    async function load() {
      const savedTracks = await getAllTracks();
      if (savedTracks.length > 0) setLibrary(savedTracks);
      
      const savedStats = await getAllStats();
      setStats(savedStats);
    }
    load();
  }, [setLibrary]);

  // Chameleon UI effect
  const dominantColor = currentTrack?.dominantColor || "#09090b";

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden text-zinc-100 transition-colors duration-1000 font-sans"
      style={{
        backgroundColor: "var(--bg-color)",
        ['--bg-color' as any]: dominantColor
      }}
    >
      {/* Dark overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-black/80 pointer-events-none z-0" />
      
      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col pt-8 pb-4">
          <div className="px-6 mb-10">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              Sonata
            </h1>
          </div>
          
          <nav className="flex-1 space-y-1 px-3">
            <NavItem 
              icon={<Library />} label="Library" 
              active={activeTab === "library"} onClick={() => setActiveTab("library")} 
            />
            <NavItem 
              icon={<Sparkles />} label="AI Playlists" 
              active={activeTab === "ai"} onClick={() => setActiveTab("ai")} 
            />
            <NavItem 
              icon={<Activity />} label="Local Wrapped" 
              active={activeTab === "stats"} onClick={() => {
                getAllStats().then(setStats);
                setActiveTab("stats");
              }} 
            />
            <NavItem 
              icon={<Settings2 />} label="Equalizer" 
              active={activeTab === "eq"} onClick={() => setActiveTab("eq")} 
            />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col bg-black/20">
          {/* Top Visualizer - Subtle */}
          <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none">
            <Visualizer />
          </div>
          
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
            {activeTab === "library" && <LibraryView />}
            {activeTab === "stats" && <StatsView stats={stats} library={library} />}
            {activeTab === "ai" && <AIPlaylistView />}
            {activeTab === "eq" && <EqView />}
          </div>
        </div>
      </div>

      <PlayerBar />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      {label}
    </button>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}

