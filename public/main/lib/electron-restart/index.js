const { app } = require('electron')

function restart () {
  app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
  app.exit(0)
}

module.exports = { restart }
