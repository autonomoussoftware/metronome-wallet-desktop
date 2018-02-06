const { ipcMain } = require('electron')
const logger = require('electron-log')
const settings = require('electron-settings')
const unhandled = require('electron-unhandled')

const {
  createWallet,
  broadcastWalletInfo,
  sendTransaction
} = require('./ethWallet')
const { sha256 } = require('./cryptoUtils')
const WalletError = require('./WalletError')

unhandled({ logger: logger.error })

function onRendererEvent (eventName, listener) {
  ipcMain.on(eventName, function (event, { id, data }) {
    logger.debug(`--> ${eventName}:${id}`)
    const result = Promise.resolve(listener(data, event.sender))

    result
      .then(function (res) {
        return res.error ? Promise.reject(res.error) : res
      })
      .then(function (res) {
        event.sender.send(eventName, { id, data: res })
      })
      .catch(function (err) {
        const error = new WalletError(err.message)
        event.sender.send(eventName, { id, data: { error } })
      })
      .then(function () {
        logger.debug(`<-- ${eventName}:${id}`)
      })
  })
}

function validPassword (password, useAsDefault) {
  const passwordHash = settings.get('user.passwordHash')

  if (!passwordHash && useAsDefault) {
    logger.verbose('No password set, using current as default')
    settings.set('user.passwordHash', sha256(password))
    return true
  }

  logger.verbose('Checking supplied password')
  return password && sha256(password) === passwordHash
}

function presetDefaultSettings () {
  logger.verbose(`Settings file: ${settings.file()}`)

  if (Object.keys(settings.getAll()).length) {
    logger.verbose('Setting found')
    return
  }
  logger.verbose('Setting defaults')
  const defaultSettings = require('./defaultSettings')
  settings.setAll(defaultSettings)
}

function initMainWorker () {
  presetDefaultSettings()

  onRendererEvent('ui-ready', function () {
    const onboardingComplete = !!settings.get('user.passwordHash')
    return { onboardingComplete }
  })

  onRendererEvent('create-wallet', function (data, webContents) {
    const { mnemonic, password } = data

    if (!validPassword(password, true)) {
      const error = new WalletError('Invalid password')
      return { error }
    }

    const result = createWallet(mnemonic, password)

    if (!result.error) {
      broadcastWalletInfo(webContents, result.walletId)
    }

    return result
  })

  onRendererEvent('open-wallets', function (data, webContents) {
    const { password } = data

    if (!validPassword(password)) {
      const error = new WalletError('Invalid password')
      return { error }
    }

    const walletIds = Object.keys(settings.get('user.wallets'))
    walletIds.forEach(function (walletId) {
      broadcastWalletInfo(webContents, walletId)
    })

    return { walletIds }
  })

  onRendererEvent('send-eth', function (data) {
    const { password } = data

    if (!validPassword(password)) {
      const error = new WalletError('Invalid password')
      return { error }
    }

    return sendTransaction(data)
  })

  // TODO send-token
}

module.exports = { initMainWorker }
