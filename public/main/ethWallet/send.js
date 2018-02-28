const web3 = require('web3')
const { decrypt: decryptOld } = require('../crypto/aes256cbc')
const { encrypt, decrypt } = require('../crypto/aes256cbcIv')

const {
  completedTransactionParams,
  getSignedTransaction,
  sendSignedTransaction
} = require('./eth')
const {
  findWalletId,
  getWallet,
  getWalletAddressIndex,
  setWalletEncryptedSeed
} = require('./settings')
const { getPrivateKey } = require('./key')

function getAddressPrivateKey({ walletId, address, password }) {
  const { encryptedSeed, derivationPath } = getWallet(walletId)

  // TODO remove this check for an old encyption before production release
  let seed
  if (encryptedSeed.length === 288) {
    // old encoding
    seed = decryptOld(password, encryptedSeed)
    setWalletEncryptedSeed({ walletId, encryptedSeed: encrypt(password, seed) })
  } else {
    // new encoding
    seed = decrypt(password, encryptedSeed)
  }
  // end

  const index = getWalletAddressIndex({ walletId, address })
  return getPrivateKey({ seed, derivationPath, index })
}

function signAndSendTransaction(args) {
  const { password } = args
  const { from, to, value, data, gasLimit, gasPrice } = args

  const params = {
    from,
    to,
    data,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice)
  }

  return completedTransactionParams(params).then(function(allParams) {
    const walletId = findWalletId(from)
    if (!walletId) {
      return Promise.reject(new Error('Origin address not found'))
    }

    const privateKey = getAddressPrivateKey({
      walletId,
      address: from,
      password
    })

    const transaction = getSignedTransaction({ params: allParams, privateKey })
    return sendSignedTransaction(transaction)
  })
}

module.exports = { signAndSendTransaction }
