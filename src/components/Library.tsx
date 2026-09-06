import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, FolderOpen, Music, AlertCircle } from 'lucide-react';
import { extractMetadata } from '../lib/metadata';
import { saveTracks, clearTracks, saveSetting, getSetting } from '../lib/db';
import { formatTime } from '../lib/utils';
import { GlobalSearch } from './GlobalSearch';

export function LibraryView() {
  const { library, setLibrary, playTrack, currentTrack, t } = usePlayer();
  const [isScanning, setIsScanning] = useState(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  
  const filteredLibrary = library;

  useEffect(() => {
    getSetting('music_dir').then(async (handle) => {
      if (handle) {
        setDirHandle(handle);
        try {
          const perm = await handle.queryPermission({ mode: 'read' });
          if (perm !== 'granted') {
            setNeedsPermission(true);
          }
        } catch (e) {
          console.error("Permission query failed", e);
        }
      }
    });
  }, []);

  const restoreAccess = async () => {
    if (dirHandle) {
      try {
        const perm = await dirHandle.requestPermission({ mode: 'read' });
        if (perm === 'granted') {
          setNeedsPermission(false);
        }
      } catch (e) {
        console.error("Permission request failed", e);
      }
    }
  };
  
  const handleSelectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setIsScanning(true);
      setNeedsPermission(false);
      setDirHandle(handle);
      await saveSetting('music_dir', handle);
      
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
      
      await scanDir(handle, handle.name);
      
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
    <div className="px-8 pb-8 pt-8 h-full flex flex-col">
      {needsPermission && library.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Please restore access to your music folder to play tracks.</span>
          </div>
          <button 
            onClick={restoreAccess}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg text-sm transition-colors"
          >
            Restore Access
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white w-1/4">{t.library}</h1>
        
        <div className="flex-1 max-w-xl flex justify-center">
            <GlobalSearch />
        </div>
        
        <div className="w-1/4 flex justify-end">
            <button 
              onClick={handleSelectFolder}
              disabled={isScanning}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <FolderOpen className="w-5 h-5" />
              {isScanning ? t.scanning : t.addFolder}
            </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: List of songs */}
        <div className="flex-1 flex flex-col pr-6">
          {library.length === 0 && !isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
              <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t.noMusic}</p>
              <p className="text-sm">{t.addFolderHint}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar pb-10">
              <div className="grid grid-cols-[1fr_2fr_2fr_1fr] px-4 py-2 text-xs font-medium text-white/40 uppercase tracking-wider border-b border-white/5 mb-4">
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
                    className={`grid grid-cols-[1fr_2fr_2fr_1fr] items-center px-4 py-3 rounded-xl cursor-pointer group transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4 truncate pr-4">
                      <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0 relative overflow-hidden">
                        {track.coverArtUrl ? (
                          <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                        )}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Play className={`w-4 h-4 fill-current text-emerald-400`} />
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
      </div>
    </div>
  );
}
