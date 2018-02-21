const { isAddressInWallet } = require('./settings')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

function transactionParser ({ transaction, receipt, walletId }) {
  const from = transaction.from.toLowerCase()
  const to = (transaction.to || NULL_ADDRESS).toLowerCase()

  const outgoing = isAddressInWallet({ walletId, address: from })
  const incoming = isAddressInWallet({ walletId, address: to })

  const meta = {
    ours: [outgoing || incoming]
  }

  if (receipt && transaction.gas === receipt.gasUsed && !receipt.logs.length) {
    meta.contractCallFailed = true
  }

  if (meta.ours) {
    meta.walletIds = [walletId]
    meta.addresses = outgoing ? [from] : incoming ? [to] : []
  }

  return meta
}

module.exports = { transactionParser }
