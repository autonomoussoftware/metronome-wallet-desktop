const hdkey = require('ethereumjs-wallet/hdkey')

function getPrivateKey ({ seed, derivationPath, index }) {
  return hdkey
    .fromMasterSeed(Buffer.from(seed, 'hex'))
    .derivePath(`${derivationPath}/${index}`)
    .getWallet()
    .getPrivateKey()
}

module.exports = { getPrivateKey }
