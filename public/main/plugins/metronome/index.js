'use strict'

const createBasePlugin = require('../../base-plugin')

const { getTokenAddress } = require('./settings')
const createApi = require('./api')
const sendStatus = require('./status')
const transactionParser = require('./transactionParser')

function attachToEvents (eventsBus, plugins, plugin) {
  const { ethWallet } = plugins

  eventsBus.on('wallet-opened', function ({ webContents }) {
    sendStatus(ethWallet, webContents)
  })

  eventsBus.on('new-best-block', function () {
    // TODO send auction status on each block but converter status on txs seen
    // by the indexer
    plugin.emitter.emit('new-block')
  })
}

const broadcastStatus = ethWallet => function (subscriptions) {
  subscriptions.forEach(function ({ webContents }) {
    sendStatus(ethWallet, webContents)
  })
}

function init ({ plugins, eventsBus }) {
  const { ethWallet, tokens } = plugins

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

  attachToEvents(eventsBus, plugins, plugin)

  tokens.registerToken(getTokenAddress(), {
    decimals: 18,
    name: 'Metronome',
    symbol: 'MET'
  })

  return plugin
}

module.exports = { init }
