const { app, BrowserWindow, Menu, dialog, session, ipcMain } = require('electron');
const path = require('path');

// --- ГЛАВНЫЙ СЕКРЕТ ОБХОДА GOOGLE AUTH В ELECTRON ---
// Google очень жестко проверяет все Chromium-браузеры. Он ищет специфичные
// переменные (например, window.chrome), которых нет в Electron.
// Если мы прикинемся Google Chrome, он нас раскусит. 
// НО! Если мы представимся как FIREFOX, Google применяет совершенно другие 
// скрипты проверки (без привязки к Chromium), и Electron их успешно проходит!
app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0";

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
      preload: path.join(__dirname, 'preload.cjs')
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


  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    process.env.NODE_ENV = 'production';
    try {
      const serverPath = path.join(__dirname, 'dist', 'server.cjs');
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
