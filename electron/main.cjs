const path = require('node:path');
const { app, BrowserWindow } = require('electron');
const { createStaticServer } = require('./static-server.cjs');

let serverHandle;

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    title: 'IceRush',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const rootDir = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked')
    : path.resolve(__dirname, '..');

  serverHandle = await createStaticServer(rootDir);
  await window.loadURL(serverHandle.url);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('Failed to start IceRush desktop app:', error);
  app.quit();
});

app.on('window-all-closed', async () => {
  if (serverHandle) {
    await serverHandle.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
