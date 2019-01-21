'use strict'

const WalletError = require('../WalletError')
const wallet = require('../wallet')
const auth = require('../auth')
const config = require('../../../../config')

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

const sendCoin = (data, { coreApi }) =>
  withAuth(coreApi.wallet.sendCoin)(data, { coreApi })

const getTokensGasLimit = (data, { coreApi }) =>
  coreApi.tokens.getTokensGasLimit(data)

const getAuctionGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getAuctionGasLimit(data)

const getConvertCoinEstimate = (data, { coreApi }) =>
  coreApi.metronome.getConvertCoinEstimate(data)

const getConvertCoinGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getConvertCoinGasLimit(data)

const getConvertMetEstimate = (data, { coreApi }) =>
  coreApi.metronome.getConvertMetEstimate(data)

const getConvertMetGasLimit = (data, { coreApi }) =>
  coreApi.metronome.getConvertMetGasLimit(data)

const buyMetronome = (data, { coreApi }) =>
  withAuth(coreApi.metronome.buyMetronome)(data, { coreApi })

const convertCoin = (data, { coreApi }) =>
  withAuth(coreApi.metronome.convertCoin)(data, { coreApi })

const convertMet = (data, { coreApi }) =>
  withAuth(coreApi.metronome.convertMet)(data, { coreApi })

const sendMet = (data, { coreApi }) =>
  withAuth(coreApi.metronome.sendMet)(data, { coreApi })

const getExportMetFee = (data, { coreApi }) =>
  coreApi.metronome.getExportMetFee(data)

const estimateExportMetGas = (data, { coreApi }) =>
  coreApi.metronome.estimateExportMetGas(
    Object.assign({}, data, {
      destinationChain: config.chains[data.destinationChain].symbol,
      destinationMetAddress:
        config.chains[data.destinationChain].metTokenAddress,
      extraData: '0x00' // TODO: complete with extra data as needed
    })
  )

const estimateImportMetGas = (data, { coreApi }) =>
  coreApi.metronome.estimateImportMetGas(data)

const exportMetronome = (data, core) =>
  withAuth(core.coreApi.metronome.exportMet)(
    data,
    core
  )

const importMetronome = (data, core) =>
  withAuth(core.coreApi.metronome.importMet)(data, core)

// TODO: Implement retry method
const retryImport = (data, core) => Promise.resolve({})

module.exports = {
  getConvertCoinEstimate,
  getConvertCoinGasLimit,
  getConvertMetEstimate,
  getConvertMetGasLimit,
  estimateExportMetGas,
  estimateImportMetGas,
  getAuctionGasLimit,
  getTokensGasLimit,
  getExportMetFee,
  exportMetronome,
  importMetronome,
  buyMetronome,
  createWallet,
  getGasLimit,
  getGasPrice,
  convertCoin,
  retryImport,
  convertMet,
  openWallet,
  sendMet,
  sendCoin
}