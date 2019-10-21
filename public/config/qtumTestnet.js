'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts['qtumTestnet']

module.exports = {
  chainId: 'test',
  chainType: 'qtum',
  displayName: 'Qtum Testnet',
  symbol: 'QTUM',

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: process.env.QTUMTEST_EXPLORER_URL || 'http://localhost:3001',
  nodeUrl: process.env.QTUMTEST_NODE_URL || 'http://user:password@localhost:13889',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
