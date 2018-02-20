const { getWeb3, isAddressInWallet } = require('../ethWallet')

const { getTokenContractAddresses } = require('./settings')

const erc20Events = [{
  name: 'Transfer',
  signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
}, {
  name: 'Approval',
  signature: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
}]

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const topicToAddress = topic => `0x${topic.substr(-40)}`

function transactionParser ({ transaction, receipt, walletId }) {
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

        const web3 = getWeb3()
        const value = web3.utils.toBN(log.data).toString()

        const outgoing = isAddressInWallet({ walletId, address: from })
        const incoming = isAddressInWallet({ walletId, address: to })

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

module.exports = { transactionParser }
