'use strict'

const restart = require('../electron-restart')
const dbManager = require('../database')
const storage = require('../storage')
const auth = require('../auth')

const validatePassword = data => auth.isValidPassword(data)

const clearCache = () =>
  dbManager
    .getDb()
    .dropDatabase()
    .then(restart)

const persistState = data => storage.persistState(data).then(() => true)

module.exports = {
  validatePassword,
  persistState,
  clearCache
}
