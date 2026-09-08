const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sonata',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Открываем DevTools для перехвата любых ошибок в интерфейсе
  win.webContents.openDevTools();

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    // В Electron сборке явно задаем NODE_ENV, чтобы Express запустился в production режиме (раздача статики)
    process.env.NODE_ENV = 'production';
    
    try {
      const serverPath = path.join(__dirname, 'dist', 'server.cjs');
      require(serverPath);
    } catch (err) {
      dialog.showErrorBox('Ошибка сервера', err.stack || err.message);
    }

    // Повторяем попытки загрузки каждые 300 мс, пока Express-сервер не поднимется
    const loadApp = () => {
      win.loadURL('http://127.0.0.1:3000').catch(() => {
        setTimeout(loadApp, 300);
      });
    };

    loadApp();
  }
}

app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
