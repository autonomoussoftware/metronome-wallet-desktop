const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const {
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser,
  isAddressInWallet
} = require('../ethWallet')

const { getTokenContractAddresses, getTokenSymbol } = require('./settings')

const ethEvents = getEvents()

function sendBalances ({ walletId, addresses, webContents }) {
  const contractAddresses = getTokenContractAddresses()

  const web3 = getWeb3()
  const contracts = contractAddresses.map(a => a.toLowerCase()).map(address => ({
    contractAddresse: address,
    contract: new web3.eth.Contract(abi, address),
    symbol: getTokenSymbol(address)
  }))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function ({ contractAddresse, contract, symbol }) {
      contract.methods.balanceOf(address).call()
        .then(function (balance) {
          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddresse]: {
                      balance
                    }
                  }
                }
              }
            }
          })
          logger.verbose(`<-- ${symbol} ${address} ${balance}`)
        })
    })
  })
}

// TODO move all subscription code to a single place in ethWallet
// TODO and into getHooks()

let subscriptions = []

ethEvents.on('wallet-opened', function ({ walletId, addresses, webContents }) {
  sendBalances({ walletId, addresses, webContents })

  const web3 = getWeb3()
  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')

  // TODO listen for new txs of wallets instead of all blocks
  blocksSubscription.on('data', function () {
    sendBalances({ walletId, addresses, webContents })
  })

  webContents.on('destroyed', function () {
    blocksSubscription.unsubscribe()
  })

  subscriptions.push({ webContents, blocksSubscription })
})

function unsubscribeUpdates (_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function (s) {
    logger.verbose('Unsubscribing token balance update')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function sendToken ({ password, token: address, from, to, value }) {
  const symbol = getTokenSymbol(address)

  logger.verbose('Sending ERC20 tokens', { from, to, value, token: symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, address)
  const transfer = contract.methods.transfer(to, value)
  const data = transfer.encodeABI()

  return sendTransaction({ password, from, to: address, data, gasMult: 2 })
}

const ERC20_TRANSFER_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ERC20_APPROVAL_SIGNATURE = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

function transactionParser ({ transaction, receipt, walletId }) {
  // TODO analyze the tx, tx receipt and return promise data to be merged with meta
  // Transfer
  // Approval

  const addresses = getTokenContractAddresses()

  const meta = {}
  const tokens = {}

  if (!receipt) {
    const to = (transaction.to || '0x0000000000000000000000000000000000000000').toLowerCase()

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
    const events = receipt.logs.filter(l => l.address.toLowerCase() === address)

    events.forEach(function (log) {
      const signature = log.topics[0]
      if ([ERC20_TRANSFER_SIGNATURE, ERC20_APPROVAL_SIGNATURE].includes(signature)) {
        const from = `0x${log.topics[1].substr(-40)}`
        const to = `0x${log.topics[2].substr(-40)}`

        const web3 = getWeb3()
        const value = web3.utils.toBN(log.data).toString()

        const outgoing = isAddressInWallet({ walletId, address: from })
        const incoming = isAddressInWallet({ walletId, address: to })

        if (outgoing || incoming) {
          tokens[address] = {
            event: signature === ERC20_TRANSFER_SIGNATURE ? 'Transfer' : 'Approval',
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

function getHooks () {
  registerTxParser(transactionParser)

  return [{
    eventName: 'send-token',
    auth: true,
    handler: sendToken
  }, {
    eventName: 'ui-unload',
    handler: unsubscribeUpdates
  }]
}

module.exports = { getHooks }
