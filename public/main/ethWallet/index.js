// TODO hdkey uses deprecated coinstring and shall use bs58check
const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')
const logger = require('electron-log')
const settings = require('electron-settings')
const EventEmitter = require('events')

const { encrypt, decrypt, sha256 } = require('../cryptoUtils')
const WalletError = require('../WalletError')

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
    // TODO error
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

    logger.debug('Sending signed Ethereum tx')
    return web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
      .once('transactionHash', function (hash) {
        logger.debug('Transaction sent', hash)
      })
      .once('receipt', function (receipt) {
        logger.debug('Transaction recepit received', receipt)
      })
      .on('error', function (error) {
        logger.debug('Transaction send error', error.message)
      })
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

function broadcastWalletInfo (webContents, walletId) {
  const walletInfo = settings.get(`user.wallets.${walletId}`)

  if (!walletInfo) {
    const error = new WalletError('No wallet data', { walletId })
    webContents.send('error', { error })
    logger.warn(`No wallet data - ${walletId}`)
    return
  }

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

  emitter.emit('wallet-opened', { walletId, addresses: Object.keys(addresses), webContents })
}

function getHooks () {
  return [{
    eventName: 'create-wallet',
    auth: true,
    handler: function (data, webContents) {
      const { password, mnemonic } = data

      const result = createWallet(mnemonic, password)

      if (!result.error) {
        broadcastWalletInfo(webContents, result.walletId)
      }

      return result
    }
  }, {
    eventName: 'open-wallets',
    auth: true,
    handler: function (data, webContents) {
      const walletIds = Object.keys(settings.get('user.wallets'))

      walletIds.forEach(function (walletId) {
        broadcastWalletInfo(webContents, walletId)
      })

      return { walletIds }
    }
  }, {
    eventName: 'send-eth',
    auth: true,
    handler: sendSignedTransaction
  }]
}

function getEvents () {
  return emitter
}

module.exports = { getHooks, getWeb3, sendSignedTransaction, getEvents }
