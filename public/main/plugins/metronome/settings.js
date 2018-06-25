'use strict'

const MetronomeContracts = require('metronome-contracts')
const settings = require('electron-settings')

const chain = settings.get('app.chain') || 'mainnet'

const getAuctionAddress = () =>
  MetronomeContracts.addresses[chain].auctions.toLowerCase()

const getConverterAddress = () =>
  MetronomeContracts.addresses[chain].autonomousConverter.toLowerCase()

const getTokenAddress = () =>
  MetronomeContracts.addresses[chain].metToken.toLowerCase()

module.exports = { getAuctionAddress, getConverterAddress, getTokenAddress }
