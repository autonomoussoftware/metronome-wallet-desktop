const { app, shell, Menu } = require('electron')

const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: (() =>
          process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11')(),
        click(item, focusedWindow) {
          focusedWindow &&
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      },

      { type: 'separator' },
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },

      {
        label: 'Force Reload',
        accelerator: 'Shift+CmdOrCtrl+R',
        role: 'forcereload'
      },

      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+CmdOrCtrl+I',
        role: 'toggledevtools'
      }
    ]
  },

  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }]
  },

  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://metronome.io')
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = 'Metronome Wallet'

  template.unshift({
    label: name,
    submenu: [
      { role: 'about', label: `About ${name}` },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide', label: `Hide ${name}` },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit', label: `Quit ${name}` }
    ]
  })

  const windowMenu = template.find(m => m.role === 'window')

  if (windowMenu) {
    windowMenu.submenu.push({ type: 'separator' }, { role: 'front' })
  }
}

module.exports = function() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
