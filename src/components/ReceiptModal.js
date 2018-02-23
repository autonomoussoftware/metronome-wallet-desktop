import { DisplayValue, Modal, Btn } from './common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'
const { shell } = window.require('electron')

const Container = styled.div`
  background-color: ${p => p.theme.colors.bg.medium};
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

const Amount = styled.div`
  color: ${p => p.theme.colors.primary};
  line-height: 2.5rem;
  text-align: right;
`

const Type = Value.extend`
  text-transform: capitalize;
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

const Arrow = styled.span`
  color: ${p => p.theme.colors.primary};
  position: relative;
  top: -6px;
  margin: 0 12px;
  transform: scale3d(1.5, 2, 1);
  display: inline-block;
`

class ReceiptModal extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    confirmations: PropTypes.number.isRequired,
    isPending: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    tx: PropTypes.shape({
      transaction: PropTypes.shape({
        blockNumber: PropTypes.number,
        hash: PropTypes.string
      }).isRequired,
      parsed: PropTypes.oneOfType([
        PropTypes.shape({
          txType: PropTypes.oneOf(['unknown']).isRequired
        }),
        PropTypes.shape({
          txType: PropTypes.oneOf(['sent']).isRequired,
          symbol: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
          value: PropTypes.string.isRequired,
          to: PropTypes.string.isRequired
        }),
        PropTypes.shape({
          txType: PropTypes.oneOf(['received']).isRequired,
          symbol: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
          value: PropTypes.string.isRequired,
          from: PropTypes.string.isRequired
        }),
        PropTypes.shape({
          txType: PropTypes.oneOf(['auction']).isRequired,
          mtnBoughtInAuction: PropTypes.string,
          ethSpentInAuction: PropTypes.string.isRequired
        }),
        PropTypes.shape({
          txType: PropTypes.oneOf(['converted']).isRequired,
          convertedFrom: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
          fromValue: PropTypes.string.isRequired,
          toValue: PropTypes.string.isRequired
        })
      ]).isRequired
    })
  }

  onExplorerLink = () => {
    shell.openExternal(
      `${config.MTN_EXPLORER_URL}/transactions/${
        this.props.tx.transaction.hash
      }`
    )
  }

  render() {
    const { onRequestClose, isOpen, tx, confirmations, isPending } = this.props

    if (!tx) return null

    return (
      <Modal onRequestClose={onRequestClose} isOpen={isOpen}>
        <Container>
          {tx.parsed.txType !== 'unknown' && (
            <Row first>
              <Label>Amount</Label>
              <Amount isPending={isPending}>
                {tx.parsed.txType === 'auction' ? (
                  <React.Fragment>
                    <DisplayValue
                      maxSize="1.6rem"
                      value={tx.parsed.ethSpentInAuction}
                      post=" ETH"
                    />
                    {tx.parsed.mtnBoughtInAuction && (
                      <React.Fragment>
                        <Arrow>&darr;</Arrow>
                        <DisplayValue
                          maxSize="1.6rem"
                          value={tx.parsed.mtnBoughtInAuction}
                          post=" MTN"
                        />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : tx.parsed.txType === 'converted' ? (
                  <React.Fragment>
                    <DisplayValue
                      maxSize="1.6rem"
                      value={tx.parsed.fromValue}
                      post={tx.parsed.convertedFrom === 'ETH' ? ' ETH' : ' MTN'}
                    />
                    {tx.parsed.toValue && (
                      <React.Fragment>
                        <Arrow>&darr;</Arrow>
                        <DisplayValue
                          maxSize="1.6rem"
                          value={tx.parsed.toValue}
                          post={
                            tx.parsed.convertedFrom === 'ETH' ? ' MTN' : ' ETH'
                          }
                        />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : (
                  <DisplayValue
                    maxSize="2rem"
                    value={tx.parsed.value}
                    post={` ${tx.parsed.symbol}`}
                  />
                )}
              </Amount>
            </Row>
          )}

          <Row first={tx.parsed.txType === 'unknown'}>
            <Label>Type</Label>
            <Type>
              {tx.parsed.isCancelApproval
                ? 'Allowance canceled'
                : tx.parsed.isApproval ? 'Allowance set' : tx.parsed.txType}
            </Type>
          </Row>

          {tx.parsed.txType === 'received' && (
            <Row>
              <Label>{isPending ? 'Pending' : 'Received'} from</Label>
              <Address>{tx.parsed.from}</Address>
            </Row>
          )}

          {tx.parsed.txType === 'sent' && (
            <Row>
              <Label>{isPending ? 'Pending' : 'Sent'} to</Label>
              <Address>{tx.parsed.to}</Address>
            </Row>
          )}

          <Row>
            <Label>Confirmations</Label>
            <Value>{confirmations}</Value>
          </Row>

          {tx.receipt && (
            <Row>
              <Label>Gas used</Label>
              <Value>{tx.receipt.gasUsed}</Value>
            </Row>
          )}

          <Row>
            <Label>Transaction hash</Label>
            <Hash>{tx.transaction.hash}</Hash>
          </Row>

          {tx.transaction.blockNumber && (
            <Row>
              <Label>Block number</Label>
              <Hash>{tx.transaction.blockNumber}</Hash>
            </Row>
          )}

          <ExplorerBtn block onClick={this.onExplorerLink}>
            VIEW IN EXPLORER
          </ExplorerBtn>
        </Container>
      </Modal>
    )
  }
}

const mapStateToProps = (state, props) => {
  const confirmations = props.tx
    ? selectors.getTxConfirmations(state, props.tx)
    : 0

  return {
    confirmations,
    isPending: confirmations < 6
  }
}

export default connect(mapStateToProps)(ReceiptModal)
