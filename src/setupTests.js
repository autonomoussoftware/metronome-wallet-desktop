global.window.require = function() {
  return {
    ipcRenderer: {
      sendSync: jest.fn(),
      send: jest.fn(),
      on: jest.fn()
    },
    shell: {
      openExternal: jest.fn()
    }
  }
}
