'use strict'

const createBasePlugin = require('../../base-plugin')

const createApi = require('./api')
const sendBalances = require('./balances')
const transactionParser = require('./transactionParser')

function attachToEvents (eventsBus, plugins, plugin) {
  const { ethWallet } = plugins

  eventsBus.on(
    'wallet-opened',
    function ({ walletId, addresses, webContents }) {
      sendBalances({ ethWallet, walletId, addresses, webContents })

      plugin.emitter.emit(
        'register-webcontents-metadata',
        { webContents, meta: { walletId, addresses } }
      )
    }
  )

  eventsBus.on('tok-tx-confirmed', function () {
    plugin.emitter.emit('token-event')
  })

  eventsBus.on('tok-tx-unconfirmed', function () {
    plugin.emitter.emit('token-event')
  })
}

const broadcastBalances = ethWallet => function (subscriptions) {
  subscriptions.forEach(function ({ webContents, meta }) {
    const { walletId, addresses } = meta

    sendBalances({
      addresses,
      ethWallet,
      shouldChange: true,
      walletId,
      webContents
    })
  })
}

function init ({ plugins, eventsBus }) {
  const { ethWallet } = plugins

  ethWallet.registerTxParser(transactionParser(ethWallet))

  const {
    approveToken,
    getAllowance,
    getGasLimit,
    registerToken,
    sendToken
  } = createApi(ethWallet)

  const plugin = createBasePlugin({
    onPluginEvents: [{
      eventName: 'token-event',
      handler: broadcastBalances(ethWallet)
    }]
  })

  plugin.name = 'tokens'
  plugin.api = {
    approveToken,
    getAllowance,
    registerToken
  }
  plugin.dependencies = ['ethWallet']
  plugin.uiHooks.push(...[
    { eventName: 'send-token', auth: true, handler: args => sendToken(args) },
    { eventName: 'tokens-get-gas-limit', handler: getGasLimit }
  ])

  attachToEvents(eventsBus, plugins, plugin)

  return plugin
}

module.exports = { init }
