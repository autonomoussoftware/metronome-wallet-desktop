'use strict'

const createBasePlugin = require('../../base-plugin')

const createApi = require('./api')
const sendStatus = require('./status')
const transactionParser = require('./transactionParser')

const start = (eventsBus, ethWallet) => function (pluginEmitter) {
  eventsBus.on('wallet-opened', function ({ webContents }) {
    sendStatus(ethWallet, webContents)
  })

  eventsBus.on('new-block-header', function () {
    // TODO send auction status on each block but converter status on txs seen
    // by the indexer
    pluginEmitter.emit('new-block')
  })
}

const broadcastStatus = ethWallet => function (subscriptions) {
  subscriptions.forEach(function ({ webContents }) {
    sendStatus(ethWallet, webContents)
  })
}

const stop = eventsBus => function () {
  eventsBus.removeAllListeners('wallet-opened')

  eventsBus.removeAllListeners('new-block-header')
}

function init ({ plugins, eventsBus }) {
  const { ethWallet } = plugins

  ethWallet.registerTxParser(transactionParser(ethWallet))

  const {
    onBuyMetronome,
    onConvertEthToMtn,
    onConvertMtnToEth,
    onEstimateEthToMet,
    onEstimateMetToEth,
    onEthGasLimit,
    onMetGasLimit,
    onAuctionGasLimit
  } = createApi(plugins)

  const plugin = createBasePlugin({
    start: start(eventsBus, ethWallet),
    stop: stop(eventsBus),
    onPluginEvents: [{
      eventName: 'new-block',
      handler: broadcastStatus(ethWallet)
    }]
  })

  plugin.dependencies = ['ethWallet', 'tokens']
  plugin.uiHooks.push(...[
    { eventName: 'metronome-buy', auth: true, handler: onBuyMetronome },
    { eventName: 'mtn-convert-eth', auth: true, handler: onConvertEthToMtn },
    { eventName: 'mtn-convert-mtn', auth: true, handler: onConvertMtnToEth },
    { eventName: 'metronome-estimate-eth-to-met', handler: onEstimateEthToMet },
    { eventName: 'metronome-estimate-met-to-eth', handler: onEstimateMetToEth },
    { eventName: 'metronome-convert-eth-gas-limit', handler: onEthGasLimit },
    { eventName: 'metronome-convert-met-gas-limit', handler: onMetGasLimit },
    { eventName: 'metronome-auction-gas-limit', handler: onAuctionGasLimit }
  ])

  return plugin
}

module.exports = { init }
