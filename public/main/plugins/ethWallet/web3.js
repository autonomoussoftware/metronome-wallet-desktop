const { memoize } = require('lodash')
const Web3 = require('web3')

const { getJsonRpcApiUrl } = require('./settings')

const getWeb3 = memoize(() =>
  new Web3(new Web3.providers.HttpProvider(getJsonRpcApiUrl()))
)

module.exports = getWeb3
