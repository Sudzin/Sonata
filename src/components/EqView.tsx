import React, { useState, useEffect } from 'react';
import { engine } from '../lib/audio';
import { Settings2 } from 'lucide-react';

const PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 1, 0, 0, 0, 0, 0, 0],
  Rock: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
  Pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
  Vocal: [-2, -2, -1, 1, 4, 4, 3, 1, -1, -2]
};

export function EqView() {
  const [gains, setGains] = useState<number[]>(PRESETS.Flat);
  const [activePreset, setActivePreset] = useState("Flat");

  useEffect(() => {
    gains.forEach((gain, idx) => {
      engine.setEqBand(idx, gain);
    });
  }, [gains]);

  const handleBandChange = (idx: number, val: number) => {
    setActivePreset("Custom");
    const newGains = [...gains];
    newGains[idx] = val;
    setGains(newGains);
  };

  const applyPreset = (name: string, values: number[]) => {
    setActivePreset(name);
    setGains(values);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold tracking-tight text-white">Equalizer</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {Object.entries(PRESETS).map(([name, values]) => (
          <button
            key={name}
            onClick={() => applyPreset(name, values)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePreset === name 
                ? "bg-white text-black" 
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-between h-64 gap-2 px-4 py-8 bg-black/20 border border-white/10 rounded-2xl">
        {engine.eqFrequencies.map((freq, idx) => (
          <div key={freq} className="flex flex-col items-center flex-1 h-full relative group">
            <div className="flex-1 w-full flex items-center justify-center relative">
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={gains[idx]}
                onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                className="w-48 h-1 appearance-none bg-white/20 rounded-full outline-none transform -rotate-90 absolute cursor-ns-resize z-10"
                style={{ WebkitAppearance: 'slider-vertical' } as any}
              />
              <div 
                className="absolute w-2 bg-white/50 rounded-full bottom-1/2 origin-bottom transition-all pointer-events-none"
                style={{ 
                  height: `${Math.abs(gains[idx]) * 4}px`, 
                  transform: gains[idx] < 0 ? 'rotate(180deg)' : 'none',
                  backgroundColor: gains[idx] > 0 ? '#10b981' : '#ef4444'
                }} 
              />
            </div>
            <span className="text-xs text-white/50 font-mono mt-4">
              {freq >= 1000 ? `${freq / 1000}k` : freq}
            </span>
            <span className="absolute -top-6 text-xs text-white/0 group-hover:text-white/80 font-mono transition-colors">
              {gains[idx] > 0 ? '+' : ''}{gains[idx]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
