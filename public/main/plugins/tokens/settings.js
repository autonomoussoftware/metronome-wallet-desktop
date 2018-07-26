'use strict'

const settings = require('electron-settings')

const toLowerCase = str => str.toLowerCase()

const getTokenContractAddresses = () =>
  Object.keys(settings.get('tokens') || {}).map(toLowerCase)

const getTokenSymbol = address =>
  settings.get(`tokens.${address.toLowerCase()}.symbol`)

const getRescanBalance = () => settings.get('app.rescanBalance')

function addTokenContract (address, meta) {
  settings.set(`tokens.${address.toLowerCase()}`, meta)
}

module.exports = {
  addTokenContract,
  getRescanBalance,
  getTokenContractAddresses,
  getTokenSymbol
}
