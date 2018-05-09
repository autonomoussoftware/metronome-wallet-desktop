'use strict'

const settings = require('electron-settings')

const getIndexerApiUrl = () =>
  settings.get('app.indexerApiUrl')

module.exports = { getIndexerApiUrl }
