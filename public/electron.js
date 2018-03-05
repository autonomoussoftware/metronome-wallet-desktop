const os = require('os')
const path = require('path')
const Raven = require('raven')
const { app } = require('electron')
const isDev = require('electron-is-dev')

const logger = require('./logger')
const config = require('./config')
const initMenu = require('./menu')
const initContextMenu = require('./contextMenu')

require('./main/lib/require-lib').add(path.join(__dirname, './main/lib'))

if (isDev) {
  require('dotenv').config()

  app.on('ready', function() {
    require('electron-debug')({ enabled: true })

    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS
    } = require('electron-devtools-installer')

    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then(extName => console.log(`Added Extension:  ${extName}`))
      .catch(err => console.log('An error occurred: ', err))
  })
} else {
  if (config.sentryDsn) {
    Raven.config(config.sentryDsn, {
      captureUnhandledRejections: true,
      tags: {
        process: process.type,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        platform: os.platform(),
        platform_release: os.release()
      }
    }).install()
  }
}

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const { createWindow } = require(path.join(__dirname, './main/mainWindow.js'))
createWindow()

const { initMainWorker } = require(path.join(__dirname, './main/mainWorker.js'))

app.on('ready', function() {
  logger.info('App ready, initializing...')
  initMenu()
  initContextMenu()
  initMainWorker()
})
