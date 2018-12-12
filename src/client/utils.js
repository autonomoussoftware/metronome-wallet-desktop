import utils from 'web3-utils'

export const fromWei = (str, unit = 'ether') => utils.fromWei(str, unit)
export const toWei = (bn, unit = 'ether') => utils.toWei(bn, unit)

export const isAddress = str => utils.isAddress(str)

export const toBN = str => utils.toBN(str)
export const toHex = bn => utils.toHex(bn)
