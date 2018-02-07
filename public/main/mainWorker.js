const { ipcMain } = require('electron')
const logger = require('electron-log')

const { isValidPassword } = require('./user')
const { presetDefault: presetDefaultSettings } = require('./settings')
const WalletError = require('./WalletError')

function onRendererEvent (eventName, listener) {
  ipcMain.on(eventName, function (event, { id, data }) {
    logger.debug(`--> ${eventName}:${id} ${JSON.stringify(data)}`)
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
        logger.debug(`<-- ${eventName}:${id} ${JSON.stringify(res)}`)
      })
  })
}

function createRendererEventsRouter () {
  const allHooks = []

  return {
    use: function (module) {
      const hooks = module.getHooks()

      hooks.forEach(function (hook) {
        const existingHook = allHooks.find(h => h.eventName === hook.eventName)

        if (existingHook) {
          existingHook.handlers.push(hook.handler)
          existingHook.auth |= hook.auth
        } else {
          allHooks.push({
            eventName: hook.eventName,
            handlers: [hook.handler],
            auth: hook.auth
          })
        }
      })

      return this
    },
    attach: function () {
      allHooks.forEach(function (hook) {
        const { eventName, handlers, auth } = hook

        onRendererEvent(eventName, function (data, webContents) {
          if (auth && !isValidPassword(data.password)) {
            return { error: new WalletError('Invalid password') }
          }

          return Promise.all(handlers.map(fn => fn(data, webContents)))
            .then(function (results) {
              return Object.assign({}, ...results)
            })
        })
      })
    }
  }
}

function initMainWorker () {
  presetDefaultSettings()

  ipcMain.on('log.error', function (event, args) {
    logger.error(args)
  })

  createRendererEventsRouter()
    .use(require('./onboarding'))
    .use(require('./coincap'))
    .use(require('./ethWallet'))
    // metronome -- buy, change
    // erc20 -- send token
    .attach()
}

module.exports = { initMainWorker }
