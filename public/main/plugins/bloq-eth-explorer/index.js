'use strict'

const { CookieJar } = require('tough-cookie')
const axios = require('axios')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const io = require('socket.io-client')
const logger = require('electron-log')

const createBasePlugin = require('../../base-plugin')

const { getIndexerApiUrl } = require('./settings')
const api = require('./api')

axiosCookieJarSupport(axios)

let socket

const baseURL = getIndexerApiUrl()

const jar = new CookieJar()

const setTimeoutAsync = timeout => new Promise(function (resolve) {
  setTimeout(resolve, timeout)
})

const getCookie = () => axios.get(baseURL, { jar, withCredentials: true })
  .then(function () {
    socket = io(`${baseURL}/v1`, {
      autoConnect: false,
      extraHeaders: {
        Cookie: jar.getCookiesSync(baseURL).join(';')
      }
    })
  })
  .catch(function (err) {
    logger.warn('Failed to get subscription cookie', err.message)

    return setTimeoutAsync(5000)
      .then(getCookie)
  })

const initialized = getCookie()

function subscribeBlocks (eventsBus) {
  initialized.then(function () {
    socket.emit('subscribe', { type: 'blocks' }, function (err) {
      if (err) {
        logger.warn('Blocks subscription failed', err)
        return
      }

      logger.debug('Blocks subscription successfull')
    })

    socket.on('block', function (data) {
      logger.verbose('New block received', data)

      eventsBus.emit('new-best-block', data)
    })
  })
}

const start = eventsBus => function (pluginEmitter) {
  initialized.then(function () {
    socket.on('error', function (err) {
      logger.warn('Connection error', err.message)

      pluginEmitter.emit('connection-state-changed', 'error')
    })

    socket.on('connect', function () {
      logger.debug('Client connected')

      pluginEmitter.emit('connection-state-changed', 'connected')

      subscribeBlocks(eventsBus)
    })

    socket.on('disconnect', function (reason) {
      logger.debug('Connection closed', reason)

      pluginEmitter.emit('connection-state-changed', 'disconnected')
    })

    socket.open()
  })
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
  initialized.then(function () {
    socket.removeAllListeners('error')

    socket.removeAllListeners('connect')

    socket.removeAllListeners('disconnect')

    socket.close()
  })
}

function subscribeAddresses ({ eventsBus, walletId, addresses }) {
  initialized.then(function () {
    socket.emit('subscribe', { type: 'txs', addresses }, function (err) {
      if (err) {
        logger.warn('Subscription failed', walletId, err)
        return
      }

      logger.debug('Addresses subscription successfull', addresses, walletId)
    })

    socket.on('tx', function (data) {
      const { type, txid, status, meta } = data

      logger.verbose('New transaction received', { walletId, data })

      eventsBus.emit(`${type}-tx-${status}`, { walletId, txid, meta })
    })
  })
}

function attachToEvents (eventsBus) {
  eventsBus.on('wallet-opened', function ({ walletId, addresses }) {
    initialized.then(function () {
      subscribeAddresses({ eventsBus, walletId, addresses })

      socket.on('connect', function () {
        subscribeAddresses({ eventsBus, walletId, addresses })
      })
    })
  })
}

function init ({ eventsBus }) {
  const plugin = createBasePlugin({
    start: start(eventsBus),
    stop,
    onPluginEvents: [{
      eventName: 'connection-state-changed',
      handler: broadcastConnectivityState
    }]
  })

  plugin.name = 'bloqEthExplorer'
  plugin.api = api

  attachToEvents(eventsBus)

  return plugin
}

module.exports = { init }
