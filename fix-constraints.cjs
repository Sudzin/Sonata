const fs = require('fs');

// 1. Remove Ctrl L hint from GlobalSearch.tsx
let gsStr = fs.readFileSync('src/components/GlobalSearch.tsx', 'utf8');
gsStr = gsStr.replace(/<div className="absolute right-4 flex items-center gap-2 text-xs font-mono text-white\/30 pointer-events-none">\s*<span className="px-1\.5 py-0\.5 bg-white\/5 rounded">Ctrl L<\/span>\s*<\/div>/g, '');
gsStr = gsStr.replace(/pr-20/g, 'pr-6'); // Adjust padding since Ctrl L is gone
fs.writeFileSync('src/components/GlobalSearch.tsx', gsStr);


// 2. Fix Electron Google Auth in main.cjs
let mainCjsStr = fs.readFileSync('main.cjs', 'utf8');
// Add user agent config to BrowserWindow and app
mainCjsStr = mainCjsStr.replace(
  /app\.whenReady\(\)\.then\(createWindow\);/g,
  `app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";\napp.whenReady().then(createWindow);`
);
fs.writeFileSync('main.cjs', mainCjsStr);


// 3. Fix Layout in App.tsx
// Restore the original layout where Sidebar is full height on the left.
// And PlayerBar is at the bottom of the right column.
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// The current layout structure in App.tsx:
/*
<div className="h-screen w-full flex flex-col bg-zinc-950 text-white overflow-hidden selection:bg-white/20">
  <div className="flex flex-1 overflow-hidden">
    {/* Sidebar * /}
    <div className="w-64 flex flex-col bg-zinc-950 border-r border-white/5 z-20">
*/

// Let's rewrite MainLayout structure
const newMainLayout = `
function MainLayout() {
  const [activeTab, setActiveTab] = useState<"library" | "albums" | "stats" | "ai" | "eq">("library");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currentTrack, setLibrary, library, t, language } = usePlayer();
  const [stats, setStats] = useState<PlayStat[]>([]);
  const { user } = useAuth();

  // Load persistence
  useEffect(() => {
    async function load() {
      const savedTracks = await getAllTracks();
      if (savedTracks.length > 0) setLibrary(savedTracks);
      
      const savedStats = await getAllStats();
      setStats(savedStats);
    }
    load();
  }, [setLibrary]);

  return (
    <div className="h-screen w-full flex bg-zinc-950 text-white overflow-hidden selection:bg-white/20">
      
      {/* Sidebar (Full Height) */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-zinc-950 border-r border-white/5 z-20">
        <div className="p-6 flex items-center gap-3">
           <Music className="w-8 h-8 text-white" />
           <span className="text-xl font-bold tracking-tight text-white">Sonata</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('library')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'library' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
            <Library className="w-5 h-5" />
            <span className="font-medium">{t.library}</span>
          </button>
          <button onClick={() => setActiveTab('albums')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'albums' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
            <Disc className="w-5 h-5" />
            <span className="font-medium">{t.albums}</span>
          </button>
          <button onClick={() => setActiveTab('ai')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'ai' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">{t.aiPlaylists}</span>
          </button>
          <button onClick={() => setActiveTab('eq')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors \${activeTab === 'eq' ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}\`}>
            <Settings2 className="w-5 h-5" />
            <span className="font-medium">{t.equalizer}</span>
          </button>
        </nav>
        
        {/* Profile in Sidebar */}
        <div className="p-6 border-t border-white/5 bg-zinc-950 flex-shrink-0">
          <div className="w-full px-4 py-3 bg-white/5 rounded-sm flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col truncate pr-2">
                <span className="text-sm font-medium text-white truncate">{user ? (user.displayName || user.email?.split('@')[0]) : t.guest}</span>
                <span className="text-[10px] text-white/40 truncate">{user ? 'Google account' : 'Local profile'}</span>
              </div>
            </div>
            <button className="text-white hover:text-white/80 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm flex-shrink-0">
               <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Split Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 overflow-y-auto bg-zinc-900 relative z-10 custom-scrollbar">
            {activeTab === "library" && <LibraryView />}
            {activeTab === "albums" && <AlbumsView />}
            {activeTab === "ai" && <AIPlaylistView />}
            {activeTab === "eq" && <EqView />}
            {activeTab === "stats" && <StatsView stats={stats} library={library} />}
          </div>
          
          {/* Right Sidebar (Always Visible) */}
          <div className="w-80 flex-shrink-0 bg-zinc-950 border-l border-white/5 flex flex-col z-20">
            {currentTrack ? (
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
                       <span className="text-white/40">Duration</span>
                       <span className="text-white text-right font-mono font-medium">{Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}</span>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-6 h-full items-center justify-center text-white/20">
                 <div className="w-full aspect-square rounded-sm overflow-hidden bg-white/5 border border-white/5 relative flex items-center justify-center opacity-50 shadow-none">
                    <Music className="w-16 h-16"/>
                 </div>
                 <div className="flex flex-col items-center justify-center mt-4">
                    <p className="text-center text-sm font-medium">{t.noTrackPlaying}</p>
                 </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Player Bar */}
        <div className="h-24 bg-zinc-950 border-t border-white/5 z-50 flex-shrink-0">
          <PlayerBar onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} setActiveTab={setActiveTab} user={user} />}
    </div>
  )
}
`;

appStr = appStr.replace(/function MainLayout\(\) \{[\s\S]*\}\s*export default function App\(\)/, newMainLayout + '\n\nexport default function App()');

fs.writeFileSync('src/App.tsx', appStr);


// 4. Update AGENTS.md
let agentsStr = fs.readFileSync('AGENTS.md', 'utf8');
agentsStr += `
2. **Не меняйте базовую структуру (Layout)**:
   - Левый сайдбар (навигация + профиль) ДОЛЖЕН занимать всю высоту экрана.
   - Профиль пользователя ДОЛЖЕН находиться строго в левом нижнем углу (внутри левого сайдбара).
   - Нижняя панель плеера (PlayerBar) ДОЛЖНА находиться только в правой/центральной части интерфейса (рядом с левым сайдбаром), чтобы мини-информация о треке была сбоку от профиля пользователя.
   - Правая боковая панель с деталями трека должна отображаться ВСЕГДА (даже если трек не играет, показываем заглушку на черном фоне, чтобы она занимала то же самое место).
`;
fs.writeFileSync('AGENTS.md', agentsStr);

console.log("Constraints fixed!");
