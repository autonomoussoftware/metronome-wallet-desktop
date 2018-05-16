'use strict'

const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')
const { get } = require('lodash/fp')

const auctionsAbi = require('./contracts/Auctions')

function getAuctionStatus ({ web3, address }) {
  const auctions = new web3.eth.Contract(auctionsAbi, address)

  const calls = {
    genesisTime: auctions.methods.genesisTime().call()
      .then(t => Number.parseInt(t, 10)),
    currentPrice: auctions.methods.currentPrice().call()
      .catch(() => 0),
    tokenRemaining: auctions.methods.heartbeat().call()
      .catch(() => ({ minting: 0 }))
      .then(get('minting')), // [4]
    nextAuctionStartTime: auctions.methods.heartbeat().call()
      .catch(() => ({ nextAuctionGMT: 0 }))
      .then(get('nextAuctionGMT')) // [9]
      .then(t => Number.parseInt(t, 10)),
    currentAuction: auctions.methods.currentAuction().call()
      .catch(() => 0),
    isInitialAuctionEnded: auctions.methods.isInitialAuctionEnded().call()
  }

  return promiseAllProps(calls)
}

function getAuctionGasLimit ({ web3, from, to, value }) {
  logger.verbose('Getting auction limit gas for address: ', { from, to, value })

  // TODO: temp fix to avoid underestimation
  const MULT = 1.1
  return web3.eth.estimateGas({ from, to, value })
    .then(gasLimit => ({ gasLimit: Math.ceil(gasLimit * MULT) }))
}

module.exports = { getAuctionStatus, getAuctionGasLimit }
