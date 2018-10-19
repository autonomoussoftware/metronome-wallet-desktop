import withReceiptState from 'metronome-wallet-ui-logic/src/hocs/withReceiptState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

import AmountRow from './AmountRow'
import TypeRow from './TypeRow'
import { Btn } from '../Btn'

const Container = styled.div`
  background-color: ${p => p.theme.colors.medium};
`

const Row = styled.div`
  padding: 1.6rem 0;
  margin: 0 1.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: ${p =>
    p.first ? 'none' : `1px solid ${p.theme.colors.lightShade}`};
`

const Label = styled.div`
  line-height: 1.4rem;
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${p => p.theme.colors.copy};
  margin-right: 1.6rem;
  white-space: nowrap;
`

const Value = styled.div`
  color: ${p => p.theme.colors.copy};
  text-align: right;
  line-height: 1.6rem;
  font-size: 1.3rem;
`

const Address = Value.extend`
  word-wrap: break-word;
  word-break: break-word;
`

const Hash = Value.extend`
  word-wrap: break-word;
  word-break: break-word;
  font-size: 1.2rem;
`

const ExplorerBtn = Btn.extend`
  line-height: 1.5rem;
  opacity: 0.7;
  font-size: 1.4rem;
  letter-spacing: 1.4px;
  border-radius: 0;
`

class Receipt extends React.Component {
  static propTypes = {
    onExplorerLinkClick: PropTypes.func.isRequired,
    onRefreshRequest: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func.isRequired,
    confirmations: PropTypes.number.isRequired,
    refreshStatus: PropTypes.oneOf(['init', 'pending', 'success', 'failure'])
      .isRequired,
    refreshError: PropTypes.string,
    isPending: PropTypes.bool.isRequired,
    tx: PropTypes.object.isRequired
  }

  // eslint-disable-next-line complexity
  render() {
    const { isPending, tx } = this.props

    return (
      <Container data-testid="receipt-modal">
        {tx.txType !== 'unknown' && (
          <Row first>
            <AmountRow {...tx} isPending={isPending} />
          </Row>
        )}

        <Row first={tx.txType === 'unknown'}>
          <TypeRow {...tx} />
        </Row>

        {tx.txType === 'received' &&
          tx.from && (
            <Row>
              <Label>
                {this.props.isPending ? 'Pending' : 'Received'} from
              </Label>
              <Address>{Web3.utils.toChecksumAddress(tx.from)}</Address>
            </Row>
          )}

        {tx.txType === 'sent' &&
          tx.to && (
            <Row>
              <Label>{this.props.isPending ? 'Pending' : 'Sent'} to</Label>
              <Address>{Web3.utils.toChecksumAddress(tx.to)}</Address>
            </Row>
          )}

        <Row>
          <Label>Confirmations</Label>
          <Value>{this.props.confirmations}</Value>
        </Row>

        {tx.receipt && (
          <Row>
            <Label>Gas used</Label>
            <Value>{tx.receipt.gasUsed}</Value>
          </Row>
        )}

        <Row>
          <Label>Transaction hash</Label>
          <Hash>{this.props.hash}</Hash>
        </Row>

        {tx.blockNumber && (
          <Row>
            <Label>Block number</Label>
            <Hash>{tx.blockNumber}</Hash>
          </Row>
        )}

        <ExplorerBtn
          onClick={() => this.props.onExplorerLinkClick(tx.hash)}
          block
        >
          VIEW IN EXPLORER
        </ExplorerBtn>
      </Container>
    )
  }
}

export default withReceiptState(Receipt)
