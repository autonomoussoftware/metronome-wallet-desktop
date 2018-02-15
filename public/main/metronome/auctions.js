const promiseAllProps = require('promise-all-props')

const auctionsAbi = require('./contracts/Auctions.0a5d422')

function getAuctionStatus ({ web3, address }) {
  const auctions = new web3.eth.Contract(auctionsAbi, address)

  const calls = {
    genesisTime: auctions.methods.genesisTime().call()
      .then(t => Number.parseInt(t, 10)),
    currentPrice: auctions.methods.currentPrice().call(),
    tokenRemaining: auctions.methods.mintable().call(),
    nextAuctionStartTime: auctions.methods.nextAuction().call()
      .then(data => data._startTime)
      .then(t => Number.parseInt(t, 10)),
    currentAuction: auctions.methods.currentAuction().call()
  }

  return promiseAllProps(calls)
}

module.exports = { getAuctionStatus }
