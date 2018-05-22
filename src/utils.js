import BigNumber from 'bignumber.js'
import Deferred from './lib/Deferred'
import config from './config'
import cuid from 'cuid'
import Web3 from 'web3'

const { ipcRenderer } = window.require('electron')

/**
 * Sends a message to Main Process and returns a Promise.
 *
 * This makes it easier to handle IPC inside components
 * without the need of manual (un)subscriptions.
 */
export function sendToMainProcess(eventName, data, timeout = 10000) {
  const id = cuid()

  const deferred = new Deferred()
  let timeoutId

  function listener(ev, { id: _id, data: _data }) {
    if (timeoutId) window.clearTimeout(timeoutId)
    if (_id !== id) return

    if (_data.error) {
      deferred.reject(_data.error)
    } else {
      deferred.resolve(_data)
    }

    ipcRenderer.removeListener(eventName, listener)
  }

  ipcRenderer.on(eventName, listener)
  ipcRenderer.send(eventName, { id, data })

  if (timeout) {
    timeoutId = setTimeout(() => {
      console.warn(`Event "${eventName}" timed out after ${timeout}ms.`)
      deferred.reject(new Error('Operation timed out. Please try again later.'))
      ipcRenderer.removeListener(eventName, listener)
    }, timeout)
  }

  return deferred.promise
}

export function isWeiable(amount, unit = 'ether') {
  let isValid
  try {
    Web3.utils.toWei(amount.replace(',', '.'), unit)
    isValid = true
  } catch (e) {
    isValid = false
  }
  return isValid
}

export function isHexable(amount) {
  try {
    Web3.utils.toHex(amount)
    return true
  } catch (e) {
    return false
  }
}

export function isGreaterThanZero(amount) {
  const weiAmount = new BigNumber(Web3.utils.toWei(amount.replace(',', '.')))
  return weiAmount.gt(new BigNumber(0))
}

export function getWeiUSDvalue(amount, rate) {
  const amountBN = Web3.utils.toBN(amount)
  const rateBN = Web3.utils.toBN(
    Web3.utils.toWei(typeof rate === 'string' ? rate : rate.toString())
  )
  return amountBN.mul(rateBN).div(Web3.utils.toBN(Web3.utils.toWei('1')))
}

export function getUSDequivalent(amount, rate) {
  const weiUSDvalue = getWeiUSDvalue(amount, rate)

  return weiUSDvalue.isZero()
    ? '$0.00 (USD)'
    : weiUSDvalue.lt(Web3.utils.toBN(Web3.utils.toWei('0.01')))
      ? '< $0.01 (USD)'
      : `$${new BigNumber(Web3.utils.fromWei(weiUSDvalue))
          .dp(2)
          .toString(10)} (USD)`
}

export function toUSD(amount, rate, errorValue, smallValue) {
  let isValidAmount
  let weiUSDvalue
  try {
    weiUSDvalue = getWeiUSDvalue(
      Web3.utils.toWei(amount.replace(',', '.')),
      rate
    )
    isValidAmount = weiUSDvalue.gte(Web3.utils.toBN('0'))
  } catch (e) {
    isValidAmount = false
  }

  const expectedUSDamount = isValidAmount
    ? weiUSDvalue.isZero()
      ? '0'
      : weiUSDvalue.lt(Web3.utils.toBN(Web3.utils.toWei('0.01')))
        ? smallValue
        : new BigNumber(Web3.utils.fromWei(weiUSDvalue)).dp(2).toString(10)
    : errorValue

  return expectedUSDamount
}

export function toETH(amount, rate, errorValue = 'Invalid amount') {
  let isValidAmount
  let weiAmount
  try {
    weiAmount = new BigNumber(Web3.utils.toWei(amount.replace(',', '.')))
    isValidAmount = weiAmount.gte(new BigNumber(0))
  } catch (e) {
    isValidAmount = false
  }

  const expectedETHamount = isValidAmount
    ? weiAmount
        .dividedBy(new BigNumber(Web3.utils.toWei(String(rate))))
        .decimalPlaces(18)
        .toString(10)
    : errorValue

  return expectedETHamount
}

export function toMET(amount, rate, errorValue = 'Invalid amount', remaining) {
  let isValidAmount
  let weiAmount
  try {
    weiAmount = new BigNumber(Web3.utils.toWei(amount.replace(',', '.')))
    isValidAmount = weiAmount.gte(new BigNumber(0))
  } catch (e) {
    isValidAmount = false
  }

  const expectedMETamount = isValidAmount
    ? Web3.utils.toWei(
        weiAmount
          .dividedBy(new BigNumber(rate))
          .decimalPlaces(18)
          .toString(10)
      )
    : errorValue

  const excedes = isValidAmount
    ? Web3.utils.toBN(expectedMETamount).gte(Web3.utils.toBN(remaining))
    : null

  const usedETHAmount =
    isValidAmount && excedes
      ? new BigNumber(remaining)
          .multipliedBy(new BigNumber(rate))
          .dividedBy(new BigNumber(Web3.utils.toWei('1')))
          .integerValue()
          .toString(10)
      : null

  const excessETHAmount =
    isValidAmount && excedes
      ? weiAmount
          .minus(usedETHAmount)
          .integerValue()
          .toString(10)
      : null

  return { expectedMETamount, excedes, usedETHAmount, excessETHAmount }
}

export function weiToGwei(amount) {
  return Web3.utils.fromWei(amount, 'gwei')
}

export function gweiToWei(amount) {
  return Web3.utils.toWei(amount, 'gwei')
}

export function smartRound(weiAmount) {
  let n = Number.parseFloat(Web3.utils.fromWei(weiAmount), 10)
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
 * Perform an array of common replacements on strings
 * Each replacement is defined by an object of shape { search, replaceWith }
 * 'search' and 'replaceWith' are used as first and second argument of
 * String.prototype.replace() so the same specs apply.
 */
export function messageParser(str) {
  const replacements = [
    { search: config.MTN_TOKEN_ADDR, replaceWith: 'MET TOKEN CONTRACT' },
    { search: config.CONVERTER_ADDR, replaceWith: 'CONVERTER CONTRACT' },
    {
      search: /(.*Insufficient\sfunds.*Required\s)(\d+)(\sand\sgot:\s)(\d+)(.*)/gim,
      replaceWith: (match, p1, p2, p3, p4, p5) =>
        [p1, smartRound(p2), ' ETH', p3, smartRound(p4), ' ETH', p5].join('')
    }
  ]

  return replacements.reduce(
    (output, { search, replaceWith }) => output.replace(search, replaceWith),
    str
  )
}

/**
 * Removes extra spaces and converts to lowercase
 * Useful for sanitizing user input before recovering a wallet.
 */
export function sanitizeMnemonic(str) {
  return str
    .replace(/\s+/gi, ' ')
    .trim()
    .toLowerCase()
}
