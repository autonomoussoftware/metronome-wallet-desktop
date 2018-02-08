const abi = require('human-standard-token-abi')
const logger = require('electron-log')
const settings = require('electron-settings')

const { getWeb3, sendSignedTransaction, getEvents } = require('../ethWallet')

const ethEvents = getEvents()

function sendBalances ({ walletId, addresses, webContents }) {
  const tokens = settings.get('tokens')
  const contractAddresses = Object.keys(tokens)

  const web3 = getWeb3()
  const contracts = contractAddresses.map(address => ({
    contractAddresse: address.toLowerCase(),
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
          logger.debug(`<-- ${symbol} ${address} ${balance}`)
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
    logger.debug('Unsubscribing token balance update')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function sendToken ({ password, token: address, from, to, value }) {
  const symbol = settings.get(`tokens.${address}.symbol`)

  logger.debug('Sending ERC20 tokens', { from, to, value, token: symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, address)
  const transfer = contract.methods.transfer(to, value)
  const data = transfer.encodeABI()

  // TODO estimate gas with transfer.estimateGas()
  const gas = 200000

  return sendSignedTransaction({ password, from, to: address, data, gas })
}

function getHooks () {
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
