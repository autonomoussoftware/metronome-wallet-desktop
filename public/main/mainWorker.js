'use strict'

const { inspect } = require('util')
const { ipcMain } = require('electron')
const EventEmitter = require('events')
const logger = require('electron-log')

const { isValidPassword } = require('./password')
const settings = require('./settings')
const WalletError = require('./WalletError')

function getLogData (data) {
  if (!data) { return '' }
  const logData = Object.assign({}, data)

  const blackList = ['password']
  blackList.forEach(w => delete logData[w])

  return JSON.stringify(logData)
}

function onRendererEvent (eventName, listener) {
  ipcMain.on(eventName, function (event, { id, data }) {
    logger.verbose(`--> ${eventName}:${id} ${getLogData()}`)
    const result = Promise.resolve(listener(data, event.sender))

    result
      .then(function (res) {
        return res.error ? Promise.reject(res.error) : res
      })
      .then(function (res) {
        event.sender.send(eventName, { id, data: res })
        return res
      })
      .catch(function (err) {
        const error = new WalletError(err.message)
        event.sender.send(eventName, { id, data: { error } })
        return { error }
      })
      .then(function (res) {
        logger.verbose(`<-- ${eventName}:${id} ${JSON.stringify(res)}`)
      })
  })
}

function createRendererEventsRouter () {
  const allUiHooks = []

  const plugins = {}

  const eventsBus = new EventEmitter()

  const eventsBusEmit = eventsBus.emit.bind(eventsBus)
  eventsBus.emit = function (eventName, ...args) {
    logger.verbose(`<<-- ${eventName}`, inspect(args))

    eventsBusEmit(eventName, ...args)
  }

  return {
    use (plugin) {
      const {
        api,
        dependencies,
        name,
        uiHooks
      } = plugin.init({ plugins, eventsBus })

      if (name && api) {
        plugins[name] = api
      }

      if (dependencies) {
        dependencies.forEach(function (dependency) {
          if (!plugins[dependency]) {
            throw new Error('Cannot initialize plugin', name, dependency)
          }
        })
      }

      if (uiHooks) {
        uiHooks.forEach(function (hook) {
          const existingHook = allUiHooks
            .find(h => h.eventName === hook.eventName)

          if (existingHook) {
            existingHook.handlers.push(hook.handler)
            existingHook.auth |= hook.auth
          } else {
            allUiHooks.push({
              eventName: hook.eventName,
              handlers: [hook.handler],
              auth: hook.auth
            })
          }
        })
      }

      return this
    },
    attachUiEvents () {
      allUiHooks.forEach(function (hook) {
        const { auth, eventName, handlers } = hook

        onRendererEvent(eventName, function (data, webContents) {
          return (auth ? isValidPassword(data.password) : Promise.resolve(true))
            .then(function (success) {
              if (!success) {
                return { error: new WalletError('Invalid password') }
              }

              return Promise.all(handlers.map(fn => fn(data, webContents)))
                .then(results => Object.assign({}, ...results))
            })
        })
      })
    }
  }
}

function initMainWorker () {
  settings.presetDefaults()
  settings.attachSync(ipcMain)

  ipcMain.on('log.error', function (event, args) {
    logger.error(args)
  })

  createRendererEventsRouter()
    .use(require('./plugins/onboarding'))
    .use(require('./plugins/coincap'))
    .use(require('./plugins/bloq-eth-explorer'))
    .use(require('./plugins/ethWallet'))
    .use(require('./plugins/tokens'))
    .use(require('./plugins/metronome'))
    .attachUiEvents()
}

module.exports = { initMainWorker }
