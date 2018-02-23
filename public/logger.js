const chalk = require('chalk')
const logger = require('electron-log')
const isDev = require('electron-is-dev')
const unhandled = require('electron-unhandled')

logger.transports.file.appName = 'metronome-desktop-wallet'

if (isDev) {
  logger.transports.console.level = 'debug'
  logger.transports.file.level = 'debug'
}

function getColorLevel(level = '') {
  switch (level.toString()) {
    case 'error':
      return 'red'
    case 'verbose':
      return 'cyan'
    case 'warn':
      return 'yellow'
    case 'debug':
      return 'magenta'
    case 'silly':
      return 'blue'
    default:
      return 'green'
  }
}

logger.transports.console = function(msg) {
  const color = getColorLevel(msg.level)
  console.log(
    `${msg.date.toISOString()} - ${chalk[color](msg.level)}:\t ${msg.data[0]}`
  )
}

unhandled({ logger: logger.error })

module.exports = logger
