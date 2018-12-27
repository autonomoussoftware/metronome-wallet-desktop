'use strict'

const WalletError = require('./WalletError')
const restart = require('./electron-restart')
const dbManager = require('./database')
const storage = require('./storage')
const wallet = require('./wallet')
const auth = require('./auth')
const keys = require('./keys')

const withAuth = fn => function (data, _, core) {
  data.walletId = '1'
  if (typeof data.walletId !== 'string') {
    throw new WalletError('WalletId is not defined')
  }
  return auth.isValidPassword(data.password)
    .then(() => wallet.getSeed(data.walletId, data.password))
    .then(core.wallet.createPrivateKey)
    .then(privateKey => fn(privateKey, data))
}

function onboardingCompleted (data, emitter, core) {
  const seed = keys.mnemonicToSeedHex(data.mnemonic)
  const walletId = wallet.getWalletId(seed)
  const address = core.wallet.createAddress(seed)
  return Promise.all([
    auth.setPassword(data.password),
    wallet.setSeed(seed, data.password),
    wallet.setAddressForWalletId(walletId, address)
  ])
    .then(() => emitter.emit('create-wallet', { walletId }))
    .then(() => emitter.emit('open-wallets', {
      walletIds: [walletId],
      activeWallet: walletId,
      address
    }))
}

const onLoginSubmit = (data, emitter) =>
  auth.isValidPassword(data.password)
    .then(function (isValid) {
      if (!isValid) {
        return { error: new WalletError('Invalid password') }
      }
      wallet.getWallets().forEach(walletId =>
        wallet.getAddressesForWalletId(walletId).forEach(address =>
          emitter.emit('open-wallets', {
            walletIds: [walletId],
            activeWallet: walletId,
            address
          })
        )
      )
      return isValid
    })

const clearCache = () => dbManager.getDb().dropDatabase().then(restart)

const validatePassword = data => auth.isValidPassword(data)

const persistState = data => storage.persistState(data).then(() => true)

const recoverFromMnemonic = function (data, _, core) {
  if (auth.isValidPassword(data.password)) {
    const seed = keys.mnemonicToSeedHex(data.mnemonic)
    const walletId = wallet.getWalletId(seed)
    const address = core.wallet.createAddress(seed)
    return Promise.all([
      wallet.setSeed(seed, data.password),
      wallet.setAddressForWalletId(walletId, address)
    ])
      .then(clearCache)
  }
}

const getGasLimit = (data, _, core) => core.wallet.getGasLimit(data)

const getGasPrice = (data, _, core) => core.wallet.getGasPrice(data)

const sendEth = (data, emitter, core) => withAuth(core.wallet.sendEth)(data, emitter, core)

const getTokensGasLimit = (data, _, core) => core.tokens.getTokensGasLimit(data)

const getAuctionGasLimit = (data, _, core) => core.metronome.getAuctionGasLimit(data)

const getConvertEthEstimate = (data, _, core) => core.metronome.getConvertEthEstimate(data)

const getConvertEthGasLimit = (data, _, core) => core.metronome.getConvertEthGasLimit(data)

const getConvertMetEstimate = (data, _, core) => core.metronome.getConvertMetEstimate(data)

const getConvertMetGasLimit = (data, _, core) => core.metronome.getConvertMetGasLimit(data)

const buyMetronome = (data, emitter, core) => withAuth(core.metronome.buyMetronome)(data, emitter, core)

const convertEth = (data, emitter, core) => withAuth(core.metronome.convertEth)(data, emitter, core)

const convertMet = (data, emitter, core) => withAuth(core.metronome.convertMet)(data, emitter, core)

const sendMet = (data, emitter, core) => withAuth(core.metronome.sendMet)(data, emitter, core)

module.exports = {
  getConvertEthEstimate,
  getConvertEthGasLimit,
  getConvertMetEstimate,
  getConvertMetGasLimit,
  onboardingCompleted,
  recoverFromMnemonic,
  getAuctionGasLimit,
  getTokensGasLimit,
  validatePassword,
  onLoginSubmit,
  buyMetronome,
  persistState,
  getGasLimit,
  getGasPrice,
  convertEth,
  convertMet,
  clearCache,
  sendMet,
  sendEth
}
