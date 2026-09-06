import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Sparkles, Play, Loader2, Music } from 'lucide-react';

export function AIPlaylistView() {
  const { library, playTrack, t } = usePlayer();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim() || library.length === 0) return;
    
    setIsGenerating(true);
    setError("");
    
    try {
      const res = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tracks: library
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate playlist");
      
      const data = await res.json();
      const ids = data.playlist || [];
      
      const resultTracks = ids
        .map((id: string) => library.find(tr => tr.id === id))
        .filter(Boolean);
        
      setGeneratedTracks(resultTracks);
      
    } catch (err) {
      console.error(err);
      setError("AI failed to generate a playlist. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const playAll = () => {
    if (generatedTracks.length > 0) {
      playTrack(generatedTracks[0], generatedTracks);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-10 mb-8 text-center relative overflow-hidden shadow-2xl">
        <Sparkles className="w-14 h-14 text-purple-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">{t.aiPlaylists}</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
          {t.aiDesc}
        </p>
        
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.generatePrompt}
            className="flex-1 bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-purple-400/60 transition-colors shadow-inner"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || library.length === 0}
            className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : t.generate}
          </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-sm bg-red-900/20 inline-block px-4 py-2 rounded-full">{error}</p>}
      </div>

      {generatedTracks.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">{t.curated}</h3>
            <button 
              onClick={playAll}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              {t.playAll}
            </button>
          </div>
          
          <div className="space-y-2">
            {generatedTracks.map((track) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track, generatedTracks)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer group transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex-shrink-0 relative overflow-hidden shadow-sm">
                  {track.coverArtUrl ? (
                    <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-lg">{track.title}</p>
                  <p className="text-white/50 text-sm truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
