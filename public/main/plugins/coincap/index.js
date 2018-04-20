'use strict'

const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')

const createBasePlugin = require('../../base-plugin')

function emitPrice (webContents, price) {
  const priceData = { token: 'ETH', currency: 'USD', price }

  webContents.send('eth-price-updated', priceData)

  logger.verbose(`<-- eth-price-updated ${JSON.stringify(price)}`)

  settings.set('coincap.ETH_USD', price)

  logger.verbose('Cached ETH price updated', price)
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

    throttledEmit(price)
  })

  logger.debug('CoinCap listener started')
}

function sendCachedPrice (webContents) {
  const cachedPrice = settings.get('coincap.ETH_USD')

  if (!cachedPrice) {
    return
  }

  logger.debug('Sending cached ETH price')

  emitPrice(webContents, cachedPrice)
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
