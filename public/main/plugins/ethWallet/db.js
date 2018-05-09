'use strict'

const { getDb } = require('../../database')

function getDatabase () {
  const db = getDb()

  return {
    transactions: db.collection('transactions'),
    state: db.collection('state')
  }
}

function clearDatabase () {
  return getDb().dropDatabase()
}

module.exports = { getDatabase, clearDatabase }
