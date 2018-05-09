'use strict'

const { merge } = require('lodash')
const logger = require('electron-log')
const settings = require('electron-settings')

const restart = require('../electron-restart')
const { getDb } = require('../database')

const settableSettings = [
  'app.node.websocketApiUrl'
]

const getKey = key => settings.get(key)

function setKey (key, value) {
  settings.set(key, value)
  logger.verbose('Settings changed', key)
}

function presetDefaults () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')

  const currentSettingsVersion = currentSettings.settingsVersion || 0

  // User settings format was changed in v2
  if (currentSettingsVersion <= 1) {
    logger.warn('Removing old user settings')
    delete currentSettings.user
  }

  // Overwrite old settings and clear db if settings file version changed
  if (defaultSettings.settingsVersion > currentSettingsVersion) {
    if (currentSettings.app) {
      logger.verbose('Clearing best block cache')
      delete currentSettings.app.bestBlock
    }

    logger.verbose('Clearing database cache')
    const db = getDb()
    db.collection('transactions')
    db.collection('state')
    db.dropDatabase()
      .catch(function (err) {
        logger.error('Possible database corruption', err.message)

        restart()
      })

    logger.verbose('Updating default settings')
    merge(currentSettings, defaultSettings)
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

const getPasswordHash = () => getKey(`user.passwordHash`)

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
