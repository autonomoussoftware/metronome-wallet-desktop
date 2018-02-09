import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import sizeMe from 'react-sizeme'
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
    value: PropTypes.string.isRequired,
    size: PropTypes.shape({
      width: PropTypes.number.isRequired
    }).isRequired,
    post: PropTypes.string,
    pre: PropTypes.string
  }

  static defaultProps = {
    maxDecimals: 18
  }

  altRound(value, width) {
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
    return String(Number.parseFloat(n.toFixed(Math.ceil(decimals)), 10))
  }

  /**
   * Returns a valid font-size value that is based
   * on component width and content length
   */
  getFontSize(formattedValue, width) {
    const fontSize = this.props.maxSize

    return fontSize
  }

  render() {
    const { size: { width }, value, post, pre } = this.props

    let formattedValue

    try {
      formattedValue = this.round(value, width)
    } catch (e) {
      formattedValue = null
    }
    const fontSize = this.getFontSize(formattedValue, width)

    return (
      <div style={{ fontSize }}>
        {pre}
        {formattedValue || '--'}
        {post}
      </div>
    )
  }
}

export default sizeMe()(DisplayValue)
