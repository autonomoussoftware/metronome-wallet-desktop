'use strict'

const singleCore = require('./single-core')
const multiCore = require('./multi-core')
const noCore = require('./no-core')

module.exports = Object.assign({}, singleCore, multiCore, noCore)
