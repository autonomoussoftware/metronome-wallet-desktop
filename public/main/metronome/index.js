const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')
const settings = require('electron-settings')

const { getWeb3 } = require('../ethWallet')

let listening = false

const auctionsAbi = require('./contracts/Auctions')

function listenForBlocks (_, webContents) {
  if (listening) {
    return
  }

  listening = true

  const web3 = getWeb3()

  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

  const auctionsAddress = settings.get('metronome.contracts.auctions')
  const auctions = new web3.eth.Contract(auctionsAbi, auctionsAddress)

  blocksSubscription.on('data', function (header) {
    logger.debug('New block header', header.number)

    // TODO throttle this to 30'

    const calls = {
      genesisTime: auctions.methods.genesisTime().call(),
      currentPrice: auctions.methods.currentPrice().call(),
      tokenRemaining: auctions.methods.mintable().call(),
      nextAuctionStartTime: auctions.methods.nextAuction().call().then(data => data._startTime)
    }

    promiseAllProps(calls).then(function (auctionStatus) {
      logger.debug('Auction status', auctionStatus)

      webContents.send('auction-status-updated', auctionStatus)
    })
  })

  blocksSubscription.on('error', function (err) {
    logger.error('Subscription error', err.message)

    // TODO notify error
  })
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: listenForBlocks
  }]
}

module.exports = { getHooks }
