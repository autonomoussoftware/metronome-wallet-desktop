import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import React from 'react'
import Web3 from 'web3'

export default class PurchaseFormProvider extends React.Component {
  static propTypes = {
    disclaimerAccepted: PropTypes.bool.isRequired,
    currentPrice: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    amount: PropTypes.string
  }

  render () {
    const { disclaimerAccepted, currentPrice, amount } = this.props

    let isValidAmount
    let weiAmount
    try {
      weiAmount = new BigNumber(Web3.utils.toWei(amount.replace(',', '.')))
      isValidAmount = weiAmount.gt(new BigNumber(0))
    } catch (e) {
      isValidAmount = false
    }

    const expectedMTNamount = isValidAmount
      ? weiAmount.dividedBy(new BigNumber(currentPrice)).toFormat()
      : null

    const isPristine = amount === null
    const isValidPurchase = isValidAmount && disclaimerAccepted

    return this.props.children({
      expectedMTNamount,
      isValidPurchase,
      isValidAmount,
      isPristine
    })
  }
}
