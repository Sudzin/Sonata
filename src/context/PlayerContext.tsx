import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Track } from "../types";
import { engine } from "../lib/audio";
import { updateTrackStat } from "../lib/db";

interface PlayerContextType {
  library: Track[];
  queue: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  
  setLibrary: (tracks: Track[]) => void;
  playTrack: (track: Track, forceQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [library, setLibrary] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  
  const currentObjectUrl = useRef<string | null>(null);
  
  useEffect(() => {
    engine.onTimeUpdate = (time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    };
    engine.onEnded = () => {
      // Record stat when finished
      if (currentTrackIndex !== -1 && queue[currentTrackIndex]) {
        updateTrackStat(queue[currentTrackIndex].id, duration);
      }
      nextTrack();
    };
    
    // Check playing state periodically (backup for Media Session API)
    const int = setInterval(() => {
      setIsPlaying(engine.isPlaying());
    }, 500);
    return () => clearInterval(int);
  }, [currentTrackIndex, queue, duration]);

  const setVolume = (val: number) => {
    setVolumeState(val);
    engine.setVolume(val);
  };

  const playTrack = async (track: Track, forceQueue?: Track[]) => {
    try {
      const q = forceQueue || queue.length > 0 ? queue : library;
      if (forceQueue) setQueue(forceQueue);
      else if (queue.length === 0) setQueue(library);
      
      const idx = (forceQueue || q).findIndex((t) => t.id === track.id);
      setCurrentTrackIndex(idx !== -1 ? idx : 0);
      
      // Cleanup previous blob URL
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      
      // We must get a fresh File from the handle because it might have expired/changed,
      // and we need to verify permission.
      // Note: in a real app, you should check verifyPermission() first.
      const file = await track.fileHandle.getFile();
      const url = URL.createObjectURL(file);
      currentObjectUrl.current = url;
      
      await engine.playTrack(url, true);
      setIsPlaying(true);
      
      // Update Media Session API
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: track.coverArtUrl ? [{ src: track.coverArtUrl, sizes: '512x512', type: 'image/png' }] : [],
        });
        navigator.mediaSession.setActionHandler("play", togglePlay);
        navigator.mediaSession.setActionHandler("pause", togglePlay);
        navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
        navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
      }
      
    } catch (err) {
      console.error("Failed to play track:", err);
      // Usually due to permissions, might need to prompt user
    }
  };

  const togglePlay = () => {
    engine.togglePlay();
    setIsPlaying(engine.isPlaying());
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= queue.length) nextIdx = 0; // loop
    playTrack(queue[nextIdx], queue);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      engine.seek(0);
      return;
    }
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    playTrack(queue[prevIdx], queue);
  };

  const seek = (time: number) => {
    engine.seek(time);
    setCurrentTime(time);
  };
  
  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    // Real implementation would shuffle the remaining queue
  };

  const currentTrack = currentTrackIndex !== -1 ? queue[currentTrackIndex] : null;

  return (
    <PlayerContext.Provider
      value={{
        library,
        queue,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffled,
        setLibrary,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleShuffle
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
