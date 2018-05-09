'use strict'

const axios = require('axios')

const { getIndexerApiUrl } = require('./settings')

const baseURL = getIndexerApiUrl()

const get = (url, params) => axios({ baseURL, url, params })
  .then(res => res.data)

const getBestBlock = () =>
  get('/blocks/best')

const getTxs = ({ address, from, to }) =>
  get(`/addresses/${address}/transactions`, { from, to })

const getTxsWithTokenLogs = ({ address, from, to, tokens = [] }) =>
  get(
    `/addresses/${address}/tokentransactions`,
    { from, to, tokens: tokens.join(',') }
  )

module.exports = {
  getBestBlock,
  getTxs,
  getTxsWithTokenLogs
}
