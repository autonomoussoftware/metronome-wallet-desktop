const { ipcMain } = require('electron')
const coincap = require('coincap-lib')
const logger = require('electron-log')
const merge = require('lodash/merge')
const settings = require('electron-settings')
const throttle = require('lodash/throttle')

const {
  createWallet,
  broadcastWalletInfo,
  sendTransaction
} = require('./ethWallet')
const { sha256 } = require('./cryptoUtils')
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

  const currentSettings = settings.getAll()
  const defaultSettings = require('./defaultSettings')
  settings.setAll(merge(defaultSettings, currentSettings))
}

function initMainWorker () {
  presetDefaultSettings()

  ipcMain.on('log.error', function (event, args) {
    logger.error(args)
  })

  onRendererEvent('ui-ready', function (data, webContents) {
    const ethPriceEmitRateMs = settings.get('app.ethPriceEmitRate') * 1000
    const emitEthPrice = throttle(function (price) {
      const priceData = { token: 'ETH', currency: 'USD', price }
      webContents.send('eth-price-updated', priceData)
      logger.debug(`ETH price updated: ${price}`)
    }, ethPriceEmitRateMs, { leading: true, trailing: false })

    coincap.open()
    coincap.on('trades', function (trade) {
      const { coin, market_id: marketId, msg: { price } } = trade

      if (coin !== 'ETH' || marketId !== 'ETH_USD') {
        return
      }

      emitEthPrice(price)
    })

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
