import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../lib/utils';

export function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, progress, duration, seek, volume, setVolume, playNext, playPrevious, toggleRepeat, toggleShuffle, repeatMode, isShuffle, t } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  return (
    <div className="w-full h-full flex items-center px-6 gap-6 relative z-50">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
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

      {/* Controls & Progress */}
      <div className="flex-1 max-w-2xl flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle} 
            className={`transition-colors ${isShuffle ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}
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
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform"
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
            className={`transition-colors relative ${repeatMode !== 'none' ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-2 -right-2 text-[8px] font-bold bg-zinc-900 px-1 rounded-full border border-emerald-500/30">1</span>
            )}
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-xs font-mono text-white/40">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div 
            ref={progressRef}
            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 rounded-full transition-colors"
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="w-1/4 min-w-[150px] flex justify-end items-center gap-3">
        <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/60 hover:text-white">
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="w-24 h-1.5 bg-white/10 rounded-full relative cursor-pointer group"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
             }}>
          <div 
            className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 rounded-full transition-colors"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
