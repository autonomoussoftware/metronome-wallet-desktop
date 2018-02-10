const { merge, pick } = require('lodash')
const EthereumTx = require('ethereumjs-tx')
const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const getWeb3 = require('./web3')

const bufferToHexString = buffer => `0x${buffer.toString('hex')}`

function getAddressBalance (address) {
  const web3 = getWeb3()
  return web3.eth.getBalance(address)
}

/**
 * @param {Object} params is { from, to, value, data }
 */
function completedTransactionParams (params, options) {
  const { gasMult } = options
  const { from } = params
  const web3 = getWeb3()
  const promises = {
    chainId: web3.eth.net.getId(),
    gas: web3.eth.estimateGas(params).then(gas => gas * (gasMult || 1)),
    gasPrice: web3.eth.getGasPrice().then(price => web3.utils.toHex(price)),
    nonce: web3.eth.getTransactionCount(from)
  }
  return promiseAllProps(promises)
    .then(function (values) {
      const merged = merge(values, params)
      logger.debug('Transaction params', merged)
      return merged
    })
}

function getSignedTransaction ({ params, privateKey }) {
  const tx = new EthereumTx(params)
  tx.sign(privateKey)
  return tx
}

function sendSignedTransaction (signedTransaction) {
  const web3 = getWeb3()
  const hash = signedTransaction.hash()
  const string = bufferToHexString(signedTransaction.serialize())
  const emitter = web3.eth.sendSignedTransaction(string)
  logger.verbose('Ethereum transaction sent', { hash: bufferToHexString(hash) })
  return { emitter }
}

module.exports = {
  getAddressBalance,
  getSignedTransaction,
  completedTransactionParams,
  sendSignedTransaction
}
