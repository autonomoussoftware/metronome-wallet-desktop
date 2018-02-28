import BigNumber from 'bignumber.js'
import Deferred from './lib/Deferred'
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

  function listener(event, { id: _id, data: _data }) {
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
    setTimeout(() => {
      deferred.reject(
        new Error(`Event "${eventName}" timed out after ${timeout}ms.`)
      )
      ipcRenderer.removeListener(eventName, listener)
    }, timeout)
  }

  return deferred.promise
}

export function isWeiable(amount) {
  let isValid
  try {
    Web3.utils.toWei(amount.replace(',', '.'))
    isValid = true
  } catch (e) {
    isValid = false
  }
  return isValid
}

export function isGreaterThanZero(amount) {
  const weiAmount = new BigNumber(Web3.utils.toWei(amount.replace(',', '.')))
  return weiAmount.gt(new BigNumber(0))
}

export function toUSD(amount, rate, errorValue = 'Invalid amount') {
  let isValidAmount
  let usdAmount
  try {
    if (!isWeiable(amount.replace(',', '.'))) throw new Error()
    usdAmount = parseFloat(amount.replace(',', '.'), 10) * parseFloat(rate, 10)
    isValidAmount = usdAmount >= 0
  } catch (e) {
    isValidAmount = false
  }

  const expectedUSDamount = isValidAmount ? usdAmount.toString(10) : errorValue

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
