'use strict'

const promiseAllProps = require('promise-all-props')
const pRetry = require('p-retry')

const getTransactionAndReceipt = ({ web3, hash }) =>
  promiseAllProps({
    transaction: pRetry(
      () => web3.eth.getTransaction(hash),
      { retries: 5, minTimeout: 250 }
    ),
    receipt: pRetry(
      () => web3.eth.getTransactionReceipt(hash),
      { retries: 5, minTimeout: 250 }
    )
  })

module.exports = { getTransactionAndReceipt }
