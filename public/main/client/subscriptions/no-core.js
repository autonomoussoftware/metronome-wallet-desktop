'use strict'

const handlers = require('../handlers')
const utils = require('./utils')

const listeners = {
  'validate-password': handlers.validatePassword,
  'change-password': handlers.changePassword,
  'persist-state': handlers.persistState,
  'clear-cache': handlers.clearCache
}

// Subscribe to messages where no core has to react
const subscribeWithoutCore = () =>
  utils.subscribeTo(listeners, 'none')

const unsubscribeWithoutCore = () =>
  utils.unsubscribeTo(listeners)

module.exports = { subscribeWithoutCore, unsubscribeWithoutCore }
