'use strict'

const crypto = require('crypto')

function decrypt (password, data) {
  const decipher = crypto.createDecipher('aes-256-cbc', password)

  let decrypted = decipher.update(data, 'hex', 'utf-8')
  decrypted += decipher.final('utf-8')
  return decrypted
}

module.exports = { decrypt }
