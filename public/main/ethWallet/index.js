// TODO hdkey uses deprecated coinstring and shall use bs58check
const hdkey = require('ethereumjs-wallet/hdkey')
const settings = require('electron-settings')
const bip39 = require('bip39')

const { encrypt, decrypt, sha256 } = require('../cryptoUtils')
const WalletError = require('../WalletError')

const getWeb3 = require('./web3')

function getAddressBalance (address) {
  const web3 = getWeb3()

  return web3.eth.getBalance(address)
}

function sendTransaction ({ password, from, to, value }) {
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
    gas: web3.eth.estimateGas({ to, value }),
    gasPrice: web3.eth.getGasPrice(),
    nonce: web3.eth.getTransactionCount(from)
  }).then(function ({ chainId, gas, gasPrice, nonce }) {
    const EthereumTx = require('ethereumjs-tx')

    const txParams = {
      chainId,
      nonce,
      from,
      to,
      value: web3.utils.toHex(value),
      gasPrice: web3.utils.toHex(gasPrice),
      gas
    }
    const tx = new EthereumTx(txParams)
    tx.sign(privateKey)
    const serializedTx = tx.serialize()

    return web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
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
    return
  }

  const addresses = settings.get(`user.wallets.${walletId}.addresses`)

  Object.keys(addresses).forEach(function (address) {
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
      })
      .catch(function (err) {
        const error = new WalletError('Could not get balance', err)
        webContents.send('error', { error })
      })
  })
}

module.exports = { createWallet, broadcastWalletInfo, sendTransaction }
