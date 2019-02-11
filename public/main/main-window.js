'use strict'

const { app, BrowserWindow, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const logger = require('electron-log')
const path = require('path')
const windowStateKeeper = require('electron-window-state')

const analytics = require('../analytics')
const restart = require('./client/electron-restart')

let mainWindow

function showUpdateNotification (info = {}) {
  if (!Notification.isSupported()) { return }

  const versionLabel = info.label
    ? `Version ${info.version}`
    : 'The latest version'

  const notification = new Notification({
    title: `${versionLabel} was installed`,
    body: 'Metronome Wallet will be automatically updated after restart.'
  })

  notification.show()
}

function initAutoUpdate () {
  if (isDev) {
    return
  }
  if (process.platform === 'linux') {
    return
  }

  autoUpdater.checkForUpdates()

  autoUpdater.on('checking-for-update', () => logger.info('Checking for update...'))
  autoUpdater.on('update-available', () => logger.info('Update available.'))
  autoUpdater.on('download-progress', function (progressObj) {
    let msg = `Download speed: ${progressObj.bytesPerSecond}`
    msg += ` - Downloaded ${progressObj.percent}%`
    msg += ` (${progressObj.transferred}/${progressObj.total})`
    logger.info(msg)
  })
  autoUpdater.on('update-downloaded', info => showUpdateNotification(info))
  autoUpdater.on('update-not-available', () => logger.info('Update not available.'))
  autoUpdater.on('error', err => logger.error(`Error in auto-updater. ${err}`))
}

function loadWindow () {
  // Ensure the app is ready before creating the main window
  if (!app.isReady()) {
    logger.warn('Tried to load main window while app not ready. Reloading...')
    restart(1)
    return
  }

  if (mainWindow) {
    return
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1140,
    defaultHeight: 700
  })

  // TODO this should be read from config
  mainWindow = new BrowserWindow({
    show: false,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 640,
    minHeight: 632,
    backgroundColor: '#323232',
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
    x: mainWindowState.x,
    y: mainWindowState.y
  })

  mainWindowState.manage(mainWindow)

  analytics.init(mainWindow.webContents.getUserAgent())

  const appUrl = isDev
    ? process.env.ELECTRON_START_URL
    : `file://${path.join(__dirname, '../index.html')}`

  logger.info('Roading renderer from URL:', appUrl)

  mainWindow.loadURL(appUrl)

  mainWindow.webContents.on('crashed', function (ev, killed) {
    logger.error('Crashed', ev.sender.id, killed)
  })

  mainWindow.on('unresponsive', function (ev) {
    logger.error('Unresponsive', ev.sender.id)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', function () {
    initAutoUpdate()
    mainWindow.show()
  })
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
