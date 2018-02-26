const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')

const abi = require('./contracts/AutonomousConverter.75f890c')

function getConverterStatus({ web3, address }) {
  const converter = new web3.eth.Contract(abi, address)

  const calls = {
    availableMtn: converter.methods.getMtnBalance().call(),
    availableEth: converter.methods.getEthBalance().call(),
    currentPrice: converter.methods
      .getEthForMtnResult(web3.utils.toWei('1', 'ether'))
      .call()
  }

  return promiseAllProps(calls)
}

function encodeConvertEthToMtn({ web3, address, minReturn = 1 }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertEthToMtn(minReturn)
  const data = convert.encodeABI()

  return data
}

function encodeConvertMtnToEth({ web3, address, value, minReturn = 1 }) {
  const contract = new web3.eth.Contract(abi, address)
  const convert = contract.methods.convertMtnToEth(value, minReturn)
  const data = convert.encodeABI()

  return data
}

function getMtnForEthResult ({ web3, address, value }) {
  const contract = new web3.eth.Contract(abi, address)

  return contract.methods.getMtnForEthResult(value).call()
}

function getEthForMtnResult ({ web3, address, value }) {
  const contract = new web3.eth.Contract(abi, address)

  return contract.methods.getEthForMtnResult(value).call()
}

function getGasLimit({ web3, from, address, value, minReturn = 1 }) {
  logger.verbose('Getting converter gas limit', { address, value, from })

  const contract = new web3.eth.Contract(abi, address)
  const convertMtnToEth = contract.methods.convertMtnToEth(value, minReturn)

  return convertMtnToEth.estimateGas({ from }).then(gasLimit => {
    logger.verbose('Converter gas limit retrieved', gasLimit)

    return { gasLimit }
  })
}


module.exports = {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getConverterStatus,
  getMtnForEthResult,
  getEthForMtnResult
  getGasLimit
}
