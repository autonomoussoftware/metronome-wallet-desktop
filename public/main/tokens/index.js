const abi = require('human-standard-token-abi')
const logger = require('electron-log')
const settings = require('electron-settings')

const {
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser
} = require('../ethWallet')

const ethEvents = getEvents()

function sendBalances ({ walletId, addresses, webContents }) {
  const tokens = settings.get('tokens')
  const contractAddresses = Object.keys(tokens)

  const web3 = getWeb3()
  const contracts = contractAddresses.map(a => a.toLowerCase()).map(address => ({
    contractAddresse: address,
    contract: new web3.eth.Contract(abi, address),
    symbol: tokens[address].symbol
  }))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function ({ contractAddresse, contract, symbol }) {
      contract.methods.balanceOf(address).call()
        .then(function (balance) {
          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddresse]: {
                      balance
                    }
                  }
                }
              }
            }
          })
          logger.verbose(`<-- ${symbol} ${address} ${balance}`)
        })
    })
  })
}

let subscriptions = []

ethEvents.on('wallet-opened', function ({ walletId, addresses, webContents }) {
  sendBalances({ walletId, addresses, webContents })

  const web3 = getWeb3()
  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

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
  const symbol = settings.get(`tokens.${address.toLowerCase()}.symbol`)

  logger.verbose('Sending ERC20 tokens', { from, to, value, token: symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, address)
  const transfer = contract.methods.transfer(to, value)
  const data = transfer.encodeABI()

  return sendTransaction({ password, from, to: address, data, gasMult: 2 })
}

function transactionParser ({ transaction }) {
  // TODO analyze the tx, tx receipt and return promise data to be merged with meta
  // Transfer
  // Approval
  return Promise.resolve({ token: { parsed: true } })
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
