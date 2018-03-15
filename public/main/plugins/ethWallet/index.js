'use strict'

const { defaultTo, get } = require('lodash/fp')
const { groupBy, isArray, mergeWith, throttle } = require('lodash')
const axios = require('axios')
const bip39 = require('bip39')
const EventEmitter = require('events')
// TODO hdkey uses deprecated coinstring and shall use bs58check
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const pRetry = require('p-retry')
const promiseAllProps = require('promise-all-props')
const settings = require('electron-settings')

const Deferred = requireLib('Deferred')
const { restart } = requireLib('electron-restart')
const { subscribe } = requireLib('web3-block-subscribe')

const sha256 = require('../../crypto/sha256')
const WalletError = require('../../WalletError')
const { encrypt } = require('../../crypto/aes256cbcIv')

const getWeb3 = require('./web3')
const { getWalletBalances } = require('./wallet')
const { signAndSendTransaction } = require('./send')
const { getTransactionAndReceipt } = require('./block')
const { transactionParser } = require('./transactionParser')
const { getDatabase, clearDatabase } = require('./db')

const {
  getAddressBalance,
  getWalletAddresses,
  getWebsocketApiUrl,
  isAddressInWallet
} = require('./settings')

function concatArrays (objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const moduleEmitter = new EventEmitter()

function getEvents () {
  return moduleEmitter
}

function sendTransaction (args, resolveToReceipt) {
  const deferred = new Deferred()

  signAndSendTransaction(args)
    .then(function ({ emitter: txEmitter }) {
      txEmitter
        .once('transactionHash', function (hash) {
          logger.verbose('Transaction hash sent', hash)

          if (!resolveToReceipt) {
            deferred.resolve({ hash })
          }

          pRetry(
            () => getWeb3().eth.getTransaction(hash)
              .then(function (transaction) {
                moduleEmitter.emit('unconfirmed-tx', transaction)
              }),
            { retries: 5, minTimeout: 250 }
          )
            .catch(function (err) {
              logger.warn('Could not get transaction hash', hash, err.message)
            })
        })
        .once('receipt', function (receipt) {
          logger.verbose('Transaction receipt received', receipt)

          if (resolveToReceipt) {
            deferred.resolve(receipt)
          }

          moduleEmitter.emit('tx-receipt', receipt)
        })
        .once('error', function (err) {
          logger.warn('Transaction send error', err.message)

          // TODO Notify the UI about the error

          deferred.reject(err)
        })
    })
    .catch(function (err) {
      logger.warn('Transaction send error', err.message)
      deferred.reject(err)
    })

  return deferred.promise
}

function generateWallet (mnemonic, password) {
  if (!bip39.validateMnemonic(mnemonic)) {
    const error = new WalletError('Invalid mnemonic')
    return { error }
  }

  const seed = bip39.mnemonicToSeedHex(mnemonic)
  const walletId = sha256.hash(seed)

  const derivationPath = settings.get('app.defaultDerivationPath')
  const index = 0
  const address = hdkey
    .fromMasterSeed(Buffer.from(seed, 'hex'))
    .derivePath(`${derivationPath}/${index}`)
    .getWallet()
    .getChecksumAddressString()
    .toLowerCase()

  const addresses = {
    [address]: {
      index
    }
  }
  const walletInfo = {
    encryptedSeed: encrypt(password, seed),
    derivationPath,
    addresses
  }
  settings.set(`user.wallets.${walletId}`, walletInfo)
  settings.set('user.activeWallet', walletId)

  // TODO get balance, update and broadcast
  // TODO get transactions, update and broadcast

  return { walletId }
}

// TODO updateWalletInfo, subscribeToWalletChanges
// TODO activateWallet

let pendingWalletStateChanges = []

function mergeAndSendPendingWalletStateChanges () {
  const byWebContent = groupBy(pendingWalletStateChanges.filter(function ({ webContents }) {
    try {
      return webContents.id || true
    } catch (err) {
      return false
    }
  }), 'webContents.id')
  Object.values(byWebContent).forEach(function (group) {
    const merged = mergeWith({}, ...group, concatArrays)

    merged.webContents.send('wallet-state-changed', merged.data)
    logger.verbose(`<-- ${merged.log.join(', ')}`, merged.data)
  })
  pendingWalletStateChanges = []
}

const sendPendingWalletStateChanges = throttle(
  mergeAndSendPendingWalletStateChanges,
  250,
  { leading: true, trailing: true }
)

function sendWalletStateChange ({ webContents, walletId, address, data, log }) {
  pendingWalletStateChanges.push({
    webContents,
    log: [log],
    data: {
      [walletId]: {
        addresses: {
          [address]: data
        }
      }
    }
  })
  logger.verbose(`<-//- ${log} queued`)
  sendPendingWalletStateChanges()
}

function sendError ({ webContents, walletId, message, err }) {
  webContents.send('error', {
    error: new WalletError(message, err)
  })
  logger.warn(`<-- Error: ${message}`, { walletId })
}

function sendBalances ({ walletId, webContents }) {
  getWalletBalances(walletId)
    .then(function (balances) {
      balances.forEach(function ({ address, balance }) {
        sendWalletStateChange({
          webContents,
          walletId,
          address,
          data: { balance },
          log: 'Balance'
        })
      })
    })
    .catch(function (err) {
      sendError({
        webContents,
        walletId,
        message: 'Could not get balance',
        err
      })

      // Send cached balances
      getWalletAddresses(walletId).map(function (address) {
        sendWalletStateChange({
          webContents,
          walletId,
          address,
          data: { balance: getAddressBalance({ walletId, address }) },
          log: 'Balance'
        })
      })
    })
}

function sendWalletOpen (webContents, walletId) {
  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  moduleEmitter.emit('wallet-opened', {
    walletId,
    addresses: Object.keys(addresses).map(a => a.toLowerCase()),
    webContents
  })
}

const any = array => array.reduce((acc, element) => acc || element, false)

const txParsers = []

function registerTxParser (parser) {
  txParsers.push(parser)
}

function parseTransaction ({ transaction, receipt, walletId, webContents }) {
  return Promise.all(
    txParsers.map(txParser => txParser({ transaction, receipt, walletId }))
  ).then(function (metas) {
    const meta = mergeWith({}, ...metas, concatArrays)
    const parsedTransaction = { transaction, receipt, meta }

    if (meta.ours && any(meta.ours)) {
      const { addresses } = meta

      // TODO should not assume there will be only one address...
      const address = addresses[0]

      const query = { 'transaction.hash': transaction.hash }
      const update = Object.assign({ walletId, address }, parsedTransaction)

      sendWalletStateChange({ webContents,
        walletId,
        address,
        data: {
          transactions: [parsedTransaction]
        },
        log: 'Transaction'
      })

      return getDatabase().transactions
        .updateAsync(query, update, { upsert: true })
    }

    return parsedTransaction
  })
}

function setBestBlock (data) {
  const query = { type: 'eth-best-block' }
  const update = Object.assign({ data }, query)

  return getDatabase().state
    .updateAsync(query, update, { upsert: true })
}

function getBestBlock () {
  return getDatabase().state
    .findOneAsync({ type: 'eth-best-block' })
    .then(defaultTo({ data: { number: -1 } }))
    .then(get('data'))
}

function sendBestBlock ({ webContents }) {
  getBestBlock()
    .then(function (bestBlock) {
      webContents.send('eth-block', bestBlock)
      logger.verbose('<-- Current best block', bestBlock)
    })
    .catch(function (err) {
      logger.warn('Could not read best block from db', err.message)
    })
}

function sendCachedTransactions ({ walletId, webContents }) {
  const addresses = Object.keys(
    settings.get(`user.wallets.${walletId}.addresses`)
  )

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    const query = { walletId, address }
    // TODO unhardcode limit
    // TODO null first
    getDatabase().transactions
      .find(query)
      .sort({ 'transaction.blockNumber': -1 })
      .exec(function (err, transactions) {
        // TODO handle error
        if (err) {
          logger.error('Error getting data from db', err.message, err)
          return
        }

        logger.verbose(transactions.map(t => t.transaction.hash))

        sendWalletStateChange({ webContents,
          walletId,
          address,
          data: {
            transactions
          },
          log: 'Transactions' })
      })
  })
}

function syncTransactions ({ number, walletId, webContents }) {
  const web3 = getWeb3()

  const indexerApiUrl = settings.get('app.indexerApiUrl')

  return promiseAllProps({
    addresses: getWalletAddresses(walletId),
    bestBlock: getBestBlock().then(get('number')),
    latest: number || web3.eth.getBlockNumber(),
    indexed: axios.get(`${indexerApiUrl}/blocks/latest/number`)
      .then(res => res.data)
      .then(data => data.number)
      .then(n => Number.parseInt(n, 10))
  })
    .then(function ({ addresses, bestBlock, latest, indexed }) {
      if (indexed < latest) {
        logger.warn('Tried to sync ahead of indexer', { indexed, latest })
      }
      if (indexed <= bestBlock) {
        logger.warn('Nothing to get from indexer', { indexed, bestBlock })
        return
      }

      logger.debug('Syncing', addresses, indexed)
      return Promise.all(
        addresses.map(function (address) {
          const qs = `from=${bestBlock + 1}&to=${indexed}`
          return promiseAllProps({
            eth: axios.get(
              `${indexerApiUrl}/addresses/${address}/transactions?${qs}`
            )
              .then(res => res.data),
            tok: axios.get(
              `${indexerApiUrl}/addresses/${address}/tokentransactions?${qs}`
            )
              .then(res => res.data)
          })
            .then(function ({ eth, tok }) {
              const txCount = eth.length + Object.keys(tok).length
              logger.debug('Got own txs', txCount)

              if (txCount) {
                sendBalances({ webContents, walletId })
              }

              return Promise.all([
                Promise.all(
                  eth.map(function (hash) {
                    logger.debug('Parsing ETH tx', hash)
                    return getTransactionAndReceipt({ web3, hash }).then(
                      function ({ transaction, receipt }) {
                        return parseTransaction({
                          transaction,
                          receipt,
                          walletId,
                          webContents
                        })
                      }
                    )
                  })
                ),
                Promise.all(
                  Object.keys(tok).map(function (tokenAddress) {
                    return Promise.all(
                      tok[tokenAddress].map(function (hash) {
                        logger.debug('Parsing token tx', hash)
                        return getTransactionAndReceipt({ web3, hash }).then(
                          function ({ transaction, receipt }) {
                            return parseTransaction({
                              transaction,
                              receipt,
                              walletId,
                              webContents
                            })
                          }
                        )
                      })
                    )
                  })
                )
              ])
            })
            .then(function () {
              webContents.send('eth-block', { number: indexed })
              logger.verbose('<-- New best block', { number: indexed })

              return setBestBlock({ number: indexed })
            })
        })
      )
    })
    .catch(function (err) {
      sendError({
        webContents,
        walletId,
        message: 'Could not sync to the latest block',
        err
      })
    })
}

let subscriptions = []

let blocksSubscription = null

function openWallet ({ webContents, walletId }) {
  sendWalletOpen(webContents, walletId)

  sendBalances({ walletId, webContents })

  sendBestBlock({ webContents })

  sendCachedTransactions({ walletId, webContents })

  syncTransactions({ walletId, webContents })
    .catch(() => {})
    .then(function () {
      subscriptions = subscriptions.concat({ walletId, webContents })

      if (subscriptions.length === 1) {
        blocksSubscription = subscribe({
          url: getWebsocketApiUrl(),
          onData: function (header) {
            moduleEmitter.emit('new-block-header', header)
          },
          onError: function (err) {
            logger.warn('New block subscription failed', err.message)
          }
        })
      }
    })
}

function unsubscribeUpdates (_, webContents) {
  subscriptions = subscriptions.filter(s => s.webContents !== webContents)

  if (!subscriptions.length && blocksSubscription) {
    blocksSubscription.unsubscribe(function (err) {
      if (err) {
        logger.warn('Could not unsubscribe', err.message)
        return
      }

      logger.verbose('New block subscription canceled')
    })

    blocksSubscription = null
  }
}

moduleEmitter.on('unconfirmed-tx', function (transaction) {
  subscriptions.forEach(function (s) {
    parseTransaction(Object.assign({ transaction }, s))
  })
})

moduleEmitter.on('new-block-header', function ({ number }) {
  subscriptions.forEach(function (s) {
    syncTransactions(Object.assign({ number }, s))
  })
})

function getGasPrice () {
  logger.verbose('Getting gas price for')

  return getWeb3()
    .eth.getGasPrice()
    .then(gasPrice => ({ gasPrice }))
}

function openWallets (data, webContents) {
  const activeWallet = settings.get('user.activeWallet')
  const walletIds = Object.keys(settings.get('user.wallets'))

  walletIds.forEach(function (walletId) {
    openWallet({ webContents, walletId })
  })

  return { walletIds, activeWallet }
}

function createWallet (data, webContents) {
  const { password, mnemonic } = data
  const result = generateWallet(mnemonic, password)

  if (result.error) {
    return result
  }

  openWallet({ webContents, walletId: result.walletId })

  return result
}

function getGasLimit ({ to }) {
  logger.verbose('Getting limit gas for address: ', to)

  return getWeb3()
    .eth.estimateGas({ to })
    .then(gasLimit => ({ gasLimit }))
}

function clearCache () {
  logger.verbose('Clear cache started')

  return clearDatabase()
    .then(() => {
      logger.verbose('Clear cache success')
      restart(1)
    })
    .catch(err => logger.error('Clear cache failed: ', err))
}

function getHooks () {
  registerTxParser(transactionParser)

  return [
    { eventName: 'create-wallet', auth: true, handler: createWallet },
    { eventName: 'open-wallets', auth: true, handler: openWallets },
    {
      eventName: 'send-eth',
      auth: true,
      handler: args => sendTransaction(args)
    },
    { eventName: 'ui-unload', handler: unsubscribeUpdates },
    { eventName: 'get-gas-price', handler: getGasPrice },
    { eventName: 'get-gas-limit', handler: getGasLimit },
    { eventName: 'cache-clear', handler: clearCache }
  ]
}

module.exports = {
  getHooks,
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser,
  isAddressInWallet
}
