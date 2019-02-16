import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ImportRequestedDetails from './ImportRequestedDetails'
import ConvertedDetails from './ConvertedDetails'
import ImportedDetails from './ImportedDetails'
import ExportedDetails from './ExportedDetails'
import ReceivedDetails from './ReceivedDetails'
import AuctionDetails from './AuctionDetails'
import SentDetails from './SentDetails'

const Container = styled.div`
  line-height: 1.6rem;
  font-size: 1rem;
  letter-spacing: 0px;
  color: ${p => p.theme.colors.copy};
  text-transform: uppercase;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  text-align: right;

  @media (min-width: 800px) {
    font-size: 1.1rem;
    letter-spacing: 0.4px;
  }
`

const Failed = styled.span`
  line-height: 1.6rem;
  color: ${p => p.theme.colors.danger};
`

export default class Details extends React.Component {
  static propTypes = {
    isPending: PropTypes.bool,
    isFailed: PropTypes.bool.isRequired,
    txType: PropTypes.oneOf([
      'import-requested',
      'converted',
      'received',
      'imported',
      'exported',
      'auction',
      'unknown',
      'sent'
    ]).isRequired
  }

  render() {
    return (
      <Container isPending={this.props.isPending}>
        {this.props.isFailed ? (
          <Failed>FAILED TRANSACTION</Failed>
        ) : this.props.txType === 'sent' ? (
          <SentDetails {...this.props} />
        ) : this.props.txType === 'auction' ? (
          <AuctionDetails {...this.props} />
        ) : this.props.txType === 'received' ? (
          <ReceivedDetails {...this.props} />
        ) : this.props.txType === 'converted' ? (
          <ConvertedDetails {...this.props} />
        ) : this.props.txType === 'import-requested' ? (
          <ImportRequestedDetails {...this.props} />
        ) : this.props.txType === 'imported' ? (
          <ImportedDetails {...this.props} />
        ) : this.props.txType === 'exported' ? (
          <ExportedDetails {...this.props} />
        ) : (
          <div>Waiting for metadata</div>
        )}
      </Container>
    )
  }
}
