'use strict'

const MetronomeContracts = require('metronome-contracts')
const addresses = MetronomeContracts.addresses.morden

module.exports = {
  displayName: 'ETC (Morden)', // visible in select control
  chainId: 2,
  symbol: 'ETC', // visible next to amounts

  // contracts addresses
  tokenPorterAddress: addresses.tokenPorter,
  converterAddress: addresses.autonomousConverter,
  validatorAddress: addresses.validator,
  metTokenAddress: addresses.metToken,
  auctionAddress: addresses.auctions,

  // urls
  explorerUrl: 'https://explorer.metronome.io',   // TODO: update!
  indexerUrl: 'https://indexer.metronome.io',     // TODO: update!
  metApiUrl: 'https://api.metronome.io/',         // TODO: update!
  wsApiUrl: 'wss://eth.wallet.metronome.io:8546', // TODO: update!

  // defauls
  coinDefaultGasLimit: '21000',
  metDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
}
