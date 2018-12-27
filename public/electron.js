'use strict'

const os = require('os')
const path = require('path')
const Raven = require('raven')
const { app } = require('electron')
const isDev = require('electron-is-dev')

const logger = require('./logger')
const config = require('./config')
const initMenu = require('./menu')
const initContextMenu = require('./contextMenu')

if (isDev) {
  require('dotenv').config()

  app.on('ready', function () {
    require('electron-debug')({ enabled: true })

    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS
    } = require('electron-devtools-installer')

    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then(extName => logger.debug(`Added Extension:  ${extName}`))
      .catch(err => logger.debug('An error occurred: ', err))
  })
} else {
  if (config.sentryDsn) {
    Raven.config(config.sentryDsn, {
      captureUnhandledRejections: true,
      release: app.getVersion(),
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

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const { createWindow } = require(path.join(__dirname, './main/main-window.js'))
createWindow()

const { createClient } = require(path.join(__dirname, './main/client'))

app.on('ready', function () {
  logger.info('App ready, initializing...')
  initMenu()
  initContextMenu()
  createClient(config)
})
