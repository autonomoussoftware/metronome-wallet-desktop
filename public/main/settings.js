const { app, ipcMain } = require('electron')
const { merge, unset } = require('lodash')
const logger = require('electron-log')
const settings = require('electron-settings')

function presetDefault () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')

  // Clear previous settings on settings version change
  if (currentSettings.settingsVersion !== defaultSettings.settingsVersion) {
    [
      'app.bestBlock',
      'metronome.contracts',
      'tokens.0xf583c8fe0cbf447727378e3b1e921b1ef81adda8'
    ].forEach(function (prop) {
      unset(currentSettings, prop)
    })
  }

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
