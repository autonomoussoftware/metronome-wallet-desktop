const { ipcMain } = require('electron')
const bip39 = require('bip39')
const settings = require('electron-settings')

const defaultSettings = require('../config/default')

const { initEthWallet } = require('./ethWallet')
const aes256cbc = require('./aes256cbc')
const sha256 = require('./sha256')

function initMainWorker () {
  if (!settings.get('app')) {
    settings.set('app', defaultSettings.app)
  }

  ipcMain.on('ui-ready', function (event, { id }) {
    const onboardingComplete = !!settings.get('user.passwordHash')
    event.sender.send('ui-ready', { id, data: { onboardingComplete } })
  })

  ipcMain.on('create-wallet', function (event, { id, data }) {
    const { mnemonic, password } = data

    if (!password) {
      const error = new Error('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    if (!bip39.validateMnemonic(mnemonic)) {
      const error = new Error('Invalid mnemonic')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    if (!settings.get('user.passwordHash')) {
      settings.set('user.passwordHash', sha256(password))
    }

    if (sha256(password) !== settings.get('user.passwordHash')) {
      const error = new Error('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    const seed = bip39.mnemonicToSeedHex(mnemonic)

    const seedHash = sha256(seed)
    settings.set('user.activeWallet', seedHash)

    const walletInfo = {
      encryptedSeed: aes256cbc.encrypt(password, seed),
      derivationPath: settings.get('app.defaultDerivationPath'),
      index: 0
    }
    settings.set(`user.wallets.${seedHash}`, walletInfo)

    event.sender.send('create-wallet', { id, data: { walletId: seedHash } })

    initEthWallet(event.sender, seedHash, password)
  })

  ipcMain.on('open-wallets', function (event, { id, data }) {
    const { password } = data

    if (!password) {
      const error = new Error('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    if (sha256(password) !== settings.get('user.passwordHash')) {
      const error = new Error('Invalid password')
      event.sender.send('create-wallet', { id, data: { error } })
      return
    }

    const walletIds = Object.keys(settings.get('user.wallets'))
    walletIds.forEach(function (walletId) {
      initEthWallet(event.sender, walletId, password)
    })

    event.sender.send('open-wallets', { id, data: { walletIds } })
  })
}

module.exports = { initMainWorker }
