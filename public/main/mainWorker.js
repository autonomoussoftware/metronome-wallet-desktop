const unhandled = require('electron-unhandled')
const logger = require('electron-log')

unhandled({ logger: logger.error })

function initMainWorker () {
  const { ipcMain } = require('electron')
  const settings = require('electron-settings')

  const { createWallet, broadcastWalletInfo } = require('./ethWallet')
  const { sha256 } = require('./cryptoUtils')
  const WalletError = require('./WalletError')

  if (!settings.get('app')) {
    const defaultSettings = require('./defaultSettings')
    settings.set('app', defaultSettings.app)
  }

  ipcMain.on('ui-ready', function (event, { id }) {
    const onboardingComplete = !!settings.get('user.passwordHash')
    event.sender.send('ui-ready', { id, data: { onboardingComplete } })
  })

  ipcMain.on('create-wallet', function (event, { id, data }) {
    const { mnemonic, password } = data

    if (!password) {
      const error = new WalletError('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    if (!settings.get('user.passwordHash')) {
      settings.set('user.passwordHash', sha256(password))
    }

    if (sha256(password) !== settings.get('user.passwordHash')) {
      const error = new WalletError('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    const result = createWallet(mnemonic, password)
    if (!result.error) {
      broadcastWalletInfo(event.sender, result.walletId)
    }

    event.sender.send('create-wallet', { id, data: result })
  })

  ipcMain.on('open-wallets', function (event, { id, data }) {
    const { password } = data

    if (!password) {
      const error = new WalletError('Invalid password')
      event.sender.send('open-wallets', { id, data: { error } })
      return
    }

    if (sha256(password) !== settings.get('user.passwordHash')) {
      const error = new WalletError('Invalid password')
      event.sender.send('open-wallets', { id, data: { error } })
      return
    }

    const walletIds = Object.keys(settings.get('user.wallets'))
    walletIds.forEach(function (walletId) {
      broadcastWalletInfo(event.sender, walletId)
    })

    event.sender.send('open-wallets', { id, data: { walletIds } })
  })
}

module.exports = { initMainWorker }
