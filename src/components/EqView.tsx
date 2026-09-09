import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useLanguage } from '../context/LanguageContext';
import { SlidersHorizontal, Settings2 } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';

const PRESETS = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bassBoost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  rock: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
  pop: [-1, -1, 0, 2, 4, 4, 2, 0, -1, -1],
  vocal: [-2, -2, -1, 2, 4, 5, 4, 2, -1, -2]
};

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export function EqView() {
  const {  } = usePlayer();
  const { t } = useLanguage();
  const [activePreset, setActivePreset] = React.useState('flat');
  const [gains, setGains] = React.useState<number[]>(PRESETS.flat);

  const handlePresetChange = (key: string, values: number[]) => {
    setActivePreset(key);
    setGains(values);
  };

  const handleSliderChange = (index: number, value: number) => {
    setActivePreset('custom');
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
  };

  return (
    <div className="px-8 pb-8 pt-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white w-1/4">{t.equalizer}</h1>
        
        <div className="flex-1 max-w-xl flex justify-center">
            <GlobalSearch />
        </div>
        
        <div className="w-1/4 flex justify-end"></div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-wrap gap-3 mb-12 border-b border-white/5 pb-8">
            {Object.entries(PRESETS).map(([key, values]) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key, values)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activePreset === key 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t[key as keyof typeof t] || key}
              </button>
            ))}
            <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activePreset === 'custom' 
                    ? 'bg-white/10 text-black' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.custom}
            </button>
          </div>

          <div className="flex justify-between items-end h-64 gap-2 md:gap-4 px-2 md:px-8">
            {gains.map((gain, i) => (
              <div key={i} className="flex flex-col items-center h-full gap-4 group">
                <span className="text-xs text-white font-mono font-medium h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {gain > 0 ? '+' : ''}{gain}
                </span>
                <div className="flex-1 relative w-1.5 bg-white/10 rounded-full flex items-end mx-auto">
                   <div 
                     className={`absolute bottom-0 w-full rounded-full transition-all duration-300 ${gain >= 0 ? 'bg-white' : 'bg-red-400'}`}
                     style={{ 
                        height: `${Math.abs(gain) * 4.16}%`,
                        bottom: gain >= 0 ? '50%' : `calc(50% - ${Math.abs(gain) * 4.16}%)`,
                        top: gain >= 0 ? `calc(50% - ${gain * 4.16}%)` : 'auto'
                     }}
                   />
                   <input
                    type="range"
                    min="-12"
                    max="12"
                    value={gain}
                    onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                    style={{ writingMode: 'vertical-lr' }}
                   />
                   {/* Center line */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/20 rounded-full pointer-events-none" />
                </div>
                <span className="text-[10px] text-white/40 font-mono mt-2">
                  {FREQUENCIES[i] >= 1000 ? `${FREQUENCIES[i]/1000}k` : FREQUENCIES[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
