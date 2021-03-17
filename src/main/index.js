import { app, BrowserWindow, ipcMain } from 'electron';
import socketTools from '../renderer/tools/socketTools'; // eslint-disable-line

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
let shareWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;
const sharedScreenURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/#/sharedScreen'
  : `file://${__dirname}/index.html`;

function createShareWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  shareWindow = new BrowserWindow({
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    show: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  shareWindow.webContents.openDevTools();
  shareWindow.loadURL(sharedScreenURL);
}
function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    resizable: false,
    nativeWindowOpen: true,
    webviewTag: true,
    show: false,
    hide: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  createShareWindow();
  mainWindow.loadURL(winURL);

  shareWindow.on('closed', () => {
    shareWindow = null;
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  ipcMain.on('WINDOW::CLOSE', () => {
    mainWindow.close();
    shareWindow.close();
  });
  ipcMain.on('WINDOW::ZOOMOUT', () => {
    mainWindow.minimize();
  });
  ipcMain.on('ENTER_REMOTE_ROOM', (e, params) => {
    console.log('ipcMain ENTER_REMOTE_ROOM', params);
    shareWindow.webContents.send('ENTER_REMOTE_ROOM', params);
  });
  ipcMain.on('LEAVE_REMOTE_ROOM', () => {
    shareWindow.webContents.send('LEAVE_REMOTE_ROOM');
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
