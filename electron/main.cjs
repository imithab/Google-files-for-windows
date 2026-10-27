/**
 * Files Studio - Desktop Electron Application
 * Production-ready Windows wrapper for Files Studio
 */

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');

let mainWindow = null;
let serverProcess = null;

const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production' && !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 840,
    minHeight: 560,
    frame: false, // Frameless window to match Files Studio custom Google title bar
    titleBarStyle: 'hidden',
    backgroundColor: '#f8fafd',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Handle window control IPC messages from TitleBar
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // Handle native Windows directory selection dialog
  ipcMain.handle('dialog:openDirectory', async () => {
    if (!mainWindow) return { canceled: true, filePaths: [] };
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Folder or Drive to Mount in Files Studio',
      properties: ['openDirectory', 'dontAddToRecent']
    });
    return result;
  });

  // Enumerate host drives
  ipcMain.handle('storage:getLogicalDrives', async () => {
    const drives = [];
    if (process.platform === 'win32') {
      const letters = ['C', 'D', 'E', 'F', 'G', 'H'];
      for (const l of letters) {
        const root = `${l}:\\`;
        if (fs.existsSync(root)) {
          drives.push({
            letter: l,
            path: root,
            name: l === 'C' ? 'Local Disk (C:)' : `Volume (${l}:)`,
            isRemovable: l !== 'C'
          });
        }
      }
    } else {
      drives.push({ letter: '/', path: '/', name: 'Internal Storage (Root)', isRemovable: false });
      drives.push({ letter: '~', path: require('node:os').homedir(), name: 'User Home', isRemovable: false });
    }
    return drives;
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load URL or local index
  if (IS_DEV) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    // mainWindow.webContents.openDevTools();
  } else {
    // In production package, either load from local server or dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(() => {
      mainWindow.loadURL(`http://localhost:${PORT}`);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance lock on Windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
