'use strict'

const auth = require('../auth')
const WalletError = require('../WalletError')
const singleCore = require('./single-core')
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

function getPortFees (data, cores) {
  const exportCore = findCore(cores, data.chain)
  return singleCore
    .getExportMetFee(data, exportCore)
    .then(fee =>
      singleCore
        .estimateExportMetGas(Object.assign({}, data, { fee }), exportCore)
        .then(exportGasLimit => ({ exportGasLimit, fee }))
    )
}

// TODO: Implement port method
function portMetronome (data, cores) {
  const exportCore = findCore(cores, data.chain)
  return singleCore.exportMetronome(data, exportCore)
}

module.exports = {
  onboardingCompleted,
  recoverFromMnemonic,
  portMetronome,
  onLoginSubmit,
  getPortFees
}
