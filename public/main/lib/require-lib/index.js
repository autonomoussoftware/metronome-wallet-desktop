const path = require('path')

const paths = []

// eslint-disable-next-line no-shadow
const requireLib = function (request) {
  if (request.startsWith('.')) {
    return require(request)
  }

  const result = paths.map(p => path.join(p, request)).find(function (p) {
    try {
      require(p)

      return true
    } catch (err) {
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

  return requireLib
}

global.requireLib = requireLib

module.exports = requireLib
