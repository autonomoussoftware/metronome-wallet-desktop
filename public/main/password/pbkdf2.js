const credential = require('credential-plus')
const pbkdf2 = require('credential-plus-pbkdf2')

credential.install(pbkdf2)

const config = {
  digest: 'sha512',
  func: 'pbkdf2',
  iterations: 19997,
  keylen: 128
}

module.exports = {
  hash: password => credential.hash(password, config),
  verify: (hash, password) => credential.verify(hash, password)
}
