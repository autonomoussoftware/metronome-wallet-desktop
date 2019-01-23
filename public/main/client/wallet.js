'use strict'

const { aes256cbcIv, sha256 } = require('./crypto')
const settings = require('electron-settings')

const getActiveWallet = () => settings.get('user.activeWallet')

const setActiveWallet = activeWallet =>
  settings.set('user.activeWallet', activeWallet)

const getWallets = () => Object.keys(settings.get('user.wallets'))

const getWalletId = seed => sha256.hash(seed)

const getWalletAddresses = walletId =>
  Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

const findWalletId = address =>
  Object.keys(settings.get('user.wallets')).find(walletId =>
    getWalletAddresses(walletId).includes(address)
  )

function getSeed (walletId, password) {
  if (!walletId) {
    return new Error('Origin address not found')
  }
  const encryptedSeed = settings.get(`user.wallets.${walletId}.encryptedSeed`)
  return aes256cbcIv.decrypt(password, encryptedSeed)
}

const getSeedByAddress = (address, password) =>
  getSeed(findWalletId(address), password)

const setAddressForWalletId = (walletId, address) =>
  Promise.resolve(
    settings.set(`user.wallets.${walletId}.addresses`, {
      [address]: {
        index: 0
      }
    })
  )

const getAddressesForWalletId = walletId => getWalletAddresses(walletId)

const setSeed = (seed, password) =>
  Promise.resolve(
    settings.set(
      `user.wallets.${getWalletId(seed)}.encryptedSeed`,
      aes256cbcIv.encrypt(password, seed)
    )
  )

module.exports = {
  getAddressesForWalletId,
  setAddressForWalletId,
  getSeedByAddress,
  getActiveWallet,
  setActiveWallet,
  findWalletId,
  getWalletId,
  getWallets,
  getSeed,
  setSeed
}
