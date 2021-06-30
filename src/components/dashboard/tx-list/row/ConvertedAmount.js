import PropTypes from 'prop-types'
import React from 'react'

import { DisplayValue } from '../../../common'
import Arrow from './Arrow'

export default class ConvertedAmount extends React.Component {
  static propTypes = {
    convertedFrom: PropTypes.string,
    coinSymbol: PropTypes.string.isRequired,
    fromValue: PropTypes.string,
    toValue: PropTypes.string,
  }

  render() {
    return (
      <React.Fragment>
        {this.props.fromValue ? (
          <DisplayValue
            value={this.props.fromValue}
            post={` ${
              this.props.convertedFrom === 'coin'
                ? this.props.coinSymbol
                : this.props.convertedFrom
            }`}
          />
        ) : (
          <div>New transaction</div>
        )}

        {this.props.fromValue && this.props.toValue && (
          <React.Fragment>
            <Arrow />
            <DisplayValue
              value={this.props.toValue}
              post={
                this.props.convertedFrom === 'coin'
                  ? ' MET'
                  : ` ${this.props.coinSymbol}`
              }
            />
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}
