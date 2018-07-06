'use strict'

const { app } = require('electron')
const ua = require('universal-analytics')
const settings = require('electron-settings')

const visitor = ua(settings.get('app.trackingId'))
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

analytics.init = function () {
  analytics.event('App', 'App initiated')
}

module.exports = analytics
