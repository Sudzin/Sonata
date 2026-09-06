const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content
        .replace(/bg-zinc-900/g, 'bg-white')
        .replace(/bg-zinc-950\/90/g, 'bg-white')
        .replace(/bg-zinc-950/g, 'bg-[#f8f9fa]')
        .replace(/bg-black\/50/g, 'bg-white/50')
        .replace(/bg-black\/60/g, 'bg-black/20')
        .replace(/text-white\/30/g, 'text-gray-400')
        .replace(/text-white\/40/g, 'text-gray-500')
        .replace(/text-white\/50/g, 'text-gray-500')
        .replace(/text-white\/60/g, 'text-gray-600')
        .replace(/text-white\/70/g, 'text-gray-700')
        .replace(/text-white\/80/g, 'text-gray-800')
        .replace(/text-white/g, 'text-black')
        .replace(/border-white\/10/g, 'border-black')
        .replace(/border-white\/5/g, 'border-black')
        .replace(/bg-white\/5/g, 'bg-gray-100')
        .replace(/bg-white\/10/g, 'bg-gray-200')
        .replace(/bg-white\/20/g, 'bg-gray-300')
        .replace(/ring-emerald-500\/50/g, 'ring-black')
        .replace(/text-emerald-400/g, 'text-blue-600')
        .replace(/text-emerald-500/g, 'text-blue-600')
        .replace(/bg-emerald-500\/20/g, 'bg-blue-100')
        .replace(/bg-emerald-500/g, 'bg-blue-600')
        .replace(/border-emerald-500\/30/g, 'border-blue-300')
        .replace(/shadow-\[0_-10px_40px_rgba\(0,0,0,0\.5\)\]/g, 'shadow-[0_-4px_0_0_rgba(0,0,0,1)]');
    fs.writeFileSync(filePath, content);
}

const dir = path.join(process.cwd(), 'src', 'components');
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        processFile(path.join(dir, file));
    }
});
