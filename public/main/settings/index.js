const { merge, unset } = require('lodash')
const logger = require('electron-log')
const settings = require('electron-settings')

const { restart } = requireLib('electron-restart')

const settableSettings = [
  'app.node.websocketApiUrl'
]

const overwritableSettings = {
  0: [
    'app.bestBlock',
    'metronome.contracts',
    'tokens.0xf583c8fe0cbf447727378e3b1e921b1ef81adda8'
  ],
  1: [
    'metronome.contracts',
    'tokens.0x4c00f8ec2d4fc3d9cbe4d7bd04d80780d5cae77f'
  ]
}

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
  const currentSettingsVersion = currentSettings.settingsVersion || 0
  const settingsToOverwrite = overwritableSettings[currentSettingsVersion] || []
  if (settingsToOverwrite.length) {
    logger.verbose('Updating default settings')
    settingsToOverwrite.concat(['settingsVersion']).forEach(function (prop) {
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
    logger.verbose(`Set setting ${key} with value ${value}`)

    if (!settableSettings.includes(key)) {
      logger.warn(`Setting ${key} does not exist`)
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
