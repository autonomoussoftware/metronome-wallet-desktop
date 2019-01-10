'use strict'

const WalletError = require('../WalletError')
const wallet = require('../wallet')
const auth = require('../auth')

const withAuth = fn =>
  function (data, { coreApi }) {
    if (typeof data.walletId !== 'string') {
      throw new WalletError('WalletId is not defined')
    }
    return auth
      .isValidPassword(data.password)
      .then(() => wallet.getSeed(data.walletId, data.password))
      .then(coreApi.wallet.createPrivateKey)
      .then(privateKey => fn(privateKey, data))
  }

function createWallet (data, { coreApi, emitter }) {
  const walletId = wallet.getWalletId(data.seed)
  const address = coreApi.wallet.createAddress(data.seed)
  return Promise.all([
    wallet.setSeed(data.seed, data.password),
    wallet.setAddressForWalletId(walletId, address)
  ]).then(() => emitter.emit('create-wallet', { walletId }))
}

const openWallet = ({ emitter }) =>
  wallet.getWallets().forEach(walletId =>
    wallet.getAddressesForWalletId(walletId).forEach(address =>
      emitter.emit('open-wallets', {
        walletIds: [walletId],
        activeWallet: walletId,
        address
      })
    )
  )

const getGasLimit = (data, { coreApi }) => coreApi.wallet.getGasLimit(data)

const getGasPrice = (data, { coreApi }) => coreApi.wallet.getGasPrice(data)

const sendEth = (data, { coreApi }) =>
  withAuth(coreApi.wallet.sendEth)(data, { coreApi })

const getTokensGasLimit = (data, { coreApi }) =>
  coreApi.tokens.getTokensGasLimit(data)

const getAuctionGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getAuctionGasLimit(data)

const getConvertEthEstimate = (data, { coreApi }) =>
  coreApi.metronome.getConvertEthEstimate(data)

const getConvertEthGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getConvertEthGasLimit(data)

const getConvertMetEstimate = (data, { coreApi }) =>
  coreApi.metronome.getConvertMetEstimate(data)

const getConvertMetGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getConvertMetGasLimit(data)

const buyMetronome = (data, { coreApi }) =>
  withAuth(coreApi.metronome.buyMetronome)(data, { coreApi })

const convertEth = (data, { coreApi }) =>
  withAuth(coreApi.metronome.convertEth)(data, { coreApi })

const convertMet = (data, { coreApi }) =>
  withAuth(coreApi.metronome.convertMet)(data, { coreApi })

const sendMet = (data, { coreApi }) =>
  withAuth(coreApi.metronome.sendMet)(data, { coreApi })

module.exports = {
  getConvertEthEstimate,
  getConvertEthGasLimit,
  getConvertMetEstimate,
  getConvertMetGasLimit,
  getAuctionGasLimit,
  getTokensGasLimit,
  buyMetronome,
  createWallet,
  getGasLimit,
  getGasPrice,
  convertEth,
  convertMet,
  openWallet,
  sendMet,
  sendEth
}
