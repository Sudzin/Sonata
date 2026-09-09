import React from 'react';
import { User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlayer } from '../../context/PlayerContext';
import { useLanguage } from '../../context/LanguageContext';

export function UserProfile({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { user } = useAuth();
  const {  } = usePlayer();
  const { t } = useLanguage();

  return (
    <div className="h-28 px-6 border-t border-white/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center shadow-2xl" style={{ WebkitAppRegion: "no-drag" } as any}>
      <div 
        className="w-full px-4 py-3 bg-white/5 rounded-sm flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors cursor-pointer" 
        onClick={onOpenSettings}
      >
        <div className="flex items-center gap-3 truncate">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-sm flex-shrink-0 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-medium text-white truncate">
              {user ? (user.displayName || user.email?.split('@')[0]) : t.guest}
            </span>
            <span className="text-[10px] text-white/40 truncate">
              {user ? 'Google account' : 'Local profile'}
            </span>
          </div>
        </div>
        <button className="text-white hover:text-white/80 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm flex-shrink-0">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
