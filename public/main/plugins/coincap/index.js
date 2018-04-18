'use strict'

const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')
const EventEmitter = require('events')

let emitter

function startEmitter () {
  if (emitter) {
    return
  }

  logger.verbose('Initializing CoinCap listener')

  emitter = new EventEmitter()

  const ethPriceEmitRateMs = settings.get('coincap.ethPriceEmitRate') * 1000

  const emitEthPrice = throttle(function (price) {
    emitter.emit('price', price)
  }, ethPriceEmitRateMs, { leading: true, trailing: false })

  coincap.open()

  coincap.on('trades', function (trade) {
    const { coin, market_id: marketId, msg: { price } } = trade

    if (coin !== 'ETH' || marketId !== 'ETH_USD') {
      return
    }

    emitEthPrice(price)
  })

  // TODO capture Socket.IO error events
}

function stopEmitter () {
  if (!emitter || emitter.listenerCount('price')) {
    return
  }

  coincap.off('trades')
  coincap.close()

  emitter = null

  logger.verbose('CoinCap listener stopped')
}

function emitPrice (webContents) {
  return function (price) {
    const priceData = { token: 'ETH', currency: 'USD', price }

    webContents.send('eth-price-updated', priceData)
    logger.verbose(`<-- eth-price-updated ${JSON.stringify(price)}`)

    settings.set('coincap.ETH_USD', price)
  }
}

const listeners = []

function registerListener (webContents, listener) {
  listeners.push({ webContents, listener })
}

function removeListener (webContents) {
  const index = listeners.findIndex(r => r.webContents === webContents)

  if (index === -1) {
    return
  }

  logger.verbose('Remove ETH price changes listener')

  const record = listeners.splice(index, 1)[0]

  emitter.removeListener('price', record.listener)

  stopEmitter()
}

function startCoinCap (data, webContents) {
  startEmitter()

  const emit = emitPrice(webContents)

  const cachedPrice = settings.get('coincap.ETH_USD')
  if (cachedPrice) {
    logger.verbose('Sending cached ETH price')
    emit(cachedPrice)
  }

  logger.verbose('Attaching listener to ETH price changes')
  emitter.on('price', emit)

  registerListener(webContents, emit)

  webContents.on('destroyed', function () {
    removeListener(webContents)
  })
}

function stopCoinCap (data, webContents) {
  removeListener(webContents)
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: startCoinCap
  }, {
    eventName: 'ui-unload',
    handler: stopCoinCap
  }]
}
// TODO listen window events to stop and restart the coincap listener

module.exports = { getHooks }
