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
  mainWindow.loadURL(process.env.ELECTRON_START_URL || startUrl)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function createWindow () {
  const { app } = require('electron')

  app.on('ready', loadWindow)
  app.on('activate', loadWindow)
}

module.exports = { createWindow }
