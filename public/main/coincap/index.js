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

  emitter.on('price', emitPrice(webContents))
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: init
  }]
}
// TODO listen window events to stop and restart the coincap listener

module.exports = { getHooks }
