'use strict'

const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const { getTokenBalance, setTokenBalance } = require('./db')
const { getTokenContractAddresses, getTokenSymbol } = require('./settings')

// util.promisify(setTimeout) is not yet possible in Electron 1.8.4
// See https://github.com/electron/electron/issues/13654
const setTimeoutAsync = delay => new Promise(function (resolve) {
  setTimeout(resolve, delay)
})

function sendMessage (webContents, event, message) {
  if (webContents.isDestroyed()) {
    return
  }

  webContents.send(event, message)
}

const sendBalance = webContents => function (params) {
  const { address, balance, contractAddress, symbol, walletId } = params

  sendMessage(webContents, 'wallet-state-changed', {
    [walletId]: {
      addresses: {
        [address]: {
          token: {
            [contractAddress]: {
              symbol,
              balance
            }
          }
        }
      }
    }
  })

  logger.verbose(`<-- ${symbol} ${address} ${balance}`)
}

const sendError = webContents => function (err) {
  logger.warn('Could not get or send token balance', err.message)

  sendMessage(webContents, 'connectivity-state-changed', {
    ok: false,
    reason: 'Connection to Ethereum node failed',
    plugin: 'tokens',
    err: err.message
  })
}

function cacheTokenBalance (params) {
  const { address, balance, contractAddress } = params

  logger.verbose('Caching token balance', address, contractAddress)

  setTokenBalance({ address, contractAddress, balance })
    .catch(function (err) {
      logger.warn(`Could not save token balance: ${err.message}`)
    })
}

const getTokenBalanceOfAddress = shouldChange => function (params) {
  const { address, contractAddress, contract, symbol, walletId } = params

  return Promise.all([
    contract.methods.balanceOf(address).call().catch(err => ({ err })),
    getTokenBalance({ address, contractAddress })
  ])
    .then(function ([current, cached]) {
      if (current.err) {
        return cached || Promise.reject(current.err)
      }

      if (current === cached && shouldChange) {
        // Balance should have changed but did not, yet...
        // Let's wait 15 sec and try again.
        return setTimeoutAsync(15000)
          .then(() => getTokenBalance({ address, contractAddress }))
          .then(function (newBalance) {
            cacheTokenBalance({ address, balance: newBalance, contractAddress })
            return newBalance
          })
      }

      cacheTokenBalance({ address, balance: current, contractAddress })
      return current
    })
    .then(function (balance) {
      return { address, balance, contractAddress, symbol, walletId }
    })
}

function sendBalances (params) {
  const { ethWallet, walletId, addresses, webContents, shouldChange } = params

  const web3 = ethWallet.getWeb3()

  const contracts = getTokenContractAddresses()
    .map(a => a.toLowerCase())
    .map(address => ({
      contractAddress: address,
      contract: new web3.eth.Contract(abi, address),
      symbol: getTokenSymbol(address)
    }))

  addresses
    .map(a => a.toLowerCase())
    .map(address => contracts.map(c => Object.assign(c, { address, walletId })))
    .reduce((flat, sub) => flat.concat(sub))
    .map(getTokenBalanceOfAddress(shouldChange))
    .map(promise => promise
      .then(sendBalance(webContents))
      .catch(sendError(webContents))
    )
}

module.exports = sendBalances
