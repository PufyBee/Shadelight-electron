const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Enable remote module
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    maxWidth: 1000,
    maxHeight: 700,
    frame: false, // Frameless window
    transparent: false,
    resizable: false, // fixed size
    icon: path.join(__dirname, 'assets', 'icons', 'logo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Enable remote in renderer
  remoteMain.enable(win.webContents);

  // Optional: expose basic window controls via IPC (fallback if you remove @electron/remote later)
  ipcMain.handle('window-minimize', () => win.minimize());
  ipcMain.handle('window-close', () => win.close());

  // Load the HTML
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
