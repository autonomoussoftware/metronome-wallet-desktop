'use strict'

const { ipcRenderer, clipboard, shell, contextBridge } = require('electron')
const remote = require('@electron/remote')
// electron-is-dev can't be used in preload script
// const isDev = require('electron-is-dev')
const isDev = !remote.app.isPackaged

// @see http://electronjs.org/docs/tutorial/security#2-disable-nodejs-integration-for-remote-content

const copyToClipboard = function (text) {
  return clipboard.writeText(text)
}

const getAppVersion = function () {
  return remote.app.getVersion()
}

const openLink = function (url) {
  return shell.openExternal(url)
}

contextBridge.exposeInMainWorld('ipcRenderer', {
  removeListener (eventName, listener) {
    return ipcRenderer.removeListener(eventName, listener)
  },
  send (eventName, payload) {
    return ipcRenderer.send(eventName, payload)
  },
  on (eventName, listener) {
    return ipcRenderer.on(eventName, listener)
  }
})

contextBridge.exposeInMainWorld('openLink', openLink)
contextBridge.exposeInMainWorld('getAppVersion', getAppVersion)
contextBridge.exposeInMainWorld('copyToClipboard', copyToClipboard)
contextBridge.exposeInMainWorld('isDev', isDev)
