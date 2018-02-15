const promiseAllProps = require('promise-all-props')

const getAllTransactionsAndReceipts = ({ web3, header }) =>
  web3.eth.getBlock(header.number, true)
    .then(({ transactions }) => Promise.all(
      transactions.map(transaction =>
        web3.eth.getTransactionReceipt(transaction.hash)
          .then(receipt => ({ transaction, receipt })))
    ))

const getTransactionAndReceipt = ({ web3, hash }) =>
  promiseAllProps({
    transaction: web3.eth.getTransaction(hash),
    receipt: web3.eth.getTransactionReceipt(hash)
  })

module.exports = { getAllTransactionsAndReceipts, getTransactionAndReceipt }
