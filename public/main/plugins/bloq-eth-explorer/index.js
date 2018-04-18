'use strict'

const axios = require('axios')
const io = require('socket.io-client')
const logger = require('electron-log')

const { getIndexerApiUrl } = require('./settings')

const baseURL = getIndexerApiUrl()

const get = (url, params) => axios({ baseURL, url, params })
  .then(res => res.data)

const getBestBlock = () =>
  get('/blocks/best')

const getTxs = ({ address, from, to }) =>
  get(`/addresses/${address}/transactions`, { from, to })

const getTxsWithTokenLogs = ({ address, from, to, tokens = [] }) =>
  get(
    `/addresses/${address}/tokentransactions`,
    { from, to, tokens: tokens.join(',') }
  )

const socket = io(`${baseURL}/v1`, { autoConnect: false })

socket.on('error', function (err) {
  logger.warn('Connection error', err.message)
})

socket.on('connect', function () {
  logger.verbose('Client connected')
})

socket.on('disconnect', function (reason) {
  logger.verbose('Connection closed', reason)
})

function connect () {
  socket.open()
}

function disconnect () {
  socket.close()
}

function subscribeAddresses ({ bus, walletId, addresses }) {
  socket.emit('subscribe', addresses, function (err) {
    if (err) {
      logger.warn('Subscription failed', walletId, err)
    }
    logger.debug('Subscription successfull', walletId)
  })

  socket.on('tx', function (data) {
    const { type, txid, status, meta } = data
    logger.debug('New transaction received', { walletId, data })

    bus.emit(`${type}-tx-${status}`, { walletId, txid, meta })
  })
}

function attachToEvents (bus) {
  bus.on('wallet-opened', function ({ walletId, addresses }) {
    subscribeAddresses({ bus, walletId, addresses })
  })
}

function init ({ eventsBus }) {
  attachToEvents(eventsBus)

  return {
    name: 'bloqEthExplorer',
    api: {
      getBestBlock,
      getTxs,
      getTxsWithTokenLogs
    },
    uiHooks: [{
      eventName: 'ui-ready',
      handler: connect
    }, {
      eventName: 'ui-unload',
      handler: disconnect
    }]
  }
}

module.exports = { init }
