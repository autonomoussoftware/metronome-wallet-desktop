const logger = require('electron-log')

const { getPasswordHash, setPasswordHash } = require('../settings')

const { hash, verify } = require('./pbkdf2')

function isValidPassword (password) {
  const passwordHash = getPasswordHash()

  // If no password has been ever set, use given password
  if (!passwordHash) {
    logger.info('No password set, using current as default')

    return hash(password)
      .then(function (newHash) {
        setPasswordHash(newHash)

        return true
      })
  }

  // Else, verify given password
  return verify(passwordHash, password)
    .then(function (isValid) {
      if (isValid) {
        logger.verbose('Supplied password is valid')
      } else {
        logger.warn('Supplied password is invalid')
      }

      return isValid
    })
    .catch(function (err) {
      logger.warn('Could not verify password', err)

      return false
    })
}

module.exports = { isValidPassword }
