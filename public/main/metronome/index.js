const logger = require('electron-log')
const settings = require('electron-settings')

const { getWeb3, sendSignedTransaction } = require('../ethWallet')

const { getAuctionStatus } = require('./auctions')
const { getConverterStatus } = require('./converter')

let subscriptions = []

function sendStatus ({ web3, webContents }) {
  const auctionsAddress = settings.get('metronome.contracts.auctions')
  getAuctionStatus({ web3, address: auctionsAddress })
    .then(function (auctionStatus) {
      logger.debug('Auction status', auctionStatus)

      webContents.send('auction-status-updated', auctionStatus)
    })

  const converterAddress = settings.get('metronome.contracts.converter')
  getConverterStatus({ web3, address: converterAddress })
    .then(function (auctionStatus) {
      logger.debug('Auction status', auctionStatus)

      webContents.send('mtn-converter-status-updated', auctionStatus)
    })
}

function listenForBlocks (_, webContents) {
  const web3 = getWeb3()

  sendStatus({ web3, webContents })

  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

  blocksSubscription.on('data', function (header) {
    logger.debug('New block header', header.number)

    // TODO throttle this to 30'

    sendStatus({ web3, webContents })
  })

  blocksSubscription.on('error', function (err) {
    logger.error('Subscription error', err.message)

    // TODO notify error
  })

  webContents.on('destroyed', function () {
    blocksSubscription.unsubscribe()
  })

  subscriptions.push({ webContents, blocksSubscription })
}

function unsubscribeUpdates (_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function (s) {
    logger.debug('Unsubscribing auction status update')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function buyMetronome ({ password, from, value }) {
  const address = settings.get('metronome.contracts.auctions')

  logger.debug('Buying MTN in auction', { from, value, address })

  // TODO estimate gas with transfer.estimateGas()
  const gas = 200000

  return sendSignedTransaction({ password, from, to: address, value, gas })
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: listenForBlocks
  }, {
    eventName: 'ui-unload',
    handler: unsubscribeUpdates
  }, {
    eventName: 'mtn-buy',
    auth: true,
    handler: buyMetronome
  }]
}

module.exports = { getHooks }
