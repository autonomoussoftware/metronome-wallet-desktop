import { withClient } from 'metronome-wallet-ui-logic/src/hocs/clientContext'
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
    client: PropTypes.shape({
      fromWei: PropTypes.func.isRequired
    }).isRequired,
    maxSize: PropTypes.string,
    inline: PropTypes.bool,
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
      maxSize,
      client,
      inline,
      toWei,
      value,
      post,
      pre
    } = this.props

    let formattedValue

    try {
      formattedValue = this.round(
        toWei ? sanitize(value) : client.fromWei(value),
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
        {post}
      </div>
    )
  }
}

export default withClient(DisplayValue)
