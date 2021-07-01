import withDisplayValueState from 'metronome-wallet-ui-logic/src/hocs/withDisplayValueState'
import { sanitize } from 'metronome-wallet-ui-logic/src/utils'
import smartRounder from 'smart-round'
import PropTypes from 'prop-types'
import React from 'react'

class DisplayValue extends React.Component {
  static propTypes = {
    maxPrecision: PropTypes.number,
    shouldFormat: PropTypes.bool,
    minDecimals: PropTypes.number,
    maxDecimals: PropTypes.number,
    coinSymbol: PropTypes.string.isRequired,
    fromWei: PropTypes.func.isRequired,
    maxSize: PropTypes.string,
    inline: PropTypes.bool,
    isCoin: PropTypes.bool,
    value: PropTypes.string,
    toWei: PropTypes.bool,
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
    const {
      shouldFormat,
      coinSymbol,
      maxSize,
      fromWei,
      inline,
      isCoin,
      toWei,
      value,
      post,
      pre
    } = this.props

    let formattedValue

    try {
      formattedValue = this.round(
        toWei ? sanitize(value) : fromWei(value),
        shouldFormat
      )
    } catch (e) {
      formattedValue = null
    }

    return (
      <div
        style={{
          whiteSpace: 'nowrap',
          fontSize: maxSize,
          display: inline ? 'inline' : 'block'
        }}
      >
        {pre}
        {formattedValue || '?'}
        {isCoin ? ` ${coinSymbol}` : post}
      </div>
    )
  }
}

export default withDisplayValueState(DisplayValue)
