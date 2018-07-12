'use strict'

const { getDb } = require('../../database')

const rates = getDb().collection('rates')

function getEthPrice () {
  return rates
    .findOneAsync({ type: 'coincap-eth-usd' })
    .then(doc => doc ? doc.price : null)
}

function setEthPrice (price) {
  const query = { type: 'coincap-eth-usd' }
  const update = Object.assign(query, { price })
  return rates
    .updateAsync(query, update, { upsert: true })
}

module.exports = { getEthPrice, setEthPrice }
