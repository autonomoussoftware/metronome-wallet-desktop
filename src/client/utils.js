import utils from 'web3-utils'

import cuid from 'cuid'

import Deferred from '../lib/Deferred'

export const fromWei = (str, unit = 'ether') => utils.fromWei(str, unit)
export const toWei = (bn, unit = 'ether') => utils.toWei(bn, unit)

export const isAddress = str => utils.isAddress(str)

export const toBN = str => utils.toBN(str)
export const toHex = bn => utils.toHex(bn)

export function forwardToMainProcess(eventName, timeout = 10000) {
  return function(data) {
    return sendToMainProcess(eventName, data, timeout)
  }
}

/*
 * Sends a message to Main Process and returns a Promise.
 *
 * This makes it easier to handle IPC inside components
 * without the need of manual (un)subscriptions.
 */
export function sendToMainProcess(eventName, data, timeout = 10000) {
  const id = cuid()

  const deferred = new Deferred()
  let timeoutId

  function listener(ev, { id: _id, data: _data, error }) {
    if (timeoutId) window.clearTimeout(timeoutId)
    if (_id !== id) return

    const responseError = error || (_data && _data.error)

    if (responseError) {
      deferred.reject(responseError)
    } else {
      deferred.resolve(_data)
    }

    window.ipcRenderer.removeListener(eventName, listener)
  }

  window.ipcRenderer.on(eventName, listener)
  window.ipcRenderer.send(eventName, { id, data })

  if (timeout) {
    timeoutId = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn(`Event "${eventName}" timed out after ${timeout}ms.`)
      deferred.reject(new Error('Operation timed out. Please try again later.'))
      window.ipcRenderer.removeListener(eventName, listener)
    }, timeout)
  }

  return deferred.promise
}
