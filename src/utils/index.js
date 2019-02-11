import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import { fromWei, toBN, toWei, toHex } from 'web3-utils'

export const errorPropTypes = (...fields) => {
  const shape = fields.reduce((acc, fieldName) => {
    acc[fieldName] = PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ])
    return acc
  }, {})
  return PropTypes.shape(shape).isRequired
}

export const statusPropTypes = PropTypes.oneOf([
  'init',
  'pending',
  'success',
  'failure'
]).isRequired

export function isWeiable(amount, unit = 'ether') {
  let isValid
  try {
    toWei(amount.replace(',', '.'), unit)
    isValid = true
  } catch (e) {
    isValid = false
  }
  return isValid
}

export function isHexable(amount) {
  try {
    toHex(amount)
    return true
  } catch (e) {
    return false
  }
}

export function isGreaterThanZero(amount) {
  const weiAmount = new BigNumber(toWei(amount.replace(',', '.')))
  return weiAmount.gt(new BigNumber(0))
}

export function getWeiUSDvalue(amount, rate) {
  const amountBN = toBN(amount)
  const rateBN = toBN(toWei(typeof rate === 'string' ? rate : rate.toString()))
  return amountBN.mul(rateBN).div(toBN(toWei('1')))
}

export function getUSDequivalent(amount, rate) {
  const weiUSDvalue = getWeiUSDvalue(amount, rate)

  return weiUSDvalue.isZero()
    ? '$0.00 (USD)'
    : weiUSDvalue.lt(toBN(toWei('0.01')))
    ? '< $0.01 (USD)'
    : `$${new BigNumber(fromWei(weiUSDvalue.toString()))
        .dp(2)
        .toString(10)} (USD)`
}

export function toUSD(amount, rate, errorValue, smallValue) {
  let isValidAmount
  let weiUSDvalue
  try {
    weiUSDvalue = getWeiUSDvalue(toWei(amount.replace(',', '.')), rate)
    isValidAmount = weiUSDvalue.gte(toBN('0'))
  } catch (e) {
    isValidAmount = false
  }

  const expectedUSDamount = isValidAmount
    ? weiUSDvalue.isZero()
      ? '0'
      : weiUSDvalue.lt(toBN(toWei('0.01')))
      ? smallValue
      : new BigNumber(fromWei(weiUSDvalue.toString())).dp(2).toString(10)
    : errorValue

  return expectedUSDamount
}

export function toCoin(amount, rate, errorValue = 'Invalid amount') {
  let isValidAmount
  let weiAmount
  try {
    weiAmount = new BigNumber(toWei(amount.replace(',', '.')))
    isValidAmount = weiAmount.gte(new BigNumber(0))
  } catch (e) {
    isValidAmount = false
  }

  const expectedCoinamount = isValidAmount
    ? weiAmount
        .dividedBy(new BigNumber(toWei(String(rate))))
        .decimalPlaces(18)
        .toString(10)
    : errorValue

  return expectedCoinamount
}

export function toMET(amount, rate, errorValue = 'Invalid amount', remaining) {
  let isValidAmount
  let weiAmount
  try {
    weiAmount = new BigNumber(toWei(amount.replace(',', '.')))
    isValidAmount = weiAmount.gte(new BigNumber(0))
  } catch (e) {
    isValidAmount = false
  }

  const expectedMETamount = isValidAmount
    ? toWei(
        weiAmount
          .dividedBy(new BigNumber(rate))
          .decimalPlaces(18)
          .toString(10)
      )
    : errorValue

  const excedes = isValidAmount
    ? toBN(expectedMETamount).gte(toBN(remaining))
    : null

  const usedCoinAmount =
    isValidAmount && excedes
      ? new BigNumber(remaining)
          .multipliedBy(new BigNumber(rate))
          .dividedBy(new BigNumber(toWei('1')))
          .integerValue()
          .toString(10)
      : null

  const excessCoinAmount =
    isValidAmount && excedes
      ? weiAmount
          .minus(usedCoinAmount)
          .integerValue()
          .toString(10)
      : null

  return { expectedMETamount, excedes, usedCoinAmount, excessCoinAmount }
}

export function weiToGwei(amount) {
  return fromWei(amount, 'gwei')
}

export function gweiToWei(amount) {
  return toWei(amount, 'gwei')
}

export function smartRound(weiAmount) {
  const n = Number.parseFloat(fromWei(weiAmount), 10)
  let decimals = -Math.log10(n) + 10
  if (decimals < 2) {
    decimals = 2
  } else if (decimals >= 18) {
    decimals = 18
  }
  // round extra decimals and remove trailing zeroes
  return new BigNumber(n.toFixed(Math.ceil(decimals))).toString(10)
}

/**
 * Removes extra spaces and converts to lowercase
 * Useful for sanitizing user input before recovering a wallet.
 *
 * @param {string} str The string to sanitize
 */
export function sanitizeMnemonic(str) {
  return str
    .replace(/\s+/gi, ' ')
    .trim()
    .toLowerCase()
}

export function getConversionRate(metAmount, coinAmount) {
  const compareAgainst = fromWei(metAmount)
  return new BigNumber(coinAmount)
    .dividedBy(new BigNumber(compareAgainst))
    .integerValue()
    .toString(10)
}
