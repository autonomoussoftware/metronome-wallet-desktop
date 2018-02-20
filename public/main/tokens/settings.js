const settings = require('electron-settings')
const logger = require('electron-log')

const toLowerCase = str => str.toLowerCase()

function getTokenContractAddresses () {
  return Object.keys(settings.get('tokens')).map(toLowerCase)
}

function getTokenSymbol (address) {
  return settings.get(`tokens.${address.toLowerCase()}.symbol`)
}

function setTokenBalance ({ walletId, address, contractAddresse, balance }) {
  const _address = address.toLowerCase()
  const token = contractAddresse.toLowerCase()
  const addressPath = `user.wallets.${walletId}.addresses.${_address}.tokens.${token}.balance`
  settings.set(addressPath, balance)
  logger.debug('Token balance updated', { address, token, balance })
}

function getTokenBalance ({ walletId, address, contractAddresse }) {
  const _address = address.toLowerCase()
  const token = contractAddresse.toLowerCase()
  const addressPath = `user.wallets.${walletId}.addresses.${_address}.tokens.${token}.balance`
  return settings.get(addressPath)
}

module.exports = {
  getTokenBalance,
  getTokenContractAddresses,
  getTokenSymbol,
  setTokenBalance
}
