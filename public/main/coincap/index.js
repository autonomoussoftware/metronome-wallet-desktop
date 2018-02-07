const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')
const EventEmitter = require('events')

let emitter

function initEmitter () {
  logger.debug('Initializing CoinCap listener')

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

function emitPrice (webContents) {
  return function (price) {
    const priceData = { token: 'ETH', currency: 'USD', price }

    webContents.send('eth-price-updated', priceData)
    logger.debug(`<-- eth-price-updated ${JSON.stringify(price)}`)
  }
}

function init (data, webContents) {
  if (!emitter) {
    initEmitter()
  }

  const emit = emitPrice(webContents)

  logger.debug('Attaching listener to ETH price changes')
  emitter.on('price', emit)

  function removeListener () {
    emitter.removeListener('price', emit)

    logger.debug('Remove ETH price changes listener')

    if (!emitter.listenerCount('price')) {
      coincap.off('trades')
      coincap.close()

      emitter = null

      logger.debug('CoinCap listener stopped')
    }
  }

  webContents.on('destroyed', removeListener)
  // TODO remove listeners on window reload too
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: init
  }]
}
// TODO listen window events to stop and restart the coincap listener

module.exports = { getHooks }
