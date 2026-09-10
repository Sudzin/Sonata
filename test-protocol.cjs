const { app, protocol, net } = require('electron');
const { pathToFileURL } = require('url');
app.whenReady().then(() => {
  console.log(typeof protocol.handle);
  console.log(pathToFileURL("C:\\test\\file.mp3").href);
  console.log(pathToFileURL("/test/file.mp3").href);
  app.quit();
});
