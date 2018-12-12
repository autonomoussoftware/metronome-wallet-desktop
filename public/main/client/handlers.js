'use strict'

const keys = require('./keys')
const auth = require('./auth')
const wallet = require('./wallet')
const WalletError = require('../WalletError')

function onboardingCompleted (data, emitter, core) {
  const seed = keys.mnemonicToSeedHex(data.mnemonic)
  const walletId = wallet.getWalletId(seed)
  const address = core.wallet.createAddress(seed)
  return Promise.all([
    auth.setPassword(data.password),
    wallet.setSeed(seed, data.password),
    wallet.setAddressForWalletId(walletId, address)
  ])
    .then(() => emitter.emit('create-wallet', { walletId }))
    .then(() => emitter.emit('open-wallets', {
      walletIds: [walletId],
      activeWallet: walletId,
      address
    }))
}

const onLoginSubmit = (data, emitter) =>
  auth.isValidPassword(data.password)
    .then(function (isValid) {
      if (!isValid) {
        return { error: new WalletError('Invalid password') }
      }
      wallet.getWallets().forEach(walletId =>
        wallet.getAddressesForWalletId(walletId).forEach(address =>
          emitter.emit('open-wallets', {
            walletIds: [walletId],
            activeWallet: walletId,
            address
          })
        )
      )
      return isValid
    })

module.exports = {
  onboardingCompleted,
  onLoginSubmit
}
