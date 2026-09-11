const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  selectMusicFolder: () => ipcRenderer.invoke('select-music-folder'),
  scanMusicFolder: (folderPath) => ipcRenderer.invoke('scan-music-folder', folderPath),
  extractMetadata: (filePath) => ipcRenderer.invoke('extract-metadata', filePath)
});
