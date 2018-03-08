'use strict'

const { app } = require('electron')
const { promisify } = require('util')
const Datastore = require('nedb')
const logger = require('electron-log')
const memoize = require('lodash/memoize')
const path = require('path')
const sum = require('lodash/sum')

const promisifyMethods = methods => function (collection) {
  methods.forEach(function (method) {
    collection[`${method}Async`] = promisify(collection[method].bind(collection))
  })
}

const promisifyCollection = promisifyMethods([
  'find',
  'findOne',
  'remove',
  'update'
])

const getDatabase = memoize(function () {
  const dataPath = app.getPath('userData')

  const db = {}

  db.transactions = new Datastore({
    filename: path.join(dataPath, 'Database/Transactions'),
    autoload: true
  })
  promisifyCollection(db.transactions)

  db.state = new Datastore({
    filename: path.join(dataPath, 'Database/State'),
    autoload: true
  })
  promisifyCollection(db.state)

  return db
})

function clearDatabase () {
  logger.verbose('Database clear started')

  const db = getDatabase()
  const collections = Object.values(db)

  return Promise.all(
    collections
      .map(collection => collection.removeAsync({}, { multi: true }))
  )
    .then(sum)
    .then(function (count) {
      logger.verbose(`Database clear success, removed ${count} documents`)

      return count
    })
    .catch(function (err) {
      logger.error('Database clear failed', err)

      throw err
    })
}

module.exports = { getDatabase, clearDatabase }
