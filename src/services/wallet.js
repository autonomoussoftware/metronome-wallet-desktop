import ethutils from 'ethereumjs-util';
import hdkey from 'ethereumjs-wallet/hdkey';

const wallet = { address: null, privKey: null, pubKey: null, seed: null }

wallet.init = function (seed, index = 0) {
  wallet.seed = seed

  const res = hdkey
    .fromMasterSeed(ethutils.toBuffer(ethutils.addHexPrefix(wallet.seed)))
    .derivePath(`m/44'/60'/0'/0/${index}`)
    .getWallet();

  wallet.address = res.getChecksumAddressString()
  wallet.privKey = res.getPrivateKey()
  wallet.pubKey = res.getPublicKey()
}

wallet.getAddress = function (seed, index = 0) {
  if (wallet.address) { return wallet.address }

  wallet.init(seed, index)
  return wallet.address
}

export default wallet