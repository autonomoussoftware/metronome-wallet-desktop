const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const WalletError = require('../../WalletError')
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

function sendBalances({ walletId, addresses, webContents }) {
  const contractAddresses = getTokenContractAddresses()

  const web3 = getWeb3()
  const contracts = contractAddresses
    .map(a => a.toLowerCase())
    .map(address => ({
      contractAddress: address,
      contract: new web3.eth.Contract(abi, address),
      symbol: getTokenSymbol(address)
    }))

  addresses.map(a => a.toLowerCase()).forEach(function(address) {
    contracts.forEach(function({ contractAddress, contract, symbol }) {
      contract.methods
        .balanceOf(address)
        .call()
        .then(function(balance) {
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
        .catch(function(err) {
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
                      balance: getTokenBalance({
                        walletId,
                        address,
                        contractAddress
                      })
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

let subscriptions = []

function unsubscribeUpdates(_, webContents) {
  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

const ethEvents = getEvents()

ethEvents.on('wallet-opened', function ({ walletId, addresses, webContents }) {
  sendBalances({ walletId, addresses, webContents })

  webContents.on('destroyed', function () {
    unsubscribeUpdates(null, webContents)
  })

  subscriptions = subscriptions.concat({ walletId, addresses, webContents })
})

ethEvents.on('new-block-header', function () {
  subscriptions.forEach(sendBalances)
})

function callTokenMethod(method, args, waitForReceipt) {
  const { password, token, from, to, value, gasPrice, gasLimit } = args

  logger.verbose(`Calling ${method} of ERC20 token`, {
    from,
    to,
    value,
    token,
    gasLimit,
    gasPrice
  })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, token)
  const call = contract.methods[method](to, value)
  const data = call.encodeABI()

  return sendTransaction({ password, from, to: token, data, gasPrice, gasLimit }, waitForReceipt)
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
          log.address.toLowerCase() === token &&
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

function getAllowance ({ token, from, to }) {
  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, token)
  return contract.methods.allowance(from, to).call()
}

function getGasLimit({ token, to, from, value }) {
  const symbol = getTokenSymbol(token)

  logger.verbose('Getting token gas limit', { to, value, symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, token)
  const transfer = contract.methods.transfer(to, value)

  return transfer.estimateGas({ from }).then(gasLimit => {
    logger.verbose('Token gas limit retrieved', gasLimit)

    return { gasLimit }
  })
}

function getHooks() {
  registerTxParser(transactionParser)

  return [
    { eventName: 'send-token', auth: true, handler: args => sendToken(args) },
    { eventName: 'ui-unload', handler: unsubscribeUpdates },
    { eventName: 'tokens-get-gas-limit', handler: getGasLimit }
  ]
}

module.exports = { getHooks, approveToken, getAllowance }
