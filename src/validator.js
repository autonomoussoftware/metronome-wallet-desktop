import Web3 from 'web3'
import bip39 from 'bip39'
import { isWeiable, isHexable } from './utils'

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

export function validateGasLimit(gasLimit, min, errors = {}) {
  if (!gasLimit) {
    errors.gasLimit = 'Gas limit is required'
  }
  // } else if (!isHexable(gasLimit.replace(',', '.'))) {
  //   errors.gasLimit = 'Invalid gas limit'
  // }
  else if (gasLimit <= 0) {
    errors.gasLimit = 'Gas limit must be greater than 0'
  }

  return errors
}

export function validateGasPrice(gasPrice, errors = {}) {
  if (!gasPrice) {
    errors.gasPrice = 'Gas price is required'
  }
  // else if (!isHexable(gasPrice.replace(',', '.'))) {
  //   errors.gasPrice = 'Invalid gas price'
  // }
  else if (gasPrice <= 0) {
    errors.gasPrice = 'Gas price must be greater than 0'
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
