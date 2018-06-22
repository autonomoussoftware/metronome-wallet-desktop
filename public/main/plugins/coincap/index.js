'use strict'

const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')

const { getDb } = require('../../database')
const createBasePlugin = require('../../base-plugin')

function emitPrice (webContents, price) {
  const priceData = { token: 'ETH', currency: 'USD', price }

  if (!webContents.isDestroyed()) {
    webContents.send('eth-price-updated', priceData)
  }

  logger.verbose(`<-- eth-price-updated ${JSON.stringify(price)}`)

  const query = { type: 'coincap-eth-usd' }
  const update = Object.assign(query, { price })
  getDb().collection('state')
    .updateAsync(query, update, { upsert: true })
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
      logger.warn(`Retrieved ETH price is not a valid format`)
      return
    }

    throttledEmit(price)
  })

  logger.debug('CoinCap listener started')
}

function sendCachedPrice (webContents) {
  getDb().collection('state')
    .findOneAsync({ type: 'coincap-eth-usd' })
    .then(function (doc) {
      if (!doc) {
        return
      }

      logger.debug('Sending cached ETH price')
      emitPrice(webContents, doc.price)
    })
    .catch(function (err) {
      logger.warn('Could not get ETH price', err)
    })
}

function broadcastEthPrice (subscriptions, price) {
  subscriptions.forEach(function ({ webContents }) {
    emitPrice(webContents, price)
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
