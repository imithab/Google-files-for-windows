/**
 * Files Studio - Desktop Electron Preload Script
 * Exposes safe APIs to the renderer window
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  getLogicalDrives: () => ipcRenderer.invoke('storage:getLogicalDrives'),
  platform: process.platform,
  isDesktop: true,
});
