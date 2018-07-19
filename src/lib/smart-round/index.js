'use strict'

const BigNumber = require('bignumber.js')
const { formatMoney } = require('accounting')

const smartRounder = (maxPrecision, minDecimals, maxDecimals) =>
  function (number, shouldFormat) {
    const bn = new BigNumber(number)

    // Calculate how much to reduce the precision
    const adjustment = Math.max(bn.precision() - maxPrecision, 0)

    // Calculate how much to reduce the decimals
    const decimals = Math.max(bn.decimalPlaces() - adjustment, minDecimals)

    const string = bn.toFixed(Math.min(decimals, maxDecimals))

    return shouldFormat
      ? formatMoney(string, '', (string.split('.')[1] || '').length)
      : string
  }

module.exports = smartRounder
