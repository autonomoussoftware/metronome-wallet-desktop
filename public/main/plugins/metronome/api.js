'use strict'

const logger = require('electron-log')
const analytics = require('./../../../analytics')

const {
  getAuctionGasLimit
} = require('./auctions')
const {
  encodeConvertEthToMtn,
  encodeConvertMtnToEth,
  getMtnForEthResult,
  getEthForMtnResult,
  getConverterGasLimit
} = require('./converter')
const {
  getAuctionAddress,
  getConverterAddress,
  getTokenAddress
} = require('./settings')

function createApi ({ ethWallet, tokens }) {
  function onBuyMetronome ({ password, from, value, gasLimit, gasPrice }) {
    const address = getAuctionAddress()

    logger.verbose('Buying MET in auction', {
      from, value, address, gasLimit, gasPrice
    })
    analytics.event({ ec: 'Buy', ea: 'Buy MET in auction initiated' })

    return ethWallet.sendTransaction({
      password, from, to: address, value, gasLimit, gasPrice
    })
      .then(function (response) {
        analytics.event({ ec: 'Buy', ea: 'Buy MET in auction succeeded' })
        return response
      })
      .catch(function (err) {
        analytics.event({ ec: 'Buy', ea: 'Buy MET in auction failed' })
        throw err
      })
  }

  function onConvertEthToMtn ({ password, from, value, minReturn, gasLimit, gasPrice }) {
    const web3 = ethWallet.getWeb3()
    const address = getConverterAddress()
    const data = encodeConvertEthToMtn({ web3, address, value, minReturn })

    logger.verbose('Converting ETH to MET', { from, value, address })
    analytics.event({ ec: 'Convert', ea: 'Convert ETH to MET initiated' })

    return ethWallet.sendTransaction({
      password,
      from,
      to: address,
      value,
      data,
      gasLimit,
      gasPrice
    })
      .then(function (response) {
        analytics.event({ ec: 'Convert', ea: 'Convert ETH to MET succeeded' })
        return response
      })
      .catch(function (err) {
        analytics.event({ ec: 'Convert', ea: 'Convert ETH to MET failed' })
        throw err
      })
  }

  function onConvertMtnToEth ({ password, from, value, minReturn, gasPrice, gasLimit }) {
    const token = getTokenAddress()
    const address = getConverterAddress()

    analytics.event({ ec: 'Convert', ea: 'Convert MET to ETH initiated' })

    return tokens.getAllowance({ token, from, to: address })
      .then(function (allowance) {
        logger.debug('Current allowance', allowance)
        const web3 = ethWallet.getWeb3()
        if (web3.utils.toBN(allowance).gtn(0)) {
          return tokens.approveToken({
            password,
            token,
            from,
            to: address,
            value: 0,
            gasPrice,
            gasLimit
          }, true)
        }
        return true
      })
      .then(function () {
        logger.debug('Setting new allowance')
        return tokens.approveToken(
          { password, token, from, to: address, value, gasPrice, gasLimit },
          true
        )
          .then(function () {
            const web3 = ethWallet.getWeb3()
            const data = encodeConvertMtnToEth({ web3, address, value, minReturn })

            logger.verbose('Converting MET to ETH', { from, value, address })

            return ethWallet.sendTransaction({
              password, from, to: address, data, gasPrice, gasLimit
            })
              .then(function (response) {
                analytics.event({ ec: 'Convert', ea: 'Convert MET to ETH succeeded' })
                return response
              })
          })
          .catch(function (err) {
            logger.warn('Conversion failed - removing approval')
            return tokens.approveToken({
              password,
              token,
              from,
              to: address,
              value: 0,
              gasLimit,
              gasPrice
            }).then(function () {
              logger.info('Approval removed')
              throw err
            })
          })
      })
      .catch(function (err) {
        analytics.event({ ec: 'Convert', ea: 'Convert MET to ETH failed' })
        throw err
      })
  }

  function onEstimateEthToMet ({ value }) {
    const web3 = ethWallet.getWeb3()
    const address = getConverterAddress()

    return getMtnForEthResult({ web3, address, value }).then(result => ({
      result
    }))
  }

  function onEstimateMetToEth ({ value }) {
    const web3 = ethWallet.getWeb3()
    const address = getConverterAddress()

    return getEthForMtnResult({ web3, address, value }).then(result => ({
      result
    }))
  }

  function onEthGasLimit ({ from, value }) {
    const web3 = ethWallet.getWeb3()
    const address = getConverterAddress()

    return getConverterGasLimit({ web3, from, address, value, type: 'eth' })
  }

  function onMetGasLimit ({ from, value }) {
    const web3 = ethWallet.getWeb3()
    const address = getConverterAddress()

    return getConverterGasLimit({ web3, from, address, value, type: 'met' })
  }

  function onAuctionGasLimit ({ from, value }) {
    const web3 = ethWallet.getWeb3()
    const to = getAuctionAddress()

    return getAuctionGasLimit({ web3, to, from, value })
  }

  return {
    onBuyMetronome,
    onConvertEthToMtn,
    onConvertMtnToEth,
    onEstimateEthToMet,
    onEstimateMetToEth,
    onEthGasLimit,
    onMetGasLimit,
    onAuctionGasLimit
  }
}

module.exports = createApi
