import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useLanguage } from '../context/LanguageContext';
import { Play, Sparkles, Loader2, Music } from 'lucide-react';
import { Track } from '../types';
import { GlobalSearch } from './GlobalSearch';

export function AIPlaylistView() {
  const { playTrack, setQueue, currentTrack } = usePlayer();
  const { library } = useLibrary();
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || library.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Mock generation for now since lib/gemini is missing
      // In a real app, you would call your backend API here
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          tracks: library.map(t => ({ id: t.id, title: t.title, artist: t.artist, album: t.album })) 
        })
      });
      if (!response.ok) throw new Error("Failed to generate");
      const data = await response.json();
      
      const generated = data.playlist
        .map((id: string) => library.find(t => t.id === id))
        .filter(Boolean);
        
      setPlaylist(generated);
    } catch (error) {
      console.error("Failed to generate playlist", error);
      alert("Failed to generate playlist. Check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAll = () => {
    if (playlist.length === 0) return;
    playTrack(playlist[0], playlist);
  };

  return (
    <div className="px-8 pb-8 pt-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white w-1/4">{t.aiPlaylists}</h1>
        
        <div className="flex-1 max-w-xl flex justify-center">
            <GlobalSearch />
        </div>
        
        <div className="w-1/4 flex justify-end"></div>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-gradient-to-br from-emerald-500/20 to-zinc-900/50 p-8 rounded-3xl border border-emerald-500/30 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-emerald-500/10 rotate-12 pointer-events-none">
            <Sparkles className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/70 mb-6 text-lg">{t.aiDesc}</p>
            
            <div className="flex gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.generatePrompt}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || library.length === 0}
                className="bg-white/10 hover:bg-white text-black px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:bg-white/10 flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? t.generating : t.generate}
              </button>
            </div>
          </div>
        </div>

        {playlist.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t.curated}</h2>
              <button 
                onClick={playAll}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                {t.playAll}
              </button>
            </div>

            <div className="space-y-2">
              {playlist.map((track, index) => {
                const isPlaying = currentTrack?.id === track.id;
                return (
                  <div 
                    key={track.id + index}
                    onClick={() => playTrack(track, playlist)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer group transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-12 h-12 rounded-md bg-white/5 shrink-0 relative overflow-hidden">
                      {track.coverArtUrl ? (
                        <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                      )}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <Play className="w-4 h-4 fill-current text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isPlaying ? 'text-white' : 'text-white'}`}>{track.title}</div>
                      <div className="text-white/50 text-sm truncate">{track.artist}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
