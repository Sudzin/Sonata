const fs = require('fs');

const preloadCode = `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
`;

fs.writeFileSync('preload.cjs', preloadCode);

// Now update main.cjs to handle these IPC events and use the preload script
let mainCode = fs.readFileSync('main.cjs', 'utf8');

mainCode = mainCode.replace(
  /const \{ app, BrowserWindow, Menu, dialog, session \} = require\('electron'\);/,
  `const { app, BrowserWindow, Menu, dialog, session, ipcMain } = require('electron');`
);

mainCode = mainCode.replace(
  /contextIsolation: true\s*\}/,
  `contextIsolation: true,\n      preload: path.join(__dirname, 'preload.cjs')\n    }`
);

const ipcHandlers = `
  ipcMain.on('window-minimize', () => {
    win.minimize();
  });
  
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  
  ipcMain.on('window-close', () => {
    win.close();
  });
`;

if (!mainCode.includes('ipcMain.on')) {
  mainCode = mainCode.replace(/const isDev = !app\.isPackaged;/, `${ipcHandlers}\n\n  const isDev = !app.isPackaged;`);
}

fs.writeFileSync('main.cjs', mainCode);
console.log("Added preload.cjs and IPC handlers for custom window controls.");
