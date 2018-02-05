const hdkey = require('ethereumjs-wallet/hdkey')
const settings = require('electron-settings')
const Web3 = require('web3')

const aes256cbc = require('./aes256cbc')

function initEthWallet (webContents, seedHash, password) {
  const walletInfo = settings.get(`user.wallets.${seedHash}`)
  if (!walletInfo) {
    const error = new Error('No wallet data')
    error.data = { seedHash }
    webContents.send('error', { error })
    return
  }

  const { encryptedSeed, derivationPath, index } = walletInfo
  const seed = aes256cbc.decrypt(password, encryptedSeed)
  const wallet = hdkey
    .fromMasterSeed(Buffer.from(seed, 'hex'))
    .derivePath(`${derivationPath}/${index}`)
    .getWallet()

  const websocketApiUrl = settings.get('app.node.websocketApiUrl')
  const web3 = new Web3(new Web3.providers.WebsocketProvider(websocketApiUrl))
  web3.eth.getBalance(wallet.getChecksumAddressString())
    .then(function (balance) {
      webContents.send('wallet-state-changed', {
        walletId: seedHash,
        index,
        balance
      })
    })
}

module.exports = { initEthWallet }
