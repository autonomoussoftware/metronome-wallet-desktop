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
    currentPrice: auctions.methods.currentPrice().call(),
    tokenRemaining: auctions.methods.heartbeat().call()
      .then(get('[4]')),
    nextAuctionStartTime: auctions.methods.nextAuction().call()
      .then(data => data._startTime)
      .then(t => Number.parseInt(t, 10)),
    currentAuction: auctions.methods.currentAuction().call(),
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
