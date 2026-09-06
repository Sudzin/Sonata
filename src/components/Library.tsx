import React, { useState } from 'react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Search, Play, FolderOpen } from 'lucide-react';
import { extractMetadata } from '../lib/metadata';
import { saveTracks, clearTracks } from '../lib/db';

export function LibraryView() {
  const { library, setLibrary, playTrack } = usePlayer();
  const [search, setSearch] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  
  const filteredLibrary = library.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.album.toLowerCase().includes(search.toLowerCase())
  );
  
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
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-white/30 transition-colors w-64"
            />
          </div>
          <button 
            onClick={handleSelectFolder}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            {isScanning ? "Scanning..." : "Add Folder"}
          </button>
        </div>
      </div>
      
      {library.length === 0 && !isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">No music found.</p>
          <p className="text-sm">Click "Add Folder" to scan for local tracks.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-4 space-y-1">
          <div className="grid grid-cols-[1fr_2fr_2fr_1fr] px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 mb-2">
            <span>Title</span>
            <span>Artist</span>
            <span>Album</span>
            <span className="text-right">Time</span>
          </div>
          
          {filteredLibrary.map((track) => (
            <div 
              key={track.id}
              onClick={() => playTrack(track)}
              className="grid grid-cols-[1fr_2fr_2fr_1fr] items-center px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-3 truncate pr-4">
                <div className="w-10 h-10 bg-white/10 rounded overflow-hidden flex-shrink-0 relative">
                  {track.coverArtUrl && <img src={track.coverArtUrl} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <span className="text-white font-medium truncate">{track.title}</span>
              </div>
              <div className="text-white/60 truncate pr-4 text-sm">{track.artist}</div>
              <div className="text-white/60 truncate pr-4 text-sm">{track.album}</div>
              <div className="text-white/60 text-right text-sm font-mono">
                {Math.floor(track.duration / 60)}:{(Math.floor(track.duration % 60)).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
