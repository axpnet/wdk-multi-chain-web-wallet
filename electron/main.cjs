// electron/main.cjs - Minimal Electron wrapper for WDK Wallet
// Loads Vite dev server in development, or dist/index.html in production

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = (() => {
  try {
    const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
    return !fs.existsSync(distIndex);
  } catch {
    return true;
  }
})();

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'WDK Wallet',
  });

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    win.loadURL(devUrl);
    // Uncomment to open DevTools automatically in dev
    // win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
