'use strict'

const logger = require('electron-log')

const { getAddressBalance } = require('./eth')
const { getWalletAddresses } = require('./settings')
const { setAddressBalance } = require('./db')

function getWalletBalances (walletId) {
  return Promise.all(getWalletAddresses(walletId).map(function (address) {
    return getAddressBalance(address).then(function (balance) {
      setAddressBalance({ address, balance })
        .then(function () {
          logger.verbose(`Balance cached for ${address}: ${balance}`)
        })
        .catch(function (err) {
          logger.warn(`Could not cache balance for ${address}: ${err.message}`)
        })
      return { address, balance }
    })
  }))
}

module.exports = {
  getWalletBalances
}
