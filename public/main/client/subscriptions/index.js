'use strict'

const { subscribeMultiCore, unsubscribeMultiCore } = require('./multi-core')
const { subscribeSingleCore, unsubscribeSingleCore } = require('./single-core')
const { subscribeWithoutCore, unsubscribeWithoutCore } = require('./no-core')

function subscribe (cores) {
  cores.forEach(subscribeSingleCore)
  subscribeMultiCore(cores)
  subscribeWithoutCore()
}

function unsubscribe () {
  unsubscribeMultiCore()
  unsubscribeSingleCore()
  unsubscribeWithoutCore()
}

module.exports = { subscribe, unsubscribe }
