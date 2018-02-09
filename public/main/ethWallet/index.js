// TODO hdkey uses deprecated coinstring and shall use bs58check
const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const settings = require('electron-settings')
const EventEmitter = require('events')

const { encrypt, decrypt, sha256 } = require('../cryptoUtils')
const WalletError = require('../WalletError')
const Deferred = require('../lib/Deferred')

const getWeb3 = require('./web3')

const emitter = new EventEmitter()

function getAddressBalance (address) {
  const web3 = getWeb3()

  return web3.eth.getBalance(address)
}

function sendSignedTransaction ({ password, from, to, value = 0, data, gas }) {
  const promiseAllProps = require('promise-all-props')

  if (!password) {
    // TODO or invalid
    // TODO error
    return
  }

  const wallets = settings.get('user.wallets')

  const wallet = Object.keys(wallets)
    .find(walletId => Object.keys(wallets[walletId].addresses).includes(from))

  if (!wallet) {
    // TODO handle error
    return
  }

  const { encryptedSeed, derivationPath } = wallets[wallet]
  const seed = decrypt(password, encryptedSeed)
  const index = wallets[wallet].addresses[from].index

  const privateKey = hdkey
    .fromMasterSeed(Buffer.from(seed, 'hex'))
    .derivePath(`${derivationPath}/${index}`)
    .getWallet()
    .getPrivateKey()

  const web3 = getWeb3()
  return promiseAllProps({
    chainId: web3.eth.net.getId(),
    estimatedGas: gas || web3.eth.estimateGas({ to, value }),
    gasPrice: web3.eth.getGasPrice(),
    nonce: web3.eth.getTransactionCount(from)
  }).then(function ({ chainId, estimatedGas, gasPrice, nonce }) {
    const EthereumTx = require('ethereumjs-tx')

    const txParams = {
      chainId,
      nonce,
      from,
      to,
      value: web3.utils.toHex(value),
      gasPrice: web3.utils.toHex(gasPrice),
      gas: estimatedGas,
      data
    }
    const tx = new EthereumTx(txParams)
    tx.sign(privateKey)
    const serializedTx = tx.serialize()

    logger.debug('Sending signed Ethereum tx', txParams)

    const deferred = new Deferred()

    web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
      .once('transactionHash', function (hash) {
        logger.debug('Transaction sent', hash)
        deferred.resolve({ hash })

        web3.eth.getTransaction(hash).then(function (transaction) {
          emitter.emit('unconfirmed-tx', transaction)
        })
      })
      .once('receipt', function (receipt) {
        logger.debug('Transaction recepit received', receipt)

        emitter.emit('tx-recepit', receipt)
      })
      .once('error', function (err) {
        logger.debug('Transaction send error', err.message)
        deferred.reject(err)
      })

    return deferred.promise
  })
}

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

function sendBalances ({ walletId, webContents }) {
  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  Object.keys(addresses).map(a => a.toLowerCase()).forEach(function (address) {
    getAddressBalance(address)
      .then(function (balance) {
        settings.set(`user.wallets.${walletId}.addresses.${address}.balance`, balance)
        webContents.send('wallet-state-changed', {
          [walletId]: {
            addresses: {
              [address]: {
                balance
              }
            }
          }
        })
        logger.debug(`<-- ETH ${address} ${balance}`)
      })
      .catch(function (err) {
        const error = new WalletError('Could not get balance', err)
        webContents.send('error', { error })
        logger.warn(`Could not get balance - ${address}`)
      })
  })
}

function sendWalletOpen (webContents, walletId) {
  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  emitter.emit('wallet-opened', {
    walletId,
    addresses: Object.keys(addresses),
    webContents
  })
}

function parseTransaction ({ transaction, addresses, walletId, webContents }) {
  const from = transaction.from.toLowerCase()
  const to = transaction.to.toLowerCase()
  const { value } = transaction

  if (!addresses.includes(from) && !addresses.includes(to)) {
    return
  }

  addresses.forEach(function (address) {
    const meta = {}

    if (from === address) {
      meta.outgoing = true
    } else {
      meta.incoming = true
    }

    // TODO gather information on the tx from the other modules > meta
    Promise.all(txParsers.map(txParser => txParser({ transaction })))
      .then(function (metas) {
        Object.assign(meta, ...metas)

        // TODO store in db

        webContents.send('wallet-state-changed', {
          [walletId]: {
            addresses: {
              [address]: {
                transactions: [{
                  transaction,
                  meta,
                  recepit: {}
                }]
              }
            }
          }
        })
        logger.debug(`<-- Transaction ${address} ${transaction.hash}`)
      })
  })
}

function parseBlock ({ header, walletId, webContents }) {
  const { number } = header
  const addresses = Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

  const web3 = getWeb3()
  web3.eth.getBlock(number, true).then(function (block) {
    const { transactions } = block

    if (!transactions.length) {
      return
    }

    // TODO optimize when this is called
    sendBalances({ webContents, walletId })

    transactions.forEach(function (transaction) {
      parseTransaction({ transaction, addresses, walletId, webContents })
    })
  })
}

let subscriptions = []

function openWallet ({ webContents, walletId }) {
  sendWalletOpen(webContents, walletId)

  sendBalances({ walletId, webContents })

  const web3 = getWeb3()
  const blocksSubscription = web3.eth.subscribe('newBlockHeaders')
  blocksSubscription.on('data', function (header) {
    parseBlock({ header, walletId, webContents })
  })

  webContents.on('destroyed', function () {
    blocksSubscription.unsubscribe()
  })

  subscriptions.push({ webContents, blocksSubscription })

  emitter.on('unconfirmed-tx', function (transaction) {
    const addresses = Object.keys(settings.get(`user.wallets.${walletId}.addresses`))

    parseTransaction({ transaction, addresses, walletId, webContents })
  })
}

function unsubscribeUpdates (_, webContents) {
  const toUnsubscribe = subscriptions.filter(s => s.webContents === webContents)

  toUnsubscribe.forEach(function (s) {
    logger.debug('Unsubscribing wallet balance update ')
    s.blocksSubscription.unsubscribe()
  })

  subscriptions = subscriptions.filter(s => s.webContents !== webContents)
}

function getHooks () {
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
    handler: sendSignedTransaction
  }, {
    eventName: 'ui-unload',
    handler: unsubscribeUpdates
  }]
}

function getEvents () {
  return emitter
}

const txParsers = []

function registerTxParser (parser) {
  txParsers.push(parser)
}

module.exports = {
  getHooks,
  getWeb3,
  sendSignedTransaction,
  getEvents,
  registerTxParser
}
