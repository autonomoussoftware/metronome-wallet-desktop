'use strict'

const path = require('path')
const debug = require('debug')('require-lib')

const paths = []

// eslint-disable-next-line no-shadow
const requireLib = function (request) {
  if (request.startsWith('.')) {
    return require(request)
  }

  const result = paths.map(p => path.join(p, request)).find(function (p) {
    try {
      debug('About to require %s', p)

      require(p)

      debug('Lib found at %s', p)

      return true
    } catch (err) {
      debug('Lib not found: %s', err.message)

      return false
    }
  })

  if (!result) {
    throw new Error(`Cannot find library '${request}'`)
  }

  return require(result)
}

requireLib.add = function (p) {
  paths.push(p)

  debug('Path added: %s', p)

  return requireLib
}

global.requireLib = requireLib

module.exports = requireLib
