import { useState, useEffect, useCallback, useRef } from 'react';
import { engine } from '../lib/audio';

export function usePlayback(onTrackEnd: () => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onTrackEndRef = useRef(onTrackEnd);
  
  useEffect(() => {
    onTrackEndRef.current = onTrackEnd;
  }, [onTrackEnd]);

  useEffect(() => {
    engine.onTimeUpdate = (time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    };
    
    engine.onEnded = () => {
      if (onTrackEndRef.current) {
        onTrackEndRef.current();
      }
    };
    
    // Check playing state periodically (backup for Media Session API)
    const int = setInterval(() => {
      setIsPlaying(engine.isPlaying());
    }, 500);
    
    return () => clearInterval(int);
  }, []);

  const togglePlay = useCallback(() => {
    engine.togglePlay();
    setIsPlaying(engine.isPlaying());
  }, []);

  const seek = useCallback((time: number) => {
    engine.seek(time);
    setCurrentTime(time);
  }, []);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    togglePlay,
    seek
  };
}
