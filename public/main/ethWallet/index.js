// TODO hdkey uses deprecated coinstring and shall use bs58check
const bip39 = require('bip39')
const EventEmitter = require('events')
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const settings = require('electron-settings')

const { encrypt, sha256 } = require('../cryptoUtils')
const Deferred = require('../lib/Deferred')
const WalletError = require('../WalletError')

const { initDatabase, getDatabase } = require('./db')
const getWeb3 = require('./web3')
const { getWalletBalances } = require('./wallet')
const { signAndSendTransaction } = require('./send')

function sendTransaction (args) {
  const deferred = new Deferred()

  signAndSendTransaction(args)
    .then(function ({ emitter: txEmitter }) {
      txEmitter
        .once('transactionHash', function (hash) {
          logger.verbose('Transaction sent', hash)
          deferred.resolve({ hash })

          const web3 = getWeb3()
          web3.eth.getTransaction(hash).then(function (transaction) {
            moduleEmitter.emit('unconfirmed-tx', transaction)
          })
        })
        .once('receipt', function (receipt) {
          logger.verbose('Transaction recepit received', receipt)

          moduleEmitter.emit('tx-recepit', receipt)
        })
        .once('error', function (err) {
          logger.warn('Transaction send error', err.message)
          deferred.reject(err)
        })
    })

  return deferred.promise
}

const moduleEmitter = new EventEmitter()

function createWallet (mnemonic, password) {
  if (!bip39.validateMnemonic(mnemonic)) {
    const error = new WalletError('Invalid mnemonic')
    return { error }
  }

  const seed = bip39.mnemonicToSeedHex(mnemonic)
  const walletId = sha256(seed)

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

function sendWalletStateChange ({ webContents, walletId, address, data, log }) {
  webContents.send('wallet-state-changed', {
    [walletId]: {
      addresses: {
        [address]: data
      }
    }
  })
  logger.verbose(`<-- ${log} ${address}`, data)
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
          log: 'Balance' }
        )
      })
    })
    .catch(function (err) {
      sendError({
        webContents,
        walletId,
        message: 'Could not get balance',
        err
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

function parseTransaction ({ transaction, addresses: _addresses, walletId, webContents }) {
  const from = transaction.from.toLowerCase()

  // TODO cleanup as contract creation have no "to"
  const to = transaction.to ? transaction.to.toLowerCase() : 'contract'

  // const { value } = transaction
  const addresses = _addresses.map(a => a.toLowerCase())

  if (!addresses.includes(from) && !addresses.includes(to)) {
    return
  }

  const db = getDatabase()

  return Promise.all(addresses.map(a => a.toLowerCase()).map(function (address) {
    const meta = {}

    if (from === address) {
      meta.outgoing = true
    } else {
      meta.incoming = true
    }

    // TODO gather information on the tx from the other modules > meta
    return Promise.all(txParsers.map(txParser => txParser({ transaction })))
      .then(function (metas) {
        Object.assign(meta, ...metas)

        const parsedTx = {
          transaction,
          meta,
          recepit: {}
        }

        const query = { 'transaction.hash': transaction.hash }
        const update = Object.assign({ walletId, address }, parsedTx)
        db.update(query, update, { upsert: true })
        // TODO handle db error

        webContents.send('wallet-state-changed', {
          [walletId]: {
            addresses: {
              [address]: {
                transactions: [parsedTx]
              }
            }
          }
        })
        logger.verbose(`<-- Transaction ${address} ${transaction.hash}`)
      })
  }))
}

function parseBlock ({ header, walletId, webContents }) {
  const { number } = header
  const addresses = Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

  const web3 = getWeb3()

  return web3.eth.getBlock(number, true).then(function (block) {
    const { transactions, hash } = block

    if (transactions.length) {
      // TODO optimize when this is called
      sendBalances({ webContents, walletId })
    }

    return Promise.all(transactions.map(function (transaction) {
      return parseTransaction({ transaction, addresses, walletId, webContents })
    })).then(function () {
      settings.set('app.bestBlock', { number, hash })
      webContents.send('eth-block', { number, hash })
      logger.verbose('New best block', { number, hash })
    })
  })
}

function sendCachedTransactions ({ walletId, webContents }) {
  const db = getDatabase()

  const addresses = Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

  addresses.map(a => a.toLowerCase()).forEach(function (address) {
    const query = { walletId, address }
    // TODO unhardcode limit
    // TODO null first
    db.find(query).sort({ 'transaction.blockNumber': -1 }).limit(100).exec(function (err, transactions) {
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

function syncTransactions ({ walletId, webContents }) {
  const web3 = getWeb3()

  return web3.eth.getBlockNumber().then(function (number) {
    const bestBlock = settings.get('app.bestBlock')

    if (!bestBlock) {
      logger.verbose('No best block seen')
      return
    }

    const bestNumber = bestBlock.number

    if (number <= bestNumber) {
      return
    }

    logger.verbose('Synching up to best block', { bestNumber, number })
    moduleEmitter.emit('syncing', { current: bestNumber, latest: number })
    return parseBlock({ header: { number: bestNumber + 1 }, walletId, webContents })
      .then(() => syncTransactions({ walletId, webContents }))
  })
}

// TODO move all subscription code to a single place that other modules can reuse

let subscriptions = []

function openWallet ({ webContents, walletId }) {
  sendWalletOpen(webContents, walletId)

  sendBalances({ walletId, webContents })

  sendCachedTransactions({ walletId, webContents })

  syncTransactions({ walletId, webContents })
  // TODO should subscribe after syncing

  const web3 = getWeb3()
  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')
  blocksSubscription.on('data', function (header) {
    parseBlock({ header, walletId, webContents })
  })

  // TODO handle on error

  webContents.on('destroyed', function () {
    blocksSubscription.unsubscribe()
  })

  subscriptions.push({ webContents, blocksSubscription })

  moduleEmitter.on('unconfirmed-tx', function (transaction) {
    const addresses = Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

    parseTransaction({ transaction, addresses, walletId, webContents })
  })
}

function unsubscribeUpdates (_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function (s) {
    logger.verbose('Unsubscribing wallet balance update ')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function getHooks () {
  initDatabase()

  return [{
    eventName: 'create-wallet',
    auth: true,
    handler: function (data, webContents) {
      const { password, mnemonic } = data

      const result = createWallet(mnemonic, password)

      if (result.error) {
        return result
      }

      openWallet({ webContents, walletId: result.walletId })

      return result
    }
  }, {
    eventName: 'open-wallets',
    auth: true,
    handler: function (data, webContents) {
      const activeWallet = settings.get('user.activeWallet')
      const walletIds = Object.keys(settings.get('user.wallets'))

      walletIds.forEach(function (walletId) {
        openWallet({ webContents, walletId })
      })

      return { walletIds, activeWallet }
    }
  }, {
    eventName: 'send-eth',
    auth: true,
    handler: sendTransaction
  }, {
    eventName: 'ui-unload',
    handler: unsubscribeUpdates
  }]
}

function getEvents () {
  return moduleEmitter
}

const txParsers = []

function registerTxParser (parser) {
  txParsers.push(parser)
}

module.exports = {
  getHooks,
  getWeb3,
  sendTransaction,
  getEvents,
  registerTxParser
}
