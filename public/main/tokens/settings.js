const settings = require('electron-settings')

const toLowerCase = str => str.toLowerCase()

function getTokenContractAddresses () {
  return Object.keys(settings.get('tokens')).map(toLowerCase)
}

function getTokenSymbol (address) {
  return settings.get(`tokens.${address.toLowerCase()}.symbol`)
}

module.exports = { getTokenContractAddresses, getTokenSymbol }
