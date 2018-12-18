'use strict'

const core = require('metronome-wallet-core')
const { ipcMain } = require('electron')
const { getPasswordHash } = require('./settings')
const { subscribeToRendererMessages } = require('./subscriptions')

function createClient (config) {
  const {
    emitter,
    events,
    api: coreApi
  } = core.start({ config })

  const eventName = 'ui-ready'

  events.push('create-wallet', 'open-wallets')

  ipcMain.on(eventName, function (e, args) {
    events.forEach(event =>
      emitter.on(event, function (data) {
        e.sender.send(event, data)
      })
    )

    emitter.on('open-wallets', function ({ address }) {
      e.sender.send('transactions-scan-started', { data: {} })
      coreApi.explorer.syncTransactions(0, address)
        .then(function () {
          e.sender.send('transactions-scan-finished', { data: {} })
        })
        .catch(function () {
          e.sender.send('transactions-scan-finished', { data: {} })
        })
    })

    const onboardingComplete = !!getPasswordHash()
    e.sender.send(eventName, Object.assign({}, args, { data: { onboardingComplete } }))
  })

  subscribeToRendererMessages(emitter, coreApi)
}

module.exports = { createClient }
