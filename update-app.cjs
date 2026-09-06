const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { Music, FolderOpen, Play, Search, Library, Disc, Sparkles, Settings2, User, Settings, X, ChevronDown, LogOut, LogIn, BarChart } from "lucide-react";
import { usePlayer, PlayerProvider } from "./context/PlayerContext";
import { LibraryView } from "./components/Library";
import { AlbumsView } from "./components/Albums";
import { PlayerBar } from "./components/PlayerBar";
import { StatsView } from "./components/Stats";
import { AIPlaylistView } from "./components/AIPlaylist";
import { EqView } from "./components/EqView";
import { getAllTracks, getAllStats } from "./lib/db";
import { PlayStat, Language } from "./types";
import { useAuth } from "./hooks/useAuth";
import { loginWithGoogle, logout } from "./lib/firebase";

function SettingsModal({ onClose, setActiveTab, user }: { onClose: () => void, setActiveTab: (tab: any) => void, user: any }) {
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
          
          {/* Profile Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">Аккаунт</label>
            <div className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="text-base font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                  <span className="text-xs text-white/40">{user ? 'Google account' : 'Local profile'}</span>
                </div>
              </div>
              <button 
                onClick={() => { if(user) logout(); else loginWithGoogle(); }} 
                className="text-white hover:text-emerald-400 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-lg flex-shrink-0 flex items-center gap-2 text-sm"
              >
                 {user ? <><LogOut className="w-4 h-4" /> {t.logout}</> : <><LogIn className="w-4 h-4" /> Login</>}
              </button>
            </div>
          </div>

          {/* Statistics Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">{t.profile}</label>
            <button 
              onClick={() => { setActiveTab('stats'); onClose(); }}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:border-white/30 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <BarChart className="w-4 h-4 text-emerald-400" />
                 </div>
                 <span className="font-medium">{t.localWrapped}</span>
              </div>
              <span className="text-white/40 group-hover:text-white/60 transition-colors text-sm">&rarr;</span>
            </button>
          </div>

          {/* Language Block */}
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
                  className={\`px-4 py-3 cursor-pointer transition-colors \${language === 'en' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}\`}
                  onClick={() => { setLanguage('en'); setIsOpen(false); }}
                >
                  {t.english}
                </div>
                <div 
                  className={\`px-4 py-3 cursor-pointer transition-colors \${language === 'ru' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}\`}
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
  const { currentTrack, setLibrary, library, t, language } = usePlayer();
  const [stats, setStats] = useState<PlayStat[]>([]);
  const { user } = useAuth();

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

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-white overflow-hidden selection:bg-emerald-500/30">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col bg-zinc-950 border-r border-white/5">
          <div className="p-6 flex items-center gap-3">
             <Music className="w-8 h-8 text-white" />
             <span className="text-xl font-bold tracking-tight text-white">Sonata</span>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <button onClick={() => setActiveTab('library')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'library' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Library className="w-5 h-5" />
              <span className="font-medium">{t.library}</span>
            </button>
            <button onClick={() => setActiveTab('albums')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'albums' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Disc className="w-5 h-5" />
              <span className="font-medium">{t.albums}</span>
            </button>
            <button onClick={() => setActiveTab('ai')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'ai' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">{t.aiPlaylists}</span>
            </button>
            <button onClick={() => setActiveTab('eq')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'eq' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Settings2 className="w-5 h-5" />
              <span className="font-medium">{t.equalizer}</span>
            </button>
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="px-4 py-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="text-sm font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                  <span className="text-[10px] text-white/40">{user ? 'Google account' : 'Local profile'}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="text-emerald-400 hover:text-emerald-300 transition-colors p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg flex-shrink-0" 
                title={t.settings}
              >
                 <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
            {activeTab === "library" && <LibraryView />}
            {activeTab === "albums" && <AlbumsView />}
            {activeTab === "ai" && <AIPlaylistView />}
            {activeTab === "eq" && <EqView />}
            {activeTab === "stats" && <StatsView stats={stats} library={library} />}
          </div>
        </div>
      </div>
      
      {/* Player Bar */}
      <div className="h-24 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 z-50">
        <PlayerBar />
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} setActiveTab={setActiveTab} user={user} />}
    </div>
  )
}

export default function App() {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}
`;

fs.writeFileSync('src/App.tsx', content);
