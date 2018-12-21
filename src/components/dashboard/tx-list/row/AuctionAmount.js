import PropTypes from 'prop-types'
import React from 'react'

import { DisplayValue } from '../../../common'
import Arrow from './Arrow'

export default class AuctionAmount extends React.Component {
  static propTypes = {
    metBoughtInAuction: PropTypes.string,
    coinSpentInAuction: PropTypes.string
  }

  render() {
    return (
      <React.Fragment>
        <DisplayValue value={this.props.coinSpentInAuction} post=" ETH" />

        {this.props.metBoughtInAuction && (
          <React.Fragment>
            <Arrow />
            <DisplayValue value={this.props.metBoughtInAuction} post=" MET" />
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}
