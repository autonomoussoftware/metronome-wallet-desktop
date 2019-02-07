'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.ropsten

module.exports = {
  displayName: 'Ropsten (Local)', // visible in select control
  chainId: 3,
  symbol: 'ETH', // visible next to amounts

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'http://localhost:3004',
  indexerUrl: 'http://localhost:3005',
  metApiUrl: 'http://localhost:3002/',
  wsApiUrl: 'ws://localhost:8546',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
