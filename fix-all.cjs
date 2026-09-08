const fs = require('fs');

// 1. Fix App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// Align Profile block height to PlayerBar
appStr = appStr.replace(
  /<div className="p-6 border-t border-white\/5 bg-zinc-950 flex-shrink-0">/g,
  '<div className="h-24 px-6 border-t border-white/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center">'
);

// Remove the placeholder from Right Sidebar so it only shows when playing
appStr = appStr.replace(
  /\{currentTrack \? \([\s\S]*?\) : \([\s\S]*?<div className="flex-1 flex flex-col items-center justify-center p-6 text-white\/20">[\s\S]*?<p className="text-center text-sm font-medium">\{t\.noTrackPlaying\}<\/p>\s*<\/div>\s*\)\}/,
  `{currentTrack && (
            <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
               <div className="flex items-center gap-2 text-white/50 mb-2">
                  <Disc className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t.nowPlaying || "Now Playing"}</span>
               </div>
               <div className="w-full aspect-square rounded-sm overflow-hidden bg-white/5 border border-white/5 relative shadow-2xl">
                  {currentTrack.coverArtUrl ? (
                    <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-16 h-16"/></div>
                  )}
               </div>
               <div className="flex flex-col text-center">
                  <h4 className="text-white font-bold text-xl mb-1">{currentTrack.title}</h4>
                  <p className="text-white/60 text-base">{currentTrack.artist}</p>
               </div>
               <div className="bg-white/5 rounded-sm p-4 flex flex-col gap-3 text-sm mt-2 border border-white/5">
                  <div className="flex justify-between items-center">
                     <span className="text-white/40">{t.album || "Album"}</span>
                     <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.album || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-white/40">{t.genre || "Genre"}</span>
                     <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.genre || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-white/40">Duration</span>
                     <span className="text-white text-right font-mono font-medium">{Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}</span>
                  </div>
               </div>
            </div>
          )}`
);
fs.writeFileSync('src/App.tsx', appStr);


// 2. Fix Library.tsx Grid (give Title more space to prevent early truncation)
let libStr = fs.readFileSync('src/components/Library.tsx', 'utf8');
libStr = libStr.replace(/grid-cols-\[1fr_2fr_2fr_1fr\]/g, 'grid-cols-[5fr_3fr_3fr_1fr]');
fs.writeFileSync('src/components/Library.tsx', libStr);

// 3. Fix PlayerBar.tsx layout
let pbCode = `import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Music, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function PlayerBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { currentTrack, isPlaying, togglePlay, progress, duration, seek, volume, setVolume, playNext, playPrevious, toggleRepeat, toggleShuffle, repeatMode, isShuffle, t } = usePlayer();
  const { user } = useAuth();
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-6 relative z-50">
      
      {/* Top Row: Track Info, Play Controls, Volume */}
      <div className="flex items-center justify-between w-full mt-1">
        
        {/* Track Info (Mini) */}
        <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
          {currentTrack ? (
            <>
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-white/10 flex-shrink-0">
                {currentTrack.coverArtUrl ? (
                  <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-6 h-6"/></div>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-white font-medium text-sm truncate leading-tight mb-1">{currentTrack.title}</h4>
                <p className="text-white/60 text-xs truncate">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <div className="text-white/30 text-sm">{t.noTrackPlaying}</div>
          )}
        </div>

        {/* Controls */}
        <div className="w-1/3 flex items-center justify-center gap-6">
          <button 
             onClick={toggleShuffle} 
             className={\`transition-colors \${isShuffle ? 'text-white' : 'text-white/40 hover:text-white'}\`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          
          <button 
             onClick={playPrevious} 
             className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
             onClick={togglePlay} 
             className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current text-black" />
            ) : (
              <Play className="w-6 h-6 fill-current text-black" />
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
             className={\`transition-colors relative \${repeatMode !== 'none' ? 'text-white' : 'text-white/40 hover:text-white'}\`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Settings */}
        <div className="w-1/3 min-w-[150px] flex justify-end items-center gap-4">
          <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/60 hover:text-white">
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="w-24 h-1.5 bg-white/10 rounded-sm relative cursor-pointer group"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
               }}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-white rounded-sm transition-colors"
              style={{ width: \`\${volume * 100}%\` }}
            />
          </div>
          <div className="w-px h-6 bg-white/10 ml-2" />
          <button 
            onClick={onOpenSettings}
            className="text-white/40 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Progress bar */}
      <div className="w-full flex justify-center mt-3">
        <div className="w-full max-w-xl flex items-center gap-3 text-xs font-mono text-white/40">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div 
             ref={progressRef}
            className="flex-1 h-1 bg-white/10 rounded-sm cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-white rounded-sm transition-colors"
              style={{ width: \`\${(progress / (duration || 1)) * 100}%\` }}
            />
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

    </div>
  );
}
`;
fs.writeFileSync('src/components/PlayerBar.tsx', pbCode);

console.log("All UI tweaks applied successfully!");
