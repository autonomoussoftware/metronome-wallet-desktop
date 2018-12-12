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
    const onboardingComplete = !!getPasswordHash()
    e.sender.send(eventName, Object.assign({}, args, { data: { onboardingComplete } }))
  })

  subscribeToRendererMessages(emitter, coreApi)
}

module.exports = { createClient }
