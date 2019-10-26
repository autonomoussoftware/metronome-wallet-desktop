'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts['ropsten']

const indexerUrl = process.env.ROPSTEN_INDEXER_URL || 'http://localhost:3005'
const wsApiUrl = process.env.ROPSTEN_NODE_URL || 'ws://localhost:8546'

module.exports = {
  displayName: 'Ropsten',
  chainType: 'ethereum',
  decimals: 18,
  chainId: 3,
  symbol: 'ETH',

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'https://ropsten.etherscan.io/tx/{{hash}}',
  indexerUrl,
  wsApiUrl,

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
