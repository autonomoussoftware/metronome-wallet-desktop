const { sha256 } = require('./cryptoUtils')
const logger = require('electron-log')
const settings = require('electron-settings')

// TODO fix the default!!!
function isValidPassword (password, useAsDefault = true) {
  const passwordHash = settings.get('user.passwordHash')

  if (!passwordHash && useAsDefault) {
    logger.info('No password set, using current as default')
    settings.set('user.passwordHash', sha256(password))
    return true
  }

  const isValid = password && sha256(password) === passwordHash

  if (isValid) {
    logger.verbose('Supplied password is valid')
  } else {
    logger.warn('Supplied password is invalid')
  }

  return isValid
}

module.exports = { isValidPassword }
