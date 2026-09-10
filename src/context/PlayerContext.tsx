import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Track } from "../types";
import { engine } from "../lib/audio";
import { updateTrackStat } from "../lib/db";
import { useLibrary } from "./LibraryContext";
import { useQueue } from "../hooks/useQueue";
import { usePlayback } from "../hooks/usePlayback";

interface PlayerContextType {
  queue: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  
  playTrack: (track: Track, forceQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (queue: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { library } = useLibrary();
  
  const {
    queue,
    currentTrackIndex,
    currentTrack,
    isShuffled,
    repeatMode,
    setQueue,
    playItem,
    toggleShuffle,
    toggleRepeat,
    getNextTrack,
    getPrevTrack
  } = useQueue();

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    togglePlay,
    seek
  } = usePlayback(() => {
    if (currentTrackIndex !== -1 && queue[currentTrackIndex]) {
      updateTrackStat(queue[currentTrackIndex].id, duration);
    }
    nextTrack();
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('sonata_volume');
    return saved ? parseFloat(saved) : 1;
  });
  
  const currentObjectUrl = useRef<string | null>(null);
  
  useEffect(() => {
    engine.setVolume(volume);
  }, []);

  useEffect(() => {
    localStorage.setItem('sonata_volume', volume.toString());
  }, [volume]);


  const setVolume = (val: number) => {
    setVolumeState(val);
    engine.setVolume(val);
  };

  const playTrack = async (track: Track, forceQueue?: Track[]) => {
    try {
      const { track: actualTrack } = playItem(track, forceQueue || (queue.length === 0 ? library : undefined));
      
      // Cleanup previous blob URL
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      
      const file = await actualTrack.fileHandle.getFile();
      const url = URL.createObjectURL(file);
      currentObjectUrl.current = url;
      
      await engine.playTrack(url, true);
      setIsPlaying(true);
      
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
    }
  };

  const nextTrack = () => {
    const next = getNextTrack();
    if (next) playTrack(next.track, queue);
  };

  const prevTrack = () => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const prev = getPrevTrack();
    if (prev) playTrack(prev.track, queue);
  };

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffled,
        repeatMode,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat
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
}
