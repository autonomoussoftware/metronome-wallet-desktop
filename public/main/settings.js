const logger = require('electron-log')
const merge = require('lodash/merge')
const settings = require('electron-settings')

function presetDefault () {
  logger.verbose(`Using settings file: ${settings.file()}`)

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')
  settings.setAll(merge(defaultSettings, currentSettings))
}

module.exports = { presetDefault }
