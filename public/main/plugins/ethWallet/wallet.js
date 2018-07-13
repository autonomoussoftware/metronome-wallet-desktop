'use strict'

const logger = require('electron-log')

const { getAddressBalance } = require('./eth')
const { getWalletAddresses } = require('./settings')
const db = require('./db')

// util.promisify(setTimeout) is not yet possible in Electron 1.8.4
// See https://github.com/electron/electron/issues/13654
const setTimeoutAsync = delay => new Promise(function (resolve) {
  setTimeout(resolve, delay)
})

function getWalletBalances (walletId, shouldChange) {
  return Promise.all(getWalletAddresses(walletId).map(function (address) {
    return Promise.all([
      getAddressBalance(address),
      db.getAddressBalance({ address })
    ])
      .then(function ([balance, cached]) {
        if (balance === cached && shouldChange) {
          // Balance should have changed but did not, yet...
          // Let's wait 15 sec and try again.
          return setTimeoutAsync(15000)
            .then(() => getAddressBalance(address))
            .then(newBalance => ({ balance: newBalance, cached }))
        }
        return { balance, cached }
      })
      .then(function ({ balance, cached }) {
        if (balance !== cached) {
          db.setAddressBalance({ address, balance })
            .then(function () {
              logger.verbose(`Balance cached for ${address}: ${balance}`)
            })
            .catch(function (err) {
              logger.warn(`Could not cache balance for ${address}: ${err.message}`)
            })
        }
        return balance
      })
      .then(balance => ({ address, balance }))
  }))
}

module.exports = {
  getWalletBalances
}
