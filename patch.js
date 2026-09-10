const fs = require('fs');
let code = fs.readFileSync('main.cjs', 'utf-8');
code = code.replace("app.whenReady().then(createWindow);", `app.whenReady().then(() => {
  protocol.handle('sonata-media', (request) => {
    const urlPath = request.url.replace(/^sonata-media:\\/\\//, '');
    const decodedPath = decodeURIComponent(urlPath);
    return net.fetch(pathToFileURL(decodedPath).href, { bypassCustomProtocolHandlers: true });
  });
  createWindow();
});`);
fs.writeFileSync('main.cjs', code);
