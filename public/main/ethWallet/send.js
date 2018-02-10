const { decrypt } = require('../cryptoUtils')

const { completedTransactionParams, getSignedTransaction, sendSignedTransaction } = require('./eth')
const { findWalletId, getWallet, getWalletAddressIndex } = require('./settings')
const { getPrivateKey } = require('./key')

function getAddressPrivateKey ({ walletId, address, password }) {
  const { encryptedSeed, derivationPath } = getWallet(walletId)
  const seed = decrypt(password, encryptedSeed)
  const index = getWalletAddressIndex({ walletId, address })
  return getPrivateKey({ seed, derivationPath, index })
}

function signAndSendTransaction (args) {
  const { password } = args
  const { from, to, value, data, gas, gasMult } = args
  const params = { from, to, value, data, gas }
  const options = { gasMult }
  return completedTransactionParams(params, options)
    .then(function (allParams) {
      const walletId = findWalletId(from)
      if (!walletId) {
        return Promise.reject(new Error('Origin address not found'))
      }

      const privateKey = getAddressPrivateKey({ walletId, address: from, password })
      const transaction = getSignedTransaction({ params: allParams, privateKey })
      return sendSignedTransaction(transaction)
    })
}

module.exports = { signAndSendTransaction }
