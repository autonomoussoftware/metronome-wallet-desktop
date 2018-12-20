import smartRounder from 'smart-round'
import PropTypes from 'prop-types'
import React from 'react'
import { fromWei } from 'web3-utils'

class DisplayValue extends React.Component {
  static propTypes = {
    // shouldFormat: PropTypes.bool,
    maxPrecision: PropTypes.number,
    minDecimals: PropTypes.number,
    maxDecimals: PropTypes.number,
    maxSize: PropTypes.string,
    inline: PropTypes.bool,
    value: PropTypes.string,
    post: PropTypes.string,
    pre: PropTypes.string
  }

  static defaultProps = {
    shouldFormat: true,
    maxPrecision: 6,
    minDecimals: 0,
    maxDecimals: 6,
    maxSize: 'inherit'
  }

  round = smartRounder(
    this.props.maxPrecision,
    this.props.minDecimals,
    this.props.maxDecimals
  )

  render() {
    const { value, post, pre, maxSize, inline } = this.props

    let formattedValue

    try {
      formattedValue = this.round(fromWei(value), true)
    } catch (e) {
      formattedValue = null
    }

    return (
      <div style={{ fontSize: maxSize, display: inline ? 'inline' : 'block' }}>
        {pre}
        {formattedValue || '?'}
        {post}
      </div>
    )
  }
}

export default DisplayValue
