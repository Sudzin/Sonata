import React, { useState } from "react";
import { usePlayer, PlayerProvider } from "./context/PlayerContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LibraryProvider } from "./context/LibraryContext";
import { LibraryView } from "./components/Library";
import { AlbumsView } from "./components/Albums";
import { PlayerBar } from "./components/PlayerBar";
import { StatsView } from "./components/Stats";
import { AIPlaylistView } from "./components/AIPlaylist";
import { EqView } from "./components/EqView";
import { useAuth } from "./hooks/useAuth";
import { useAppInit } from "./hooks/useAppInit";

import { WindowControls } from "./components/layout/WindowControls";
import { TrackInfoPanel } from "./components/layout/TrackInfoPanel";
import { Sidebar } from "./components/layout/Sidebar";
import { SettingsModal } from "./components/settings/SettingsModal";

function MainLayout() {
  const [activeTab, setActiveTab] = useState<"library" | "albums" | "stats" | "ai" | "eq">("library");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuth();
  
  // Use the extracted hook for database and initialization logic
  const { stats, library } = useAppInit();

  return (
    <div className="h-screen w-full flex bg-zinc-950 text-white overflow-hidden selection:bg-white/20">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Custom Titlebar / Window Controls - Now spans the entire right side */}
        <WindowControls />

        {/* Top Split Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
            {activeTab === "library" && <LibraryView />}
            {activeTab === "albums" && <AlbumsView />}
            {activeTab === "ai" && <AIPlaylistView />}
            {activeTab === "eq" && <EqView />}
            {activeTab === "stats" && <StatsView stats={stats} library={library} />}
          </div>
          
          {/* Right Sidebar */}
          <TrackInfoPanel />
        </div>

        {/* Player Bar */}
        <div className="h-28 bg-zinc-950 border-t border-white/5 z-50 shrink-0 shadow-2xl">
          <PlayerBar />
        </div>
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} setActiveTab={setActiveTab} user={user} />}
    </div>
  )
}


export default function App() {
  return (
    <LanguageProvider>
      <LibraryProvider>
        <PlayerProvider>
          <MainLayout />
        </PlayerProvider>
      </LibraryProvider>
    </LanguageProvider>
  );
}
