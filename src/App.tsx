import React, { useState, useEffect } from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { PlayerBar } from "./components/PlayerBar";
import { Visualizer } from "./components/Visualizer";
import { LibraryView } from "./components/Library";
import { AlbumsView } from "./components/Albums";
import { StatsView } from "./components/Stats";
import { AIPlaylistView } from "./components/AIPlaylist";
import { EqView } from "./components/EqView";
import { GlobalSearch } from "./components/GlobalSearch";
import { Library, Disc, Sparkles, Settings2, User, Settings, X, ChevronDown } from "lucide-react";
import { getAllTracks, getAllStats } from "./lib/db";
import { PlayStat } from "./types";
import { Language } from "./i18n";

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { language, setLanguage, t } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t.settings}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-white/60">{t.language}</label>
            <div 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{language === 'en' ? t.english : t.russian}</span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10 animate-in fade-in slide-in-from-top-2">
                <div 
                  className={`px-4 py-3 cursor-pointer transition-colors ${language === 'en' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => { setLanguage('en'); setIsOpen(false); }}
                >
                  {t.english}
                </div>
                <div 
                  className={`px-4 py-3 cursor-pointer transition-colors ${language === 'ru' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => { setLanguage('ru'); setIsOpen(false); }}
                >
                  {t.russian}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const [activeTab, setActiveTab] = useState<"library" | "albums" | "stats" | "ai" | "eq">("library");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currentTrack, setLibrary, library, t } = usePlayer();
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
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col pt-8">
          <div className="px-6 mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              Sonata
            </h1>
          </div>
          
          <nav className="flex-1 space-y-2 px-3">
            <NavItem 
              icon={<Library />} label={t.library} 
              active={activeTab === "library"} onClick={() => setActiveTab("library")} 
            />
            <NavItem 
              icon={<Disc />} label={t.albums} 
              active={activeTab === "albums"} onClick={() => setActiveTab("albums")} 
            />
            <NavItem 
              icon={<Sparkles />} label={t.aiPlaylists} 
              active={activeTab === "ai"} onClick={() => setActiveTab("ai")} 
            />
            <NavItem 
              icon={<Settings2 />} label={t.equalizer} 
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
          
          <div className="relative z-20 px-8">
            <GlobalSearch />
          </div>
          
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
            {activeTab === "library" && <LibraryView />}
            {activeTab === "albums" && <AlbumsView />}
            {activeTab === "stats" && <StatsView stats={stats} library={library} />}
            {activeTab === "ai" && <AIPlaylistView />}
            {activeTab === "eq" && <EqView />}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-24 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 flex relative z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Profile Section (Matches Sidebar Width) */}
        <div 
          className="w-64 border-r border-white/5 flex items-center justify-between px-6 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => {
            getAllStats().then(setStats);
            setActiveTab("stats");
          }}
        >
          <div className="flex items-center gap-3">
             <User className="w-5 h-5 text-white/60" />
             <span className={`text-sm font-semibold transition-colors ${activeTab === 'stats' ? 'text-white' : 'text-white/60'}`}>{t.profile}</span>
          </div>
          <button 
             onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
             className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors -mr-2"
          >
             <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Player Section */}
        <div className="flex-1 min-w-0">
          <PlayerBar />
        </div>
      </div>
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white shadow-inner" : "text-white/60 hover:bg-white/5 hover:text-white"
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
