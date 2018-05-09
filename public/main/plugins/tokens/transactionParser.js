'use strict'

const { getTokenContractAddresses } = require('./settings')
const erc20Events = require('./erc20-events')
const topicToAddress = require('./topic-to-address')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const transactionParser = ethWallet => function ({ transaction, receipt, walletId }) {
  const addresses = getTokenContractAddresses()

  const meta = {}
  const tokens = {}

  if (!receipt) {
    const to = (transaction.to || NULL_ADDRESS).toLowerCase()

    const related = addresses.filter(a => a === to)

    related.forEach(function (address) {
      tokens[address] = {
        processing: true
      }

      meta.tokens = tokens
    })

    return meta
  }

  addresses.forEach(function (address) {
    const logs = receipt.logs.filter(l => l.address.toLowerCase() === address)

    logs.forEach(function (log) {
      const signature = log.topics[0]
      const event = erc20Events.find(e => e.signature === signature)

      if (event) {
        const from = topicToAddress(log.topics[1])
        const to = topicToAddress(log.topics[2])

        const web3 = ethWallet.getWeb3()
        const value = web3.utils.toBN(log.data).toString()

        const outgoing = ethWallet.isAddressInWallet({ walletId, address: from })
        const incoming = ethWallet.isAddressInWallet({ walletId, address: to })

        if (outgoing || incoming) {
          tokens[address] = {
            event: event.name,
            from,
            to,
            value,
            processing: false
          }

          meta.tokens = tokens
          meta.walletId = [walletId]
          meta.addresses = [outgoing ? from : to]
          meta.ours = [true]
        }
      }
    })
  })

  return meta
}

module.exports = transactionParser
