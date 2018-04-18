'use strict'

const axios = require('axios')
const { utils: { toBN } } = require('web3')

const { getTracerApiUrl } = require('./settings')

const ZERO = '0x0'

const incomingValue = from => trace =>
  trace.action.to === from ? trace.action.value : ZERO

const sum = values =>
  values.reduce((acc, value) => acc.add(toBN(value)), toBN(ZERO))

const parseTraces = ({ hash, from }) =>
  axios.get(`${getTracerApiUrl()}/transactions/${hash}`)
    .then(res => res.data)
    .then(body => body.result)
    .then(traces => ({
      returnedValue: traces
        ? sum(traces.map(incomingValue(from))).toString()
        : '0'
    }))

module.exports = { parseTraces }
