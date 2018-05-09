'use strict'

const { getAuctionAddress, getConverterAddress } = require('./settings')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const transactionParser = ethWallet => function ({ transaction, walletId }) {
  const from = transaction.from.toLowerCase()
  const to = (transaction.to || NULL_ADDRESS).toLowerCase()

  const metronome = {}
  const meta = { metronome }

  const outgoing = ethWallet.isAddressInWallet({ walletId, address: from })
  const toAuction = to === getAuctionAddress()
  const toConverter = to === getConverterAddress()

  if (outgoing) {
    if (toAuction) {
      metronome.auction = true
    }

    if (toConverter) {
      metronome.converter = true
    }

    meta.ours = [true]
  }

  return meta
}

module.exports = transactionParser
