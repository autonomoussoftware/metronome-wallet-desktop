import EthereumTx from 'ethereumjs-tx';
import ethutils from 'ethereumjs-util'
import hdkey from 'ethereumjs-wallet/hdkey'
import Web3 from 'web3'

import mtn from './mtn'

const wallet = { address: null, privKey: null, pubKey: null, seed: null }

wallet.init = function (seed, index = 0) {
  wallet.seed = seed

  const res = hdkey
    .fromMasterSeed(ethutils.toBuffer(ethutils.addHexPrefix(wallet.seed)))
    .derivePath(`m/44'/60'/0'/0/${index}`)
    .getWallet()

  wallet.address = res.getChecksumAddressString()
  wallet.privKey = res.getPrivateKey()
  wallet.pubKey = res.getPublicKey()
}

wallet.getAddress = function (seed, index = 0) {
  if (wallet.address) { return wallet.address }

  wallet.init(seed, index)
  return wallet.address
}

wallet.sendTransaction = function (from, to, value) {
  return Promise.all([
    mtn.web3.eth.getGasPrice(),
    mtn.web3.eth.net.getId(),
    mtn.web3.eth.getTransactionCount(from),
    mtn.web3.eth.estimateGas({ to, value })
  ]).then(res => {
    const txParams = {
      gasPrice: mtn.web3.utils.toHex(res[0]),
      chainId: res[1],
      nonce: res[2],
      gas: res[3],
      value: mtn.web3.utils.toHex(value),
      from,
      to
    }

    const tx = new EthereumTx(txParams)
    tx.sign(wallet.privKey)
    return mtn.web3.eth.sendSignedTransaction(`0x${tx.serialize().toString('hex')}`)
  })
}

export default wallet