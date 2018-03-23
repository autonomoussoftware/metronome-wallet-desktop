global.window.require = function() {
  return {
    ipcRenderer: {
      on: jest.fn()
    },
    shell: {
      openExternal: jest.fn()
    }
  }
}
