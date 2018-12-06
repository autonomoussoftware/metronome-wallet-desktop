'use strict'

const keys = require('./keys')

function onboardingCompleted (data, emitter, core) {
  const seed = keys.mnemonicToSeedHex(data.mnemonic)
  emitter.emit('create-wallet', { walletId: 1 })
  emitter.emit('open-wallets', {
    address: core.wallet.createAddress(seed)
  })
  return Promise.resolve({
    walletIds: [1],
    activeWallet: 1
  })
}

const createMnemonic = () => keys.createMnemonic()

const isValidMnemonic = data => keys.isValidMnemonic(data.mnemonic)

module.exports = { createMnemonic, isValidMnemonic, onboardingCompleted }
