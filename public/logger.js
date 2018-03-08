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

logger.transports.console = function(log) {
  const color = getColorLevel(log.level)
  const msg = log.data[0]
  let info = ''

  if (log.data[1]) {
    info += ' => '
    info +=
      typeof log.data[1] === 'object'
        ? JSON.stringify(log.data[1])
        : log.data[1]
  }

  console.log(
    `${log.date.toISOString()} - ${chalk[color](log.level)}:\t ${msg}\t ${info}`
  )
}

unhandled({ logger: logger.error })

module.exports = logger
