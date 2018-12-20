'use strict'

const { ipcMain } = require('electron')
const logger = require('electron-log')
const WalletError = require('../WalletError')
const handlers = require('./handlers')

function getLogData (data) {
  if (!data) { return '' }
  const logData = Object.assign({}, data)

  const blackList = ['password']
  blackList.forEach(w => delete logData[w])

  return JSON.stringify(logData)
}

function onRendererEvent (eventName, handler) {
  ipcMain.on(eventName, function (event, { id, data }) {
    logger.verbose(`--> ${eventName}:${id} ${getLogData()}`)
    const result = handler(data)

    result
      .then(function (res) {
        if (event.sender.isDestroyed()) {
          return
        }
        event.sender.send(eventName, { id, data: res })
        logger.verbose(`<-- ${eventName}:${id} ${JSON.stringify(res)}`)
      })
      .catch(function (err) {
        if (event.sender.isDestroyed()) {
          return
        }
        const error = new WalletError(err.message)
        event.sender.send(eventName, { id, data: { error } })
        logger.warn(`<-- ${eventName}:${id} ${err.message}`)
      })
      .catch(function (err) {
        logger.warn(`Could not send message to renderer: ${err.message}`)
      })
  })
}

const subscribeToRendererMessages = function (emitter, core) {
  function subscribeTo (types) {
    return Object.keys(types).forEach(type =>
      onRendererEvent(type, types[type])
    )
  }

  function withCore (fn) {
    return function (data) {
      return fn(data, emitter, core)
    }
  }

  subscribeTo({
    'get-convert-eth-gas-limit': withCore(handlers.getConvertEthGasLimit),
    'get-convert-met-gas-limit': withCore(handlers.getConvertMetGasLimit),
    'get-convert-eth-estimate': withCore(handlers.getConvertEthEstimate),
    'get-convert-met-estimate': withCore(handlers.getConvertMetEstimate),
    'recover-from-mnemonic': withCore(handlers.recoverFromMnemonic),
    'onboarding-completed': withCore(handlers.onboardingCompleted),
    'get-auction-gas-limit': withCore(handlers.getAuctionGasLimit),
    'get-tokens-gas-limit': withCore(handlers.getTokensGasLimit),
    'validate-password': handlers.validatePassword,
    'buy-metronome': withCore(handlers.buyMetronome),
    'login-submit': withCore(handlers.onLoginSubmit),
    'get-gas-limit': withCore(handlers.getGasLimit),
    'get-gas-price': withCore(handlers.getGasPrice),
    'convert-eth': withCore(handlers.convertEth),
    'convert-met': withCore(handlers.convertMet),
    'send-eth': withCore(handlers.sendEth),
    'send-met': withCore(handlers.sendMet),
    'clear-cache': handlers.clearCache
  })
}

module.exports = { subscribeToRendererMessages }
