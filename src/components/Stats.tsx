import React, { useState } from 'react';
import { PlayStat, Track } from '../types';
import { formatTime } from '../lib/utils';
import { BarChart, Activity, Clock, Trophy, Music, User, LogIn, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle, logout } from '../lib/firebase';

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
  
  const topArtist = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])[0] || ['-', 0];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-32">
      {/* Profile Header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          {user && user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-16 h-16 rounded-full border border-emerald-500/30 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{user ? user.displayName : t.guest}</h2>
            <p className="text-white/50 text-sm">{user ? user.email : 'Local profile'}</p>
          </div>
        </div>
        {user ? (
          <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        ) : (
          <button onClick={loginWithGoogle} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
            <LogIn className="w-4 h-4" />
            {t.loginWithGoogle}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mt-8 mb-4">
        <BarChart className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight text-white">{t.localWrapped}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />
          <Clock className="w-6 h-6 text-emerald-400 mb-4" />
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{t.totalTime}</p>
          <p className="text-3xl font-bold text-white mt-2">{formatTime(totalPlayTime)}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
          <Activity className="w-6 h-6 text-blue-400 mb-4" />
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{t.totalPlays}</p>
          <p className="text-3xl font-bold text-white mt-2">{totalPlays}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors" />
          <Trophy className="w-6 h-6 text-purple-400 mb-4" />
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{t.topArtist}</p>
          <p className="text-2xl font-bold text-white mt-2 truncate">{topArtist[0]}</p>
        </div>
      </div>
      
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">{t.topTracks}</h2>
        <div className="space-y-3">
          {topTracks.length === 0 ? (
            <p className="text-white/40 text-center py-8">{t.keepListening}</p>
          ) : (
            topTracks.map((item, idx) => {
              const isExpanded = expandedTrackId === item.track!.id;
              const pct = totalPlayTime > 0 ? Math.round((item.stat.totalPlayTime / totalPlayTime) * 100) : 0;
              
              return (
                <div key={item.track!.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setExpandedTrackId(isExpanded ? null : item.track!.id)}
                  >
                    <div className="w-8 text-center text-white/30 font-bold text-lg">{idx + 1}</div>
                    <div className="w-14 h-14 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden shadow-sm">
                      {item.track!.coverArtUrl ? (
                        <img src={item.track!.coverArtUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-6 h-6"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 px-2">
                      <p className="text-white font-semibold truncate text-lg">{item.track!.title}</p>
                      <p className="text-white/50 text-sm truncate">{item.track!.artist}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-emerald-400/90 font-mono font-medium">{item.stat.playCount} {t.plays}</p>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-16 pb-6 pt-2 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{t.trackDetails}</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         <div>
                           <p className="text-white/50 text-xs mb-1">{t.time}</p>
                           <p className="text-white font-mono">{formatTime(item.stat.totalPlayTime)}</p>
                         </div>
                         <div>
                           <p className="text-white/50 text-xs mb-1">{t.percentOfTotal}</p>
                           <p className="text-white font-mono">{pct}%</p>
                         </div>
                         <div>
                           <p className="text-white/50 text-xs mb-1">{t.lastPlayed}</p>
                           <p className="text-white font-mono text-sm">{new Date(item.stat.lastPlayed).toLocaleDateString()}</p>
                         </div>
                         <div>
                           <p className="text-white/50 text-xs mb-1">{t.album}</p>
                           <p className="text-white truncate text-sm">{item.track!.album}</p>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
