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
    const result = Promise.resolve(handler(data))

    result
      .then(res => res.error ? Promise.reject(res.error) : res)
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
    'onboarding-completed': withCore(handlers.onboardingCompleted),
    'create-mnemonic': handlers.createMnemonic,
    'validate-mnemonic': handlers.isValidMnemonic
  })
}

module.exports = { subscribeToRendererMessages }
