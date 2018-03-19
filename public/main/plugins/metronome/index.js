'use strict'

const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const { getAuctionStatus, getAuctionGasLimit } = require('./auctions')
const { approveToken, getAllowance } = require('../tokens')
const { transactionParser } = require('./transactionParser')
const {
  getEvents,
  getWeb3,
  registerTxParser,
  sendTransaction
} = require('../ethWallet')
const {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getConverterStatus,
  getMtnForEthResult,
  getEthForMtnResult,
  getConverterGasLimit
} = require('./converter')
const { getTokenStatus } = require('./token')
const {
  getAuctionAddress,
  getConverterAddress,
  getTokenAddress
} = require('./settings')

function sendStatus ({ web3, webContents }) {
  promiseAllProps({
    auctionStatus: getAuctionStatus({ web3, address: getAuctionAddress() }),
    converterStatus: getConverterStatus({
      web3,
      address: getConverterAddress()
    })
  })
    .then(function (status) {
      if (status.auctionStatus.isInitialAuctionEnded) {
        return getTokenStatus({ web3, address: getTokenAddress() })
          .then(function (tokenStatus) {
            return Object.assign(status, { tokenStatus })
          })
      }
      return Object.assign(status, { tokenStatus: { transferAllowed: false } })
    })
    .then(function ({ auctionStatus, converterStatus, tokenStatus }) {
      logger.verbose('<-- Metronome status', auctionStatus, converterStatus, tokenStatus)

      webContents.send('auction-status-updated', auctionStatus)
      webContents.send('mtn-converter-status-updated', converterStatus)
      webContents.send('metronome-token-status-updated', tokenStatus)
    })
    .catch(function (err) {
      logger.warn('Could not get metronome status', err)

      // TODO retry before notifying

      webContents.send('connectivity-state-changed', {
        ok: false,
        reason: 'Connection to Ethereum node failed',
        plugin: 'metronome',
        err: err.message
      })
    })
}

let subscriptions = []

function unsubscribeUpdates (_, webContents) {
  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function listenForBlocks (_, webContents) {
  const web3 = getWeb3()

  sendStatus({ web3, webContents })

  webContents.on('destroyed', function () {
    unsubscribeUpdates(null, webContents)
  })

  subscriptions = subscriptions.concat({ web3, webContents })
}

const ethEvents = getEvents()

ethEvents.on('new-block-header', function () {
  subscriptions.forEach(sendStatus)
})

function buyMetronome ({ password, from, value, gasLimit, gasPrice }) {
  const address = getAuctionAddress()

  logger.verbose('Buying MET in auction', { from, value, address, gasLimit, gasPrice })

  return sendTransaction({ password, from, to: address, value, gasLimit, gasPrice })
}

function convertEthToMtn ({ password, from, value, gasLimit, gasPrice }) {
  const web3 = getWeb3()
  const address = getConverterAddress()
  const data = encodeConvertEthToMtn({ web3, address, value })

  logger.verbose('Converting ETH to MET', { from, value, address })

  return sendTransaction({
    password,
    from,
    to: address,
    value,
    data,
    gasLimit,
    gasPrice
  })
}

function convertMtnToEth ({ password, from, value, gasPrice, gasLimit }) {
  const token = getTokenAddress()
  const address = getConverterAddress()

  return getAllowance({ token, from, to: address })
    .then(function (allowance) {
      logger.debug('Current allowance', allowance)
      const web3 = getWeb3()
      if (web3.utils.toBN(allowance).gtn(0)) {
        return approveToken(
          { password, token, from, to: address, value: 0, gasPrice, gasLimit },
          true
        )
      }
    })
    .then(function () {
      logger.debug('Setting new allowance')
      return approveToken(
        { password, token, from, to: address, value, gasPrice, gasLimit },
        true
      )
        .then(function () {
          const web3 = getWeb3()
          const data = encodeConvertMtnToEth({ web3, address, value })

          logger.verbose('Converting MET to ETH', { from, value, address })

          return sendTransaction({ password, from, to: address, data, gasPrice, gasLimit })
        })
        .catch(function (err) {
          logger.warn('Conversion failed - removing approval')
          return approveToken({
            password,
            token,
            from,
            to: address,
            value: 0,
            gasLimit,
            gasPrice
          }).then(function () {
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

  return getMtnForEthResult({ web3, address, value }).then(result => ({
    result
  }))
}

function estimateMetToEth ({ value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()

  return getEthForMtnResult({ web3, address, value }).then(result => ({
    result
  }))
}

function getEthGasLimit ({ from, value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()

  return getConverterGasLimit({ web3, from, address, value, type: 'eth' })
}

function getMetGasLimit ({ from, value }) {
  const web3 = getWeb3()
  const address = getConverterAddress()

  return getConverterGasLimit({ web3, from, address, value, type: 'met' })
}

function getAuctionMetGasLimit ({ from, value }) {
  const web3 = getWeb3()
  const to = getAuctionAddress()

  return getAuctionGasLimit({ web3, to, from, value })
}

function getHooks () {
  registerTxParser(transactionParser)

  return [
    { eventName: 'ui-ready', handler: listenForBlocks },
    { eventName: 'ui-unload', handler: unsubscribeUpdates },
    { eventName: 'metronome-buy', auth: true, handler: buyMetronome },
    { eventName: 'mtn-convert-eth', auth: true, handler: convertEthToMtn },
    { eventName: 'mtn-convert-mtn', auth: true, handler: convertMtnToEth },
    { eventName: 'metronome-estimate-eth-to-met', handler: estimateEthToMet },
    { eventName: 'metronome-estimate-met-to-eth', handler: estimateMetToEth },
    { eventName: 'metronome-convert-eth-gas-limit', handler: getEthGasLimit },
    { eventName: 'metronome-convert-met-gas-limit', handler: getMetGasLimit },
    { eventName: 'metronome-auction-gas-limit', handler: getAuctionMetGasLimit }
  ]
}

module.exports = { getHooks }
