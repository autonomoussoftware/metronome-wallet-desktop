const logger = require('electron-log')

const { getPasswordHash, setPasswordHash } = require('../settings')
const { sha256 } = require('../cryptoUtils')

const { hash, verify } = require('./pbkdf2')

function isValidPassword (password) {
  const passwordHash = getPasswordHash()

  // if no password has been ever set, use given password
  if (!passwordHash) {
    logger.info('No password set, using current as default')

    return hash(password)
      .then(function (newHash) {
        setPasswordHash(newHash)

        return true
      })
  }

  // else, verify given password
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

      // TODO remove this check for an old hash before production release
      if (sha256(password) === passwordHash) {
        logger.debug('Upgrading password encryption')

        return hash(password)
          .then(function (newHash) {
            setPasswordHash(newHash)

            return true
          })
      }
      // end of logic to remove

      return false
    })
}

module.exports = { isValidPassword }
