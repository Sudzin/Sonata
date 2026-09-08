const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Flatten all rounding to make it strict (sharp corners, mostly rounded-sm or rounded-md)
    content = content
        .replace(/rounded-3xl/g, 'rounded-sm')
        .replace(/rounded-2xl/g, 'rounded-sm')
        .replace(/rounded-xl/g, 'rounded-sm')
        .replace(/rounded-lg/g, 'rounded-sm')
        .replace(/rounded-full/g, 'rounded-sm')
        .replace(/rounded-md/g, 'rounded-sm');

    // 2. Remove playful gradients and make them strict monochrome
    content = content
        .replace(/bg-gradient-to-br from-indigo-500\/20 to-purple-500\/5 border border-indigo-500\/20/g, 'bg-zinc-950 border border-white/10')
        .replace(/bg-gradient-to-br from-emerald-500\/20 to-teal-500\/5 border border-emerald-500\/20/g, 'bg-zinc-950 border border-white/10')
        .replace(/bg-gradient-to-br from-rose-500\/20 to-orange-500\/5 border border-rose-500\/20/g, 'bg-zinc-950 border border-white/10')
        .replace(/bg-gradient-to-br from-emerald-500\/20 to-zinc-900\/50/g, 'bg-zinc-950')
        .replace(/border-emerald-500\/30/g, 'border-white/10')
        .replace(/shadow-2xl/g, 'shadow-none')
        .replace(/shadow-xl/g, 'shadow-none')
        .replace(/shadow-lg/g, 'shadow-none');

    // 3. Make the UI a bit tighter, borders slightly sharper
    content = content
        // Sidebar active state
        .replace(/bg-white\/10 text-white/g, 'bg-white text-black')
        // General panel backgrounds
        .replace(/bg-zinc-900\/50/g, 'bg-zinc-900')
        .replace(/bg-zinc-900\/5 /g, 'bg-zinc-950 ')
        // Remove bouncing animations if any
        .replace(/hover:scale-105/g, 'hover:scale-100')
        .replace(/hover:scale-110/g, 'hover:scale-100');

    fs.writeFileSync(filePath, content);
}

// Process App.tsx
processFile(path.join(process.cwd(), 'src', 'App.tsx'));

// Process all components
const dir = path.join(process.cwd(), 'src', 'components');
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        processFile(path.join(dir, file));
    }
});
