// TODO hdkey uses deprecated coinstring and shall use bs58check
const { mergeWith, isArray } = require('lodash')
const axios = require('axios')
const bip39 = require('bip39')
const EventEmitter = require('events')
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const promiseAllProps = require('promise-all-props')
const settings = require('electron-settings')

const { encrypt } = require('../crypto/aes256cbcIv')
const Deferred = require('../lib/Deferred')
const sha256 = require('../crypto/sha256')
const WalletError = require('../WalletError')

const { getTransactionAndReceipt } = require('./block')
const { getWalletBalances } = require('./wallet')
const { initDatabase, getDatabase } = require('./db')
const {
  getAddressBalance,
  getWalletAddresses,
  isAddressInWallet
} = require('./settings')
const { signAndSendTransaction } = require('./send')
const getWeb3 = require('./web3')
const { transactionParser } = require('./transactionParser')

function sendTransaction (args, resolveToReceipt) {
  const deferred = new Deferred()

  signAndSendTransaction(args)
    .then(function({ emitter: txEmitter }) {
      txEmitter
        .once('transactionHash', function(hash) {
          logger.verbose('Transaction hash sent', hash)

          if (!resolveToReceipt) {
            deferred.resolve({ hash })
          }

          const web3 = getWeb3()
          web3.eth.getTransaction(hash).then(function(transaction) {
            moduleEmitter.emit('unconfirmed-tx', transaction)
          })
        })
        .once('receipt', function(receipt) {
          logger.verbose('Transaction receipt received', receipt)

          if (resolveToReceipt) {
            deferred.resolve(receipt)
          }

          moduleEmitter.emit('tx-receipt', receipt)
        })
        .once('error', function(err) {
          logger.warn('Transaction send error', err.message)

          // TODO Notify the UI about the error

          deferred.reject(err)
        })
    })
    .catch(function(err) {
      logger.warn('Transaction send error', err.message)
      deferred.reject(err)
    })

  return deferred.promise
}

const moduleEmitter = new EventEmitter()

function getEvents() {
  return moduleEmitter
}

function createWallet(mnemonic, password) {
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

function sendWalletStateChange({ webContents, walletId, address, data, log }) {
  webContents.send('wallet-state-changed', {
    [walletId]: {
      addresses: {
        [address]: data
      }
    }
  })
  logger.verbose(`<-- ${log} ${address}`, data)
}

function sendError({ webContents, walletId, message, err }) {
  webContents.send('error', {
    error: new WalletError(message, err)
  })
  logger.warn(`<-- Error: ${message}`, { walletId })
}

function sendBalances({ walletId, webContents }) {
  getWalletBalances(walletId)
    .then(function(balances) {
      balances.forEach(function({ address, balance }) {
        sendWalletStateChange({
          webContents,
          walletId,
          address,
          data: { balance },
          log: 'Balance'
        })
      })
    })
    .catch(function(err) {
      sendError({
        webContents,
        walletId,
        message: 'Could not get balance',
        err
      })

      // Send cached balances
      getWalletAddresses(walletId).map(function(address) {
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

function sendWalletOpen(webContents, walletId) {
  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  moduleEmitter.emit('wallet-opened', {
    walletId,
    addresses: Object.keys(addresses).map(a => a.toLowerCase()),
    webContents
  })
}

const any = array => array.reduce((acc, element) => acc || element, false)

function concatArrays(objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

function parseTransaction({ transaction, receipt, walletId, webContents }) {
  return Promise.all(
    txParsers.map(txParser => txParser({ transaction, receipt, walletId }))
  ).then(function(metas) {
    const meta = mergeWith({}, ...metas, concatArrays)
    const parsedTransaction = { transaction, receipt, meta }

    if (meta.ours && any(meta.ours)) {
      const { addresses } = meta

      // TODO should not assume there will be only one address...
      const address = addresses[0]

      const db = getDatabase()

      const query = { 'transaction.hash': transaction.hash }
      const update = Object.assign({ walletId, address }, parsedTransaction)
      db.update(query, update, { upsert: true })
      // TODO handle db error

      webContents.send('wallet-state-changed', {
        [walletId]: {
          addresses: {
            [address]: {
              transactions: [parsedTransaction]
            }
          }
        }
      })
      logger.verbose(`<-- Transaction ${address} ${transaction.hash}`, meta)
    }

    return parsedTransaction
  })
}

function sendBestBlock({ webContents }) {
  const bestBlock = settings.get('app.bestBlock') || { number: 0 }
  webContents.send('eth-block', bestBlock)
  logger.verbose('Current best block', bestBlock)
}

function sendCachedTransactions({ walletId, webContents }) {
  const db = getDatabase()

  const addresses = Object.keys(
    settings.get(`user.wallets.${walletId}.addresses`)
  )

  addresses.map(a => a.toLowerCase()).forEach(function(address) {
    const query = { walletId, address }
    // TODO unhardcode limit
    // TODO null first
    db
      .find(query)
      .sort({ 'transaction.blockNumber': -1 })
      .limit(25)
      .exec(function(err, transactions) {
        // TODO handle error
        if (err) {
          logger.error('Error getting data from db', err.message, err)
          return
        }

        logger.verbose(transactions.map(t => t.transaction.hash))

        webContents.send('wallet-state-changed', {
          [walletId]: {
            addresses: {
              [address]: {
                transactions
              }
            }
          }
        })
        logger.verbose(`<-- Transactions ${address} ${transactions.length}`)
      })
  })
}

function syncTransactions({ number, walletId, webContents }) {
  const web3 = getWeb3()

  const indexerApiUrl = settings.get('app.indexerApiUrl')
  const bestBlock = settings.get('app.bestBlock', { number: -1 })

  return promiseAllProps({
    addresses: getWalletAddresses(walletId),
    latest: number || web3.eth.getBlockNumber(),
    indexed: axios
      .get(`${indexerApiUrl}/blocks/latest/number`)
      .then(res => res.data)
      .then(data => data.number)
      .then(n => Number.parseInt(n, 10))
  })
    .then(function({ addresses, latest, indexed }) {
      if (indexed < latest) {
        logger.warn('Tried to sync ahead of indexer', { indexed, latest })
      }
      if (indexed <= bestBlock) {
        logger.warn('Nothing to get from indexer', { indexed, bestBlock })
        return
      }

      logger.debug('Syncing', addresses, indexed)
      return Promise.all(
        addresses.map(function(address) {
          const qs = `from=${bestBlock.number + 1}&to=${indexed}`
          return promiseAllProps({
            eth: axios
              .get(`${indexerApiUrl}/addresses/${address}/transactions?${qs}`)
              .then(res => res.data),
            tok: axios
              .get(
                `${indexerApiUrl}/addresses/${address}/tokentransactions?${qs}`
              )
              .then(res => res.data)
          })
            .then(function({ eth, tok }) {
              const txCount = eth.length + Object.keys(tok).length
              logger.debug('Got own txs', txCount)

              if (txCount) {
                sendBalances({ webContents, walletId })
              }

              return Promise.all([
                Promise.all(
                  eth.map(function(hash) {
                    logger.debug('Parsing ETH tx', hash)
                    return getTransactionAndReceipt({ web3, hash }).then(
                      function({ transaction, receipt }) {
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
                  Object.keys(tok).map(function(tokenAddress) {
                    return tok[tokenAddress].map(function(hash) {
                      logger.debug('Parsing token tx', hash)
                      return getTransactionAndReceipt({ web3, hash }).then(
                        function({ transaction, receipt }) {
                          return parseTransaction({
                            transaction,
                            receipt,
                            walletId,
                            webContents
                          })
                        }
                      )
                    })
                  })
                )
              ])
            })
            .then(function() {
              settings.set('app.bestBlock', { number: indexed })
              webContents.send('eth-block', { number: indexed })
              logger.verbose('New best block', { number: indexed })
            })
        })
      )
    })
    .catch(function(err) {
      sendError({
        webContents,
        walletId,
        message: 'Could not sync to the latest block',
        err
      })
    })
}

// TODO move all subscription code to a single place that other modules can reuse

let subscriptions = []

function openWallet({ webContents, walletId }) {
  sendWalletOpen(webContents, walletId)

  sendBalances({ walletId, webContents })

  sendBestBlock({ webContents })

  sendCachedTransactions({ walletId, webContents })

  syncTransactions({ walletId, webContents }).then(function() {
    const web3 = getWeb3()
    const blocksSubscription = web3.eth.subscribe('newBlockHeaders')
    blocksSubscription.on('data', function({ number }) {
      syncTransactions({ number, walletId, webContents })
    })

    // TODO handle on error
    blocksSubscription.on('error', function() {
      logger.warn('Error receiving new block notifications')

      setTimeout(function() {
        syncTransactions({ walletId, webContents })
      }, 5000)
    })

    webContents.on('destroyed', function() {
      blocksSubscription.unsubscribe()
    })

    subscriptions.push({ webContents, blocksSubscription })
  })

  moduleEmitter.on('unconfirmed-tx', function(transaction) {
    parseTransaction({ transaction, walletId, webContents })
  })
}

function unsubscribeUpdates(_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function(s) {
    logger.verbose('Unsubscribing wallet balance update ')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

const txParsers = []

function registerTxParser(parser) {
  txParsers.push(parser)
}

function getHooks() {
  initDatabase()

  registerTxParser(transactionParser)

  return [
    {
      eventName: 'create-wallet',
      auth: true,
      handler: function(data, webContents) {
        const { password, mnemonic } = data

        const result = createWallet(mnemonic, password)

        if (result.error) {
          return result
        }

        openWallet({ webContents, walletId: result.walletId })

        return result
      }
    },
    {
      eventName: 'open-wallets',
      auth: true,
      handler: function(data, webContents) {
        const activeWallet = settings.get('user.activeWallet')
        const walletIds = Object.keys(settings.get('user.wallets'))

        walletIds.forEach(function(walletId) {
          openWallet({ webContents, walletId })
        })

        return { walletIds, activeWallet }
      }
    },
    {
      eventName: 'send-eth',
      auth: true,
    handler: args => sendTransaction(args)
    },
    {
      eventName: 'ui-unload',
      handler: unsubscribeUpdates
    },
    {
      eventName: 'get-gas-price',
      handler: function() {
        const web3 = getWeb3()
        return web3.eth.getGasPrice().then(gasPrice => ({ gasPrice }))
      }
    }
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

