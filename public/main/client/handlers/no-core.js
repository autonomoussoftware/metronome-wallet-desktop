'use strict'

const restart = require('../electron-restart')
const dbManager = require('../database')
const logger = require('../../../logger')
const storage = require('../storage')
const auth = require('../auth')

const validatePassword = data => auth.isValidPassword(data)

const changePassword = data => auth.changePassword(data)

function clearCache () {
  logger.verbose('Clearing database cache')
  return dbManager
    .getDb()
    .dropDatabase()
    .then(restart)
}

const persistState = data => storage.persistState(data).then(() => true)

module.exports = {
  validatePassword,
  changePassword,
  persistState,
  clearCache
}
