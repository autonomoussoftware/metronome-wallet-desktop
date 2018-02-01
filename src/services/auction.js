import Web3 from 'web3'
import promiseAllProps from 'promise-all-props'

import mtn from './mtn'

const auction = {}

const toInt = str => parseInt(str, 10)

auction.getStatus = function () {
  const token = mtn.mtntoken.methods
  const auctions = mtn.auctions.methods

  return promiseAllProps({
    currentAuction: auctions.currentAuction().call(),
    currentPrice: auctions.currentPrice().call(),
    genesisTime: auctions.genesisTime().call().then(toInt),
    globalMtnSupply: auctions.globalMtnSupply().call(),
    lastPurchasePrice: auctions.lastPurchasePrice().call(),
    lastPurchaseTick: auctions.lastPurchaseTick().call().then(toInt),
    mintable: auctions.mintable().call(),
    nextAuction: auctions.nextAuction().call(),
    totalSupply: token.totalSupply().call()
  })
    .then(
    ({
      currentAuction,
      currentPrice,
      genesisTime,
      globalMtnSupply,
      lastPurchasePrice,
      lastPurchaseTick,
      mintable,
      nextAuction,
      totalSupply
    }) => {
      return {
        currentAuction,
        currentPrice,
        genesisTime,
        lastPurchasePrice,
        lastPurchaseTime: genesisTime + lastPurchaseTick * 60,
        nextAuctionStartTime: toInt(nextAuction._startTime),
        tokenCirculation: totalSupply,
        tokenRemaining: mintable,
        tokenSold: globalMtnSupply && mintable
          ? Web3.utils.toBN(globalMtnSupply).sub(Web3.utils.toBN(mintable)).toString()
          : '0'
      }
    })
    .catch(err => { throw err })
}

auction.buy = function (address, amount) {
  return Web3.sendTransaction(address, mtn.auctions.options.address, amount)
}

export default auction