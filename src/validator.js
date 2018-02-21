import { isWeiable } from './utils'
import bip39 from 'bip39'
import Web3 from 'web3'

function validateAmount(amount, propName, max, errors = {}) {
  if (!amount) {
    errors[propName] = 'Amount is required'
  } else if (!isWeiable(amount)) {
    errors[propName] = 'Invalid amount'
  } else if (max && parseFloat(amount) > parseFloat(max)) {
    errors[propName] = 'Insufficient funds'
  }

  return errors
}

export function validateEthAmount(ethAmount, max, errors = {}) {
  return validateAmount(ethAmount, 'ethAmount', max, errors)
}

export function validateMtnAmount(mtnAmount, max, errors = {}) {
  return validateAmount(mtnAmount, 'mtnAmount', max, errors)
}

export function validateToAddress(toAddress, errors = {}) {
  if (!toAddress) {
    errors.toAddress = 'Address is required'
  } else if (!Web3.utils.isAddress(toAddress)) {
    errors.toAddress = 'Invalid address'
  }

  return errors
}

export function validateMnemonic(mnemonic, propName = 'mnemonic', errors = {}) {
  if (!mnemonic) {
    errors[propName] = 'The phrase is required'
  } else if (!bip39.validateMnemonic(mnemonic)) {
    errors[propName] = "These words don't look like a valid recovery phrase"
  }

  return errors
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
