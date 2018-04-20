'use strict'

const { noop } = require('lodash')
const EventEmitter = require('events')

const defaultPluginOptions = {
  start: noop,
  stop: noop,
  onNewPage: noop,
  onPluginEvents: []
}

function createBasePlugin (options) {
  const {
    start,
    stop,
    onNewPage,
    onPluginEvents
  } = Object.assign({}, defaultPluginOptions, options)

  const pluginEmitter = new EventEmitter()

  const subscriptions = []

  function onUnload (_, webContents) {
    const index = subscriptions.findIndex(s => s.webContents === webContents)

    if (index < 0) {
      return
    }

    subscriptions.splice(index, 1)

    if (subscriptions.length === 0) {
      stop()
    }
  }

  function onReady (_, webContents) {
    webContents.on('destroyed', function () {
      onUnload(_, webContents)
    })

    subscriptions.push({ webContents })

    if (subscriptions.length === 1) {
      start(pluginEmitter)
    }

    onNewPage(webContents)
  }

  onPluginEvents.forEach(function ({ eventName, handler }) {
    pluginEmitter.on(eventName, function (data) {
      handler(subscriptions, data)
    })
  })

  pluginEmitter.on('register-webcontents-metadata', function (data) {
    const { webContents, meta } = data

    const subscription = subscriptions.find(s => s.webContents === webContents)

    subscription.meta = meta
  })

  return {
    uiHooks: [
      { eventName: 'ui-ready', handler: onReady },
      { eventName: 'ui-unload', handler: onUnload }
    ]
  }
}

module.exports = createBasePlugin
