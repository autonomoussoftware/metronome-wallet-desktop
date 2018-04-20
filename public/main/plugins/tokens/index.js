'use strict'

const createBasePlugin = require('../../base-plugin')

const createApi = require('./api')
const sendBalances = require('./balances')
const transactionParser = require('./transactionParser')

const start = (eventsBus, ethWallet) => function (pluginEmitter) {
  eventsBus.on(
    'wallet-opened',
    function ({ walletId, addresses, webContents }) {
      sendBalances({ ethWallet, walletId, addresses, webContents })

      pluginEmitter.emit(
        'register-webcontents-metadata',
        { webContents, meta: { walletId, addresses } }
      )
    }
  )

  eventsBus.on('tok-tx-confirmed', function () {
    pluginEmitter.emit('token-event')
  })

  eventsBus.on('tok-tx-unconfirmed', function () {
    pluginEmitter.emit('token-event')
  })
}

const broadcastBalances = ethWallet => function (subscriptions) {
  subscriptions.forEach(function ({ webContents, meta }) {
    const { walletId, addresses } = meta

    sendBalances({ ethWallet, walletId, addresses, webContents })
  })
}

const stop = eventsBus => function () {
  eventsBus.off('wallet-opened')

  eventsBus.off('tok-tx-confirmed')

  eventsBus.off('tok-tx-unconfirmed')
}

function init ({ plugins, eventsBus }) {
  const { ethWallet } = plugins

  const {
    approveToken,
    getAllowance,
    getGasLimit,
    sendToken
  } = createApi(ethWallet)

  ethWallet.registerTxParser(transactionParser(ethWallet))

  const plugin = createBasePlugin({
    start: start(eventsBus, ethWallet),
    stop: stop(eventsBus),
    onPluginEvents: [{
      eventName: 'token-event',
      handler: broadcastBalances(ethWallet)
    }]
  })

  plugin.name = 'tokens'
  plugin.api = {
    approveToken,
    getAllowance
  }
  plugin.dependencies = ['ethWallet']
  plugin.uiHooks.push(...[
    { eventName: 'send-token', auth: true, handler: args => sendToken(args) },
    { eventName: 'tokens-get-gas-limit', handler: getGasLimit }
  ])

  return plugin
}

module.exports = { init }
