const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix profile block height to match PlayerBar (h-28)
code = code.replace(
  /<div className="h-24 px-6 border-t border-white\/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center">/,
  '<div className="h-28 px-6 border-t border-white/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center shadow-2xl">'
);

// Add custom title drag region at the top of Sidebar and Main View to allow moving the window
code = code.replace(
  /<div className="w-64 flex-shrink-0 flex flex-col bg-zinc-950 border-r border-white\/5 z-20">/,
  '<div className="w-64 flex-shrink-0 flex flex-col bg-zinc-950 border-r border-white/5 z-20" style={{ WebkitAppRegion: "drag" } as any}>'
);

// Make the nav and profile area no-drag so buttons still work
code = code.replace(
  /<nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">/,
  '<nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar" style={{ WebkitAppRegion: "no-drag" } as any}>'
);
code = code.replace(
  /<div className="h-28 px-6 border-t border-white\/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center shadow-2xl">/,
  '<div className="h-28 px-6 border-t border-white/5 bg-zinc-950 flex-shrink-0 flex items-center justify-center shadow-2xl" style={{ WebkitAppRegion: "no-drag" } as any}>'
);

// We need a draggable top bar for the main content area too, so you can drag from the center top
code = code.replace(
  /<div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">/,
  `<div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
            {/* Drag region for main area */}
            <div className="absolute top-0 left-0 right-0 h-8 z-50 pointer-events-none" style={{ WebkitAppRegion: "drag" } as any} />`
);

// Hide Right Sidebar when empty and use translations for Right Sidebar
code = code.replace(
  /\{currentTrack \? \([\s\S]*?\) : \([\s\S]*?<\/[a-z]+>\s*\)\}/,
  `{currentTrack && (
              <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                 <div className="flex items-center gap-2 text-white/50 mb-2">
                    <Disc className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t.nowPlaying || "Now Playing"}</span>
                 </div>
                 <div className="w-full aspect-square rounded-sm overflow-hidden bg-white/5 border border-white/5 relative shadow-2xl">
                    {currentTrack.coverArtUrl ? (
                      <img src={currentTrack.coverArtUrl} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-16 h-16"/></div>
                    )}
                 </div>
                 <div className="flex flex-col text-center">
                    <h4 className="text-white font-bold text-xl mb-1">{currentTrack.title}</h4>
                    <p className="text-white/60 text-base">{currentTrack.artist}</p>
                 </div>
                 <div className="bg-white/5 rounded-sm p-4 flex flex-col gap-3 text-sm mt-2 border border-white/5">
                    <div className="flex justify-between items-center">
                       <span className="text-white/40">{t.album || "Album"}</span>
                       <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.album || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-white/40">{t.genre || "Genre"}</span>
                       <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.genre || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-white/40">{t.duration || "Duration"}</span>
                       <span className="text-white text-right font-mono font-medium">{Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}</span>
                    </div>
                 </div>
              </div>
            )}`
);

// Conditionally render the right sidebar wrapper
code = code.replace(
  /<div className="w-80 flex-shrink-0 bg-zinc-950 border-l border-white\/5 flex flex-col z-20">/,
  '{currentTrack && <div className="w-80 flex-shrink-0 bg-zinc-950 border-l border-white/5 flex flex-col z-20">'
);
code = code.replace(
  /<\/div>\s*<\/div>\s*\{\/\* Player Bar \*\/\}/,
  '</div>}\n        </div>\n\n        {/* Player Bar */}'
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx UI updated!");
