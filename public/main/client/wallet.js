'use strict'

const { aes256cbcIv, sha256 } = require('./crypto')
const logger = require('electron-log')
const settings = require('electron-settings')

const toLowerCase = str => str.toLowerCase()

const getActiveWallet = () => settings.get('user.activeWallet')

const getWallets = () => Object.keys(settings.get('user.wallets'))

const getWalletId = seed => 1 // sha256.hash(seed)

function getWalletAddresses (walletId) {
  const addressesPath = `user.wallets.${walletId}.addresses`
  return Object.keys(settings.get(addressesPath)).map(toLowerCase)
}

function findWalletId (address) {
  const _address = address.toLowerCase()
  const walletIds = Object.keys(settings.get('user.wallets'))
  return walletIds.find(walletId =>
    getWalletAddresses(walletId).includes(_address)
  )
}

function getWallet (walletId) {
  return settings.get(`user.wallets.${walletId}`)
}

function getWalletAddressIndex ({ walletId, address }) {
  const wallet = getWallet(walletId)
  return wallet.addresses[address.toLowerCase()].index
}

function isAddressInWallet ({ walletId, address }) {
  const addresses = getWalletAddresses(walletId)
  return addresses.includes(address.toLowerCase())
}

const getSeed = (address, password) => {
  const walletId = findWalletId(address)
  if (!walletId) {
    return new Error('Origin address not found')
  }
  const encryptedSeed = settings.get(`users.wallets.${walletId}.encryptedSeed`)
  return aes256cbcIv.decrypt(password, encryptedSeed)
}

const setAddressForWalletId = (walletId, address) =>
  Promise.resolve(settings.set(`user.wallets.${walletId}.addresses`, {
    [address]: {
      index: 0
    }
  }))

const getAddressesForWalletId = walletId =>
  getWalletAddresses(walletId)

const setSeed = (seed, password) =>
  Promise.resolve(settings.set(`user.wallets.${getWalletId(seed)}.encryptedSeed`, aes256cbcIv.encrypt(seed, password)))

module.exports = {
  getAddressesForWalletId,
  setAddressForWalletId,
  getActiveWallet,
  findWalletId,
  getWalletId,
  getWallets,
  getSeed,
  setSeed
}
