'use strict'

const { ipcMain } = require('electron')
const createCore = require('metronome-wallet-core')
const logger = require('electron-log')
const stringify = require('json-stringify-safe')

const subscriptions = require('./subscriptions')
const settings = require('./settings')
const storage = require('./storage')
const pTimeout = require('p-timeout')

function startCore ({ chain, core, config: coreConfig }, webContent) {
  logger.verbose(`Starting core ${chain}`)
  const { emitter, events, api: coreApi } = core.start(coreConfig)

  emitter.setMaxListeners(30)

  events.push(
    'create-wallet',
    'open-wallets',
    'transactions-scan-started',
    'transactions-scan-finished'
  )

  function send (eventName, data) {
    if (!webContent) {
      return
    }
    const payload = Object.assign({}, data, { chain })
    webContent.sender.send(eventName, payload)
    logger.verbose(`<-- ${eventName} ${stringify(payload)}`)
  }

  events.forEach(event =>
    emitter.on(event, function (data) {
      send(event, data)
    })
  )

  function syncTransactions ({ address }) {
    storage
      .getSyncBlock(chain)
      .then(function (from) {
        send('transactions-scan-started', {})

        return pTimeout(
          coreApi.explorer.syncTransactions(from, address),
          coreConfig.scanTransactionTimeout
        )
          .then(number => storage.setSyncBlock(number, chain))
          .then(function () {
            send('transactions-scan-finished', { success: true })

            emitter.on('coin-block', function ({ number }) {
              storage.setSyncBlock(number, chain).catch(function (err) {
                logger.warn('Could not save new synced block', err)
              })
            })
          })
      })
      .catch(function (err) {
        logger.warn('Could not sync transactions/events', err.stack)
        send('transactions-scan-finished', {
          error: err.message,
          success: false
        })

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
    core: createCore(),
    config: Object.assign({}, config.chains[chainName], config)
  }))

  ipcMain.on('ui-ready', function (webContent, args) {
    const onboardingComplete = !!settings.getPasswordHash()
    storage.getState()
      .catch(function (err) {
        logger.warn('Faild to get state', err.message)
        return {}
      })
      .then(function (persistedState) {
        const payload = Object.assign({}, args, {
          data: {
            onboardingComplete,
            persistedState: persistedState || {},
            config
          }
        })
        webContent.sender.send('ui-ready', payload)
        logger.verbose(`<-- ui-ready ${stringify(payload)}`)
      })
      .catch(function (err) {
        logger.error('Could not send ui-ready message back', err.message)
      })
      .then(function () {
        cores.forEach(function (core) {
          const { emitter, events, coreApi } = startCore(core, webContent)
          core.emitter = emitter
          core.events = events
          core.coreApi = coreApi
        })
        subscriptions.subscribe(cores)
      })
      .catch(function (err) {
        logger.error('Could not start cores', err.message)
      })
  })

  ipcMain.on('ui-unload', function () {
    cores.forEach(stopCore)
    subscriptions.unsubscribe(cores)
  })
}

module.exports = { createClient }
