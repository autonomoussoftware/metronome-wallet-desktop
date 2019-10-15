'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts['qtumTestnet']

module.exports = {
  displayName: 'Qtum Testnet',
  chainId: 3,
  symbol: 'QTUM',

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'http://localhost', // TODO: update!
  indexerUrl: process.env.QTUM_TESTNET_INDEXER_URL || 'http://localhost:3025',
  wsApiUrl: process.env.QTUM_TESTNET_NODE_URL || 'ws://localhost:8566',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
