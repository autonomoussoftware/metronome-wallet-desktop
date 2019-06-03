'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.morden

const indexerUrl = process.env.MORDEN_INDEXER_URL || 'http://localhost:3015'
const metApiUrl = process.env.MORDEN_API_URL || 'http://localhost:3012/'
const wsApiUrl = process.env.MORDEN_NODE_URL || 'ws://localhost:8556'

module.exports = {
  displayName: 'Morden',
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
  indexerUrl,
  metApiUrl,
  wsApiUrl,

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
