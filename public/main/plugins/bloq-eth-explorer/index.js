'use strict'

const io = require('socket.io-client')
const logger = require('electron-log')

const createBasePlugin = require('../../base-plugin')

const { getIndexerApiUrl } = require('./settings')
const api = require('./api')

const baseURL = getIndexerApiUrl()

const socket = io(`${baseURL}/v1`, { autoConnect: false })

function start (pluginEmitter) {
  socket.on('error', function (err) {
    logger.warn('Connection error', err.message)

    pluginEmitter.emit('connection-state-changed', 'error')
  })

  socket.on('connect', function () {
    logger.debug('Client connected')

    pluginEmitter.emit('connection-state-changed', 'connected')
  })

  socket.on('disconnect', function (reason) {
    logger.debug('Connection closed', reason)

    pluginEmitter.emit('connection-state-changed', 'disconnected')
  })

  socket.open()
}

function broadcastConnectivityState (subscriptions, state) {
  subscriptions.forEach(function ({ webContents }) {
    webContents.send('connectivity-state-changed', {
      ok: state === 'connected',
      reason: `Connection to indexer is ${state}`,
      plugin: 'bloq-eth-explorer'
    })
  })
}

function stop () {
  socket.removeAllListeners('error')

  socket.removeAllListeners('connect')

  socket.removeAllListeners('disconnect')

  socket.close()
}

function subscribeAddresses ({ eventsBus, walletId, addresses }) {
  socket.emit('subscribe', addresses, function (err) {
    if (err) {
      logger.warn('Subscription failed', walletId, err)
      return
    }

    logger.debug('Subscription successfull', walletId)
  })

  socket.on('tx', function (data) {
    const { type, txid, status, meta } = data

    logger.verbose('New transaction received', { walletId, data })

    eventsBus.emit(`${type}-tx-${status}`, { walletId, txid, meta })
  })
}

function attachToEvents (eventsBus) {
  eventsBus.on('wallet-opened', function ({ walletId, addresses }) {
    subscribeAddresses({ eventsBus, walletId, addresses })
  })
}

function init ({ eventsBus }) {
  attachToEvents(eventsBus)

  const plugin = createBasePlugin({
    start,
    stop,
    onPluginEvents: [{
      eventName: 'connection-state-changed',
      handler: broadcastConnectivityState
    }]
  })

  plugin.name = 'bloqEthExplorer'
  plugin.api = api

  return plugin
}

module.exports = { init }
