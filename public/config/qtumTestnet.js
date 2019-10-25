'use strict'

const { keyBy } = require('lodash')
const MetronomeContracts = require('metronome-wallet-core/contracts')

const chainId = 'test'
const chainType = 'qtum'

const contracts = keyBy(MetronomeContracts[chainType][chainId], 'name')

const config = {
  chainId,
  chainType,
  displayName: 'Qtum Testnet',
  symbol: 'QTUM',
  decimals: 8,

  // contracts addresses
  tokenPorterAddress: contracts['TokenPorter'].address,
  converterAddress: contracts['AutonomousConverter'].address,
  validatorAddress: contracts['Validator'].address,
  metTokenAddress: contracts['METToken'].address,
  auctionAddress: contracts['Auctions'].address,

  // urls
  explorerUrl: process.env.QTUMTEST_EXPLORER_URL || 'http://localhost:3001',
  nodeUrl: process.env.QTUMTEST_NODE_URL || 'http://user:password@localhost:13889',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}

module.exports = config
