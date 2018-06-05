import { isWeiable, isHexable, gweiToWei, weiToGwei } from './utils'
import stringEntropy from 'fast-password-entropy'
import bip39 from 'bip39'
import Web3 from 'web3'

function validateAmount(amount, propName, max, errors = {}) {
  if (!amount) {
    errors[propName] = 'Amount is required'
  } else if (!isWeiable(amount)) {
    errors[propName] = 'Invalid amount'
  } else if (max && parseFloat(amount) > parseFloat(max)) {
    errors[propName] = 'Insufficient funds'
  } else if (parseFloat(amount) < 0) {
    errors[propName] = 'Amount must be greater than 0'
  }

  return errors
}

export function validateEthAmount(ethAmount, max, errors = {}) {
  return validateAmount(ethAmount, 'ethAmount', max, errors)
}

export function validateMetAmount(mtnAmount, max, errors = {}) {
  return validateAmount(mtnAmount, 'metAmount', max, errors)
}

export function validateToAddress(toAddress, errors = {}) {
  if (!toAddress) {
    errors.toAddress = 'Address is required'
    // Specifically check for address validity (ignoring checksum)
  } else if (!Web3.utils.isAddress(toAddress.toLowerCase())) {
    errors.toAddress = 'Invalid address'
    // Specifically check address checksum
  } else if (!Web3.utils.checkAddressChecksum(toAddress)) {
    errors.toAddress = 'Address checksum is invalid'
  }

  return errors
}

export function validateGasLimit(gasLimit, min, errors = {}) {
  gasLimit = (gasLimit || '').replace(/,/g, '.')
  const value = parseFloat(gasLimit, 10)

  if (gasLimit === null || gasLimit === '') {
    errors.gasLimit = 'Gas limit is required'
  } else if (Number.isNaN(value)) {
    errors.gasLimit = 'Invalid value'
  } else if (Math.floor(value) !== value) {
    errors.gasLimit = 'Gas limit must be an integer'
  } else if (value <= 0) {
    errors.gasLimit = 'Gas limit must be greater than 0'
  } else if (!isHexable(value.toString())) {
    errors.gasLimit = 'Invalid value'
  }

  return errors
}

export function validateGasPrice(gasPrice, max, errors = {}) {
  gasPrice = (gasPrice || '').replace(/,/g, '.')
  const value = parseFloat(gasPrice, 10)

  max = weiToGwei(max)

  if (gasPrice === null || gasPrice === '') {
    errors.gasPrice = 'Gas price is required'
  } else if (Number.isNaN(value)) {
    errors.gasPrice = 'Invalid value'
  } else if (value < 1) {
    errors.gasPrice = 'Gas price must be greater than 1'
  } else if (value > parseFloat(max)) {
    errors.gasPrice = `Gas price must be lower than ${max}`
  } else if (!isWeiable(value.toString(), 'gwei')) {
    errors.gasPrice = 'Invalid value'
  } else if (!isHexable(gweiToWei(value.toString()))) {
    errors.gasPrice = 'Invalid value'
  }

  return errors
}

export function validateMnemonic(mnemonic, propName = 'mnemonic', errors = {}) {
  if (!mnemonic) {
    errors[propName] = 'The phrase is required'
  } else if (!bip39.validateMnemonic(mnemonic)) {
    errors[propName] = 'These words don\'t look like a valid recovery phrase'
  }

  return errors
}

export function validatePassword(password, errors = {}) {
  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}

export function validatePasswordCreation(password, errors = {}) {
  if (!password) {
    errors.password = 'Password is required'
  } else if (stringEntropy(password) < 72) {
    errors.password = 'Password is not strong enough'
  }

  return errors
}
