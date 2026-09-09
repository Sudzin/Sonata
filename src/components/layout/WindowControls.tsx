import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export function WindowControls() {
  return (
    <div className="w-full h-8 shrink-0 flex justify-end bg-zinc-950 z-[100]" style={{ WebkitAppRegion: "drag" } as any}>
      <div className="flex items-center h-full" style={{ WebkitAppRegion: "no-drag" } as any}>
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
