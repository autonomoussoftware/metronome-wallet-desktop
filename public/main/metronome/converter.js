const promiseAllProps = require('promise-all-props')

const converterAbi = require('./contracts/AutonomousConverter.mwjs')

function getConverterStatus ({ web3, address }) {
  const converter = new web3.eth.Contract(converterAbi, address)

  const calls = {
    availableMtn: converter.methods.getMtnBalance().call(),
    availableEth: converter.methods.getEthBalance().call(),
    currentPrice: converter.methods.getEthForMtnResult(web3.utils.toWei('1', 'ether')).call()
  }

  return promiseAllProps(calls)
}

module.exports = { getConverterStatus }
