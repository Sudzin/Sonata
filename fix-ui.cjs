const fs = require('fs');

// 1. Fix App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// Replace emerald colors in App.tsx
appStr = appStr.replace(/bg-emerald-500\/20/g, 'bg-white/10');
appStr = appStr.replace(/text-emerald-400/g, 'text-white');
appStr = appStr.replace(/hover:text-emerald-400/g, 'hover:text-white');
appStr = appStr.replace(/hover:text-emerald-300/g, 'hover:text-white/80');
appStr = appStr.replace(/bg-emerald-500\/10/g, 'bg-white/5');
appStr = appStr.replace(/hover:bg-emerald-500\/20/g, 'hover:bg-white/10');
appStr = appStr.replace(/selection:bg-emerald-500\/30/g, 'selection:bg-white/20');

// Inject Right Panel into MainLayout
const rightPanelCode = `
      {/* Right Sidebar (Track Details) */}
      <div className="w-80 flex-shrink-0 bg-zinc-950 border-l border-white/5 flex flex-col z-20">
        {currentTrack ? (
          <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
             <div className="flex items-center gap-2 text-white/50 mb-2">
                <Disc className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t.nowPlaying || "Now Playing"}</span>
             </div>
             <div className="w-full aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 relative shadow-2xl">
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
             <div className="bg-white/5 rounded-lg p-4 flex flex-col gap-3 text-sm mt-2 border border-white/5">
                <div className="flex justify-between items-center">
                   <span className="text-white/40">{t.album || "Album"}</span>
                   <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.album || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-white/40">{t.genre || "Genre"}</span>
                   <span className="text-white text-right truncate max-w-[140px] font-medium">{currentTrack.genre || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-white/40">Duration</span>
                   <span className="text-white text-right font-mono font-medium">{Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-white/20">
             <Music className="w-16 h-16 mb-4 opacity-50" />
             <p className="text-center text-sm font-medium">{t.noTrackPlaying}</p>
          </div>
        )}
      </div>
`;

// Insert the right panel right after the Main View and before the end of the flex container
appStr = appStr.replace(
  /{activeTab === "stats" && <StatsView stats={stats} library={library} \/>}\s*<\/div>/,
  `{activeTab === "stats" && <StatsView stats={stats} library={library} />}\n        </div>${rightPanelCode}`
);

// We need to fix the layout nesting in App.tsx
// Currently we have:
// <div className="flex-1 flex flex-col relative overflow-hidden">
//   <div className="flex-1 overflow-y-auto..."> (Main View) </div>
//   <div className="w-80..."> (Right Sidebar inserted above) </div>
//   <div className="h-24 ... PlayerBar"></div>
// </div>
//
// This is WRONG. The Right Sidebar needs to be next to the Main View, in a flex row.
// Let's rewrite the layout slightly.
appStr = appStr.replace(
  /<div className="flex-1 flex flex-col relative overflow-hidden">\s*{?\/\* Main View \*\/?}\s*<div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">([\s\S]*?)<div className="h-24 bg-zinc-950\/90 backdrop-blur-xl border-t border-white\/5 z-50 flex-shrink-0">\s*<PlayerBar \/>\s*<\/div>\s*<\/div>/,
  `<div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Area: Main View + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
            $1
          </div>
          ${rightPanelCode}
        </div>
        
        {/* Player Bar (Spans full width minus left sidebar) */}
        <div className="h-24 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 z-50 flex-shrink-0">
          <PlayerBar />
        </div>
      </div>`
);

fs.writeFileSync('src/App.tsx', appStr);


// 2. Fix PlayerBar.tsx
let pbStr = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');

// Replace Repeat import with Repeat, Repeat1
pbStr = pbStr.replace(/Repeat, Shuffle, Music/g, 'Repeat, Repeat1, Shuffle, Music');

// Remove ml-1 from Play icon
pbStr = pbStr.replace(/<Play className="w-5 h-5 fill-current text-black ml-1" \/>/g, '<Play className="w-5 h-5 fill-current text-black" />');

// Adjust Play button style for centering and looks
pbStr = pbStr.replace(/w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform/g, 'w-12 h-12 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform');
pbStr = pbStr.replace(/w-5 h-5 fill-current text-black/g, 'w-6 h-6 fill-current text-black');

// Adjust Shuffle icon colors
pbStr = pbStr.replace(/isShuffle \? 'text-emerald-400' : 'text-white\/40 hover:text-white'/g, "isShuffle ? 'text-white' : 'text-white/40 hover:text-white'");

// Adjust Repeat logic and colors
pbStr = pbStr.replace(
  /<button\s+onClick={toggleRepeat}\s+className={`transition-colors relative \${repeatMode !== 'none' \? 'text-emerald-400' : 'text-white\/40 hover:text-white'}`}\s*>\s*<Repeat className="w-4 h-4" \/>\s*\{repeatMode === 'one' && \(\s*<span className="absolute -top-2 -right-2 text-\[8px\] font-bold bg-zinc-900 px-1 rounded-full border border-emerald-500\/30">1<\/span>\s*\)\}\s*<\/button>/g,
  `<button 
             onClick={toggleRepeat} 
             className={\`transition-colors relative \${repeatMode !== 'none' ? 'text-white' : 'text-white/40 hover:text-white'}\`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>`
);

// Progress bar colors
pbStr = pbStr.replace(/group-hover:bg-emerald-400/g, 'group-hover:bg-white');

fs.writeFileSync('src/components/PlayerBar.tsx', pbStr);

// 3. Fix Library.tsx button and emerald colors
let libStr = fs.readFileSync('src/components/Library.tsx', 'utf8');
libStr = libStr.replace(/bg-white text-black font-medium rounded-full hover:bg-white\/90/g, 'bg-zinc-800 text-white border border-white/10 font-medium rounded-lg hover:bg-zinc-700');
libStr = libStr.replace(/text-emerald-400/g, 'text-white');
libStr = libStr.replace(/text-emerald-400'/g, "text-white font-bold'"); // In isPlaying ternary

fs.writeFileSync('src/components/Library.tsx', libStr);

// 4. Update Stats, AIPlaylist, EqView (replace emerald colors)
function replaceEmeraldColors(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/text-emerald-400/g, 'text-white');
  code = code.replace(/text-emerald-300/g, 'text-white');
  code = code.replace(/bg-emerald-500/g, 'bg-white/10');
  code = code.replace(/bg-emerald-400/g, 'bg-white');
  code = code.replace(/text-emerald-500\/20/g, 'text-white/10');
  fs.writeFileSync(filePath, code);
}
replaceEmeraldColors('src/components/Stats.tsx');
replaceEmeraldColors('src/components/AIPlaylist.tsx');
replaceEmeraldColors('src/components/EqView.tsx');

console.log("UI updated!");
