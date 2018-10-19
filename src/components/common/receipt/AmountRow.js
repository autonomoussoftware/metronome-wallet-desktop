import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import DisplayValue from '../DisplayValue'

const Label = styled.div`
  line-height: 1.4rem;
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${p => p.theme.colors.copy};
  margin-right: 1.6rem;
  white-space: nowrap;
`

const Amount = styled.div`
  color: ${p => p.theme.colors.primary};
  line-height: 2.5rem;
  text-align: right;
`

const Arrow = styled.span`
  color: ${p => p.theme.colors.primary};
  position: relative;
  top: -6px;
  margin: 0 12px;
  transform: scale3d(1.5, 2, 1);
  display: inline-block;
`

export default class AmountRow extends React.Component {
  static propTypes = {
    mtnBoughtInAuction: PropTypes.string,
    ethSpentInAuction: PropTypes.string,
    convertedFrom: PropTypes.string,
    isPending: PropTypes.bool.isRequired,
    fromValue: PropTypes.string,
    toValue: PropTypes.string,
    txType: PropTypes.oneOf([
      'converted',
      'received',
      'auction',
      'unknown',
      'sent'
    ]).isRequired,
    symbol: PropTypes.string,
    value: PropTypes.string
  }

  render() {
    return (
      <React.Fragment>
        <Label>Amount</Label>
        <Amount isPending={this.props.isPending}>
          {this.props.txType === 'auction' ? (
            <React.Fragment>
              <DisplayValue
                maxSize="1.6rem"
                value={this.props.ethSpentInAuction}
                post=" ETH"
              />
              {this.props.mtnBoughtInAuction && (
                <React.Fragment>
                  <Arrow>&darr;</Arrow>
                  <DisplayValue
                    maxSize="1.6rem"
                    value={this.props.mtnBoughtInAuction}
                    post=" MET"
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          ) : this.props.txType === 'converted' ? (
            <React.Fragment>
              <DisplayValue
                maxSize="1.6rem"
                value={this.props.fromValue}
                post={this.props.convertedFrom === 'ETH' ? ' ETH' : ' MET'}
              />
              {this.props.toValue && (
                <React.Fragment>
                  <Arrow>&darr;</Arrow>
                  <DisplayValue
                    maxSize="1.6rem"
                    value={this.props.toValue}
                    post={this.props.convertedFrom === 'ETH' ? ' MET' : ' ETH'}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <DisplayValue
              maxSize="2rem"
              value={this.props.value}
              post={` ${this.props.symbol}`}
            />
          )}
        </Amount>
      </React.Fragment>
    )
  }
}
