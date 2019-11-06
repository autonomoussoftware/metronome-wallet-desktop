'use strict'

const { merge } = require('lodash')
const settings = require('electron-settings')

const { upgradeSettings } = require('./upgradeSettings')
const { getDb } = require('../database')
const restart = require('../electron-restart')
const logger = require('../../../logger')

function getPasswordHash () {
  return settings.get('user.passwordHash')
}

function setPasswordHash (hash) {
  settings.set('user.passwordHash', hash)
  logger.verbose('Password hash changed')
}

/**
 * Delete cached app state
 */
function clearCache () {
  const db = getDb()
  db.collection('Balances')
  db.collection('Rates')
  db.collection('TokenBalances')
  db.collection('Transactions')
  db.collection('State')
  db.dropDatabase()
    .catch(function (err) {
      logger.error('Possible database corruption', err.message)
      restart()
    })
}

/**
 * Initializes app settings merging potentially newer app defaults with
 * currently installed app settings and upgrading them if required.
 */
function init () {
  logger.verbose('Settings file', settings.file())
  const defaultSettings = require('./defaultSettings')
  const installedSettings = settings.getAll()
  const installedSettingsVersion = installedSettings.settingsVersion || 0

  if (defaultSettings.settingsVersion > installedSettingsVersion) {
    logger.verbose('Updating default settings')
    upgradeSettings(defaultSettings, installedSettings)
    clearCache()
  } else {
    settings.setAll(merge(defaultSettings, installedSettings))
    logger.verbose('Default settings applied')
    logger.debug('Current settings', settings.getAll())
  }
}

module.exports = {
  getPasswordHash,
  setPasswordHash,
  init
}
