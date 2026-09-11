const fs = require('fs');
let code = fs.readFileSync('src/context/PlayerContext.tsx', 'utf-8');

// Replace playTrack logic
code = code.replace(/      \/\/ Cleanup previous blob URL\n      if \(currentObjectUrl\.current\) \{\n        URL\.revokeObjectURL\(currentObjectUrl\.current\);\n      \}\n      \n      const file = await actualTrack\.fileHandle\.getFile\(\);\n      const url = URL\.createObjectURL\(file\);\n      currentObjectUrl\.current = url;\n      \n      await engine\.playTrack\(url, true\);/, `      // Cleanup previous blob URL
      if (currentObjectUrl.current && currentObjectUrl.current.startsWith('blob:')) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      
      const url = actualTrack.filePath 
        ? \`sonata-media://\${actualTrack.filePath}\`
        : ''; // fallback if needed, though shouldn't happen with new flow
      currentObjectUrl.current = url;
      
      await engine.playTrack(url, true);`);

// Replace restoreSession logic
code = code.replace(/        if \(currentObjectUrl\.current\) \{\n          URL\.revokeObjectURL\(currentObjectUrl\.current\);\n        \}\n        \n        const file = await track\.fileHandle\.getFile\(\);\n        const url = URL\.createObjectURL\(file\);\n        currentObjectUrl\.current = url;\n        \n        await engine\.playTrack\(url, false\);/, `        if (currentObjectUrl.current && currentObjectUrl.current.startsWith('blob:')) {
          URL.revokeObjectURL(currentObjectUrl.current);
        }
        
        const url = track.filePath 
          ? \`sonata-media://\${track.filePath}\`
          : '';
        currentObjectUrl.current = url;
        
        await engine.playTrack(url, false);`);

fs.writeFileSync('src/context/PlayerContext.tsx', code);
