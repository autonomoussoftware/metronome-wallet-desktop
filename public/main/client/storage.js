'use strict'

const promiseThrottle = require('./promise-throttle')
const { defaultTo, get } = require('lodash/fp')
const { getDb } = require('./database')
const logger = require('electron-log')

const keysToPersist = [
  'blockchain',
  'wallets',
  'rates'
]

const mapToObject = array => array.reduce(function (acum, current) {
  acum[current.type] = current.data
  return acum
}, {})

const persistState = promiseThrottle(function (state) {
  return Promise.all(keysToPersist.map(function persist (key) {
    const query = { type: key }
    const update = Object.assign({ data: state[key] }, query)

    return getDb().collection('state')
      .updateAsync(query, update, { upsert: true })
  }))
})

function getState () {
  return getDb().collection('state')
    .findAsync({ type: { $in: keysToPersist } })
    .then(mapToObject)
}

function getBestBlock () {
  return getDb().collection('state')
    .findOneAsync({ type: 'blockchain' })
    .then(defaultTo({ data: { height: null } }))
    .then(get('data.height'))
}

function setSyncBlock (number, chain) {
  const query = { type: `sync-${chain}` }
  const update = Object.assign({ data: { number } }, query)

  return getDb().collection('state')
    .updateAsync(query, update, { upsert: true })
}

function getSyncBlock (chain) {
  return getDb().collection('state')
    .findOneAsync({ type: `sync-${chain}` })
    .then(defaultTo({ data: { number: 0 } }))
    .then(get('data.number'))
}

function setBestBlock (data) {
  const query = { type: 'blockchain' }
  const update = Object.assign({ data }, query)

  return getDb().collection('state')
    .updateAsync(query, update, { upsert: true })
}

module.exports = {
  getBestBlock,
  setBestBlock,
  setSyncBlock,
  getSyncBlock,
  persistState,
  getState
}
