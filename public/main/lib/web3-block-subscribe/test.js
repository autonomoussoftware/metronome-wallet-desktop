const url = 'ws://parity.bloqrock.net:8546'
// const url = 'ws://localhost:8546'

const web3Subscription = require('.')

web3Subscription.subscribe({
  url,
  onData: function ({ number }) {
    console.log('Hash', number)
  },
  onError: function (err) {
    console.warn('Error', err.message)
  }
})
