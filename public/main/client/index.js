'use strict'

const subscriptions = require('./subscriptions')
const { createCore } = require('metronome-wallet-core')
const { ipcMain } = require('electron')
const logger = require('electron-log')
const settings = require('./settings')
const storage = require('./storage')

function startCore ({ chain, core }, webContent) {
  logger.verbose(`Starting core ${chain}`)
  const { emitter, events, api: coreApi } = core.start()

  emitter.setMaxListeners(15)

  events.push('create-wallet', 'open-wallets')

  function send (eventName, data) {
    if (!webContent) {
      return
    }
    webContent.send(eventName, Object.assign({}, data, { chain }))
  }

  events.forEach(event =>
    emitter.on(event, function (data) {
      send(event, data)
    })
  )

  function syncTransactions ({ address }) {
    storage.getSyncBlock(chain)
      .then(function (from) {
        send('transactions-scan-started', { data: {} })

        return coreApi.explorer
          .syncTransactions(from, address)
          .then(number => storage.setSyncBlock(number, chain))
          .then(function () {
            send('transactions-scan-finished', { data: { success: true } })

            emitter.on('coin-block', function ({ number }) {
              storage.setSyncBlock(number, chain).catch(function (err) {
                logger.warn('Could not save new synced block', err)
              })
            })
          })
      })
      .catch(function (err) {
        logger.warn('Could not sync transactions/events', err.stack)
        send('transactions-scan-finished', { data: { err, success: false } })

        emitter.once('coin-block', () =>
          syncTransactions({ address })
        )
      })
  }

  emitter.on('open-wallets', syncTransactions)

  emitter.on('wallet-error', function (err) {
    logger.warn(err.inner
      ? `${err.message} - ${err.inner.message}`
      : err.message
    )
  })

  return {
    emitter,
    events,
    coreApi
  }
}

function stopCore ({ core, chain }) {
  logger.verbose(`Stopping core ${chain}`)
  core.stop()
}

function createClient (config) {
  ipcMain.on('log.error', function (_, args) {
    logger.error(args.message)
  })

  settings.presetDefaults()

  const cores = config.enabledChains.map(chainName => ({
    chain: chainName,
    core: createCore(Object.assign({}, config.chains[chainName], config))
  }))

  ipcMain.on('ui-ready', function (webContent, args) {
    cores.forEach(function (core) {
      const { emitter, events, coreApi } = startCore(core, webContent.sender)
      core.emitter = emitter
      core.events = events
      core.coreApi = coreApi
    })

    subscriptions.subscribe(cores)

    const onboardingComplete = !!settings.getPasswordHash()
    storage.getState()
      .catch(function (err) {
        logger.warn('Faild to get state', err.message)
        return {}
      })
      .then(function (persistedState) {
        webContent.sender.send(
          'ui-ready',
          Object.assign({}, args, {
            data: {
              onboardingComplete,
              persistedState: persistedState || {},
              config
            }
          })
        )
      })
      .catch(function (err) {
        logger.error('Could not send ui-ready message back', err.message)
      })
  })

  ipcMain.on('ui-unload', () => cores.forEach(stopCore))
}

module.exports = { createClient }
