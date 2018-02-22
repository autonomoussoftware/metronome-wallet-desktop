const { isAddressInWallet } = require('./settings')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

function transactionParser ({ transaction, receipt, walletId }) {
  const from = transaction.from.toLowerCase()
  const to = (transaction.to || NULL_ADDRESS).toLowerCase()

  const { input, gas } = transaction

  const outgoing = isAddressInWallet({ walletId, address: from })
  const incoming = isAddressInWallet({ walletId, address: to })

  const meta = {
    ours: [outgoing || incoming]
  }

  meta.contractCallFailed = receipt &&
    (receipt.status === 0 || // byzantium fork
    (input !== '0x' && gas === receipt.gasUsed && !receipt.logs.length))

  if (meta.ours) {
    meta.walletIds = [walletId]
    meta.addresses = outgoing ? [from] : incoming ? [to] : []
  }

  return meta
}

module.exports = { transactionParser }
