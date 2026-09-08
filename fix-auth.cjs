const fs = require('fs');

let mainStr = fs.readFileSync('main.cjs', 'utf8');

// Disable nodeIntegration and enable contextIsolation
mainStr = mainStr.replace(/nodeIntegration:\s*true/g, 'nodeIntegration: false');
mainStr = mainStr.replace(/contextIsolation:\s*false/g, 'contextIsolation: true');

// Add setWindowOpenHandler to the main window
const handlerCode = `
  // Открываем DevTools для перехвата любых ошибок в интерфейсе
  win.webContents.openDevTools();

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

  // Добавляем userAgent для всех запросов
  win.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
  });
`;

mainStr = mainStr.replace(
  /\/\* Открываем DevTools для перехвата любых ошибок в интерфейсе \*\/\s*win\.webContents\.openDevTools\(\);|win\.webContents\.openDevTools\(\);/g,
  handlerCode
);

// Update userAgentFallback to a very clean generic string
mainStr = mainStr.replace(
  /app\.userAgentFallback = ".*?";/g,
  `app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";`
);

fs.writeFileSync('main.cjs', mainStr);
console.log("main.cjs updated for Google Auth bypass!");
