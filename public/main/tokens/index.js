const abi = require('human-standard-token-abi')
const logger = require('electron-log')
const settings = require('electron-settings')

const { getWeb3, sendSignedTransaction } = require('../ethWallet')

function sendToken ({ password, token: address, from, to, value }) {
  const symbol = settings.get(`tokens.${address}.symbol`)

  logger.debug('Sending ERC20 tokens', { from, to, value, token: symbol })

  const web3 = getWeb3()
  const contract = new web3.eth.Contract(abi, address)
  const transfer = contract.methods.transfer(to, value)
  const data = transfer.encodeABI()

  // TODO estimate gas with transfer.estimateGas()
  const gas = 200000

  return sendSignedTransaction({ password, from, to: address, data, gas })
}

function getHooks () {
  return [{
    eventName: 'send-token',
    auth: true,
    handler: sendToken
  }]
}

module.exports = { getHooks }
