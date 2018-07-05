'use strict'

const { app } = require('electron')
const ua = require('universal-analytics')
const config = require('./config')

const visitor = ua(config.googleAnalyticsAccountId)
const analytics = {}

visitor.set('ds', 'app')
visitor.set('an', 'Metronome Wallet')
visitor.set('av', app.getVersion())

analytics.screenview = function (...args) {
  visitor.screenview(...args).send()
}

analytics.event = function (...args) {
  visitor.event(...args).send()
}

analytics.event('Main Process', 'App Initialized')

global.analytics = analytics

module.exports = analytics
