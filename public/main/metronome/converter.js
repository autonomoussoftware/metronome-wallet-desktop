const promiseAllProps = require('promise-all-props')

const abi = require('./contracts/AutonomousConverter.75f890c')

function getConverterStatus ({ web3, address }) {
  const converter = new web3.eth.Contract(abi, address)

  const calls = {
    availableMtn: converter.methods.getMtnBalance().call(),
    availableEth: converter.methods.getEthBalance().call(),
    currentPrice: converter.methods.getEthForMtnResult(web3.utils.toWei('1', 'ether')).call()
  }

  return promiseAllProps(calls)
}

function encodeConvertEthToMtn ({ web3, address, value }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertEthToMtn(value)
  const data = convert.encodeABI()

  return data
}

function encodeConvertMtnToEth ({ web3, address, value, minReturn = 1 }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertMtnToEth(value, minReturn)
  const data = convert.encodeABI()

  return data
}

module.exports = {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getConverterStatus
}
