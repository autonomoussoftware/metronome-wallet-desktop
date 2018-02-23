const settings = require('electron-settings')

const getAuctionAddress = () =>
  settings.get('metronome.contracts.auctions').toLowerCase()

const getConverterAddress = () =>
  settings.get('metronome.contracts.converter').toLowerCase()

const getTokenAddress = () =>
  settings.get('metronome.contracts.token').toLowerCase()

module.exports = { getAuctionAddress, getConverterAddress, getTokenAddress }
