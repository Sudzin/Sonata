const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// We need to add our own custom window buttons (minimize, maximize, close) to the top right corner
// since we set frame: false.

const titlebarImport = `import { Minus, Square, X } from 'lucide-react';`;
if (!appCode.includes('Minus, Square, X')) {
  appCode = appCode.replace(/import \{ Disc, Music, User, Settings \} from 'lucide-react';/, `import { Disc, Music, User, Settings, Minus, Square, X } from 'lucide-react';`);
}


const customTitlebar = `
            {/* Custom Titlebar / Window Controls */}
            <div className="absolute top-0 left-0 right-0 h-8 z-50 flex justify-end" style={{ WebkitAppRegion: "drag" } as any}>
               <div className="flex items-center h-full" style={{ WebkitAppRegion: "no-drag" } as any}>
                  <button onClick={() => window.electron?.minimize()} className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                     <Minus className="w-4 h-4" />
                  </button>
                  <button onClick={() => window.electron?.maximize()} className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                     <Square className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => window.electron?.close()} className="w-10 h-full flex items-center justify-center text-white/50 hover:bg-red-500 hover:text-white transition-colors">
                     <X className="w-4 h-4" />
                  </button>
               </div>
            </div>`;

appCode = appCode.replace(
  /\{\/\* Drag region for main area \*\/\}\s*<div className="absolute top-0 left-0 right-0 h-8 z-50 pointer-events-none" style=\{\{ WebkitAppRegion: "drag" \} as any\} \/>/,
  customTitlebar
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Added custom window buttons to App.tsx");
