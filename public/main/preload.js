'use strict'

const { ipcRenderer, clipboard, shell, remote } = require('electron')
const isDev = require('electron-is-dev')

// @see http://electronjs.org/docs/tutorial/security#2-disable-nodejs-integration-for-remote-content

window.copyToClipboard = function (text) {
  return clipboard.writeText(text)
}

window.getAppVersion = function () {
  return remote.app.getVersion()
}

window.openLink = function (url) {
  return shell.openExternal(url)
}

window.isDev = isDev

window.ipcRenderer = {
  removeListener (eventName, listener) {
    return ipcRenderer.removeListener(eventName, listener)
  },
  send (eventName, payload) {
    return ipcRenderer.send(eventName, payload)
  },
  on (eventName, listener) {
    return ipcRenderer.on(eventName, listener)
  }
}
