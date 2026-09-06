import React, { useState } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Shuffle, Repeat, 
  ListMusic
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../lib/utils";

export function PlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    currentTime, 
    duration, 
    seek,
    volume,
    setVolume,
    isShuffled,
    toggleShuffle
  } = usePlayer();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setDragTime(val);
  };

  const commitSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seek(val);
    setIsDragging(false);
  };

  return (
    <div className="h-24 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 flex items-center px-6 gap-6 relative z-50">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 shadow-lg relative group">
              {currentTrack.coverArtUrl ? (
                <img src={currentTrack.coverArtUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <ListMusic className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-white truncate">{currentTrack.title}</span>
              <span className="text-xs text-white/50 truncate">{currentTrack.artist}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 text-white/30">
            <div className="w-14 h-14 rounded-md bg-white/5 flex items-center justify-center">
              <ListMusic className="w-6 h-6" />
            </div>
            <span className="text-sm">No track playing</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle} 
            className={`transition-colors ${isShuffled ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
          
          <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          
          <button className="text-white/40 hover:text-white/80 transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        {/* Seek Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-white/50 font-mono">
          <span>{formatTime(displayTime)}</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group">
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none" 
              style={{ width: `${progress}%` }}
            />
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={displayTime}
              onMouseDown={() => setIsDragging(true)}
              onChange={handleSeek}
              onMouseUp={commitSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px]">
        <div className="flex items-center gap-2 w-32 group">
          <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/50 hover:text-white transition-colors">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
            <div 
              className="absolute top-0 left-0 h-full bg-white/70 rounded-full pointer-events-none group-hover:bg-white transition-colors" 
              style={{ width: `${volume * 100}%` }}
            />
            <input 
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
