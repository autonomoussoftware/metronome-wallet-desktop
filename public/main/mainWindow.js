const isDev = require('electron-is-dev');
const autoUpdater = require('electron-updater').autoUpdater;
const notifier = require('node-notifier');

const logger = require('electron-log');

const unhandled = require('electron-unhandled');

unhandled({
  logger: logger.error
});

let mainWindow

function loadWindow () {
  const { BrowserWindow } = require('electron')
  const path = require('path')
  const url = require('url')

  if (mainWindow) {
    return
  }

  // TODO this should be comming from config
  mainWindow = new BrowserWindow({
    width: 1140,
    height: 700
  })

  // TODO shall remove dev server env variable for security
  const startUrl = url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startUrl)
  // WIP: autoupdate feature. Only last to have the artifact we want to use.
  // initAutoUpdate();
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function initAutoUpdate() {
  if (isDev) {
    return;
  }

  if (process.platform === 'linux') {
    return;
  }

  autoUpdater.checkForUpdates();
  autoUpdater.signals.updateDownloaded(showUpdateNotification);
}

function showUpdateNotification(it) {
  it = it || {};
  const restartNowAction = 'Restart now';

  const versionLabel = it.label ? `Version ${it.version}` : 'The latest version';

  notifier.notify(
    {
      title: 'A new update is ready to install.',
      message: `${versionLabel} has been downloaded and will be automatically installed after restart.`,
      closeLabel: 'Okay',
      actions: restartNowAction
    },
    function(err, response, metadata) {
      if (err) throw err;
      if (metadata.activationValue !== restartNowAction) {
        return;
      }
      autoUpdater.quitAndInstall();
    }
  );
}

function createWindow () {
  const { app } = require('electron')

  app.on('ready', loadWindow)
  app.on('activate', loadWindow)
}

module.exports = { createWindow }
