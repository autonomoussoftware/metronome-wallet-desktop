'use strict'

const MetronomeContracts = require('metronome-contracts')
const contracts = MetronomeContracts.mainnet

module.exports = {
  displayName: 'ETHEREUM', // visible in select control
  chainId: 1,
  symbol: 'ETH', // visible next to amounts

  // contracts addresses
  tokenPorterAddress: contracts.TokenPorter.address,
  converterAddress: contracts.AutonomousConverter.address,
  validatorAddress: contracts.Validator.address,
  metTokenAddress: contracts.METToken.address,
  auctionAddress: contracts.Auctions.address,


  // urls
  explorerUrl: 'https://explorer.metronome.io',
  indexerUrl: 'https://indexer.metronome.io',
  metApiUrl: 'https://api.metronome.io/',
  wsApiUrl: 'wss://eth.wallet.metronome.io:8546',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
