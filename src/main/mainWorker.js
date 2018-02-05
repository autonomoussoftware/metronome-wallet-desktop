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
    // TODO cannot init here without the password to recover wallet data!!!
    // initEthWallet(event.sender)

    const onboardingComplete = settings.get('user.onboardingComplete')
    event.sender.send('ui-ready', { id, data: { onboardingComplete } })
  })

  ipcMain.on('onboarding-completed', function (event, { id, data }) {
    const { password } = data

    if (settings.get('user.onboardingComplete')) {
      const error = new Error('Onboarding already completed')
      event.sender.send('onboarding-completed', { id, data: { error } })
    }

    settings.set('user.onboardingComplete', true)
    settings.set('user.passwordHash', sha256(password))

    event.sender.send('onboarding-completed', { id, data: { success: true } })
  })

  ipcMain.on('recover-wallet', function (event, { id, data }) {
    const { mnemonic, password } = data

    if (!settings.get('user.onboardingComplete')) {
      const error = new Error('Onboarding not yet completed')
      event.sender.send('recover-wallet', { id, data: { error } })
    }

    if (sha256(password) !== settings.get('user.passwordHash')) {
      const error = new Error('Invalid password')
      event.sender.send('recover-wallet', { id, data: { error } })
    }

    const seed = bip39.mnemonicToSeedHex(mnemonic)

    const seedHash = sha256(seed)
    settings.set('app.activeWallet', seedHash)

    const walletInfo = {
      encryptedSeed: aes256cbc.encrypt(password, seed),
      derivationPath: settings.get('app.defaultDerivationPath'),
      index: 0
    }
    settings.set(`user.wallets.${seedHash}`, walletInfo)

    initEthWallet(event.sender, seedHash, password)
  })
}

module.exports = { initMainWorker }
