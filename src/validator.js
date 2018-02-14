import Web3 from 'web3'
import bip39 from 'bip39'
import { isWeiable } from './utils'

function validateAmout(amount, propName, errors = {}) {
  if (!amount) {
    errors[propName] = 'Amount is required'
  } else if (!isWeiable(amount)) {
    errors[propName] = 'Invalid amount'
  }

  return errors
}

export function validateEthAmount(ethAmount, errors = {}) {
  return validateAmout(ethAmount, 'ethAmount', errors)
}

export function validateMtnAmount(mtnAmount, errors = {}) {
  return validateAmout(mtnAmount, 'mtnAmount', errors)
}

export function validateToAddress(toAddress, errors = {}) {
  if (!toAddress) {
    errors.toAddress = 'Address is required'
  } else if (!Web3.utils.isAddress(toAddress)) {
    errors.toAddress = 'Invalid address'
  }

  return errors
}

export function validateMnemonic(mnemonic, errors = {}) {
  if (!mnemonic) {
    errors.mnemonic = 'The phrase is required'
  } else if (!bip39.validateMnemonic(mnemonic)) {
    errors.mnemonic = "These words don't look like a valid recovery phrase"
  }
}

export function validatePassword(password, errors = {}) {
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password =
      'Password length must be equal or greater than 8 characters'
  }

  return errors
}
