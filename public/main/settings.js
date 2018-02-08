const logger = require('electron-log')
const merge = require('lodash/merge')
const settings = require('electron-settings')

function presetDefault () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')
  settings.setAll(merge(defaultSettings, currentSettings))

  logger.silly('Current settings', settings.getAll())
}

module.exports = { presetDefault }
