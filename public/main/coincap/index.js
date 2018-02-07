const coincap = require('coincap-lib')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')
const logger = require('electron-log')

function init (data, webContents) {
  const ethPriceEmitRateMs = settings.get('coincap.ethPriceEmitRate') * 1000

  const emitEthPrice = throttle(function (price) {
    const priceData = { token: 'ETH', currency: 'USD', price }

    webContents.send('eth-price-updated', priceData)
    logger.debug(`<-- eth-price-updated ${JSON.stringify(price)}`)
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

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: init
  }]
}

module.exports = { getHooks }
