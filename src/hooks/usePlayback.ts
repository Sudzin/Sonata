import { useState, useEffect, useCallback, useRef } from 'react';
import { engine } from '../lib/audio';

export function usePlayback(onTrackEnd: () => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem('sonata_current_time');
    return saved ? parseFloat(saved) : 0;
  });
  const [duration, setDuration] = useState(0);

  const currentTimeRef = useRef(currentTime);
  const onTrackEndRef = useRef(onTrackEnd);
  
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    onTrackEndRef.current = onTrackEnd;
  }, [onTrackEnd]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.setItem('sonata_current_time', currentTimeRef.current.toString());
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

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
