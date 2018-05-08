'use strict'

const logger = require('electron-log')

const tokenAbi = require('./contracts/MTNToken')

const contracts = {}

const isTransferAllowed = address => contracts[address.toLowerCase()] || false

function setTransferAllowed (address, allowed) {
  contracts[address.toLowerCase()] = !!allowed
}

function getTokenStatus ({ web3, address }) {
  if (isTransferAllowed(address)) {
    return Promise.resolve({ transferAllowed: true })
  }

  const token = new web3.eth.Contract(tokenAbi, address)
  return token.methods.transferAllowed().call()
    .then(function (allowed) {
      logger.verbose('Token transfer allowed?', allowed)

      setTransferAllowed(address, allowed)

      return { transferAllowed: allowed }
    })
    .catch(function (err) {
      logger.warn('Could not get token transfer status', err.message)

      // Default to false, as this is the "conservative" option
      return { transferAllowed: false }
    })
}

module.exports = { getTokenStatus }
