'use strict'

const { defaultTo, get } = require('lodash/fp')
const { groupBy, isArray, isNull, mergeWith, throttle } = require('lodash')
const bip39 = require('bip39')
// TODO hdkey uses deprecated coinstring and shall use bs58check
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const pDefer = require('p-defer')
const pRetry = require('p-retry')
const promiseAllProps = require('promise-all-props')
const settings = require('electron-settings')
const startInterval = require('startinterval2')

const { encrypt } = require('../../crypto/aes256cbcIv')
const createBasePlugin = require('../../base-plugin')
const restart = require('../../electron-restart')
const sha256 = require('../../crypto/sha256')
const WalletError = require('../../WalletError')

const { getWalletBalances } = require('./wallet')
const { signAndSendTransaction } = require('./send')
const { getTransactionAndReceipt } = require('./block')
const {
  getAddressBalance,
  getDatabase,
  clearDatabase
} = require('./db')
const {
  getRescanUnconfirmedTxs,
  getWalletAddresses,
  isAddressInWallet
} = require('./settings')
const getWeb3 = require('./web3')
const transactionParser = require('./transactionParser')

const concatArrays = (objValue, srcValue) =>
  isArray(objValue) ? objValue.concat(srcValue) : undefined

const throwIfNull = err => function (obj) {
  if (isNull(obj)) {
    throw err
  }
  return obj
}

const createSendTransaction = bus => function (args, resolveToReceipt) {
  const deferred = pDefer()

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
              .then(throwIfNull(new Error('Transaction not found')))
              .then(function (transaction) {
                bus.emit('unconfirmed-tx', transaction)
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

          bus.emit('tx-receipt', receipt)
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
  const byWebContent = groupBy(
    pendingWalletStateChanges.filter(function ({ webContents }) {
      try {
        return webContents.id || true
      } catch (err) {
        return false
      }
    }),
    'webContents.id'
  )
  Object.values(byWebContent).forEach(function (group) {
    const merged = mergeWith({}, ...group, concatArrays)

    if (merged.webContents.isDestroyed()) { return }

    merged.webContents.send('wallet-state-changed', merged.data)
    logger.verbose(`<-- ${merged.log.join(', ')}`, merged.data)
  })
  pendingWalletStateChanges = []
}

const GUARD_TIME = 250

const sendPendingWalletStateChanges = throttle(
  mergeAndSendPendingWalletStateChanges,
  GUARD_TIME,
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
  if (webContents.isDestroyed()) { return }

  webContents.send('error', { error: new WalletError(message, err) })
  logger.warn(`<-- Error: ${message}`, { walletId, errMessage: err.message })
}

function sendBalances ({ shouldChange, walletId, webContents }) {
  getWalletBalances(walletId, shouldChange)
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
      getWalletAddresses(walletId).forEach(function (address) {
        getAddressBalance({ address })
          .then(function (balance) {
            sendWalletStateChange({
              webContents,
              walletId,
              address,
              data: { balance },
              log: 'Balance'
            })
          })
          // eslint-disable-next-line no-shadow
          .catch(function (err) {
            logger.warn(`Could not get balance for ${address}: ${err.message}`)
          })
      })
    })
}

function sendWalletOpen (bus, webContents, walletId) {
  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  bus.emit('wallet-opened', {
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

const parseTransaction = ({ transaction, receipt, walletId, webContents }) =>
  Promise.all(
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

function setBestBlock (data) {
  const query = { type: 'eth-best-block' }
  const update = Object.assign({ data }, query)

  return getDatabase().state
    .updateAsync(query, update, { upsert: true })
}

const getBestBlock = () => getDatabase().state
  .findOneAsync({ type: 'eth-best-block' })
  .then(defaultTo({ data: { number: -1 } }))
  .then(get('data'))

function sendBestBlock ({ webContents }) {
  getBestBlock()
    .then(function (bestBlock) {
      if (webContents.isDestroyed()) { return }

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

// TODO continue here... When a wallet is opened, the tx cache has to be updated
// and txs added to the UI. And when new txs arrive, the same.

function syncTransactions ({ number, walletId, webContents, bloqEthExplorer }) {
  const web3 = getWeb3()

  return promiseAllProps({
    addresses: getWalletAddresses(walletId),
    bestBlock: getBestBlock().then(get('number')),
    latest: number || web3.eth.getBlockNumber(),
    indexed: bloqEthExplorer.getBestBlock()
      .then(best => best.number)
  })
    .then(function ({ addresses, bestBlock, latest, indexed }) {
      if (indexed < latest) {
        logger.warn('Tried to sync ahead of indexer', { indexed, latest })
      }
      if (indexed <= bestBlock) {
        logger.warn('Nothing to get from indexer', { indexed, bestBlock })
        return false
      }

      logger.debug('Syncing', addresses, indexed)
      return Promise.all(
        addresses.map(function (address) {
          const from = bestBlock + 1
          const to = indexed
          return promiseAllProps({
            eth: bloqEthExplorer.getTxs({ address, from, to }),
            tok: bloqEthExplorer.getTxsWithTokenLogs({ address, from, to })
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
                      ({ transaction, receipt }) => parseTransaction({
                        transaction,
                        receipt,
                        walletId,
                        webContents
                      })
                    )
                  })
                ),
                Promise.all(
                  Object.keys(tok).map(tokenAddress => Promise.all(
                    tok[tokenAddress].map(function (hash) {
                      logger.debug('Parsing token tx', hash)
                      return getTransactionAndReceipt({ web3, hash }).then(
                        ({ transaction, receipt }) => parseTransaction({
                          transaction,
                          receipt,
                          walletId,
                          webContents
                        })
                      )
                    })
                  ))
                )
              ])
            })
            .then(function () {
              if (!webContents.isDestroyed()) {
                webContents.send('eth-block', { number: indexed })
                logger.verbose('<-- New best block', { number: indexed })
              }

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

const getUnconfirmedTransactions = (projection = { 'transaction.hash': 1 }) =>
  new Promise(function (resolve, reject) {
    getDatabase().transactions
      .find({ 'transaction.blockNumber': null }, projection)
      .exec(function (err, transactions) {
        if (err) {
          reject(err)
          return
        }
        resolve(transactions.map(t => t.transaction))
      })
  })

function parseUnconfirmedTransactions (walletId, webContents) {
  const web3 = getWeb3()

  getUnconfirmedTransactions()
    .then(transactions => transactions.map(t => t.hash))
    .then(hashes =>
      Promise.all(hashes.map(hash =>
        getTransactionAndReceipt({ web3, hash })
      ))
    )
    .then(fullTransactions =>
      Promise.all(fullTransactions.map(t =>
        parseTransaction(Object.assign({ walletId, webContents }, t))
      ))
    )
    .catch(function (err) {
      logger.warn(`Could not reparse unconfirmed transactions: ${err.message}`)
    })
}

function openWallet ({ bus, webContents, walletId, plugins, plugin }) {
  const { bloqEthExplorer } = plugins

  const rescanTime = getRescanUnconfirmedTxs()

  sendWalletOpen(bus, webContents, walletId)

  sendBalances({ walletId, webContents })

  sendBestBlock({ webContents })

  sendCachedTransactions({ walletId, webContents })

  syncTransactions({ walletId, webContents, bloqEthExplorer })
    .then(function () {
      function emitNewBlock (data) {
        plugin.emitter.emit('new-block', data)
      }

      bus.on('new-best-block', emitNewBlock)

      bus.on('stop-updating-best-block', function () {
        bus.removeListener('new-best-block', emitNewBlock)
      })
    })
    .then(function () {
      startInterval(function () {
        const id = parseUnconfirmedTransactions(walletId, webContents)

        bus.on('stop-searching-unconfirmed-txs', function () {
          clearInterval(id)
        })
      }, rescanTime)
    })
}

const stop = eventsBus => function () {
  eventsBus.emit('stop-updating-best-block')
  eventsBus.emit('stop-searching-unconfirmed-txs')
}

function parseUnconfirmedTransaction (subscriptions, transaction) {
  subscriptions.forEach(function (s) {
    pRetry(
      () => parseTransaction(Object.assign({ transaction }, s, s.meta)),
      { retries: 5, minTimeout: 500 }
    )
      .catch(function (err) {
        const msg = transaction
          ? `Could not parse transaction: ${transaction.hash}`
          : 'Could not parse latest transaction'

        logger.warn(msg, err.message)
      })
  })
}

function parseNewTransaction (subscriptions, { walletId, txid }) {
  const web3 = getWeb3()
  getTransactionAndReceipt({ web3, hash: txid, waitForReceipt: true })
    .then(({ transaction, receipt }) =>
      Promise.all(subscriptions.map(s =>
        parseTransaction(Object.assign({
          transaction,
          receipt,
          walletId
        }, s))
          .then(() => sendBalances({
            shouldChange: true,
            walletId,
            webContents: s.webContents
          }))
      ))
    )
    .catch(function (err) {
      logger.warn(
        'Could not parse incoming transaction', txid, err.message
      )
    })
}

function broadcastNewBlock (subscriptions, data) {
  Promise.all(subscriptions.map(function (s) {
    if (!s.webContents.isDestroyed()) {
      s.webContents.send('eth-block', data)
      logger.verbose('<-- New best block', data)
    }

    return setBestBlock(data)
  }))
    .catch(function (err) {
      logger.warn(
        'Could not broadcast new block', data.number, err.message
      )
    })
}

function attachToEvents (eventsBus, plugins, plugin) {
  const { ethWallet } = plugins

  eventsBus.on('unconfirmed-tx', function (transaction) {
    plugin.emitter.emit('new-tx-received', transaction)
  })

  eventsBus.on('eth-tx-confirmed', function (data) {
    plugin.emitter.emit('new-txid-received', data)
  })

  eventsBus.on('eth-tx-unconfirmed', function (data) {
    plugin.emitter.emit('new-txid-received', data)
  })

  eventsBus.on('tok-tx-confirmed', function (data) {
    plugin.emitter.emit('new-txid-received', data)
  })

  eventsBus.on('tok-tx-unconfirmed', function (data) {
    plugin.emitter.emit('new-txid-received', data)
  })

  eventsBus.on(
    'wallet-opened',
    function ({ walletId, addresses, webContents }) {
      sendBalances({ ethWallet, walletId, addresses, webContents })

      plugin.emitter.emit(
        'register-webcontents-metadata',
        { webContents, meta: { walletId, addresses } }
      )
    }
  )
}

function getGasPrice () {
  logger.verbose('Getting gas price for')

  return getWeb3()
    .eth.getGasPrice()
    .then(gasPrice => ({ gasPrice }))
}

const createOpenWallets = (bus, plugins, plugin) =>
  function (data, webContents) {
    const activeWallet = settings.get('user.activeWallet')
    const walletIds = Object.keys(settings.get('user.wallets'))

    walletIds.forEach(function (walletId) {
      openWallet({ bus, webContents, walletId, plugins, plugin })
    })

    return { walletIds, activeWallet }
  }

const createCreateWallet = (bus, plugins, plugin) =>
  function (data, webContents) {
    const { password, mnemonic } = data
    const result = generateWallet(mnemonic, password)

    if (result.error) {
      return result
    }

    setBestBlock({ number: -1 })
      .then(function () {
        openWallet({
          bus,
          webContents,
          walletId: result.walletId,
          plugins,
          plugin
        })
      })

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
    .then(function () {
      logger.verbose('Clear cache success')
      restart(1)
    })
    .catch(err => logger.error('Clear cache failed: ', err))
}

function init ({ plugins, eventsBus }) {
  registerTxParser(transactionParser)

  const plugin = createBasePlugin({
    stop: stop(eventsBus),
    onPluginEvents: [{
      eventName: 'new-tx-received',
      handler: parseUnconfirmedTransaction
    }, {
      eventName: 'new-txid-received',
      handler: parseNewTransaction
    }, {
      eventName: 'new-block',
      handler: broadcastNewBlock
    }]
  })

  const createWallet = createCreateWallet(eventsBus, plugins, plugin)
  const openWallets = createOpenWallets(eventsBus, plugins, plugin)
  const sendTransaction = createSendTransaction(eventsBus)

  plugin.name = 'ethWallet'
  plugin.api = {
    getWeb3,
    isAddressInWallet,
    registerTxParser,
    sendTransaction
  }
  plugin.dependencies = ['bloqEthExplorer']
  plugin.uiHooks.push(...[
    { eventName: 'create-wallet', auth: true, handler: createWallet },
    { eventName: 'open-wallets', auth: true, handler: openWallets },
    {
      eventName: 'send-eth',
      auth: true,
      handler: args => sendTransaction(args)
    },
    { eventName: 'get-gas-price', handler: getGasPrice },
    { eventName: 'get-gas-limit', handler: getGasLimit },
    { eventName: 'cache-clear', handler: clearCache }
  ])

  attachToEvents(eventsBus, plugins, plugin)

  return plugin
}

module.exports = { init }
