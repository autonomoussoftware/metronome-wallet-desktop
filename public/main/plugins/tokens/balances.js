'use strict'

const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const {
  getTokenBalance,
  getTokenContractAddresses,
  getTokenSymbol,
  setTokenBalance
} = require('./settings')

function sendBalances ({ ethWallet, walletId, addresses, webContents }) {
  const contractAddresses = getTokenContractAddresses()

  const web3 = ethWallet.getWeb3()
  const contracts = contractAddresses
    .map(a => a.toLowerCase())
    .map(address => ({
      contractAddress: address,
      contract: new web3.eth.Contract(abi, address),
      symbol: getTokenSymbol(address)
    }))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function ({ contractAddress, contract, symbol }) {
      contract.methods
        .balanceOf(address)
        .call()
        .then(function (balance) {
          setTokenBalance({ walletId, address, contractAddress, balance })

          if (webContents.isDestroyed()) { return }

          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: { [contractAddress]: { symbol, balance } }
                }
              }
            }
          })
          logger.verbose(`<-- ${symbol} ${address} ${balance}`)
        })
        .catch(function (err) {
          logger.warn('Could not get token balance', symbol, err.message)

          if (webContents.isDestroyed()) { return }

          // TODO retry before notifying
          webContents.send('connectivity-state-changed', {
            ok: false,
            reason: 'Connection to Ethereum node failed',
            plugin: 'tokens',
            err: err.message
          })

          // Send cached balance
          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddress]: {
                      symbol,
                      balance: getTokenBalance({ walletId, address, contractAddress })
                    }
                  }
                }
              }
            }
          })
        })
    })
  })
}

module.exports = sendBalances
