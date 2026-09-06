import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Sparkles, Play, Loader2 } from 'lucide-react';

export function AIPlaylistView() {
  const { library, playTrack } = usePlayer();
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
        .map((id: string) => library.find(t => t.id === id))
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">AI Playlist Generator</h2>
        <p className="text-white/60 mb-6 max-w-lg mx-auto">
          Describe the vibe, mood, or activity you're aiming for, and Gemini will curate the perfect playlist from your local library.
        </p>
        
        <div className="flex gap-2 max-w-xl mx-auto">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Upbeat synthwave for coding, Calm acoustic evening..."
            className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || library.length === 0}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
          </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>

      {generatedTracks.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Curated Selection</h3>
            <button 
              onClick={playAll}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </button>
          </div>
          
          <div className="space-y-1">
            {generatedTracks.map((track, idx) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track, generatedTracks)}
                className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 rounded flex-shrink-0 relative overflow-hidden">
                  {track.coverArtUrl && <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{track.title}</p>
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
