const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const { getWeb3, registerTxParser, sendTransaction } = require('../ethWallet')
const { approveToken, getAllowance } = require('../tokens')

const { getAuctionStatus } = require('./auctions')
const {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getConverterStatus,
  getMtnForEthResult,
  getEthForMtnResult
} = require('./converter')
const { transactionParser } = require('./transactionParser')
const {
  getAuctionAddress,
  getConverterAddress,
  getTokenAddress
} = require('./settings')

// TODO move all subscription code to a single place in ethWallet

let subscriptions = []

function sendStatus ({ web3, webContents }) {
  promiseAllProps({
    auctionStatus: getAuctionStatus({ web3, address: getAuctionAddress() }),
    converterStatus: getConverterStatus({ web3, address: getConverterAddress() })
  })
    .then(function ({ auctionStatus, converterStatus }) {
      logger.verbose('Metronome status', auctionStatus, converterStatus)

      webContents.send('auction-status-updated', auctionStatus)
      webContents.send('mtn-converter-status-updated', converterStatus)
    })
    .catch(function (err) {
      logger.warn('Could not get metronome status', err)

      // TODO retry before notifying

      webContents.send('connectivity-state-changed', {
        ok: false,
        reason: 'Call to Ethereum node failed',
        plugin: 'metronome',
        err: err.message
      })
    })
}

function listenForBlocks (_, webContents) {
  const web3 = getWeb3()

  sendStatus({ web3, webContents })

  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

  blocksSubscription.on('data', function (header) {
    logger.verbose('New block header', header.number)

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
    logger.verbose('Unsubscribing auction status update')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function buyMetronome ({ password, from, value }) {
  const address = getAuctionAddress()

  logger.verbose('Buying MET in auction', { from, value, address })

  return sendTransaction({ password, from, to: address, value, gasMult: 2 })
}

function convertEthToMtn ({ password, from, value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()
  const data = encodeConvertEthToMtn({ web3, address, value })

  logger.verbose('Converting ETH to MET', { from, value, address })

  return sendTransaction({ password, from, to: address, value, data, gasMult: 2 })
}

function convertMtnToEth ({ password, from, value }) {
  const token = getTokenAddress()
  const address = getConverterAddress()

  return getAllowance({ token, from, to: address })
    .then(function (allowance) {
      logger.debug('Current allowance', allowance)
      const web3 = getWeb3()
      if (web3.utils.toBN(allowance).gtn(0)) {
        return approveToken({ password, token, from, to: address, value: 0 }, true)
      }
    })
    .then(function () {
      logger.debug('Setting new allowance')
      return approveToken({ password, token, from, to: address, value }, true)
        .then(function () {
          const web3 = getWeb3()
          const data = encodeConvertMtnToEth({ web3, address, value })

          logger.verbose('Converting MET to ETH', { from, value, address })

          return sendTransaction({ password, from, to: address, data, gasMult: 2 })
        })
        .catch(function (err) {
          logger.warn('Conversion failed - removing approval')
          return approveToken({ password, token, from, to: address, value: 0 })
            .then(function () {
              logger.info('Approval removed')
              throw err
            })
        })
    })
    .catch(function (err) {
      throw err
    })
}

function estimateEthToMet ({ value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()

  return getMtnForEthResult({ web3, address, value }).then(result => ({ result }))
}

function estimateMetToEth ({ value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()

  return getEthForMtnResult({ web3, address, value }).then(result => ({ result }))
}

function getHooks () {
  registerTxParser(transactionParser)

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
  }, {
    eventName: 'mtn-convert-eth',
    auth: true,
    handler: convertEthToMtn
  }, {
    eventName: 'mtn-convert-mtn',
    auth: true,
    handler: convertMtnToEth
  }, {
    eventName: 'metronome-estimate-eth-to-met',
    handler: estimateEthToMet
  }, {
    eventName: 'metronome-estimate-met-to-eth',
    handler: estimateMetToEth
  }]
}

module.exports = { getHooks }
