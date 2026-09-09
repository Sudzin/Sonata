import { useState, useEffect } from 'react';
import { getAllTracks, getAllStats } from '../lib/db';
import { usePlayer } from '../context/PlayerContext';
import { PlayStat } from '../types';

export function useAppInit() {
  const { setLibrary, library } = usePlayer();
  const [stats, setStats] = useState<PlayStat[]>([]);

  useEffect(() => {
    async function load() {
      const savedTracks = await getAllTracks();
      if (savedTracks.length > 0) setLibrary(savedTracks);
      
      const savedStats = await getAllStats();
      setStats(savedStats);
    }
    load();
  }, [setLibrary]);

  return { stats, library };
}
