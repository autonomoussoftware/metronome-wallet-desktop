const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const WalletError = require('../WalletError')
const {
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser
} = require('../ethWallet')

const {
  getTokenBalance,
  getTokenContractAddresses,
  getTokenSymbol,
  setTokenBalance
} = require('./settings')
const {
  erc20Events,
  topicToAddress,
  transactionParser
} = require('./transactionParser')

const ethEvents = getEvents()

function sendBalances ({ walletId, addresses, webContents }) {
  const contractAddresses = getTokenContractAddresses()

  const web3 = getWeb3()
  const contracts = contractAddresses.map(a => a.toLowerCase()).map(address => ({
    contractAddress: address,
    contract: new web3.eth.Contract(abi, address),
    symbol: getTokenSymbol(address)
  }))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function ({ contractAddress, contract, symbol }) {
      contract.methods.balanceOf(address).call()
        .then(function (balance) {
          setTokenBalance({ walletId, address, contractAddress, balance })

          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddress]: {
                      balance
                    }
                  }
                }
              }
            }
          })
          logger.verbose(`<-- ${symbol} ${address} ${balance}`)
        })
        .catch(function (err) {
          logger.warn('Could not get token balance', symbol, err)

          // TODO retry before notifying

          webContents.send('connectivity-state-changed', {
            ok: false,
            reason: 'Call to Ethereum node failed',
            plugin: 'tokens',
            err: err.message
          })

          // Send cached balance
          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contractAddress]: {
                      balance: getTokenBalance({ walletId, address, contractAddress })
                    }
                  }
                }
              }
            }
          })
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

function callTokenMethod (method, args, waitForReceipt) {
  const { password, token, from, to, value } = args

  logger.verbose(`Calling ${method} of ERC20 token`, { from, to, value, token })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, token)
  const call = contract.methods[method](to, value)
  const data = call.encodeABI()

  return sendTransaction({ password, from, to: token, data, gasMult: 2 }, waitForReceipt)
    .then(function (result) {
      if (!waitForReceipt) {
        return result
      }

      const eventName = {
        transfer: 'Transfer',
        approve: 'Approval'
      }[method]
      const signature = erc20Events.find(e => e.name === eventName).signature
      const success = (result.status === 0 ||
        result.logs.find(log =>
          log.address === token &&
          log.topics[0] === signature &&
          topicToAddress(log.topics[1]) === from.toLowerCase() &&
          topicToAddress(log.topics[2]) === to.toLowerCase()
          // TODO validate data === value
        )
      )

      if (!success) {
        throw new WalletError(`Token call ${method} failed`)
      }

      return result
    })
}

function sendToken (args, waitForReceipt) {
  return callTokenMethod('transfer', args, waitForReceipt)
}

function approveToken (args, waitForReceipt) {
  return callTokenMethod('approve', args, waitForReceipt)
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

module.exports = { getHooks, approveToken }
