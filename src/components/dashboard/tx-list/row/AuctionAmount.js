import PropTypes from 'prop-types'
import React from 'react'

import { DisplayValue } from '../../../common'
import Arrow from './Arrow'

export default class AuctionAmount extends React.Component {
  static propTypes = {
    mtnBoughtInAuction: PropTypes.string,
    ethSpentInAuction: PropTypes.string
  }

  render() {
    return (
      <React.Fragment>
        <DisplayValue value={this.props.ethSpentInAuction} post=" ETH" />

        {this.props.mtnBoughtInAuction && (
          <React.Fragment>
            <Arrow />
            <DisplayValue value={this.props.mtnBoughtInAuction} post=" MET" />
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}
