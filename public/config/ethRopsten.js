'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.ropsten

module.exports = {
  displayName: 'ETH (Ropsten)',
  chainId: 3,
  symbol: 'ETH',

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,

  // urls
  explorerUrl: 'https://explorer.metronome.io', // TODO: update!
  indexerUrl: 'https://indexer.metronome.io', // TODO: update!
  metApiUrl: 'https://api.metronome.io/', // TODO: update!
  wsApiUrl: 'wss://eth.wallet.metronome.io:8546', // TODO: update!

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
