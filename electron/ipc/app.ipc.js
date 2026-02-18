const { app } = require('electron');

function register(ipcMain) {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
}

module.exports = { register };
