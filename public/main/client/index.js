'use strict'

const core = require('metronome-wallet-core')
const logger = require('electron-log')
const { ipcMain } = require('electron')
const { getPasswordHash } = require('./settings')
const { subscribeToRendererMessages } = require('./subscriptions')

function createClient (config) {
  const {
    emitter,
    events,
    api: coreApi
  } = core.start({ config })

  events.push('create-wallet', 'open-wallets')

  let webContent = null
  let bestBlock = null

  function send (eventName, data) {
    if (!webContent) {
      if (eventName === 'eth-block') {
        bestBlock = data
      }
      return
    }
    webContent.send(eventName, data)
  }

  events.forEach(event =>
    emitter.on(event, function (data) {
      send(event, data)
    })
  )

  emitter.on('open-wallets', function ({ address }) {
    send('transactions-scan-started', { data: {} })
    coreApi.explorer.syncTransactions(0, address)
      .then(function () {
        send('transactions-scan-finished', { data: {} })
      })
      .catch(function (err) {
        logger.warn('Could not sync transactions/events', err)
        send('transactions-scan-finished', { data: {} })
      })
  })

  ipcMain.on('ui-ready', function (e, args) {
    webContent = e.sender
    webContent.on('destroyed', function () {
      webContent = null
    })

    if (bestBlock) {
      webContent.send('eth-block', bestBlock)
    }
    const onboardingComplete = !!getPasswordHash()
    webContent.send('ui-ready', Object.assign({}, args, { data: { onboardingComplete } }))
  })

  ipcMain.on('ui-unload', function () {
    webContent = null
  })

  subscribeToRendererMessages(emitter, coreApi)
}

module.exports = { createClient }
