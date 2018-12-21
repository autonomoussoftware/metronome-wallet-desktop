'use strict'

const MetronomeContracts = require('metronome-contracts')
const newConfig = require('../config/index.js')

const addresses =
  MetronomeContracts.addresses[process.env.REACT_APP_ETH_CHAIN || 'main']
const defaultExplorerUrl = 'https://explorer.metronome.io'

const env = {
  ETH_CHAIN: 'ropsten',
  // ETH_WS_API_URL: 'wss://eth.wallet.bloqrock.net:8546',
  ETH_WS_API_URL: 'ws://ec2-54-233-108-37.sa-east-1.compute.amazonaws.com:8546',
  // EXPLORER_INDEXER_URL: 'https://indexer.bloqrock.net',
  EXPLORER_INDEXER_URL: 'http://localhost:3005',
  MET_EXPLORER_URL: 'https://explorer.met.bloqrock.net',
  TRACKING_ID: null,
  SENTRY_DSN: null,
  debug: false
}

// const prodEnv = {
//   ETH_CHAIN: 'mainnet',
//   ETH_WS_API_URL: 'wss://eth.wallet.metronome.io:8546',
//   EXPLORER_INDEXER_URL: 'https://indexer.metronome.io',
//   MET_EXPLORER_URL: 'https://explorer.metronome.io',
//   TRACKING_ID: null,
//   SENTRY_DSN: null,
//   debug: false
// }

const oldConfig = {
  MET_TOKEN_ADDR: addresses.metToken,
  CONVERTER_ADDR: addresses.autonomousConverter,
  MET_EXPLORER_URL:
    process.env.REACT_APP_MET_EXPLORER_URL || defaultExplorerUrl,
  SENTRY_DSN:
    null,
  // process.env.REACT_APP_SENTRY_DSN ||
  // 'https://d9905c2eec994071935593d4085d3547@sentry.io/290706',
  ETH_DEFAULT_GAS_LIMIT: '21000',
  MET_DEFAULT_GAS_LIMIT: '250000',
  DEFAULT_GAS_PRICE: '1000000000',
  MAX_GAS_PRICE: '20000000000000000', // ~= $12 USD
  REQUIRED_PASSWORD_ENTROPY: 1,
  eth: {
    chain: env.ETH_CHAIN,
    wsApiUrl: env.ETH_WS_API_URL
  },
  explorer: {
    indexerUrl: env.EXPLORER_INDEXER_URL
  },
  debug: env.debug
}

// TODO: temporary until we migrate everything to use newConfig format
module.exports = Object.assign({}, oldConfig, newConfig)
