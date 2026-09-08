const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// The problematic block starts at line 191 up to 256. 
// We will replace everything from `{/* Right Sidebar (Always Visible) */}` to the end of that block.

const correctSidebar = `{/* Right Sidebar (Conditionally Visible) */}
          {currentTrack && (
            <div className="w-80 flex-shrink-0 bg-zinc-950 border-l border-white/5 flex flex-col z-20">
              <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar" style={{ WebkitAppRegion: "no-drag" } as any}>
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
            </div>
          )}
        </div>`;

appCode = appCode.replace(/\{\/\* Right Sidebar \(Always Visible\) \*\/\}[\s\S]*?<\/div>\}[\s]*<\/div>/m, correctSidebar);

fs.writeFileSync('src/App.tsx', appCode);
console.log('Fixed App.tsx Sidebar syntax error.');
