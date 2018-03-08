const { isAddressInWallet } = require('../ethWallet')
const { getAuctionAddress, getConverterAddress } = require('./settings')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

function transactionParser ({ transaction, walletId }) {
  const from = transaction.from.toLowerCase()
  const to = (transaction.to || NULL_ADDRESS).toLowerCase()

  const metronome = {}
  const meta = { metronome }

  const outgoing = isAddressInWallet({ walletId, address: from })
  const toAuction = to === getAuctionAddress() // settings.get('metronome.contracts.auctions').toLowerCase()
  const toConverter = to === getConverterAddress() // settings.get('metronome.contracts.converter').toLowerCase()

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

module.exports = { transactionParser }
