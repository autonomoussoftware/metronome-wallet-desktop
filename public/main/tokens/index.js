const abi = require('human-standard-token-abi')
const logger = require('electron-log')
const settings = require('electron-settings')

const { getWeb3, sendSignedTransaction, getEvents } = require('../ethWallet')

const ethEvents = getEvents()

ethEvents.on('wallet-opened', function ({ walletId, addresses, webContents }) {
  const contractAddresses = Object.keys(settings.get('tokens'))

  const web3 = getWeb3()
  const contracts = contractAddresses.map(address => new web3.eth.Contract(abi, address))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    contracts.forEach(function (contract) {
      contract.methods.balanceOf(address).call()
        .then(function (balance) {
          webContents.send('wallet-state-changed', {
            [walletId]: {
              addresses: {
                [address]: {
                  token: {
                    [contract.options.address.toLowerCase()]: {
                      balance
                    }
                  }
                }
              }
            }
          })
          logger.debug(`Address MTN balance updated - ${address} ${balance}`)
        })
    })
  })
})

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
