const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const {
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser
} = require('../ethWallet')

const {
  getTokenBalance,
  getTokenContractAddresses,
  getTokenSymbol,
  setTokenBalance
} = require('./settings')
const { transactionParser } = require('./transactionParser')

const ethEvents = getEvents()

function sendBalances ({ walletId, addresses, webContents }) {
  const contractAddresses = getTokenContractAddresses()

  const web3 = getWeb3()
  const contracts = contractAddresses.map(a => a.toLowerCase()).map(address => ({
    contractAddress: address,
    contract: new web3.eth.Contract(abi, address),
    symbol: getTokenSymbol(address)
  }))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function ({ contractAddress, contract, symbol }) {
      contract.methods.balanceOf(address).call()
        .then(function (balance) {
          setTokenBalance({ walletId, address, contractAddress, balance })

          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddress]: {
                      balance
                    }
                  }
                }
              }
            }
          })
          logger.verbose(`<-- ${symbol} ${address} ${balance}`)
        })
        .catch(function (err) {
          logger.warn('Could not get token balance', symbol, err)

          // TODO retry before notifying

          webContents.send('connectivity-state-changed', {
            ok: false,
            reason: 'Call to Ethereum node failed',
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

// TODO move all subscription code to a single place in ethWallet
// TODO and into getHooks()

let subscriptions = []

ethEvents.on('wallet-opened', function ({ walletId, addresses, webContents }) {
  sendBalances({ walletId, addresses, webContents })

  const web3 = getWeb3()
  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

  // TODO listen for new txs of wallets instead of all blocks
  blocksSubscription.on('data', function () {
    sendBalances({ walletId, addresses, webContents })
  })

  webContents.on('destroyed', function () {
    blocksSubscription.unsubscribe()
  })

  subscriptions.push({ webContents, blocksSubscription })
})

function unsubscribeUpdates (_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function (s) {
    logger.verbose('Unsubscribing token balance update')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function sendToken ({ password, token: address, from, to, value }) {
  const symbol = getTokenSymbol(address)

  logger.verbose('Sending ERC20 tokens', { from, to, value, token: symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, address)
  const transfer = contract.methods.transfer(to, value)
  const data = transfer.encodeABI()

  return sendTransaction({ password, from, to: address, data, gasMult: 2 })
}

function getHooks () {
  registerTxParser(transactionParser)

  return [{
    eventName: 'send-token',
    auth: true,
    handler: sendToken
  }, {
    eventName: 'ui-unload',
    handler: unsubscribeUpdates
  }]
}

module.exports = { getHooks }
