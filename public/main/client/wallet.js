'use strict'

const { aes256cbcIv, sha256 } = require('./crypto')
const settings = require('electron-settings')

const getActiveWallet = () => settings.getSync('user.activeWallet')

const setActiveWallet = activeWallet =>
  settings.setSync('user.activeWallet', activeWallet)

const getWallets = () => Object.keys(settings.getSync('user.wallets'))

const getWalletId = seed => sha256.hash(seed)

const getWalletAddresses = walletId =>
  Object.keys(settings.getSync(`user.wallets.${walletId}.addresses`))

const findWalletId = address =>
  Object.keys(settings.getSync('user.wallets')).find(walletId =>
    getWalletAddresses(walletId).includes(address)
  )

function getSeed (walletId, password) {
  if (!walletId) {
    return new Error('Origin address not found')
  }
  const encryptedSeed = settings.getSync(`user.wallets.${walletId}.encryptedSeed`)
  return aes256cbcIv.decrypt(password, encryptedSeed)
}

const getSeedByAddress = (address, password) =>
  getSeed(findWalletId(address), password)

const setAddressForWalletId = (walletId, address) =>
  settings.setSync(`user.wallets.${walletId}.addresses`, {
    [address]: {
      index: 0
    }
  })

const getAddressesForWalletId = walletId => getWalletAddresses(walletId)

const setSeed = (seed, password) =>
  settings.setSync(
    `user.wallets.${getWalletId(seed)}.encryptedSeed`,
    aes256cbcIv.encrypt(password, seed)
  )

const clearWallets = () => settings.setSync('user.wallets', {})

module.exports = {
  getAddressesForWalletId,
  setAddressForWalletId,
  getSeedByAddress,
  getActiveWallet,
  setActiveWallet,
  clearWallets,
  findWalletId,
  getWalletId,
  getWallets,
  getSeed,
  setSeed
}
