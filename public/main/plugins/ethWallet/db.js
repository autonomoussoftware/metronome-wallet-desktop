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

const balances = getDb().collection('balances')

function getAddressBalance ({ address }) {
  const query = { address: address.toLowerCase() }
  return balances
    .findOneAsync(query)
    .then(doc => doc ? doc.balance : null)
}

function setAddressBalance ({ address, balance }) {
  const query = { address: address.toLowerCase() }
  const update = Object.assign(query, { balance })
  return balances
    .updateAsync(query, update, { upsert: true })
}

module.exports = {
  clearDatabase,
  getAddressBalance,
  getDatabase,
  setAddressBalance
}
