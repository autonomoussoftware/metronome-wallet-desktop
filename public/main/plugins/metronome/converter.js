'use strict'

const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const abi = require('./contracts/AutonomousConverter')

function getConverterStatus ({ web3, address }) {
  const converter = new web3.eth.Contract(abi, address)

  const calls = {
    availableMtn: converter.methods.getMetBalance().call(),
    availableEth: converter.methods.getEthBalance().call(),
    currentPrice: converter.methods
      .getEthForMetResult(web3.utils.toWei('1', 'ether'))
      .call()
  }

  return promiseAllProps(calls)
}

function encodeConvertEthToMtn ({ web3, address, minReturn = 1 }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertEthToMet(minReturn)
  const data = convert.encodeABI()

  return data
}

function encodeConvertMtnToEth ({ web3, address, value, minReturn = 1 }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertMetToEth(value, minReturn)
  const data = convert.encodeABI()

  return data
}

function getMtnForEthResult ({ web3, address, value }) {
  const contract = new web3.eth.Contract(abi, address)
  return contract.methods.getMetForEthResult(value).call()
}

function getEthForMtnResult ({ web3, address, value }) {
  const contract = new web3.eth.Contract(abi, address)
  return contract.methods.getEthForMetResult(value).call()
}

function getConverterGasLimit ({ web3, from, address, value, minReturn = '1', type = 'met' }) {
  logger.verbose(`Getting ${type} converter gas limit`, { address, value, from, minReturn })

  const contract = new web3.eth.Contract(abi, address)
  const convert = type === 'met'
    ? contract.methods.convertMetToEth(value, minReturn)
    : contract.methods.convertEthToMet(minReturn)

  const data = convert.encodeABI()
  value = type === 'met' ? '0' : value

  return web3.eth.estimateGas({ data, from, to: address, value })
    .then(function (gasLimit) {
      logger.verbose(`Converter ${type} gas limit retrieved`, gasLimit)
      return { gasLimit }
    })
    .catch(function (err) {
      logger.warn(`Could not estimate converter ${type} gas`, err.message)
      throw err
    })
}

module.exports = {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getConverterStatus,
  getMtnForEthResult,
  getEthForMtnResult,
  getConverterGasLimit
}
