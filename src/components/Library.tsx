import React, { useState } from 'react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Search, Play, FolderOpen, Music } from 'lucide-react';
import { extractMetadata } from '../lib/metadata';
import { saveTracks, clearTracks } from '../lib/db';
import { formatTime } from '../lib/utils';

export function LibraryView() {
  const { library, setLibrary, playTrack, currentTrack, t } = usePlayer();
  const [isScanning, setIsScanning] = useState(false);
  
  const filteredLibrary = library;
  
  const handleSelectFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      setIsScanning(true);
      
      const tracks: Track[] = [];
      
      async function scanDir(dirHandle: FileSystemDirectoryHandle, currentPath: string) {
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop()?.toLowerCase();
            if (['mp3', 'flac', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
              const fileHandle = entry as FileSystemFileHandle;
              const metadata = await extractMetadata(fileHandle, `${currentPath}/${entry.name}`);
              tracks.push(metadata);
            }
          } else if (entry.kind === 'directory') {
            await scanDir(entry as FileSystemDirectoryHandle, `${currentPath}/${entry.name}`);
          }
        }
      }
      
      await scanDir(dirHandle, dirHandle.name);
      
      await clearTracks();
      await saveTracks(tracks);
      setLibrary(tracks);
      setIsScanning(false);
      
    } catch (err) {
      console.error("User cancelled or error scanning:", err);
      setIsScanning(false);
    }
  };

  return (
    <div className="px-8 pb-8 h-full flex flex-col pt-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t.library}</h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSelectFolder}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            {isScanning ? t.scanning : t.addFolder}
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: List of songs */}
        <div className="flex-1 flex flex-col pr-6 border-r border-white/5">
          {library.length === 0 && !isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
              <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">{t.noMusic}</p>
              <p className="text-sm">{t.addFolderHint}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-4 space-y-1 custom-scrollbar pb-10">
              <div className="grid grid-cols-[1fr_2fr_2fr_1fr] px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 mb-2">
                <span>{t.title}</span>
                <span>{t.artist}</span>
                <span>{t.album}</span>
                <span className="text-right">{t.time}</span>
              </div>
              
              {filteredLibrary.map((track) => {
                const isPlaying = currentTrack?.id === track.id;
                return (
                  <div 
                    key={track.id}
                    onClick={() => playTrack(track, filteredLibrary)}
                    className={`grid grid-cols-[1fr_2fr_2fr_1fr] items-center px-4 py-3 rounded-lg cursor-pointer group transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4 truncate pr-4">
                      <div className="w-10 h-10 bg-white/10 rounded-md overflow-hidden flex-shrink-0 relative shadow-sm">
                        {track.coverArtUrl ? (
                          <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-4 h-4"/></div>
                        )}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Play className={`w-4 h-4 fill-current ${isPlaying ? 'text-emerald-400' : 'text-white'}`} />
                        </div>
                      </div>
                      <span className={`font-medium truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>{track.title}</span>
                    </div>
                    <div className="text-white/60 truncate pr-4 text-sm">{track.artist}</div>
                    <div className="text-white/60 truncate pr-4 text-sm">{track.album}</div>
                    <div className="text-white/60 text-right text-sm font-mono">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column: Spotify-style Now Playing Details */}
        <div className="hidden lg:flex w-80 flex-col pl-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 mt-2 self-start">{t.nowPlaying}</h3>
          
          {currentTrack ? (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-6 bg-white/5 relative group border border-white/5">
                {currentTrack.coverArtUrl ? (
                  <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Music className="w-16 h-16 text-white/20"/></div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight text-center w-full truncate px-4">{currentTrack.title}</h2>
              <p className="text-white/60 text-lg mb-8 text-center w-full truncate px-4">{currentTrack.artist}</p>

              <div className="w-full bg-white/5 rounded-xl p-4 flex flex-col gap-3 border border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">{t.album}</span>
                  <span className="text-white truncate ml-4 font-medium">{currentTrack.album}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">{t.time}</span>
                  <span className="text-white font-mono">{formatTime(currentTrack.duration)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/30 text-center mt-32 flex flex-col items-center">
              <Music className="w-16 h-16 mb-4 opacity-30" />
              <p>{t.selectTrack}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
