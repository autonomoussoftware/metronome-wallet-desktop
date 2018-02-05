const crypto = require('crypto')

function encrypt (password, data) {
  const cipher = crypto.createCipher('aes-256-cbc', password)

  let encrypted = cipher.update(data, 'utf-8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt (password, data) {
  const decipher = crypto.createDecipher('aes-256-cbc', password)

  var decrypted = decipher.update(data, 'hex', 'utf-8')
  decrypted += decipher.final('utf-8')
  return decrypted
}

module.exports = {
  encrypt,
  decrypt
}
