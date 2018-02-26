const { ipcMain } = require('electron')
const logger = require('electron-log')

const { isValidPassword } = require('./password')
const settings = require('./settings')
const WalletError = require('./WalletError')

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

function getLogData (data) {
  if (!data) { return '' }
  const logData = Object.assign({}, data)

  const blackList = ['password']
  blackList.forEach(w => delete logData[w])

  return JSON.stringify(logData)
}

function createRendererEventsRouter () {
  const allHooks = []

  return {
    use: function (plugin) {
      const hooks = plugin.getHooks()

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
    .use(require('./onboarding'))
    .use(require('./coincap'))
    .use(require('./ethWallet'))
    .use(require('./tokens'))
    .use(require('./metronome'))
    .attach()
}

module.exports = { initMainWorker }
