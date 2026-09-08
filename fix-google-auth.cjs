const fs = require('fs');

const mainCode = `const { app, BrowserWindow, Menu, dialog, session } = require('electron');
const path = require('path');

function createWindow() {
  Menu.setApplicationMenu(null);

  // --- КРИТИЧЕСКИЙ ФИКС ДЛЯ GOOGLE AUTH ---
  // Google палит Electron через специальные HTTP-заголовки (Client Hints).
  // Мы перехватываем ВСЕ сетевые запросы приложения и удаляем эти заголовки,
  // попутно маскируясь под самый обычный Chrome.
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    delete details.requestHeaders['sec-ch-ua'];
    delete details.requestHeaders['sec-ch-ua-mobile'];
    delete details.requestHeaders['sec-ch-ua-platform'];
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sonata',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Открываем DevTools
  // win.webContents.openDevTools();

  // Настройка всплывающих окон (Google OAuth popup)
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

  // Принудительно задаем User-Agent для всех дочерних окон
  win.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
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

app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

fs.writeFileSync('main.cjs', mainCode);
console.log("main.cjs fully rewritten with Client Hints bypass!");
