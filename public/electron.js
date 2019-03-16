'use strict'

const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { app } = require('electron')
const isDev = require('electron-is-dev')
const os = require('os')
const Raven = require('raven')

const { createWindow } = require('./main/main-window.js')
const { createClient } = require('./main/client')
const config = require('./config')
const initContextMenu = require('./contextMenu')
const initMenu = require('./menu')
const logger = require('./logger')

// If running tests, set a different location for user data
if (process.env.NODE_ENV === 'test') {
  app.setPath('userData', `${app.getPath('userData')}-test`)
}

if (isDev && process.env.NODE_ENV !== 'test') {
  // Development
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
  // Production
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

// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

createWindow()

app.on('ready', function () {
  logger.info('App ready, initializing...')

  initMenu()
  initContextMenu()

  createClient(config)
})
