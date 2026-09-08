const fs = require('fs');

const code = `import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume, nextTrack, prevTrack, toggleRepeat, toggleShuffle, repeatMode, isShuffled, t } = usePlayer();
  const { user } = useAuth();
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 relative z-50">
      
      {/* Top Row: Track Info, Play Controls, Volume */}
      <div className="flex items-center justify-between w-full h-full">
        
        {/* Track Info (Mini) */}
        <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
          {currentTrack ? (
            <>
              <div className="w-16 h-16 rounded-sm overflow-hidden bg-white/10 flex-shrink-0 shadow-lg">
                {currentTrack.coverArtUrl ? (
                  <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-8 h-8"/></div>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-white font-semibold text-base truncate leading-tight mb-1">{currentTrack.title}</h4>
                <p className="text-white/60 text-sm truncate">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <div className="text-white/30 text-sm font-medium">{t.noTrackPlaying || "No track playing"}</div>
          )}
        </div>

        {/* Controls (Center) */}
        <div className="w-1/3 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleShuffle}
              className={\`transition-colors \${isShuffled ? 'text-white' : 'text-white/40 hover:text-white'}\`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button
              onClick={prevTrack}
              className="text-white/60 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform flex-shrink-0 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current text-black" />
              ) : (
                <Play className="w-7 h-7 fill-current text-black ml-1" />
              )}
            </button>
            
            <button
              onClick={nextTrack}
              className="text-white/60 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            
            <button
              onClick={toggleRepeat}
              className={\`transition-colors relative \${repeatMode !== 'none' ? 'text-white' : 'text-white/40 hover:text-white'}\`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Progress bar moved here to keep things centered and aligned */}
          <div className="w-full max-w-lg flex items-center gap-3 text-xs font-mono text-white/40 mt-2">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
              onClick={handleSeek}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-white rounded-full transition-all"
                style={{ width: \`\${(currentTime / (duration || 1)) * 100}%\` }}
              />
            </div>
            <span className="w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-1/3 min-w-[150px] flex justify-end items-center gap-4 pr-4">
          <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/60 hover:text-white transition-colors">
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="w-28 h-1.5 bg-white/10 rounded-full relative cursor-pointer group"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
               }}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-white rounded-full transition-all"
              style={{ width: \`\${volume * 100}%\` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/PlayerBar.tsx', code);
console.log("PlayerBar updated!");
