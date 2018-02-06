import Deferred from './lib/Deferred'
import cuid from 'cuid'

const { ipcRenderer } = window.require('electron')

export function sendToMainProcess(event, data, timeout = 10000) {
  const id = cuid()

  const deferred = new Deferred()

  function listener(event, { id: _id, data: _data }) {
    if (_id !== id) return

    if (_data.error) {
      deferred.reject(_data.error)
    } else {
      deferred.resolve(_data)
    }

    ipcRenderer.removeListener(event, listener)
  }

  ipcRenderer.on(event, listener)
  ipcRenderer.send(event, { id, data })

  setTimeout(() => {
    deferred.reject(
      new Error(`Event "${event}"" timed out after ${timeout}ms.`)
    )
    ipcRenderer.removeListener(event, listener)
  }, timeout)

  return deferred.promise
}
