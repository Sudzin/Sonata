const fs = require('fs');
let code = fs.readFileSync('main.cjs', 'utf-8');

const scanEndIndex = code.indexOf('await scan(folderPath);\n    return results;\n  });') + 'await scan(folderPath);\n    return results;\n  });'.length;

const inject = `

  ipcMain.handle('extract-metadata', async (event, filePath) => {
    try {
      const mm = await import('music-metadata');
      const metadata = await mm.parseFile(filePath);
      const format = metadata.format;
      const common = metadata.common;
      
      let coverArtUrl = undefined;
      
      if (common.picture && common.picture.length > 0) {
        const picture = common.picture[0];
        const base64 = picture.data.toString('base64');
        coverArtUrl = \`data:\${picture.format};base64,\${base64}\`;
      }
      
      const fileName = path.basename(filePath);
      
      return {
        id: filePath,
        title: common.title || fileName.replace(/\\.[^/.]+$/, ""),
        artist: common.artist || "Unknown Artist",
        album: common.album || "Unknown Album",
        genre: common.genre && common.genre.length > 0 ? common.genre[0] : "Unknown",
        duration: format.duration || 0,
        relativePath: filePath,
        coverArtUrl,
      };
    } catch (error) {
      console.error(\`Error parsing metadata for \${filePath}:\`, error);
      const fileName = path.basename(filePath);
      return {
        id: filePath,
        title: fileName.replace(/\\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        genre: "Unknown",
        duration: 0,
        relativePath: filePath,
      };
    }
  });`;

code = code.slice(0, scanEndIndex) + inject + code.slice(scanEndIndex);
fs.writeFileSync('main.cjs', code);
