'use strict'

const bip39 = require('bip39')

const createMnemonic = () => Promise.resolve(bip39.generateMnemonic())

const isValidMnemonic = mnemonic => bip39.validateMnemonic(mnemonic)

const mnemonicToSeedHex = mnemonic =>
  bip39.mnemonicToSeedHex(mnemonic).toString('hex')

module.exports = {
  createMnemonic,
  isValidMnemonic,
  mnemonicToSeedHex
}
