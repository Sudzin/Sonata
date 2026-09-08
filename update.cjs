const fs = require('fs');
const path = require('path');

const appContent = `import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-zinc-950 border border-white/10 rounded-sm w-full max-w-md p-6 shadow-none animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t.settings}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          
          {/* Profile Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">{t.account}</label>
            <div className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-sm bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="text-base font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                  <span className="text-xs text-white/40">{user ? 'Google account' : 'Local profile'}</span>
                </div>
              </div>
              <button 
                onClick={() => { if(user) logout(); else loginWithGoogle(); }} 
                className="text-white hover:text-emerald-400 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm flex-shrink-0 flex items-center gap-2 text-sm"
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
              className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 text-white flex items-center justify-between hover:border-white/30 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-sm bg-emerald-500/10 flex items-center justify-center">
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
              className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{language === 'en' ? t.english : t.russian}</span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-sm overflow-hidden shadow-none z-10 animate-in fade-in slide-in-from-top-2">
                <div 
                  className={\`px-4 py-3 cursor-pointer transition-colors \${language === 'en' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}\`}
                  onClick={() => { setLanguage('en'); setIsOpen(false); }}
                >
                  {t.english}
                </div>
                <div 
                  className={\`px-4 py-3 cursor-pointer transition-colors \${language === 'ru' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}\`}
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
        <div className="w-64 flex flex-col bg-zinc-950 border-r border-white/5 z-20">
          <div className="p-6 flex items-center gap-3">
             <Music className="w-8 h-8 text-white" />
             <span className="text-xl font-bold tracking-tight text-white">Sonata</span>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <button onClick={() => setActiveTab('library')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'library' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Library className="w-5 h-5" />
              <span className="font-medium">{t.library}</span>
            </button>
            <button onClick={() => setActiveTab('albums')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'albums' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Disc className="w-5 h-5" />
              <span className="font-medium">{t.albums}</span>
            </button>
            <button onClick={() => setActiveTab('ai')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'ai' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">{t.aiPlaylists}</span>
            </button>
            <button onClick={() => setActiveTab('eq')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'eq' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
              <Settings2 className="w-5 h-5" />
              <span className="font-medium">{t.equalizer}</span>
            </button>
          </nav>
          
          {/* Track Info in Sidebar */}
          <div className="p-6 border-t border-white/5 flex flex-col gap-4 bg-zinc-950 flex-shrink-0">
            {currentTrack ? (
              <>
                <div className="w-full aspect-square rounded-sm overflow-hidden bg-white/5 border border-white/5 relative">
                  {currentTrack.coverArtUrl ? (
                    <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-12 h-12"/></div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col">
                  <h4 className="text-white font-medium text-base truncate leading-tight mb-1">{currentTrack.title}</h4>
                  <p className="text-white/50 text-sm truncate">{currentTrack.artist}</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-white/20">
                 <Music className="w-10 h-10 mb-3 opacity-50" />
                 <span className="text-sm font-medium text-center">{t.noTrackPlaying}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
          {activeTab === "library" && <LibraryView />}
          {activeTab === "albums" && <AlbumsView />}
          {activeTab === "ai" && <AIPlaylistView />}
          {activeTab === "eq" && <EqView />}
          {activeTab === "stats" && <StatsView stats={stats} library={library} />}
        </div>
      </div>
      
      {/* Player Bar */}
      <div className="h-24 bg-zinc-950 border-t border-white/5 z-50 flex-shrink-0">
        <PlayerBar onOpenSettings={() => setIsSettingsOpen(true)} />
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

const playerBarContent = `import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, User, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function PlayerBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { isPlaying, togglePlay, progress, duration, seek, volume, setVolume, playNext, playPrevious, toggleRepeat, toggleShuffle, repeatMode, isShuffle, t } = usePlayer();
  const { user } = useAuth();
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  return (
    <div className="w-full h-full flex items-center relative z-50">
      {/* Left Section: Profile Block */}
      <div className="w-64 flex-shrink-0 h-full border-r border-white/5 flex items-center px-4 bg-zinc-950">
          <div className="w-full px-4 py-3 bg-white/5 rounded-sm flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col truncate pr-2">
                <span className="text-sm font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                <span className="text-[10px] text-white/40 truncate">{user ? 'Google account' : 'Local profile'}</span>
              </div>
            </div>
            <button 
              onClick={onOpenSettings} 
              className="text-emerald-400 hover:text-emerald-300 transition-colors p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-sm flex-shrink-0" 
              title={t.settings}
            >
               <Settings className="w-4 h-4" />
            </button>
          </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex-1 max-w-2xl mx-auto flex flex-col items-center justify-center gap-2 px-6">
        <div className="flex items-center gap-6">
          <button 
             onClick={toggleShuffle} 
             className={\`transition-colors \${isShuffle ? 'text-emerald-400' : 'text-white/40 hover:text-white'}\`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
             onClick={playPrevious} 
             className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
             onClick={togglePlay} 
             className="w-10 h-10 flex items-center justify-center bg-white rounded-sm hover:scale-100 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-black" />
            ) : (
              <Play className="w-5 h-5 fill-current text-black ml-1" />
            )}
          </button>
          <button 
             onClick={playNext} 
             className="text-white/60 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button 
             onClick={toggleRepeat} 
             className={\`transition-colors relative \${repeatMode !== 'none' ? 'text-emerald-400' : 'text-white/40 hover:text-white'}\`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-2 -right-2 text-[8px] font-bold bg-zinc-900 px-1 rounded-sm border border-white/10">1</span>
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-3 text-xs font-mono text-white/40">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div 
             ref={progressRef}
            className="flex-1 h-1.5 bg-white/10 rounded-sm cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 rounded-sm transition-colors"
              style={{ width: \`\${(progress / (duration || 1)) * 100}%\` }}
            />
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="w-64 flex-shrink-0 flex justify-end items-center gap-3 px-6">
        <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/60 hover:text-white">
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="w-24 h-1.5 bg-white/10 rounded-sm relative cursor-pointer group"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
             }}>
          <div 
            className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 rounded-sm transition-colors"
            style={{ width: \`\${volume * 100}%\` }}
          />
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/App.tsx', appContent);
fs.writeFileSync('src/components/PlayerBar.tsx', playerBarContent);
