'use strict'

const { getAddressBalance } = require('./eth')
const { getWalletAddresses, setAddressBalance } = require('./settings')

function getWalletBalances (walletId) {
  return Promise.all(getWalletAddresses(walletId).map(function (address) {
    return getAddressBalance(address).then(function (balance) {
      setAddressBalance({ walletId, address, balance })
      return { address, balance }
    })
  }))
}

module.exports = {
  getWalletBalances
}
