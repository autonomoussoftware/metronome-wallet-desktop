'use strict'
require('dotenv').config()

var ethRopstenLocal = require('./ethRopstenLocal')
var etcMordenLocal = require('./etcMordenLocal')
var ethMainnet = require('./ethMainnet')
var ethRopsten = require('./ethRopsten')
var etcMorden = require('./etcMorden')

module.exports = {
  chains: {
    ethRopstenLocal,
    etcMordenLocal,
    ethMainnet,
    ethRopsten,
    etcMorden
  },
  enabledChains: process.env.REACT_APP_ENABLED_CHAINS
    ? process.env.REACT_APP_ENABLED_CHAINS.split(' ')
    : ['ethMain'],
  requiredPasswordEntropy: 72,
  explorerDebounce: 2000,
  ratesUpdateMs: 30000,
  trackingId: process.env.TRACKING_ID || null,
  sentryDsn: process.env.SENTRY_DSN || null,
  debug: process.env.DEBUG || false
}
