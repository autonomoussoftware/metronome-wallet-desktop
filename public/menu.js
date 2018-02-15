const { Menu } = require('electron')
const { app } = require('electron')

// TODO: Re-think menu

const template = [
  {
    label: 'Application',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit(0)
        }
      }
    ]
  },

  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  }
]

module.exports = function() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
