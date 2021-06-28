'use strict'

const settings = require('electron-settings')
const utils = require('web3-utils')
const { merge } = require('lodash')

const logger = require('../../../logger')
const restart = require('../electron-restart')
const { getDb } = require('../database')

const getKey = key => settings.getSync(key)

function setKey (key, value) {
  settings.setSync(key, value)
  logger.verbose('Settings changed', key)
}

const getPasswordHash = () => getKey('user.passwordHash')

function setPasswordHash (hash) {
  setKey('user.passwordHash', hash)
}

function upgradeSettings (defaultSettings, currentSettings) {
  const finalSettings = merge({}, currentSettings)
  // Remove no longer used settings as now are stored in config
  delete finalSettings.app
  delete finalSettings.coincap
  delete finalSettings.tokens
  // Convert previous addresses to checksum addresses
  if (finalSettings.user && finalSettings.user.wallets) {
    Object.keys(finalSettings.user.wallets).forEach(function (key) {
      Object.keys(finalSettings.user.wallets[key].addresses).forEach(
        function (address) {
          if (!utils.checkAddressChecksum(address)) {
            finalSettings.user.wallets[key]
              .addresses[utils.toChecksumAddress(address)] =
            finalSettings.user.wallets[key].addresses[address]
            // Remove previous lowercase address
            delete finalSettings.user.wallets[key].addresses[address]
          }
        }
      )
    })
  }
  finalSettings.settingsVersion = defaultSettings.settingsVersion
  settings.setSync(finalSettings)
}

function presetDefaults () {
  logger.verbose('Settings file', settings.file())

  const currentSettings = settings.getSync()
  const defaultSettings = require('./defaultSettings')

  const currentSettingsVersion = currentSettings.settingsVersion || 0

  // User settings format was changed in v2
  if (currentSettingsVersion <= 1) {
    logger.warn('Removing old user settings')
    delete currentSettings.user
  }

  // Overwrite old settings and clear db if settings file version changed
  if (defaultSettings.settingsVersion > currentSettingsVersion) {
    logger.verbose('Updating default settings')
    upgradeSettings(defaultSettings, currentSettings)
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
  } else {
    settings.setSync(merge(defaultSettings, currentSettings))
    logger.verbose('Default settings applied')
    logger.debug('Current settings', settings.getSync())
  }
}

module.exports = {
  getPasswordHash,
  setPasswordHash,
  presetDefaults
}
