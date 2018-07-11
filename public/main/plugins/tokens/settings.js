'use strict'

const settings = require('electron-settings')

const toLowerCase = str => str.toLowerCase()

const getTokenContractAddresses = () =>
  Object.keys(settings.get('tokens')).map(toLowerCase)

const getTokenSymbol = address =>
  settings.get(`tokens.${address.toLowerCase()}.symbol`)

module.exports = {
  getTokenContractAddresses,
  getTokenSymbol
}
