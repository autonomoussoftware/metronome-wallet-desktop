'use strict'

const { getDb } = require('../../database')

const balances = getDb().collection('tokenBalances')

function getTokenBalance ({ address, contractAddress }) {
  const query = {
    address: address.toLowerCase(),
    token: contractAddress.toLowerCase()
  }
  return balances
    .findOneAsync(query)
    .then(doc => doc ? doc.balance : null)
}

function setTokenBalance ({ address, contractAddress, balance }) {
  const query = {
    address: address.toLowerCase(),
    token: contractAddress.toLowerCase()
  }
  const update = Object.assign(query, { balance })
  return balances
    .updateAsync(query, update, { upsert: true })
}

module.exports = { getTokenBalance, setTokenBalance }
