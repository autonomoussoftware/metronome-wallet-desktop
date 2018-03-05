const path = require('path')

const paths = []

// eslint-disable-next-line no-shadow
const requireLib = function (request) {
  if (request.startsWith('.')) {
    return require(request)
  }

  const result = paths.find(function (p) {
    try {
      return require(path.join(p, request))
    } catch (err) {
      return false
    }
  })

  if (!result) {
    throw new Error(`Cannot find library '${request}'`)
  }

  return result
}

requireLib.add = function (p) {
  paths.push(p)

  return requireLib
}

global.requireLib = requireLib

module.exports = requireLib
