const { app, BrowserWindow, Menu, dialog, session, ipcMain, protocol, net } = require("electron");
const { pathToFileURL } = require("url");
const path = require('path');
const fs = require('fs/promises');

// --- ГЛАВНЫЙ СЕКРЕТ ОБХОДА GOOGLE AUTH В ELECTRON ---
// Google очень жестко проверяет все Chromium-браузеры. Он ищет специфичные
// переменные (например, window.chrome), которых нет в Electron.
// Если мы прикинемся Google Chrome, он нас раскусит. 
// НО! Если мы представимся как FIREFOX, Google применяет совершенно другие 
// скрипты проверки (без привязки к Chromium), и Electron их успешно проходит!
app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0";

protocol.registerSchemesAsPrivileged([
  { scheme: 'sonata-media', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true, stream: true } }
]);

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sonata',
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: app.isPackaged ? path.join(process.resourcesPath, 'preload.cjs') : path.join(__dirname, 'preload.cjs')
    }
  });

  // Настройка всплывающих окон для Firebase Auth
  win.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true
        }
      }
    };
  });

  
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

  ipcMain.handle('select-music-folder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('scan-music-folder', async (event, folderPath) => {
    const results = [];
    const validExts = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a']);
    
    async function scan(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (validExts.has(ext)) {
              results.push(fullPath);
            }
          }
        }
      } catch (err) {
        console.error(`Error scanning directory ${dir}:`, err);
      }
    }
    
    await scan(folderPath);
    return results;
  });


  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    process.env.NODE_ENV = 'production';
    
    // Перехватываем критические ошибки NodeJS (например занятый порт)
    process.on('uncaughtException', (err) => {
      dialog.showErrorBox('Критическая ошибка сервера', `Не удалось запустить сервер. Возможно, порт 3000 занят.\n\n${err.stack || err.message}`);
      app.quit();
    });

    try {
      const serverPath = path.join(__dirname, 'dist', 'server.cjs');
      process.env.HOST = "127.0.0.1";
      require(serverPath);
    } catch (err) {
      dialog.showErrorBox('Ошибка сервера', err.stack || err.message);
    }

    const loadApp = () => {
      win.loadURL('http://127.0.0.1:3000').catch(() => {
        setTimeout(loadApp, 300);
      });
    };
    loadApp();
  }
}

app.whenReady().then(() => {
  protocol.handle('sonata-media', (request) => {
    const urlPath = request.url.replace(/^sonata-media:\/\//, '');
    const decodedPath = decodeURIComponent(urlPath);
    return net.fetch(pathToFileURL(decodedPath).href, { bypassCustomProtocolHandlers: true });
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
