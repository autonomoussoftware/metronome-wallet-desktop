'use strict'

const { ipcMain } = require('electron')
const logger = require('electron-log')
const WalletError = require('../WalletError')
const handlers = require('../handlers')

function getLogData (data) {
  if (!data) {
    return ''
  }
  const logData = Object.assign({}, data)

  const blackList = ['password']
  blackList.forEach(w => delete logData[w])

  return JSON.stringify(logData)
}

const logEvent = eventName => eventName !== 'persist-state'

const ignoreChain = (chain, data) =>
  (chain !== 'multi' && chain !== 'none' && data.chain && chain !== data.chain)

function onRendererEvent (eventName, handler, chain) {
  ipcMain.on(eventName, function (event, { id, data }) {
    if (ignoreChain(chain, data)) {
      return
    }
    if (logEvent(eventName)) {
      logger.verbose(`--> ${eventName}:${id} ${getLogData()}`)
    }
    const result = handler(data)

    result
      .then(function (res) {
        if (event.sender.isDestroyed()) {
          return
        }
        event.sender.send(eventName, { id, data: res })
        if (logEvent(eventName)) {
          logger.verbose(`<-- ${eventName}:${id} ${JSON.stringify(res)}`)
        }
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

const subscribeTo = (types, chain) =>
  Object.keys(types).forEach(type => onRendererEvent(type, types[type], chain))

// Subscribe to messages where only one particular core has to react
function subscribeSingleCore ({ emitter, coreApi, chain }) {
  const withCore = fn => data => fn(data, { emitter, coreApi, chain })

  subscribeTo({
    'get-convert-eth-gas-limit': withCore(handlers.getConvertEthGasLimit),
    'get-convert-met-gas-limit': withCore(handlers.getConvertMetGasLimit),
    'get-convert-eth-estimate': withCore(handlers.getConvertEthEstimate),
    'get-convert-met-estimate': withCore(handlers.getConvertMetEstimate),
    'get-auction-gas-limit': withCore(handlers.getAuctionGasLimit),
    'get-tokens-gas-limit': withCore(handlers.getTokensGasLimit),
    'buy-metronome': withCore(handlers.buyMetronome),
    'get-gas-limit': withCore(handlers.getGasLimit),
    'get-gas-price': withCore(handlers.getGasPrice),
    'convert-eth': withCore(handlers.convertEth),
    'convert-met': withCore(handlers.convertMet),
    'send-eth': withCore(handlers.sendEth),
    'send-met': withCore(handlers.sendMet)
  }, chain)
}

// Subscribe to messages where no core has to react
const subscribeWithoutCore = () =>
  subscribeTo({
    'validate-password': handlers.validatePassword,
    'persist-state': handlers.persistState,
    'clear-cache': handlers.clearCache
  }, 'none')

// Subscribe to messages where two or more cores have to react
function subscribeMultiCore (cores) {
  const withCores = fn => data => fn(data, cores)

  subscribeTo({
    'recover-from-mnemonic': withCores(handlers.recoverFromMnemonic),
    'onboarding-completed': withCores(handlers.onboardingCompleted),
    'login-submit': withCores(handlers.onLoginSubmit)
  }, 'multi')
}

function subscribe (cores) {
  cores.forEach(subscribeSingleCore)
  subscribeMultiCore(cores)
  subscribeWithoutCore()
}

module.exports = { subscribe }
