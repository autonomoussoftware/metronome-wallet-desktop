'use strict'

const auctionsAbi = require('metronome-contracts/src/abis/Auctions')
const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

function parseAuctionStatus (status) {
  const {
    currentAuction,
    currentPrice,
    genesisTime,
    heartbeat: {
      minting,
      nextAuctionGMT
    },
    isInitialAuctionEnded
  } = status

  return {
    currentAuction,
    currentPrice,
    genesisTime: Number.parseInt(genesisTime, 10),
    isInitialAuctionEnded,
    nextAuctionStartTime: Number.parseInt(nextAuctionGMT, 10),
    tokenRemaining: minting
  }
}

function getAuctionStatus ({ web3, address }) {
  const auctions = new web3.eth.Contract(auctionsAbi, address)

  const calls = {
    genesisTime: auctions.methods.genesisTime().call(),
    currentPrice: auctions.methods.currentPrice().call()
      .catch(() => 0),
    heartbeat: auctions.methods.heartbeat().call()
      .catch(() => ({ minting: 0, nextAuctionGMT: 0 })),
    currentAuction: auctions.methods.currentAuction().call()
      .catch(() => 0),
    isInitialAuctionEnded: auctions.methods.isInitialAuctionEnded().call()
  }

  return promiseAllProps(calls)
    .then(parseAuctionStatus)
}

function getAuctionGasLimit ({ web3, from, to, value }) {
  logger.verbose('Getting auction limit gas for address: ', { from, to, value })

  // TODO: temp fix to avoid underestimation
  const MULT = 1.1
  return web3.eth.estimateGas({ from, to, value })
    .then(gasLimit => ({ gasLimit: Math.ceil(gasLimit * MULT) }))
}

module.exports = { getAuctionStatus, getAuctionGasLimit }
