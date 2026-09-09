import React from 'react';
import { Music, Library, Disc, Sparkles, Settings2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLanguage } from '../../context/LanguageContext';

interface NavigationSidebarProps {
  activeTab: "library" | "albums" | "stats" | "ai" | "eq";
  setActiveTab: (tab: "library" | "albums" | "stats" | "ai" | "eq") => void;
}

export function NavigationSidebar({ activeTab, setActiveTab }: NavigationSidebarProps) {
  const {  } = usePlayer();
  const { t } = useLanguage();

  return (
    <>
      <div className="p-6 flex items-center gap-3">
        <Music className="w-8 h-8 text-white" />
        <span className="text-xl font-bold tracking-tight text-white">Sonata</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar" style={{ WebkitAppRegion: "no-drag" } as any}>
        <button 
          onClick={() => setActiveTab('library')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'library' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Library className="w-5 h-5" />
          <span className="font-medium">{t.library}</span>
        </button>
        <button 
          onClick={() => setActiveTab('albums')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'albums' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Disc className="w-5 h-5" />
          <span className="font-medium">{t.albums}</span>
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'ai' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">{t.aiPlaylists}</span>
        </button>
        <button 
          onClick={() => setActiveTab('eq')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'eq' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Settings2 className="w-5 h-5" />
          <span className="font-medium">{t.equalizer}</span>
        </button>
      </nav>
    </>
  );
}
