'use strict'

const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')

const { getEthPrice, setEthPrice } = require('./db')

const createBasePlugin = require('../../base-plugin')

function emitAndCachePrice (webContents, price) {
  const priceData = { token: 'ETH', currency: 'USD', price }

  if (!webContents.isDestroyed()) {
    webContents.send('eth-price-updated', priceData)
    logger.verbose(`<-- eth-price-updated ${JSON.stringify(price)}`)
  }

  setEthPrice(price)
    .then(function () {
      logger.verbose('Cached ETH price updated', price)
    })
    .catch(function (err) {
      logger.warn('Could not save ETH price', err)
    })
}

function start (pluginEmitter) {
  const ethPriceEmitRateMs = settings.get('coincap.ethPriceEmitRate') * 1000

  const throttledEmit = throttle(function (price) {
    pluginEmitter.emit('eth-price', price)
  }, ethPriceEmitRateMs, { leading: true, trailing: false })

  coincap.open()

  coincap.on('trades', function (trade) {
    const { coin, market_id: marketId, msg: { price } } = trade

    if (coin !== 'ETH' || marketId !== 'ETH_USD') {
      return
    }

    if (typeof price !== 'number') {
      logger.warn('Retrieved ETH price is not a valid format')
      return
    }

    throttledEmit(price)
  })

  logger.debug('CoinCap listener started')
}

function sendCachedPrice (webContents) {
  getEthPrice()
    .then(function (price) {
      if (!price) {
        logger.debug('Getting ETH price')
        return coincap.coin('ETH')
          .then(res => res.price)
      }

      logger.debug('Using cached ETH price')
      return price
    })
    .then(function (price) {
      logger.debug('Sending ETH price')
      emitAndCachePrice(webContents, price)
    })
    .catch(function (err) {
      logger.warn('Could not get ETH price', err)
    })
}

function broadcastEthPrice (subscriptions, price) {
  subscriptions.forEach(function ({ webContents }) {
    emitAndCachePrice(webContents, price)
  })
}

function stop () {
  coincap.off('trades')

  coincap.close()

  logger.debug('CoinCap listener stopped')
}

const init = () => createBasePlugin({
  start,
  stop,
  onNewPage: sendCachedPrice,
  onPluginEvents: [{
    eventName: 'eth-price',
    handler: broadcastEthPrice
  }]
})

module.exports = { init }
