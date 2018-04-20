'use strict'

const abi = require('human-standard-token-abi')
const logger = require('electron-log')

const WalletError = require('../../WalletError')

const { getTokenSymbol } = require('./settings')
const erc20Events = require('./erc20-events')
const topicToAddress = require('./topic-to-address')

function createApi (ethWallet) {
  function callTokenMethod (method, args, waitForReceipt) {
    const { password, token, from, to, value, gasPrice, gasLimit } = args

    logger.verbose(`Calling ${method} of ERC20 token`, {
      from,
      to,
      value,
      token,
      gasLimit,
      gasPrice
    })

    const web3 = ethWallet.getWeb3()
    const contract = new web3.eth.Contract(abi, token)
    const call = contract.methods[method](to, value)
    const data = call.encodeABI()

    return ethWallet.sendTransaction(
      { password, from, to: token, data, gasPrice, gasLimit },
      waitForReceipt
    )
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

  const sendToken = (args, waitForReceipt) =>
    callTokenMethod('transfer', args, waitForReceipt)

  const approveToken = (args, waitForReceipt) =>
    callTokenMethod('approve', args, waitForReceipt)

  function getAllowance ({ token, from, to }) {
    const web3 = ethWallet.getWeb3()
    const contract = new web3.eth.Contract(abi, token)
    return contract.methods.allowance(from, to).call()
  }

  function getGasLimit ({ token, to, from, value }) {
    const symbol = getTokenSymbol(token)

    logger.verbose('Getting token gas limit', { to, value, symbol })

    const web3 = ethWallet.getWeb3()
    const contract = new web3.eth.Contract(abi, token)
    const transfer = contract.methods.transfer(to, value)

    return transfer.estimateGas({ from }).then(function (gasLimit) {
      logger.verbose('Token gas limit retrieved', gasLimit)

      return { gasLimit }
    })
  }

  return {
    approveToken,
    getAllowance,
    sendToken,
    getGasLimit
  }
}

module.exports = createApi
