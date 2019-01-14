'use strict'

const auth = require('../auth')
const WalletError = require('../WalletError')
const singleCore = require('./single-core')
const config = require('../../../../config')
const noCore = require('./no-core')
const keys = require('../keys')

const createWallets = (data, cores) =>
  Promise.all([
    cores.forEach(core =>
      singleCore
        .createWallet(data, core)
        .then(() => singleCore.openWallet(core))
    )
  ])

const onboardingCompleted = (data, cores) =>
  auth.setPassword(data.password).then(() =>
    createWallets(
      {
        seed: keys.mnemonicToSeedHex(data.mnemonic),
        password: data.password
      },
      cores
    )
  )

const recoverFromMnemonic = function (data, cores) {
  if (auth.isValidPassword(data.password)) {
    return createWallets(
      { seed: keys.mnemonicToSeedHex(data.mnemonic), password: data.password },
      cores
    ).then(noCore.clearCache)
  }
}

function onLoginSubmit (data, cores) {
  return auth.isValidPassword(data.password).then(function (isValid) {
    if (!isValid) {
      return { error: new WalletError('Invalid password') }
    }
    cores.forEach(singleCore.openWallet)
    return isValid
  })
}

const findCore = (cores, chain) => cores.find(e => e.chain === chain)

function getPortFees ({ chain, destinationChain, from, to, value }, cores) {
  const core = findCore(cores, chain)
  return core.coreApi.metronome.getExportMetFee({ value }).then(fee =>
    core.coreApi.metronome
      .estimateExportMetGas({
        destinationChain: config.chains[destinationChain].symbol,
        destinationMetAddress: config.chains[destinationChain].metTokenAddress,
        extraData: '0x00', // TODO: complete with extra data as needed
        fee,
        from,
        to,
        value
      })
      .then(exportGasLimit => ({ exportGasLimit, fee }))
  )
}

// TODO: Implement port method
const portMetronome = (data, cores) => Promise.resolve({})

module.exports = {
  onboardingCompleted,
  recoverFromMnemonic,
  portMetronome,
  onLoginSubmit,
  getPortFees
}
