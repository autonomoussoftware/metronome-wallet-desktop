'use strict'

const MetronomeContracts = require('metronome-contracts')
const addresses = MetronomeContracts.addresses.mainnet

module.exports = {
  displayName: 'ETHEREUM', // visible in select control
  chainId: 1,
  symbol: 'ETH', // visible next to amounts

  // contracts addresses
  converterAddress: addresses.autonomousConverter,
  metTokenAddress: addresses.metToken,
  auctionAddress: addresses.auctions,

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
