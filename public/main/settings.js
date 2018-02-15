const logger = require('electron-log')
const merge = require('lodash/merge')
const settings = require('electron-settings')
const { app, ipcMain } = require('electron')

function presetDefault () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')
  settings.setAll(merge(defaultSettings, currentSettings))

  logger.silly('Current settings', settings.getAll())
}

ipcMain.on('settings-get', function (event, { key }) {
  event.returnValue = settings.get(key)
})

ipcMain.on('settings-set', function (event, { key, value }) {
  // TODO: add settings whitelist
  settings.set(key, value)
  event.returnValue = true

  app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
  app.exit(0)
})

module.exports = { presetDefault }
