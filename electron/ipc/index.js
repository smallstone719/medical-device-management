const { ipcMain } = require('electron');
const appIpc = require('./app.ipc');
const windowIpc = require('./window.ipc');

function registerIpcHandlers() {
  appIpc.register(ipcMain);
  windowIpc.register(ipcMain);
}

module.exports = { registerIpcHandlers };
