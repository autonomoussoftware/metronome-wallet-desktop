'use strict'

const restart = require('../electron-restart')
const dbManager = require('../database')
const logger = require('../../../logger')
const storage = require('../storage')
const auth = require('../auth')
const wallet = require('../wallet')

const validatePassword = data => auth.isValidPassword(data)

function clearCache () {
  logger.verbose('Clearing database cache')
  return dbManager
    .getDb()
    .dropDatabase()
    .then(restart)
}

const persistState = data => storage.persistState(data).then(() => true)

function changePassword (data) {
  const isValid = validatePassword(data)
  if (isValid) {
    wallet.getWallets().forEach(function (walletId) {
      const seed = wallet.getSeed(walletId, data.oldPassword)
      auth.setPassword(data.newPassword)
      wallet.setSeed(seed, data.newPassword)
    })
  }
  return isValid
}

module.exports = {
  validatePassword,
  changePassword,
  persistState,
  clearCache
}
