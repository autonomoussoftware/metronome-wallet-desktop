/* eslint-disable no-fallthrough */
'use strict'

const { merge } = require('lodash')
const settings = require('electron-settings')
const utils = require('web3-utils')

const logger = require('../../../logger')

/**
 * Upgrade the installed app settings by applying the transformations required
 * by each released version update.
 *
 * @param {Object} defaultSettings - Default settings for the current app
 *                                   version, which could be newer than the
 *                                   installed app settings.
 * @param {Object} installedSettings - The currently installed app settings.
 */
// eslint-disable-next-line complexity
function upgradeSettings (defaultSettings, installedSettings) {
  const finalSettings = merge({}, installedSettings)

  switch (installedSettings.settingsVersion || 0) {
    case 0:
    case 1:
      // User settings format was changed in v2
      logger.warn('Removing old user settings')
      delete finalSettings.user

    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
      // Remove no longer used settings as now these are stored in config
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
                delete finalSettings.user.wallets[key].addresses[address]
              }
            }
          )
        })
      }

    case 16:
      // Add "ethereum" chainType to existing addresses
      // Required after adding Qtum support
      if (finalSettings.user && finalSettings.user.wallets) {
        Object.keys(finalSettings.user.wallets).forEach(function (key) {
          Object.keys(finalSettings.user.wallets[key].addresses).forEach(
            function (address) {
              finalSettings.user.wallets[key].addresses[address].chainType =
                'ethereum'
            }
          )
        })
      }
  }

  finalSettings.settingsVersion = defaultSettings.settingsVersion
  settings.setAll(finalSettings)
}

module.exports = {
  upgradeSettings
}
