import React, { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useLanguage } from '../context/LanguageContext';
import { Music, Play } from 'lucide-react';
import { Track } from '../types';
import { PageHeader } from './layout/PageHeader';

export function AlbumsView() {
  const { playTrack, currentTrack } = usePlayer();
  const { library } = useLibrary();
  const { t } = useLanguage();
  
  const albums = useMemo(() => {
    const map = new Map<string, Track[]>();
    library.forEach(track => {
      const albumName = track.album || 'Unknown Album';
      if (!map.has(albumName)) map.set(albumName, []);
      map.get(albumName)!.push(track);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [library]);

  if (library.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/30 h-full">
        <p className="text-lg">{t.noMusic}</p>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8 pt-8 h-full overflow-y-auto custom-scrollbar">
      <PageHeader title={t.albums} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-24">
        {albums.map(([albumName, tracks]) => {
          const coverTrack = tracks.find(t => t.coverArtUrl) || tracks[0];
          const isPlayingFromAlbum = currentTrack && tracks.some(t => t.id === currentTrack.id);
          
          return (
            <div 
              key={albumName}
              className="bg-zinc-900/5 rounded-2xl p-4 border border-white/10 hover:bg-zinc-900/10 transition-colors group cursor-pointer"
              onClick={() => playTrack(tracks[0], tracks)}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900/10 relative shadow-lg mb-4">
                {coverTrack?.coverArtUrl ? (
                  <img src={coverTrack.coverArtUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={albumName} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-12 h-12"/></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 rounded-full bg-emerald-400 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </button>
                </div>
              </div>
              <h3 className={`font-bold truncate ${isPlayingFromAlbum ? 'text-emerald-400' : 'text-white'}`}>{albumName}</h3>
              <p className="text-white/40 text-sm truncate">{coverTrack?.artist}</p>
              <p className="text-white/30 text-xs mt-1">{t.tracksPlural(tracks.length)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
