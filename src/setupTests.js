global.window.require = function() {
  return {
    ipcRenderer: {
      send: jest.fn(),
      on: jest.fn()
    },
    shell: {
      openExternal: jest.fn()
    }
  }
}
