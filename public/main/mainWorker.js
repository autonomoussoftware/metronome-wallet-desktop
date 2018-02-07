const { ipcMain } = require('electron')
const logger = require('electron-log')
const settings = require('electron-settings')

const {
  createWallet,
  broadcastWalletInfo,
  sendTransaction
} = require('./ethWallet')
const { init: initCoinCap } = require('./coincap')
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

function initMainWorker () {
  presetDefaultSettings()

  ipcMain.on('log.error', function (event, args) {
    logger.error(args)
  })

  onRendererEvent('ui-ready', function (data, webContents) {
    initCoinCap(webContents)

    const onboardingComplete = !!settings.get('user.passwordHash')
    return { onboardingComplete }
  })

  onRendererEvent('create-wallet', function (data, webContents) {
    const { mnemonic, password } = data

    if (!isValidPassword(password, true)) {
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

    if (!isValidPassword(password)) {
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

    if (!isValidPassword(password)) {
      const error = new WalletError('Invalid password')
      return { error }
    }

    return sendTransaction(data)
  })

  // TODO send-token
}

module.exports = { initMainWorker }
