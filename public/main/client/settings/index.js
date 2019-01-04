'use strict'

const logger = require('electron-log')
const settings = require('electron-settings')

const getKey = key => settings.get(key)

function setKey (key, value) {
  settings.set(key, value)
  logger.verbose('Settings changed', key)
}

const getPasswordHash = () => getKey('user.passwordHash')

function setPasswordHash (hash) {
  setKey('user.passwordHash', hash)
}

module.exports = {
  getPasswordHash,
  setPasswordHash
}
