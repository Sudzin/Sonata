import React, { useState, useEffect } from 'react';
import { engine } from '../lib/audio';
import { Settings2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const PRESETS = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bassBoost: [6, 5, 4, 1, 0, 0, 0, 0, 0, 0],
  rock: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
  pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
  vocal: [-2, -2, -1, 1, 4, 4, 3, 1, -1, -2]
};

const VerticalSlider: React.FC<{ value: number; onChange: (v: number) => void; freq: string }> = ({ value, onChange, freq }) => {
  const min = -12;
  const max = 12;
  const percent = ((value - min) / (max - min)) * 100;

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const y = e.clientY - rect.top;
     let p = 1 - (y / rect.height);
     p = Math.max(0, Math.min(1, p));
     onChange(Math.round(min + p * (max - min)));
  };

  return (
    <div className="flex flex-col items-center gap-4 group">
      <span className="text-xs text-white/0 group-hover:text-white/80 font-mono transition-colors">
        {value > 0 ? '+' : ''}{value}
      </span>
      <div
         className="w-8 md:w-10 h-48 bg-black/40 rounded-xl relative cursor-pointer border border-white/5 shadow-inner touch-none"
         onPointerDown={(e) => {
           e.currentTarget.setPointerCapture(e.pointerId);
           handlePointer(e);
         }}
         onPointerMove={(e) => {
           if (e.buttons === 1) handlePointer(e);
         }}
      >
         <div className="absolute top-1/2 left-1 right-1 h-px bg-white/20 -translate-y-1/2 pointer-events-none" />
         <div
           className="absolute bottom-0 w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80 pointer-events-none"
           style={{ height: `${percent}%` }}
         />
         <div
           className="absolute w-full h-2 bg-white rounded shadow-md pointer-events-none"
           style={{ bottom: `calc(${percent}% - 4px)` }}
         />
      </div>
      <span className="text-xs text-white/50 font-mono">
        {freq}
      </span>
    </div>
  );
};

export function EqView() {
  const { t } = usePlayer();
  const [gains, setGains] = useState<number[]>(PRESETS.flat);
  const [activePreset, setActivePreset] = useState("flat");

  useEffect(() => {
    gains.forEach((gain, idx) => {
      engine.setEqBand(idx, gain);
    });
  }, [gains]);

  const handleBandChange = (idx: number, val: number) => {
    setActivePreset("custom");
    const newGains = [...gains];
    newGains[idx] = val;
    setGains(newGains);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold tracking-tight text-white">{t.equalizer}</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {Object.keys(PRESETS).map((presetKey) => (
          <button
            key={presetKey}
            onClick={() => { setActivePreset(presetKey); setGains(PRESETS[presetKey as keyof typeof PRESETS]); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePreset === presetKey 
                ? "bg-white text-black shadow-md" 
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t[presetKey as keyof typeof t] || presetKey}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-between gap-1 md:gap-4 px-4 md:px-12 py-8 bg-black/20 border border-white/10 rounded-3xl shadow-2xl">
        {engine.eqFrequencies.map((freq, idx) => (
          <VerticalSlider
             key={freq}
             value={gains[idx]}
             onChange={(v) => handleBandChange(idx, v)}
             freq={freq >= 1000 ? `${freq / 1000}k` : freq.toString()}
          />
        ))}
      </div>
    </div>
  );
}
