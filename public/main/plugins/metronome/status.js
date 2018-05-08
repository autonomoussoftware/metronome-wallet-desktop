'use strict'

const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const { getAuctionStatus } = require('./auctions')
const { getConverterStatus } = require('./converter')
const { getTokenStatus } = require('./token')
const {
  getAuctionAddress,
  getConverterAddress,
  getTokenAddress
} = require('./settings')

function sendStatus (ethWallet, webContents) {
  const web3 = ethWallet.getWeb3()

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
          .then(tokenStatus => Object.assign(status, { tokenStatus }))
      }
      return Object.assign(status, { tokenStatus: { transferAllowed: false } })
    })
    .then(function ({ auctionStatus, converterStatus, tokenStatus }) {
      logger.verbose('<-- Metronome status',
        auctionStatus, converterStatus, tokenStatus
      )

      webContents.send('auction-status-updated', auctionStatus)
      webContents.send('mtn-converter-status-updated', converterStatus)
      webContents.send('metronome-token-status-updated', tokenStatus)
    })
    .catch(function (err) {
      logger.warn('Could not get metronome status', err.message)

      // Send token status anyway to allow the UI to start
      webContents.send(
        'metronome-token-status-updated',
        { transferAllowed: false }
      )

      // TODO retry before notifying

      webContents.send('connectivity-state-changed', {
        ok: false,
        reason: 'Connection to Ethereum node failed',
        plugin: 'metronome',
        err: err.message
      })
    })
}

module.exports = sendStatus
