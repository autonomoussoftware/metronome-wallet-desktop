'use strict'

const MetronomeContracts = require('metronome-contracts')
const addresses = MetronomeContracts.addresses.ropsten

module.exports = {
  displayName: 'Ropsten (Local)', // visible in select control
  chainId: 3,
  symbol: 'ETH', // visible next to amounts

  // contracts addresses
  tokenPorterAddress: addresses.tokenPorter,
  converterAddress: addresses.autonomousConverter,
  validatorAddress: addresses.validator,
  metTokenAddress: addresses.metToken,
  auctionAddress: addresses.auctions,

  // urls
  explorerUrl: 'https://explorer.metronome.io',   // TODO: update!
  indexerUrl: 'http://localhost:3005',
  metApiUrl: 'https://api.metronome.io/',         // TODO: update!
  wsApiUrl: 'ws://localhost:8546',

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
