'use strict'

const handlers = require('../handlers')
const utils = require('./utils')

const withCores = cores => fn => data => fn(data, cores)

const listeners = {
  'recover-from-mnemonic': handlers.recoverFromMnemonic,
  'onboarding-completed': handlers.onboardingCompleted,
  'get-import-gas-limit': handlers.getImportMetGas,
  'port-metronome': handlers.portMetronome,
  'retry-import': handlers.importMetronome,
  'login-submit': handlers.onLoginSubmit,
  'get-port-fees': handlers.getPortFees
}

// Subscribe to messages where two or more cores have to react
function subscribeMultiCore (cores) {
  Object.keys(listeners).forEach(function (key) {
    listeners[key] = withCores(cores)(listeners[key])
  })
  utils.subscribeTo(listeners, 'multi')
}

const unsubscribeMultiCore = () =>
  utils.unsubscribeTo(listeners)

module.exports = { subscribeMultiCore, unsubscribeMultiCore }
