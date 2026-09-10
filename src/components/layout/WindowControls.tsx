import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch';
import { usePlayer } from '../../context/PlayerContext';

export function WindowControls() {
  const { currentTrack } = usePlayer();

  return (
    <div className="w-full h-16 shrink-0 flex bg-zinc-950 z-[100] relative" style={{ WebkitAppRegion: "drag" } as any}>
      {/* Search container - dynamically add padding if TrackInfoPanel is visible to center perfectly over the main view */}
      <div className={`h-full flex-1 flex justify-center items-end pb-2 pointer-events-none ${currentTrack ? 'pr-80' : ''}`}>
        <div className="w-[80%] max-w-2xl pointer-events-auto" style={{ WebkitAppRegion: "no-drag" } as any}>
          <GlobalSearch />
        </div>
      </div>

      <div className="absolute top-0 right-0 h-8 flex items-center pointer-events-auto" style={{ WebkitAppRegion: "no-drag" } as any}>
        <button 
          onClick={() => window.electron?.minimize()} 
          className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          onClick={() => window.electron?.maximize()} 
          className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => window.electron?.close()} 
          className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
