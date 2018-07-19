'use strict';

var BigNumber = require('bignumber.js');

var _require = require('accounting'),
    formatMoney = _require.formatMoney;

var smartRounder = function smartRounder(maxPrecision, minDecimals, maxDecimals) {
  return function (number, shouldFormat) {
    var bn = new BigNumber(number);

    // Calculate how much to reduce the precision
    var adjustment = Math.max(bn.precision() - maxPrecision, 0);

    // Calculate how much to reduce the decimals
    var decimals = Math.max(bn.decimalPlaces() - adjustment, minDecimals);

    var string = bn.toFixed(Math.min(decimals, maxDecimals));

    return shouldFormat ? formatMoney(string, '', (string.split('.')[1] || '').length) : string;
  };
};

module.exports = smartRounder;
