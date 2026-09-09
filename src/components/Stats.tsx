import React, { useState } from 'react';
import { PlayStat, Track } from '../types';
import { formatTime } from '../lib/utils';
import { BarChart, Activity, Clock, Trophy, Music, User, LogIn, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle, logout, auth } from '../lib/firebase';
import { GlobalSearch } from './GlobalSearch';

interface StatsProps {
  stats: PlayStat[];
  library: Track[];
}

export function StatsView({ stats, library }: StatsProps) {
  const { t } = usePlayer();
  const { user } = useAuth();
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  
  // Compute top tracks
  const topTracks = [...stats]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 10)
    .map(stat => ({
      stat,
      track: library.find(tr => tr.id === stat.trackId)
    }))
    .filter(tr => tr.track !== undefined);
    
  const totalPlayTime = stats.reduce((acc, curr) => acc + curr.totalPlayTime, 0);
  const totalPlays = stats.reduce((acc, curr) => acc + curr.playCount, 0);
  
  // Compute top artist
  const artistCounts: Record<string, number> = {};
  stats.forEach(stat => {
    const track = library.find(tr => tr.id === stat.trackId);
    if (track) {
      artistCounts[track.artist] = (artistCounts[track.artist] || 0) + stat.playCount;
    }
  });
  
  let topArtist = "Unknown";
  let maxArtistPlays = 0;
  for (const [artist, count] of Object.entries(artistCounts)) {
    if (count > maxArtistPlays) {
      topArtist = artist;
      maxArtistPlays = count;
    }
  }

  return (
    <div className="px-8 pb-8 pt-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white w-1/4">{t.profile}</h1>
        
        <div className="flex-1 max-w-xl flex justify-center">
            <GlobalSearch />
        </div>
        
        <div className="w-1/4 flex justify-end"></div>
      </div>
      
      {!user && auth && (
         <div className="bg-white/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
             <h3 className="text-white font-bold mb-1">Unlock Cloud Sync</h3>
             <p className="text-white/60 text-sm">Sign in to save your listening history, AI playlists, and equalizer presets across devices.</p>
           </div>
           <button 
             onClick={loginWithGoogle}
             className="px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-2"
           >
             <LogIn className="w-4 h-4" />
             {t.loginWithGoogle}
           </button>
         </div>
      )}

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/5 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-indigo-500/20 group-hover:scale-110 transition-transform">
            <Clock className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-300 text-sm font-medium mb-1 uppercase tracking-wider">{t.totalTime}</p>
            <p className="text-4xl font-black text-white">{formatTime(totalPlayTime)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-white/10 group-hover:scale-110 transition-transform">
            <Activity className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <p className="text-white text-sm font-medium mb-1 uppercase tracking-wider">{t.totalPlays}</p>
            <p className="text-4xl font-black text-white">{totalPlays}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/20 to-orange-500/5 border border-rose-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-rose-500/20 group-hover:scale-110 transition-transform">
            <Trophy className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <p className="text-rose-300 text-sm font-medium mb-1 uppercase tracking-wider">{t.topArtist}</p>
            <p className="text-2xl font-black text-white truncate pr-16">{maxArtistPlays > 0 ? topArtist : '-'}</p>
            <p className="text-rose-200/50 text-xs mt-1">{maxArtistPlays} {t.plays}</p>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-white" />
        {t.topTracks}
      </h2>
      
      {topTracks.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
          <Music className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">{t.keepListening}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topTracks.map(({stat, track}, index) => {
            const isExpanded = expandedTrackId === track!.id;
            const percentage = totalPlayTime > 0 ? ((stat.totalPlayTime / totalPlayTime) * 100).toFixed(1) : '0';
            
            return (
              <div key={track!.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all hover:bg-zinc-900">
                <div 
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedTrackId(isExpanded ? null : track!.id)}
                >
                  <div className="w-8 text-center font-mono font-bold text-white/30 text-lg">
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex-shrink-0 relative overflow-hidden">
                     {track!.coverArtUrl ? (
                       <img src={track!.coverArtUrl} className="w-full h-full object-cover" alt="" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-5 h-5"/></div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate text-base">{track!.title}</h4>
                    <p className="text-white/50 text-sm truncate">{track!.artist}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-medium">{stat.playCount} {t.plays}</p>
                    <p className="text-white/40 text-xs">{formatTime(stat.totalPlayTime)}</p>
                  </div>
                  <div className="text-white/30 p-2">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-16 pb-6 pt-2 text-sm text-white/60 bg-black/20 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="mb-1"><span className="text-white/40">{t.lastPlayed}:</span> {new Date(stat.lastPlayed).toLocaleString()}</p>
                         <p><span className="text-white/40">{t.percentOfTotal}:</span> {percentage}%</p>
                       </div>
                       <div>
                         <p className="mb-1"><span className="text-white/40">{t.album}:</span> {track!.album || '-'}</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
