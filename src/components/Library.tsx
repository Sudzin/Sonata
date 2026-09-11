import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useLanguage } from '../context/LanguageContext';
import { Play, FolderOpen, Music } from 'lucide-react';
import { extractMetadata } from '../lib/metadata';
import { saveTracks, clearTracks, saveSetting, getSetting } from '../lib/db';
import { formatTime } from '../lib/utils';
import { PageHeader } from './layout/PageHeader';

export function LibraryView() {
  const { playTrack, currentTrack } = usePlayer();
  const { library, setLibrary } = useLibrary();
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  
  const filteredLibrary = library;

  
  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.electron!.selectMusicFolder();
      if (!folderPath) return; // User cancelled

      setIsScanning(true);
      // We don't save handles anymore, we just save the string path
      await saveSetting('music_dir_path', folderPath);
      
      const filePaths = await window.electron!.scanMusicFolder(folderPath);
      const tracks: Track[] = [];
      
      // Process sequentially to not overload IPC/memory
      for (const filePath of filePaths) {
        try {
          const metadata = await extractMetadata(filePath);
          tracks.push(metadata);
        } catch (e) {
          console.error("Failed to extract metadata for:", filePath, e);
        }
      }
      
      await clearTracks();
      await saveTracks(tracks);
      setLibrary(tracks);
      setIsScanning(false);
    } catch (err) {
      console.error("Error scanning:", err);
      setIsScanning(false);
    }
  };

  return (
    <div className="px-8 pb-8 pt-8 h-full flex flex-col">

      <PageHeader title={t.library} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: List of songs */}
        <div className="flex-1 flex flex-col pr-6">
          {isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/50">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-lg font-medium">{t.scanning}</p>
            </div>
          ) : library.length === 0 ? (
            <button 
              onClick={handleSelectFolder}
              className="flex-1 flex flex-col items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-3xl border-2 border-dashed border-white/10 hover:border-white/20 transition-all m-4 group cursor-pointer"
            >
              <div className="p-6 rounded-full bg-white/5 mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                <FolderOpen className="w-12 h-12" />
              </div>
              <p className="text-xl font-medium mb-2">{t.noMusic}</p>
              <p className="text-sm text-white/50">{t.addFolderHint}</p>
            </button>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar pb-10">
              <div className="grid grid-cols-[5fr_3fr_3fr_1fr] px-4 py-2 text-xs font-medium text-white/40 uppercase tracking-wider border-b border-white/5 mb-4">
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
                    className={`grid grid-cols-[5fr_3fr_3fr_1fr] items-center px-4 py-3 rounded-xl cursor-pointer group transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4 truncate pr-4">
                      <div className="w-10 h-10 rounded-md bg-white/5 shrink-0 relative overflow-hidden">
                        {track.coverArtUrl ? (
                          <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                        )}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Play className={`w-4 h-4 fill-current text-white`} />
                        </div>
                      </div>
                      <span className={`font-medium truncate ${isPlaying ? 'text-white' : 'text-white'}`}>{track.title}</span>
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
      </div>
    </div>
  );
}
