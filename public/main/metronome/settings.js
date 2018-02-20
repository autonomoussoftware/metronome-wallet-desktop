const settings = require('electron-settings')

const getAuctionAddress = () =>
  settings.get('metronome.contracts.auctions').toLowerCase()

const getConverterAddress = () =>
  settings.get('metronome.contracts.converter').toLowerCase()

module.exports = { getAuctionAddress, getConverterAddress }
