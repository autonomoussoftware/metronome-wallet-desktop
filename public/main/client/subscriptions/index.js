'use strict'

const { subscribeMultiCore, unsubscribeMultiCore } = require('./multi-core')
const { subscribeSingleCore, unsubscribeSingleCore } = require('./single-core')
const { subscribeWithoutCore, unsubscribeWithoutCore } = require('./no-core')

function subscribe (cores) {
  cores.forEach(subscribeSingleCore)
  subscribeMultiCore(cores)
  subscribeWithoutCore()
}

function unsubscribe (cores) {
  cores.forEach(unsubscribeSingleCore)
  unsubscribeMultiCore()
  unsubscribeWithoutCore()
}

module.exports = { subscribe, unsubscribe }
