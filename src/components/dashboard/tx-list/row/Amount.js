import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue } from '../../../common'
import ConvertedAmount from './ConvertedAmount'
import AuctionAmount from './AuctionAmount'

const Container = styled.div`
  line-height: 2.5rem;
  text-align: right;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  color: ${p =>
    p.isPending
      ? p.theme.colors.copy
      : p.isFailed
      ? p.theme.colors.danger
      : p.theme.colors.primary};
  display: flex;
  justify-content: flex-end;
  font-size: 2.3vw;

  @media (min-width: 800px) {
    font-size: 1.8vw;
  }

  @media (min-width: 1040px) {
    font-size: 1.5vw;
  }

  @media (min-width: 1440px) {
    font-size: 2.2rem;
  }
`

export default class Amount extends React.Component {
  static propTypes = {
    isProcessing: PropTypes.bool,
    isPending: PropTypes.bool,
    isFailed: PropTypes.bool.isRequired,
    symbol: PropTypes.string,
    txType: PropTypes.oneOf([
      'converted',
      'imported',
      'exported',
      'received',
      'auction',
      'unknown',
      'sent'
    ]).isRequired,
    value: PropTypes.string.isRequired
  }

  render() {
    return (
      <Container
        isPending={this.props.isPending}
        isFailed={this.props.isFailed}
      >
        {this.props.txType === 'auction' ? (
          <AuctionAmount {...this.props} />
        ) : this.props.txType === 'converted' ? (
          <ConvertedAmount {...this.props} />
        ) : this.props.txType === 'unknown' || this.props.isProcessing ? (
          <div>New transaction</div>
        ) : (
          <DisplayValue
            value={this.props.value}
            post={
              this.props.txType === 'imported' ||
              this.props.txType === 'exported'
                ? ' MET'
                : ` ${
                    this.props.symbol === 'coin'
                      ? this.props.coinSymbol
                      : this.props.symbol
                  }`
            }
          />
        )}
      </Container>
    )
  }
}
