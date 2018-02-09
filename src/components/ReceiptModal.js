import { DisplayValue, Modal, Btn } from './common'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

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

const ExplorerBtn = Btn.extend`
  line-height: 1.5rem;
  opacity: 0.7;
  font-size: 1.4rem;
  letter-spacing: 1.4px;
  border-radius: 0;
`

export default class ReceiptModal extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    tx: PropTypes.shape({
      transaction: PropTypes.shape({
        value: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
        from: PropTypes.string,
        to: PropTypes.string
      }).isRequired,
      meta: PropTypes.shape({
        outgoing: PropTypes.bool
      }).isRequired
    })
  }

  render() {
    const {
      onRequestClose,
      isOpen,
      tx = { transaction: {}, meta: {} }
    } = this.props

    const type = tx.meta.outgoing ? 'sent' : 'received'

    return (
      <Modal onRequestClose={onRequestClose} isOpen={isOpen}>
        <Container>
          <Row first>
            <Label>Amount</Label>
            <Amount>
              <DisplayValue value={tx.transaction.value} maxSize="2rem" />
            </Amount>
          </Row>
          <Row>
            <Label>Type</Label>
            <Type>{type}</Type>
          </Row>
          {tx.transaction.from && (
            <Row>
              <Label>Received from</Label>
              <Address>{tx.transaction.from}</Address>
            </Row>
          )}
          {tx.status && (
            <Row>
              <Label>Status</Label>
              <Value>Pending {tx.status}</Value>
            </Row>
          )}
          <ExplorerBtn block>VIEW IN EXPLORER</ExplorerBtn>
        </Container>
      </Modal>
    )
  }
}
