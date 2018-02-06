const path = require('path')
const logger = require('electron-log')
const isDev = require('electron-is-dev');
const autoUpdater = require('electron-updater').autoUpdater;
const notifier = require('node-notifier');

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
    show: false,
    width: 1140,
    height: 700
  })

  const appUrl = isDev ? process.env.ELECTRON_START_URL : `file://${path.join(__dirname, '../index.html')}`
  logger.info('loading url:', appUrl)

  mainWindow.loadURL(appUrl)

  // WIP: autoupdate feature. Only last to have the artifact we want to use.
  // initAutoUpdate();

  mainWindow.webContents.on('crashed', function (event, killed) {
    logger.error(event, killed)
  })

  mainWindow.on('unresponsive', function () {
    logger.error(event, killed)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
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
