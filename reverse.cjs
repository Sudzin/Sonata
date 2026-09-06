const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content
        .replace(/bg-white\/50/g, 'bg-black/50')
        .replace(/bg-black\/20/g, 'bg-black/60')
        
        .replace(/text-gray-400/g, 'text-white/30')
        .replace(/text-gray-500/g, 'text-white/40')
        .replace(/text-gray-600/g, 'text-white/60')
        .replace(/text-gray-700/g, 'text-white/70')
        .replace(/text-gray-800/g, 'text-white/80')
        
        .replace(/text-black/g, 'text-white')
        .replace(/border-black/g, 'border-white/10')
        
        .replace(/bg-gray-100/g, 'bg-white/5')
        .replace(/bg-gray-200/g, 'bg-white/10')
        .replace(/bg-gray-300/g, 'bg-white/20')
        
        .replace(/ring-black/g, 'ring-emerald-500/50')
        .replace(/text-blue-600/g, 'text-emerald-400')
        .replace(/bg-blue-100/g, 'bg-emerald-500/20')
        .replace(/bg-blue-600/g, 'bg-emerald-500')
        .replace(/border-blue-300/g, 'border-emerald-500/30')
        .replace(/shadow-\[0_-4px_0_0_rgba\(0,0,0,1\)\]/g, 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]')
        
        // Backgrounds might have been replaced blindly.
        // Let's replace remaining 'bg-white' assuming it was bg-zinc-900 (for modals/components).
        // It's safer to just let the specific files handle their major backgrounds.
        .replace(/bg-white/g, 'bg-zinc-900')
        .replace(/bg-\[\#f8f9fa\]/g, 'bg-zinc-950')
        
    fs.writeFileSync(filePath, content);
}

const dir = path.join(process.cwd(), 'src', 'components');
fs.readdirSync(dir).forEach(file => {
    // Only process files that were affected by replace.cjs and not fully overwritten by cat
    // Wait, since I'm going to overwrite Library, PlayerBar, GlobalSearch via cat anyway, I can just run it on everything.
    if (file.endsWith('.tsx')) {
        processFile(path.join(dir, file));
    }
});
