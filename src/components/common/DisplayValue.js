import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import React from 'react'
import Web3 from 'web3'

const format = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3
}

BigNumber.config({ FORMAT: format })

class DisplayValue extends React.Component {
  static propTypes = {
    maxDecimals: PropTypes.number,
    maxSize: PropTypes.string.isRequired,
    value: PropTypes.string,
    post: PropTypes.string,
    pre: PropTypes.string
  }

  static defaultProps = {
    maxDecimals: 18
  }

  altRound(value) {
    const valBN = new BigNumber(Web3.utils.fromWei(value))

    const decimalPlaces = valBN.isGreaterThanOrEqualTo(BigNumber('100'))
      ? 2
      : valBN.isGreaterThanOrEqualTo(BigNumber('0.000001'))
        ? 7
        : this.props.maxDecimals

    return valBN.toFormat(decimalPlaces)
  }

  round(value) {
    let n = Number.parseFloat(Web3.utils.fromWei(value), 10)
    let decimals = -Math.log10(n) + 10
    if (decimals < 2) {
      decimals = 2
    } else if (decimals >= 18) {
      decimals = 18
    }
    // round extra decimals and remove trailing zeroes
    return new BigNumber(n.toFixed(Math.ceil(decimals))).toString(10)
  }

  render() {
    const { value, post, pre, maxSize } = this.props

    let formattedValue

    try {
      formattedValue = this.round(value)
    } catch (e) {
      formattedValue = null
    }

    return (
      <div style={{ fontSize: maxSize }}>
        {pre}
        {formattedValue || '?'}
        {post}
      </div>
    )
  }
}

export default DisplayValue
