import React, { useState } from 'react';
import { PlayStat, Track } from '../types';
import { formatTime } from '../lib/utils';
import { BarChart, Activity, Clock, Trophy } from 'lucide-react';

interface StatsProps {
  stats: PlayStat[];
  library: Track[];
}

export function StatsView({ stats, library }: StatsProps) {
  // Compute top tracks
  const topTracks = [...stats]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 10)
    .map(stat => ({
      stat,
      track: library.find(t => t.id === stat.trackId)
    }))
    .filter(t => t.track !== undefined);
    
  const totalPlayTime = stats.reduce((acc, curr) => acc + curr.totalPlayTime, 0);
  const totalPlays = stats.reduce((acc, curr) => acc + curr.playCount, 0);
  
  // Compute top artist
  const artistCounts: Record<string, number> = {};
  stats.forEach(stat => {
    const track = library.find(t => t.id === stat.trackId);
    if (track) {
      artistCounts[track.artist] = (artistCounts[track.artist] || 0) + stat.playCount;
    }
  });
  
  const topArtist = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <BarChart className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight text-white">Local Wrapped</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />
          <Clock className="w-6 h-6 text-emerald-400 mb-4" />
          <p className="text-white/50 text-sm font-medium">Total Listening Time</p>
          <p className="text-3xl font-bold text-white mt-1">{formatTime(totalPlayTime)}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
          <Activity className="w-6 h-6 text-blue-400 mb-4" />
          <p className="text-white/50 text-sm font-medium">Total Plays</p>
          <p className="text-3xl font-bold text-white mt-1">{totalPlays}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors" />
          <Trophy className="w-6 h-6 text-purple-400 mb-4" />
          <p className="text-white/50 text-sm font-medium">Top Artist</p>
          <p className="text-2xl font-bold text-white mt-1 truncate">{topArtist[0]}</p>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Top Tracks</h2>
        <div className="space-y-2">
          {topTracks.length === 0 ? (
            <p className="text-white/40">Keep listening to generate your top tracks!</p>
          ) : (
            topTracks.map((item, idx) => (
              <div key={item.track!.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-8 text-center text-white/30 font-bold">{idx + 1}</div>
                <div className="w-12 h-12 rounded bg-white/10 flex-shrink-0 overflow-hidden">
                  {item.track!.coverArtUrl && (
                    <img src={item.track!.coverArtUrl} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.track!.title}</p>
                  <p className="text-white/50 text-sm truncate">{item.track!.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 font-mono text-sm">{item.stat.playCount} plays</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
