const { app, BrowserWindow } = require('electron')
const autoUpdater = require('electron-updater').autoUpdater
const isDev = require('electron-is-dev')
const logger = require('electron-log')
const notifier = require('node-notifier')
const path = require('path')

const { restart } = require('./lib/electron-restart')

let mainWindow

function loadWindow () {
  // ensure the app is ready before creating the main window
  if (!app.isReady()) {
    logger.warn('Tried to load main window while app not ready. Reloading...')
    restart(1)
    return
  }

  if (mainWindow) {
    return
  }

  // TODO this should be read from config
  mainWindow = new BrowserWindow({
    show: false,
    width: 1140,
    height: 700,
    minWidth: 640,
    minHeight: 600
  })

  const appUrl = isDev
    ? process.env.ELECTRON_START_URL
    : `file://${path.join(__dirname, '../index.html')}`
  logger.info('loading url:', appUrl)

  mainWindow.loadURL(appUrl)

  initAutoUpdate()

  mainWindow.webContents.on('crashed', function (ev, killed) {
    logger.error(ev, killed)
  })

  mainWindow.on('unresponsive', function (ev) {
    logger.error(ev)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

function initAutoUpdate () {
  if (isDev) { return }
  if (process.platform === 'linux') { return }

  autoUpdater.checkForUpdates()

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update...')
  })
  autoUpdater.on('update-available', () => {
    logger.info('Update available.')
  })
  autoUpdater.on('update-not-available', () => {
    logger.info('Update not available.')
  })
  autoUpdater.on('error', err => {
    logger.error('Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', progressObj => {
    let msg = 'Download speed: ' + progressObj.bytesPerSecond
    msg += ' - Downloaded ' + progressObj.percent + '%'
    msg += ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    logger.info(msg)
  })
  autoUpdater.on('update-downloaded', info => {
    showUpdateNotification(info)
  })
}

function showUpdateNotification (info) {
  info = info || {}
  const restartNowAction = 'Restart now'

  const versionLabel = info.label ? `Version ${info.version}` : 'The latest version'

  notifier.notify(
    {
      title: 'A new update is ready to install.',
      wait: true,
      sound: true,
      message: `${versionLabel} has been downloaded and will be automatically installed after restart.`,
      closeLabel: 'Ok',
      actions: restartNowAction
    },
    function (err) {
      if (err) throw err
      autoUpdater.quitAndInstall()
    }
  )
}

function createWindow () {
  app.on('fullscreen', function () {
    mainWindow.isFullScreenable
      ? mainWindow.setFullScreen(true)
      : mainWindow.setFullScreen(false)
  })

  app.on('ready', loadWindow)
  app.on('activate', loadWindow)
}

module.exports = { createWindow }
