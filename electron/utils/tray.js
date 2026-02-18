const { Tray, Menu } = require('electron');
const path = require('path');

let tray = null;

function createTray(mainWindow) {
  tray = new Tray(path.join(__dirname, '../../frontend/public/favicon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => mainWindow.close() }
  ]);

  tray.setToolTip('Medical Device Management');
  tray.setContextMenu(contextMenu);
}

module.exports = { createTray };
