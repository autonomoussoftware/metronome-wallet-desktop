'use strict'
var ethMainnet = require('./ethMainnet')
var ethRopsten = require('./ethRopsten')
var etcMorden = require('./etcMorden')

module.exports = {
  chains: {
    ethMainnet,
    ethRopsten,
    etcMorden
  },
  enabledChains: ['ethMainnet', 'ethRopsten', 'etcMorden'],
  requiredPasswordEntropy: 72,
  trackingId: process.env.TRACKING_ID || null,
  sentryDsn: process.env.SENTRY_DSN || null,
  debug: process.env.DEBUG || false
}
