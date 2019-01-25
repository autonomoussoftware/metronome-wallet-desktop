'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.morden

module.exports = {
  displayName: 'Morden (Local)', // visible in select control
  chainId: 2,
  symbol: 'ETC', // visible next to amounts

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'https://explorer.metronome.io',   // TODO: update!
  indexerUrl: 'http://localhost:3015',
  metApiUrl: 'https://api.metronome.io/',         // TODO: update!
  wsApiUrl: 'ws://localhost:8556',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
