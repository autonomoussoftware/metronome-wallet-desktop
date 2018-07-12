'use strict'

const { app } = require('electron')
const ua = require('universal-analytics')
const { noop } = require('lodash')
const settings = require('electron-settings')
const isDev = require('electron-is-dev')

const visitor = ua(settings.get('app.trackingId'))
const analytics = {}

visitor.set('ds', 'app')
visitor.set('an', app.getName())
visitor.set('av', app.getVersion())

analytics.screenview = function (...args) {
  visitor.screenview(...args).send()
}

analytics.event = function (...args) {
  visitor.event(...args).send()
}

analytics.init = function (userAgent) {
  visitor.set('ua', userAgent)
  analytics.event('App', 'App initiated')
}

const analyticsDev = {
  init: noop,
  event: noop,
  screenview: noop
}

module.exports = isDev ? analyticsDev : analytics
