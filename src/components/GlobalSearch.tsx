import React, { useState, useEffect, useRef } from 'react';
import { Search, History, Music, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLanguage } from '../context/LanguageContext';
import { Track } from '../types';

export function GlobalSearch() {
  const { library, playTrack, currentTrack } = usePlayer();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Track[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('search_history_ids');
    if (saved) {
      try {
        const ids = JSON.parse(saved) as string[];
        const historyTracks = ids
          .map(id => library.find(t => t.id === id))
          .filter((t): t is Track => t !== undefined);
        setHistory(historyTracks);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [library]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlay = (track: Track) => {
    playTrack(track, library);
    setIsOpen(false);
    
    // Add to history
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const newHistory = [track, ...filtered].slice(0, 10);
      localStorage.setItem('search_history_ids', JSON.stringify(newHistory.map(t => t.id)));
      return newHistory;
    });
  };

  const results = query.trim() === '' ? [] : library.filter(tr => 
    tr.title.toLowerCase().includes(query.toLowerCase()) ||
    tr.artist.toLowerCase().includes(query.toLowerCase()) ||
    tr.album.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const showHistory = query.trim() === '' && history.length > 0;

  return (
    <div className="relative w-full flex items-center justify-center z-50" ref={containerRef}>
      <div className={`relative w-full flex items-center bg-zinc-900 border border-white/10 rounded-full shadow-lg transition-all ${isOpen ? 'ring-2 ring-emerald-500/50' : ''}`}>
        <Search className="absolute left-4 w-5 h-5 text-white/40" />
        <input 
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-transparent text-white placeholder-white/40 pl-12 pr-6 py-3 rounded-full focus:outline-none"
        />
        
      </div>

      {isOpen && (showHistory || results.length > 0 || query.trim() !== '') && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {showHistory && (
            <div className="px-4 py-2">
              <h3 className="text-sm font-bold text-white mb-2">{t.searchHistory}</h3>
              <div className="space-y-1">
                {history.map(track => (
                  <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                    <div className="w-12 h-12 bg-white/10 rounded-md overflow-hidden flex-shrink-0">
                      {track.coverArtUrl ? (
                        <img src={track.coverArtUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{track.title}</div>
                      <div className="text-white/50 text-sm truncate">{t.track} • {track.artist}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory(prev => {
                          const newHistory = prev.filter(t => t.id !== track.id);
                          localStorage.setItem('search_history_ids', JSON.stringify(newHistory.map(t => t.id)));
                          return newHistory;
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && results.length > 0 && (
            <div className="px-4 py-2">
              <h3 className="text-sm font-bold text-white mb-2">{t.topResults}</h3>
              <div className="space-y-1">
                {results.map(track => (
                  <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                    <div className="w-12 h-12 bg-white/10 rounded-md overflow-hidden flex-shrink-0">
                      {track.coverArtUrl ? (
                        <img src={track.coverArtUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{track.title}</div>
                      <div className="text-white/50 text-sm truncate">{t.track} • {track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <div className="py-8 text-center text-white/40">
              {t.noResults} "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
