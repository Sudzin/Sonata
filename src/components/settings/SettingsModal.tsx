import React, { useState } from 'react';
import { X, User, LogOut, LogIn, BarChart, ChevronDown } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { loginWithGoogle, logout, auth } from '../../lib/firebase';

interface SettingsModalProps {
  onClose: () => void;
  setActiveTab: (tab: "library" | "albums" | "stats" | "ai" | "eq") => void;
  user: any;
}

export function SettingsModal({ onClose, setActiveTab, user }: SettingsModalProps) {
  const { language, setLanguage, t } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-zinc-950 border border-white/10 rounded-sm w-full max-w-md p-6 shadow-none animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t.settings}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          
          {/* Profile Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">{t.account}</label>
            <div className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="text-base font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                  <span className="text-xs text-white/40">{user ? 'Google account' : 'Local profile'}</span>
                </div>
              </div>
              {auth && (
                <button 
                  onClick={() => { if(user) logout(); else loginWithGoogle(); }} 
                  className="text-white hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm flex-shrink-0 flex items-center gap-2 text-sm"
                >
                   {user ? <><LogOut className="w-4 h-4" /> {t.logout}</> : <><LogIn className="w-4 h-4" /> Login</>}
                </button>
              )}
            </div>
          </div>

          {/* Statistics Block */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">{t.profile}</label>
            <button 
              onClick={() => { setActiveTab('stats'); onClose(); }}
              className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 text-white flex items-center justify-between hover:border-white/30 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center">
                    <BarChart className="w-4 h-4 text-white" />
                 </div>
                 <span className="font-medium">{t.localWrapped}</span>
              </div>
              <span className="text-white/40 group-hover:text-white/60 transition-colors text-sm">&rarr;</span>
            </button>
          </div>

          {/* Language Block */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-white/60">{t.language}</label>
            <div 
              className="w-full bg-zinc-900 border border-white/10 rounded-sm px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{language === 'en' ? t.english : t.russian}</span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-sm overflow-hidden shadow-none z-10 animate-in fade-in slide-in-from-top-2">
                <div 
                  className={`px-4 py-3 cursor-pointer transition-colors ${language === 'en' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => { setLanguage('en'); setIsOpen(false); }}
                >
                  {t.english}
                </div>
                <div 
                  className={`px-4 py-3 cursor-pointer transition-colors ${language === 'ru' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => { setLanguage('ru'); setIsOpen(false); }}
                >
                  {t.russian}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
