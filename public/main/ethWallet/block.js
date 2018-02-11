const getAllTransactionsAndReceipts = ({ web3, header }) =>
  web3.eth.getBlock(header.number, true)
    .then(({ transactions }) => Promise.all(
      transactions.map(transaction =>
        web3.eth.getTransactionReceipt(transaction.hash)
          .then(receipt => ({ transaction, receipt })))
    ))

module.exports = { getAllTransactionsAndReceipts }
