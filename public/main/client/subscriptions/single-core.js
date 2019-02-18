'use strict'

const handlers = require('../handlers')
const utils = require('./utils')

const withCore = core => fn => data => fn(data, core)

const listeners = {
  'get-convert-coin-gas-limit': handlers.getConvertCoinGasLimit,
  'get-convert-coin-estimate': handlers.getConvertCoinEstimate,
  'get-export-gas-limit': handlers.getExportMetGas,
  'get-import-gas-limit': handlers.getImportMetGas,
  'get-convert-met-gas-limit': handlers.getConvertMetGasLimit,
  'refresh-all-transactions': handlers.refreshAllTransactions,
  'get-convert-met-estimate': handlers.getConvertMetEstimate,
  'get-auction-gas-limit': handlers.getAuctionGasLimit,
  'get-tokens-gas-limit': handlers.getTokensGasLimit,
  'refresh-transaction': handlers.refreshTransaction,
  'retry-import': handlers.importMetronome,
  'buy-metronome': handlers.buyMetronome,
  'get-gas-limit': handlers.getGasLimit,
  'get-gas-price': handlers.getGasPrice,
  'convert-coin': handlers.convertCoin,
  'convert-met': handlers.convertMet,
  'send-coin': handlers.sendCoin,
  'send-met': handlers.sendMet
}

const coreListeners = {}

// Subscribe to messages where only one particular core has to react
function subscribeSingleCore (core) {
  coreListeners[core.chain] = {}
  Object.keys(listeners).forEach(function (key) {
    coreListeners[core.chain][key] = withCore(core)(listeners[key])
  })

  utils.subscribeTo(coreListeners[core.chain], core.chain)
}

const unsubscribeSingleCore = core =>
  utils.unsubscribeTo(coreListeners[core.chain])

module.exports = { subscribeSingleCore, unsubscribeSingleCore }
