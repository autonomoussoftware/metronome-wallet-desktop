'use strict'

const chalk = require('chalk')
const logger = require('electron-log')
const isDev = require('electron-is-dev')
const stringify = require('json-stringify-safe')
const unhandled = require('electron-unhandled')

logger.transports.file.appName = 'metronome-desktop-wallet'

function getColorLevel (level = '') {
  const colors = {
    error: 'red',
    verbose: 'cyan',
    warn: 'yellow',
    debug: 'magenta',
    silly: 'blue'
  }
  return colors[level.toString()] || 'green'
}

logger.transports.console = function ({ date, level, data }) {
  const color = getColorLevel(level)

  const text = data.shift()

  let meta = ''
  if (data.length) {
    meta += ' => '
    meta += data.map(d => typeof d === 'object' ? stringify(d) : d).join(', ')
  }

  // eslint-disable-next-line no-console
  console.log(
    `${date.toISOString()} - ${chalk[color](level)}:\t${text}\t${meta}`
  )
}

if (isDev) {
  logger.transports.console.level = 'debug'
  logger.transports.file.level = 'debug'
}

unhandled({ logger: logger.error })

module.exports = logger
