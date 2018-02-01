import promiseAllProps from 'promise-all-props'

import mtn from './mtn'
import wallet from './wallet'

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
          ? mtn.web3.utils.toBN(globalMtnSupply).sub(mtn.web3.utils.toBN(mintable)).toString()
          : '0'
      }
    })
    .catch(err => { throw err })
}

auction.buy = function (amount) {
  const from = wallet.getAddress()
  const weiAmount = mtn.web3.utils.toWei(amount.replace(',', '.'))
  return wallet.sendTransaction(from, mtn.auctions.options.address, weiAmount)
}

export default auction