import { useState, useCallback } from 'react';
import { Track } from '../types';

export function useQueue() {
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < queue.length 
    ? queue[currentTrackIndex] 
    : null;

  const setQueue = useCallback((newQueue: Track[]) => {
    setOriginalQueue(newQueue);
    if (isShuffled) {
      const shuffled = [...newQueue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQueueState(shuffled);
    } else {
      setQueueState(newQueue);
    }
  }, [isShuffled]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const next = !prev;
      if (next) {
        if (queue.length > 0 && currentTrackIndex !== -1) {
          const current = queue[currentTrackIndex];
          const others = queue.filter((_, i) => i !== currentTrackIndex);
          for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
          }
          setQueueState([current, ...others]);
          setCurrentTrackIndex(0);
        }
      } else {
        setQueueState(originalQueue);
        if (currentTrackIndex !== -1) {
          const current = queue[currentTrackIndex];
          const originalIdx = originalQueue.findIndex(t => t.id === current.id);
          setCurrentTrackIndex(originalIdx !== -1 ? originalIdx : 0);
        }
      }
      return next;
    });
  }, [queue, originalQueue, currentTrackIndex]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const getNextTrack = useCallback(() => {
    if (queue.length === 0) return null;
    if (repeatMode === 'one') {
      return { track: queue[currentTrackIndex], index: currentTrackIndex };
    }
    
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= queue.length) {
      nextIdx = 0; // loop to start
    }
    return { track: queue[nextIdx], index: nextIdx };
  }, [queue, currentTrackIndex, repeatMode]);

  const getPrevTrack = useCallback(() => {
    if (queue.length === 0) return null;
    if (repeatMode === 'one') {
      return { track: queue[currentTrackIndex], index: currentTrackIndex };
    }

    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    return { track: queue[prevIdx], index: prevIdx };
  }, [queue, currentTrackIndex, repeatMode]);

  const playItem = useCallback((track: Track, forceQueue?: Track[]) => {
    let nextOriginal = forceQueue || originalQueue;
    let nextQueue = nextOriginal;

    if (forceQueue) {
      setOriginalQueue(forceQueue);
      if (isShuffled) {
        const others = forceQueue.filter(t => t.id !== track.id);
        for (let i = others.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [others[i], others[j]] = [others[j], others[i]];
        }
        nextQueue = [track, ...others];
      }
      setQueueState(nextQueue);
    }

    const idx = nextQueue.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }

    return { track, queue: nextQueue, index: idx };
  }, [originalQueue, isShuffled]);

  return {
    queue,
    originalQueue,
    currentTrackIndex,
    currentTrack,
    isShuffled,
    repeatMode,
    setQueue,
    playItem,
    setCurrentTrackIndex,
    toggleShuffle,
    toggleRepeat,
    getNextTrack,
    getPrevTrack
  };
}
