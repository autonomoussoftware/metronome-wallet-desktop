'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.morden

module.exports = {
  displayName: 'Morden (Local)',
  chainId: 2,
  symbol: 'ETC',

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'https://mordenexplorer.ethertrack.io/tx/{{hash}}',
  indexerUrl: 'http://localhost:3015',
  metApiUrl: 'http://localhost:3012/',
  wsApiUrl: 'ws://localhost:8556',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
