const { merge, unset } = require('lodash')
const logger = require('electron-log')
const settings = require('electron-settings')

const { restart } = require('../lib/electron-restart')

const settableSettings = [
  'app.node.websocketApiUrl'
]

const overwritableSettings = [
  'app.bestBlock',
  'metronome.contracts',
  'tokens.0xf583c8fe0cbf447727378e3b1e921b1ef81adda8'
]

function getKey (key) {
  return settings.get(key)
}

function setKey (key, value) {
  settings.set(key, value)
  logger.verbose('Settings changed', key)
}

function presetDefaults () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')

  // Clear previous settings if settings file version changed
  if (currentSettings.settingsVersion !== defaultSettings.settingsVersion) {
    logger.verbose('Updating default settings')
    overwritableSettings.forEach(function (prop) {
      unset(currentSettings, prop)
    })
  }

  settings.setAll(merge(defaultSettings, currentSettings))
  logger.verbose('Default settings applied')
  logger.debug('Current settings', settings.getAll())
}

function attachSync (ipcMain) {
  ipcMain.on('settings-get', function (event, { key }) {
    event.returnValue = getKey(key)
  })

  ipcMain.on('settings-set', function (event, { key, value }) {
    if (!settableSettings.includes(key)) {
      event.returnValue = false
      return
    }

    setKey(key, value)
    event.returnValue = true

    restart()
  })
}

function getPasswordHash () {
  return getKey(`user.passwordHash`)
}

function setPasswordHash (hash) {
  setKey(`user.passwordHash`, hash)
}

module.exports = {
  attachSync,
  getKey,
  getPasswordHash,
  presetDefaults,
  setKey,
  setPasswordHash
}
