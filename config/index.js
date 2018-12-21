'use strict'
var ethMainnet = require('./ethMainnet')
var ethRopsten = require('./ethRopsten')

module.exports = {
  chains: {
    ethMainnet,
    ethRopsten
  },
  enabledChains: ['ethMainnet', 'ethRopsten'],
  requiredPasswordEntropy: 72,
  trackingId: process.env.TRACKING_ID || null,
  sentryDsn: process.env.SENTRY_DSN || null,
  debug: process.env.DEBUG || false
}
