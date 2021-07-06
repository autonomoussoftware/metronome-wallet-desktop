'use strict'

const restart = require('../electron-restart')
const dbManager = require('../database')
const logger = require('../../../logger')
const storage = require('../storage')
const auth = require('../auth')
const wallet = require('../wallet')

const validatePassword = data => auth.isValidPassword(data)

function clearCache() {
  logger.verbose('Clearing database cache')
  return dbManager
    .getDb()
    .dropDatabase()
    .then(restart)
}

const persistState = data => storage.persistState(data).then(() => true)

function changePassword({ oldPassword, newPassword }) {
  return validatePassword(oldPassword).then(function(isValid) {
    if (!isValid) {
      return isValid
    }
    return auth.setPassword(newPassword).then(function() {
      wallet.getWallets().forEach(function(walletId) {
        const seed = wallet.getSeed(walletId, oldPassword)
        wallet.setSeed(seed, newPassword)
      })
      return true
    })
  })
}

module.exports = {
  validatePassword,
  changePassword,
  persistState,
  clearCache
}
